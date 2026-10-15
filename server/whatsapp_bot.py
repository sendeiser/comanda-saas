#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
COMANDA SAAS — BOT DE WHATSAPP MULTI-NEGOCIO EN PYTHON
Servicio ejecutable autónomo con soporte multi-tenant por SLUG.
Lee dinámicamente desde Supabase Cloud (https://vmnhystuwcbdbukoxdtz.supabase.co):
  - Perfil del comercio (stores)
  - Modos de operación del bot (auto_order, catalog_link, flows, ai)
  - Plantillas de mensajes y respuestas (bot_config -> templates)
  - Flujos de conversación y menús (bot_config -> flows)
  - Variables personalizadas dinámicas (bot_config -> variables)
  - Catálogo de productos y modificadores (products)
  - Registro de comandas correlativas en tiempo real (orders)
=============================================================================
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler
import argparse

# Configurar encoding UTF-8 en consolas Windows
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Credenciales canónicas de Supabase
DEFAULT_SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://vmnhystuwcbdbukoxdtz.supabase.co")
DEFAULT_SUPABASE_KEY = os.getenv(
    "VITE_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg"
)

# Sesiones activas en memoria (phone -> session_data)
SESSIONS = {}

# ---------------------------------------------------------------------------
# CLIENTE SUPABASE REST MULTI-TENANT
# ---------------------------------------------------------------------------
class SupabaseClient:
    def __init__(self, url=DEFAULT_SUPABASE_URL, key=DEFAULT_SUPABASE_KEY):
        self.url = url.rstrip("/")
        self.key = key

    def _headers(self, extra=None):
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }
        if extra:
            headers.update(extra)
        return headers

    def get(self, table, query=""):
        url = f"{self.url}/rest/v1/{table}"
        if query:
            url += f"?{query}"
        req = urllib.request.Request(url, headers=self._headers(), method="GET")
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as e:
            print(f"[SupabaseClient GET {table}] Error: {e}", file=sys.stderr)
            return None

    def post(self, table, data, upsert=False):
        url = f"{self.url}/rest/v1/{table}"
        extra = {}
        if upsert:
            extra["Prefer"] = "resolution=merge-duplicates,return=representation"
        else:
            extra["Prefer"] = "return=representation"

        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers=self._headers(extra), method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"[SupabaseClient POST {table} HTTP {e.code}] Error: {err_body}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"[SupabaseClient POST {table}] Error: {e}", file=sys.stderr)
            return None

    def list_all_stores(self):
        """Devuelve todos los comercios activos registrados en la base de datos."""
        res = self.get("stores", "is_active=eq.true&order=name.asc")
        return res or []

    def get_store_by_slug_or_id(self, identifier):
        """Busca un comercio por slug exacto o por ID UUID en Supabase."""
        if not identifier:
            identifier = "demo"
        clean = identifier.strip().lower()

        # 1. Búsqueda directa por slug
        res = self.get("stores", f"slug=eq.{urllib.parse.quote(clean)}&limit=1")
        if res and len(res) > 0:
            return res[0]

        # 2. Búsqueda por ID UUID
        if len(clean) >= 30:
            res_id = self.get("stores", f"id=eq.{clean}&limit=1")
            if res_id and len(res_id) > 0:
                return res_id[0]

        # 3. Búsqueda parcial o fallback
        fallback = self.get("stores", f"slug=ilike.*{urllib.parse.quote(clean)}*&limit=1")
        if fallback and len(fallback) > 0:
            return fallback[0]

        return None

    def get_bot_config(self, store_id, config_type):
        """Lee la configuración específica (templates, flows, variables) para un store_id."""
        clean_store = store_id or "00000000-0000-0000-0000-000000000001"
        config_id = f"bot_{config_type}_{clean_store}"
        res = self.get("bot_config", f"id=eq.{config_id}&limit=1")
        if res and len(res) > 0 and res[0].get("data"):
            return res[0]["data"]
        return None

    def get_products(self, store_id):
        """Obtiene el catálogo de productos disponible para este negocio."""
        if store_id:
            query = f"or=(store_id.eq.{store_id},store_id.is.null)&is_active=eq.true&order=name.asc"
        else:
            query = "is_active=eq.true&order=name.asc"
        return self.get("products", query) or []

    def get_next_order_number(self, store_id=None):
        """Consulta el número de orden correlativo consecutivo para no pisar pedidos."""
        orders = self.get("orders", "select=order_number&order=order_number.desc&limit=1")
        if orders and len(orders) > 0 and orders[0].get("order_number"):
            return int(orders[0]["order_number"]) + 1
        return 1

    def create_order(self, order_dict):
        """Registra el pedido directamente en la tabla orders de Supabase."""
        return self.post("orders", order_dict, upsert=False)


# ---------------------------------------------------------------------------
# MOTOR CONVERSACIONAL INTELIGENTE MULTI-MODAL
# ---------------------------------------------------------------------------
class MultiTenantBotEngine:
    def __init__(self, target_slug=None, supabase_client=None):
        self.sb = supabase_client or SupabaseClient()
        self.target_slug = target_slug
        self.current_store = None
        self.templates = {}
        self.flows = []
        self.variables = {}
        self.products = []
        self.last_sync_time = 0

        if target_slug:
            self.load_store_context(target_slug)

    def load_store_context(self, slug_or_id):
        """Carga todo el contexto de Supabase (negocio, plantillas, flujos, variables y menú)."""
        store = self.sb.get_store_by_slug_or_id(slug_or_id)
        if not store:
            stores = self.sb.list_all_stores()
            if stores:
                store = stores[0]
            else:
                store = {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "slug": "demo",
                    "name": "Comanda Demo Gastronómica",
                    "industry": "fast_food",
                    "delivery_settings": {"baseFee": 1500},
                    "payment_settings": {"transferAlias": "COMANDA.FAST", "transferCbu": ""}
                }

        self.current_store = store
        store_id = store["id"]

        # 1. Cargar plantillas desde Supabase
        tpl_data = self.sb.get_bot_config(store_id, "templates") or {}
        self.templates = tpl_data

        # 2. Cargar flujos desde Supabase
        flows_data = self.sb.get_bot_config(store_id, "flows") or []
        self.flows = flows_data if isinstance(flows_data, list) else []

        # 3. Cargar variables dinámicas desde Supabase
        vars_data = self.sb.get_bot_config(store_id, "variables") or []
        var_map = {}
        if isinstance(vars_data, list):
            for v in vars_data:
                if isinstance(v, dict) and "key" in v:
                    var_map[v["key"]] = v.get("value", v.get("defaultValue", ""))
        self.variables = var_map

        # 4. Cargar productos desde Supabase
        self.products = self.sb.get_products(store_id)
        self.last_sync_time = time.time()

        return self.current_store

    def get_mode(self):
        """Determina el modo operativo configurado en Supabase: catalog, templates, catalog_direct, flows o ai."""
        menu_mode = self.templates.get("menu_mode")
        if menu_mode in ["catalog", "templates", "catalog_direct"]:
            return menu_mode
        mode = self.templates.get("bot_mode") or self.current_store.get("bot_mode") or "catalog"
        return str(mode).lower()

    def compile_text(self, text, extra_vars=None):
        """Reemplaza dinámicamente variables del negocio en los textos de respuesta."""
        if not text:
            return ""

        store = self.current_store or {}
        contact = store.get("contact_info", {})
        delivery = store.get("delivery_settings", {})
        payment = store.get("payment_settings", {})

        slug = store.get("slug", "demo")
        catalog_link = f"https://comandasaas.app/#catalog?store={slug}"

        # Generar lista rápida de catálogo en texto prediseñado
        catalog_lines = []
        for idx, p in enumerate(self.products[:8], 1):
            price_val = f"${int(p.get('price', 0)):,}".replace(",", ".")
            desc_val = f"\n   _{p.get('description')}_" if p.get('description') else ""
            img_badge = " 📸" if p.get('image') else ""
            num_badge = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"][idx - 1] if idx <= 8 else f"{idx}."
            catalog_lines.append(f"{num_badge} *{p.get('name')}* — {price_val}{img_badge}{desc_val}")
        catalog_text = "\n\n".join(catalog_lines) if catalog_lines else "Consultar carta online."
        if len(self.products) > 8:
            catalog_text += f"\n\n⏩ _Mostrando las primeras 8 opciones de {len(self.products)}. Escribí *SIGUIENTE* para ver más._"

        replacements = {
            "{cliente}": (extra_vars or {}).get("cliente", "Cliente"),
            "{nombre_local}": store.get("name", "ComandaFast"),
            "{nombre_negocio}": store.get("name", "ComandaFast"),
            "{negocio}": store.get("name", "ComandaFast"),
            "{catalogo_url}": catalog_link,
            "{enlace_carta}": catalog_link,
            "{carta}": catalog_link,
            "{link_carta}": catalog_link,
            "{catalogo_lista}": catalog_text,
            "{promos_alerta}": "🔥 *¡PROMOS DEL DÍA DISPONIBLES!* 🔥\n" if self.templates.get("promo_alert") else "",
            "{telefono}": contact.get("phone", contact.get("whatsapp", "")),
            "{whatsapp}": contact.get("whatsapp", contact.get("phone", "")),
            "{direccion}": contact.get("address", "Atención al público y delivery"),
            "{horarios}": store.get("opening_hours", "Miércoles a Domingos de 19:30 a 00:30 hs"),
            "{costo_envio}": f"${int(delivery.get('baseFee', 1500)):,}".replace(",", "."),
            "{alias_banco}": payment.get("transferAlias", "COMANDA.FAST"),
            "{alias}": payment.get("transferAlias", "COMANDA.FAST"),
            "{alias_mp}": payment.get("transferAlias", "COMANDA.FAST"),
            "{banco}": payment.get("bankName", "Mercado Pago / Banco"),
            "{titular}": payment.get("bankHolder", "Titular del Negocio"),
            "{cbu}": payment.get("transferCbu", "—"),
            "{demora_estimada}": str(self.templates.get("delay_minutes", "30 a 45")),
            "{pedido_id}": str((extra_vars or {}).get("pedido_id", "1")),
            "{total}": str((extra_vars or {}).get("total", "0")),
            "{subtotal}": str((extra_vars or {}).get("subtotal", "0")),
            "{tipo_entrega}": (extra_vars or {}).get("tipo_entrega", "Delivery"),
            "{detalle_pedido}": (extra_vars or {}).get("detalle_pedido", "")
        }

        # Sumar variables dinámicas cargadas de la tabla bot_config
        for k, v in self.variables.items():
            token = f"{{{k}}}"
            replacements[token] = str(v)

        result = text
        for token, val in replacements.items():
            result = result.replace(token, str(val))

        return result

    def process_message(self, phone, raw_text, override_store_id=None):
        """Procesa un mensaje entrante respetando el modo y configuración del negocio."""
        # Refrescar contexto si se solicita un store específico
        if override_store_id and (not self.current_store or self.current_store.get("id") != override_store_id):
            self.load_store_context(override_store_id)

        # Si pasaron más de 5 minutos, recargar en background
        if time.time() - self.last_sync_time > 300:
            if self.current_store:
                self.load_store_context(self.current_store["slug"])

        phone = re.sub(r"[^\d+]", "", phone or "5491100000000")
        text = (raw_text or "").strip()
        text_lower = text.lower()

        store = self.current_store or {}
        store_name = store.get("name", "ComandaFast")
        store_slug = store.get("slug", "demo")
        delivery_fee = float(store.get("delivery_settings", {}).get("baseFee", 1500))
        bot_mode = self.get_mode()

        catalog_link = f"https://comandasaas.app/#catalog?store={store_slug}"

        # 1. EVALUAR FLUJOS INTERACTIVOS (Si hay flujos configurados en bot_config)
        if self.flows and len(self.flows) > 0:
            for flow in self.flows:
                trigger = (flow.get("trigger") or flow.get("keyword") or "").lower().strip()
                if trigger and trigger in text_lower:
                    reply_text = flow.get("response") or flow.get("message") or ""
                    return {
                        "reply": self.compile_text(reply_text),
                        "order_created": None,
                        "mode": "flows",
                        "store": store_name
                    }

        # 2. DETECCIÓN DE PEDIDO COMPARTIDO DESDE LA CARTA WEB (OlaClick / Tripp style)
        is_catalog_shared_order = "mi pedido" in text_lower or "pedido #" in text_lower or re.search(r"\d+x\s+.+—\s*\$?", text)
        if is_catalog_shared_order:
            # Parsear pedido compartido desde el catálogo
            order_num = self.sb.get_next_order_number(store.get("id"))
            subtotal_match = re.search(r"subtotal[^\d\n]*([$\d\.,]+)", text, re.IGNORECASE)
            total_match = re.search(r"total[^\d\n]*([$\d\.,]+)", text, re.IGNORECASE)
            name_match = re.search(r"nombre[:\s*]+([^\n,]+)", text, re.IGNORECASE)
            addr_match = re.search(r"(?:direcci[oó]n|dir|calle)[:\s*]+([^\n,]+)", text, re.IGNORECASE)
            pay_match = re.search(r"(?:forma de pago|pago)[:\s*]+([^\n,]+)", text, re.IGNORECASE)

            def clean_curr(raw_val):
                if not raw_val: return 0
                c = re.sub(r"[^\d]", "", raw_val)
                return float(c) if c else 0

            subtotal_val = clean_curr(subtotal_match.group(1)) if subtotal_match else 0
            total_val = clean_curr(total_match.group(1)) if total_match else subtotal_val
            cust_name = name_match.group(1).strip() if name_match else "Cliente Web"
            cust_addr = addr_match.group(1).strip() if addr_match else "Entrega a coordinar"
            pay_str = pay_match.group(1).lower() if pay_match else ""
            payment_method = "transferencia" if any(t in pay_str for t in ["transf", "mp", "alias", "cbu"]) else "efectivo"

            # Parsear líneas de ítems
            parsed_items = []
            for line in text.split("\n"):
                m = re.match(r"[•\*\-]?\s*(\d+)x\s+([^—\n]+?)\s*—\s*\$?([\d\.,]+)", line)
                if m:
                    parsed_items.append({
                        "name": m.group(2).strip(),
                        "qty": int(m.group(1)),
                        "unitPrice": clean_curr(m.group(3)) / max(1, int(m.group(1))),
                        "notes": "Desde carta web WhatsApp"
                    })

            new_order = {
                "id": f"ord-web-{int(time.time() * 1000)}",
                "store_id": store.get("id"),
                "order_number": order_num,
                "channel": "whatsapp",
                "table_number": "",
                "customer": {
                    "name": cust_name,
                    "phone": phone,
                    "address": cust_addr
                },
                "items": parsed_items if parsed_items else [{"name": "Pedido Catálogo", "qty": 1, "unitPrice": total_val or subtotal_val}],
                "subtotal": subtotal_val or total_val,
                "delivery_fee": delivery_fee if "delivery" in text_lower or "domicilio" in text_lower else 0,
                "total": total_val or subtotal_val,
                "payment_method": payment_method,
                "status": "pendiente",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }

            created = self.sb.create_order(new_order)
            created_record = created[0] if created and isinstance(created, list) else new_order

            # Elegir plantilla de confirmación según el modo
            tpl_confirm = self.templates.get("template_catalog_direct_confirmation")
            if not tpl_confirm:
                tpl_confirm = (
                    "🎉 *¡Recibimos tu pedido #{pedido_id}!* 🍔🔥\n\n"
                    "¡Muchas gracias *{cliente}*! Tu comanda ya ingresó al sistema de nuestra cocina y caja.\n"
                    "💵 *Total:* ${total}\n"
                    "🚀 *Entrega:* {tipo_entrega}\n\n"
                    "👩‍💼 *En instantes nuestra cajera confirma tu pedido y te avisa el tiempo estimado. ¡Muchas gracias!*"
                )

            compiled_reply = self.compile_text(tpl_confirm, {
                "cliente": cust_name,
                "pedido_id": str(order_num),
                "total": f"{int(total_val or subtotal_val):,}".replace(",", "."),
                "tipo_entrega": "A domicilio" if "delivery" in text_lower else "Retiro por el local",
                "detalle_pedido": f"📍 Destino: {cust_addr}"
            })

            return {
                "reply": compiled_reply,
                "order_created": created_record,
                "mode": bot_mode,
                "store": store_name,
                "paused_for_human": (bot_mode == "catalog_direct")
            }

        # 3. SALUDO O SOLICITUD DE CARTA DIGITAL
        is_greeting = any(w in text_lower for w in [
            "hola", "buenas", "buen dia", "buenas tardes", "buenas noches",
            "menu", "carta", "que tienen", "que hay", "precios", "promos"
        ])

        if is_greeting or bot_mode in ["catalog", "catalog_direct", "templates"]:
            if bot_mode == "catalog_direct":
                custom_tpl = self.templates.get("template_catalog_direct_welcome")
                if not custom_tpl:
                    custom_tpl = (
                        f"🍔 *¡Hola {{cliente}}! Bienvenido a {store_name}* 🔥\n\n"
                        f"📱 *Hacé tu pedido directo desde nuestra Carta Online con fotos reales y precios:*\n"
                        f"👉 {catalog_link}\n\n"
                        f"Armá tu pedido en un toque y al enviarlo ingresa directamente a nuestra cocina y POS. ¡Te esperamos! 🛵✨"
                    )
            elif bot_mode == "catalog":
                custom_tpl = (
                    f"🍔 *¡Hola {{cliente}}! Bienvenido a {store_name}* 🔥\n\n"
                    f"📱 *¡Hacé tu pedido directo desde nuestra Carta Digital interactiva con fotos reales y precios!* 📸\n"
                    f"👉 {catalog_link}\n\n"
                    f"Allí podés ver fotos reales de cada hamburguesa, armar tu combo con adicionales y enviar tu pedido directo a la cocina en un toque. ¡Te esperamos! 🛵✨\n\n"
                    f"_Si necesitás consultar por un pedido en curso o hablar con nosotros, podés escribir *ESTADO* o *HUMANO*._"
                )
            else: # modo templates: bienvenida con menú catálogo prediseñado
                custom_tpl = self.templates.get("template_menu")
                if not custom_tpl or "{catalogo_lista}" not in custom_tpl or "Consultar estado" in custom_tpl or custom_tpl.strip() == "Hola bienvenido a nuestro menu!":
                    custom_tpl = (
                        f"🍔 *¡Hola {{cliente}}! Bienvenido a {store_name}* 🔥\n\n"
                        f"{{promos_alerta}}¿Qué te preparamos hoy? *Elegí lo que más te guste:*\n\n"
                        f"{{catalogo_lista}}\n\n"
                        f"───────────────────\n"
                        f"👉 *Respondé con el NÚMERO (1, 2, 3...) o el nombre de lo que quieras pedir.*\n"
                        f"👉 Podés agregar aclaraciones como *Sin cebolla*, *Extra cheddar*, etc.\n\n"
                        f"_Si querés consultar horarios, datos de pago o un pedido en curso, escribí *HORARIOS*, *DATOS* o *ESTADO*._"
                    )

            compiled = self.compile_text(custom_tpl)
            return {
                "reply": compiled,
                "order_created": None,
                "mode": bot_mode,
                "store": store_name
            }

        # 4. CONSULTA DE HORARIOS O DIRECCIÓN
        if any(w in text_lower for w in ["horario", "abierto", "donde estan", "direccion", "ubicacion"]):
            custom_hours = self.templates.get("template_hours") or self.templates.get("menu_response_3")
            if custom_hours:
                reply = self.compile_text(custom_hours)
            else:
                addr = store.get("contact_info", {}).get("address", "Consultar dirección por chat")
                reply = (
                    f"📍 *{store_name}*\n"
                    f"Dirección: {addr}\n"
                    f"🕒 Estamos abiertos de Miércoles a Domingos de 19:30 a 00:30 hs.\n"
                    f"Mirá toda la carta y hacé tu pedido en: {catalog_link}"
                )
            return {
                "reply": reply,
                "order_created": None,
                "mode": bot_mode,
                "store": store_name
            }

        # 5. MODO TEXTO / AUTO-PEDIDO: PARSING DE PRODUCTOS Y CREACIÓN DE COMANDA EN SUPABASE
        if bot_mode in ["templates", "auto_order", "hybrid", "ai"]:
            matched_items = []
            subtotal = 0

            # Comparar contra los productos reales de la base de datos de Supabase
            for p in self.products:
                p_name_lower = p.get("name", "").lower()
                clean_term = p_name_lower[:14].strip()
                pattern = rf"(\d+)?\s*(?:de\s+)?{re.escape(clean_term)}"
                match = re.search(pattern, text_lower)
                if match or clean_term in text_lower:
                    qty = int(match.group(1)) if match and match.group(1) else 1
                    price = float(p.get("price", 0))
                    item_total = price * qty
                    subtotal += item_total
                    matched_items.append({
                        "id": p.get("id"),
                        "name": p.get("name"),
                        "qty": qty,
                        "unitPrice": price,
                        "notes": "Tomado automáticamente por Bot WhatsApp"
                    })

            if matched_items:
                order_num = self.sb.get_next_order_number(store.get("id"))
                total = subtotal + delivery_fee

                # Parsear datos de envío
                name_match = re.search(r"nombre[:\s]+([^\n,]+)", text, re.IGNORECASE)
                addr_match = re.search(r"(?:direccion|dir|calle)[:\s]+([^\n,]+)", text, re.IGNORECASE)
                cust_name = name_match.group(1).strip() if name_match else "Cliente WhatsApp"
                cust_addr = addr_match.group(1).strip() if addr_match else "A coordinar por chat"

                # Detectar forma de pago
                is_transf = any(t in text_lower for t in ["transf", "alias", "banco", "mp", "mercado"])
                payment_method = "transferencia" if is_transf else "efectivo"

                new_order = {
                    "id": f"ord-bot-{int(time.time() * 1000)}",
                    "store_id": store.get("id"),
                    "order_number": order_num,
                    "channel": "whatsapp",
                    "table_number": "",
                    "customer": {
                        "name": cust_name,
                        "phone": phone,
                        "address": cust_addr
                    },
                    "items": matched_items,
                    "subtotal": subtotal,
                    "delivery_fee": delivery_fee,
                    "total": total,
                    "payment_method": payment_method,
                    "status": "pendiente",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }

                # INSERTAR EN SUPABASE CLOUD DIRECTO A COCINA Y POS
                created = self.sb.create_order(new_order)
                created_record = created[0] if created and isinstance(created, list) else new_order

                # Formatear comprobante WhatsApp
                items_text = "\n".join([f"• {it['qty']}x {it['name']} (${int(it['unitPrice'] * it['qty']):,})".replace(",", ".") for it in matched_items])

                payment_extra = ""
                if payment_method == "transferencia":
                    alias = store.get("payment_settings", {}).get("transferAlias", "COMANDA.FAST")
                    payment_extra = f"\n💳 *Datos de Transferencia:*\n• Alias: *{alias}*\n• Por favor enviá el comprobante por acá.\n"

                reply = (
                    f"✅ *¡Comanda #{order_num} Registrada en {store_name}!* 🔥\n\n"
                    f"📋 *Tu Pedido:*\n{items_text}\n\n"
                    f"🛵 Envío: ${int(delivery_fee):,}\n"
                    f"💰 *Total a abonar: ${int(total):,}* ({payment_method.capitalize()})\n"
                    f"{payment_extra}\n"
                    f"📍 Dirección: {cust_addr}\n"
                    f"⏱️ Tiempo estimado: {self.templates.get('delay_minutes', '25 a 40')} min.\n"
                    f"¡Ya dimos aviso a la cocina para su preparación! 🚀"
                ).replace(",", ".")

                return {
                    "reply": reply,
                    "order_created": created_record,
                    "mode": bot_mode,
                    "store": store_name
                }

        # 5. RESPUESTA POR DEFECTO AMIGABLE CON ENLACE
        return {
            "reply": (
                f"Gracias por escribir a *{store_name}* 🍔.\n"
                f"Podés ver todos los productos con fotos y promociones en nuestra carta digital:\n"
                f"{catalog_link}\n\n"
                f"O decinos qué te gustaría pedir y te tomamos la comanda por acá."
            ),
            "order_created": None,
            "mode": bot_mode,
            "store": store_name
        }


# ---------------------------------------------------------------------------
# SERVIDOR HTTP REST & WEBHOOK COMPATIBLE
# ---------------------------------------------------------------------------
active_engine = None

class BotHttpHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        store = active_engine.current_store if active_engine else {}

        if path in ["/", "/health"]:
            self._send_json(200, {
                "status": "online",
                "service": "ComandaFast WhatsApp Python Daemon",
                "version": "2.1.0",
                "store_active": store.get("name", "Sin tienda asignada"),
                "store_slug": store.get("slug", "demo"),
                "store_id": store.get("id"),
                "bot_mode": active_engine.get_mode() if active_engine else "auto_order",
                "products_count": len(active_engine.products) if active_engine else 0,
                "supabase_target": DEFAULT_SUPABASE_URL,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        elif path == "/api/status":
            self._send_json(200, {
                "status": "connected",
                "bot": "ComandaFast Multi-Tenant Python Daemon",
                "store": store.get("name", "Demo"),
                "slug": store.get("slug", "demo"),
                "qr": None,
                "uptime": time.time()
            })
        elif path.startswith("/api/stores/"):
            parts = path.strip("/").split("/")
            if len(parts) >= 3:
                s_id = parts[2]
                st = active_engine.sb.get_store_by_slug_or_id(s_id)
                self._send_json(200, st or {"error": "Comercio no encontrado"})
            else:
                stores = active_engine.sb.list_all_stores()
                self._send_json(200, stores)
        else:
            self._send_json(404, {"error": "Ruta no encontrada"})

    def do_POST(self):
        path = self.path.split("?")[0]
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # 1. Simulador de Chat desde Web o consola
        if path == "/api/simulate-chat":
            msg = payload.get("message", "")
            phone = payload.get("phone", "5491122334455")
            store_id = payload.get("store_id")

            result = active_engine.process_message(phone, msg, store_id)
            self._send_json(200, result)

        # 2. Webhook WhatsApp Oficial (Meta Cloud API / Baileys / Evolution API)
        elif path == "/api/webhook/whatsapp":
            msg = ""
            phone = ""
            store_id = payload.get("store_id")

            if "message" in payload and "phone" in payload:
                msg = payload["message"]
                phone = payload["phone"]
            elif "entry" in payload:
                try:
                    change = payload["entry"][0]["changes"][0]["value"]
                    msg_obj = change.get("messages", [{}])[0]
                    msg = msg_obj.get("text", {}).get("body", "")
                    phone = msg_obj.get("from", "")
                except Exception:
                    pass

            result = active_engine.process_message(phone, msg, store_id)
            self._send_json(200, result)

        # 3. Cambio de negocio en caliente
        elif path == "/api/switch-store":
            slug = payload.get("slug") or payload.get("store_id")
            if slug:
                st = active_engine.load_store_context(slug)
                self._send_json(200, {
                    "success": True,
                    "store": st.get("name"),
                    "slug": st.get("slug"),
                    "mode": active_engine.get_mode()
                })
            else:
                self._send_json(400, {"error": "Falta parámetro slug"})

        else:
            self._send_json(404, {"error": "Endpoint POST no encontrado"})


# ---------------------------------------------------------------------------
# MODO INTERACTIVO CLI (Chat en terminal)
# ---------------------------------------------------------------------------
def run_interactive_chat(engine):
    store = engine.current_store
    print("\n" + "=" * 60)
    print(f"💬 MODO CHAT INTERACTIVO — {store.get('name')} (slug: {store.get('slug')})")
    print(f"Modo del bot: {engine.get_mode().upper()} | Productos: {len(engine.products)}")
    print("Escribí tus mensajes simulando ser un cliente de WhatsApp.")
    print("Escribí 'salir' o 'exit' para terminar.")
    print("=" * 60 + "\n")

    user_phone = "5491199887766"
    while True:
        try:
            msg = input("\n👤 Cliente: ").strip()
            if not msg:
                continue
            if msg.lower() in ["salir", "exit", "quit"]:
                print("Finalizando sesión interactiva.")
                break

            response = engine.process_message(user_phone, msg)
            print(f"\n🤖 Bot ({response.get('mode')}):\n{response['reply']}")

            if response.get("order_created"):
                ord_data = response["order_created"]
                print(f"\n[🔥 COMANDA GENERADA EN SUPABASE -> ID: {ord_data.get('id')} | TOTAL: ${ord_data.get('total')}]")
        except (KeyboardInterrupt, EOFError):
            print("\nSaliendo...")
            break


# ---------------------------------------------------------------------------
# ENTRYPOINT CLI
# ---------------------------------------------------------------------------
def main():
    global active_engine
    parser = argparse.ArgumentParser(
        description="COMANDA SAAS — Bot de WhatsApp Ejecutable Multi-Negocio en Python",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("-s", "--store", "--slug", dest="slug", type=str, default=None,
                        help="Slug del negocio a conectar (ej: fastburga-centro, demo)")
    parser.add_argument("-p", "--port", type=int, default=3002,
                        help="Puerto HTTP del servidor de webhook (default: 3002)")
    parser.add_argument("-m", "--message", type=str, default=None,
                        help="Simular un mensaje directo y devolver la respuesta en consola")
    parser.add_argument("-i", "--interactive", action="store_true",
                        help="Iniciar en modo chat interactivo en consola de inmediato")
    parser.add_argument("--list", action="store_true",
                        help="Listar todos los comercios registrados en Supabase y salir")

    args = parser.parse_args()

    client = SupabaseClient()

    # Si se pide solo listar
    if args.list:
        print(f"\nConectando a Supabase ({DEFAULT_SUPABASE_URL})...\n")
        stores = client.list_all_stores()
        print(f"{'SLUG':<25} {'NOMBRE DEL COMERCIO':<35} {'RUBRO':<15}")
        print("-" * 75)
        for s in stores:
            print(f"{s.get('slug', ''):<25} {s.get('name', ''):<35} {s.get('industry', 'fast_food'):<15}")
        print(f"\nTotal: {len(stores)} comercios activos.\n")
        return

    # Si no se pasó slug, preguntar de forma interactiva en la consola
    target_slug = args.slug
    if not target_slug and sys.stdin.isatty() and not os.getenv("COMANDA_AUTO_START"):
        print("\n" + "=" * 65)
        print("🍔 COMANDA FAST — ASISTENTE WHATSAPP MULTI-NEGOCIO")
        print(f"📡 Supabase Target: {DEFAULT_SUPABASE_URL}")
        print("=" * 65)

        stores = client.list_all_stores()
        if stores:
            print("\nComercios detectados en tu base de datos:")
            for idx, s in enumerate(stores, 1):
                print(f"  [{idx}] {s.get('slug', ''):<22} -> {s.get('name')}")
            print()

            choice = input("Escribí el número [1..N] o el SLUG del negocio (ENTER para 'demo'): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(stores):
                target_slug = stores[int(choice) - 1]["slug"]
            elif choice:
                target_slug = choice
            else:
                target_slug = "demo"
        else:
            target_slug = "demo"

    if not target_slug:
        target_slug = "demo"

    print(f"\n[Sistema] Cargando configuración de Supabase para comercio: '{target_slug}'...")
    active_engine = MultiTenantBotEngine(target_slug, client)
    store = active_engine.current_store

    print(f"\n" + "-" * 60)
    print(f"✅ COMERCIO CONECTADO:")
    print(f"   • Nombre:    {store.get('name')}")
    print(f"   • Slug:      {store.get('slug')}")
    print(f"   • ID:        {store.get('id')}")
    print(f"   • Modo Bot:  {active_engine.get_mode().upper()}")
    print(f"   • Productos: {len(active_engine.products)} cargados desde Supabase")
    print(f"   • Enlace:    https://comandasaas.app/#catalog?store={store.get('slug')}")
    print("-" * 60)

    # Si se pasó mensaje por comando directo
    if args.message:
        res = active_engine.process_message("5491100000000", args.message)
        print(f"\n[RESPUESTA DEL BOT — Modo: {res.get('mode')}]")
        print(res.get("reply"))
        if res.get("order_created"):
            print(f"\n[🔥 COMANDA GENERADA EN SUPABASE -> ID: {res['order_created'].get('id')} | TOTAL: ${res['order_created'].get('total')}]")
        return

    # Si se solicitó modo interactivo
    if args.interactive:
        run_interactive_chat(active_engine)
        return

    # Si no, iniciar servidor HTTP daemon
    server_address = ("", args.port)
    httpd = HTTPServer(server_address, BotHttpHandler)
    print(f"\n🚀 Servidor Webhook & API escuchando en http://localhost:{args.port}")
    print(f"   • Endpoint Health:     http://localhost:{args.port}/health")
    print(f"   • Endpoint Webhook:    http://localhost:{args.port}/api/webhook/whatsapp")
    print(f"   • Endpoint Simulador:  http://localhost:{args.port}/api/simulate-chat")
    print(f"\nPresiona Ctrl + C para detener el bot.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Sistema] Deteniendo servidor de WhatsApp Bot...")
        httpd.server_close()


if __name__ == "__main__":
    main()
