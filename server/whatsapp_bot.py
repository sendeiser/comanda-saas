#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
COMANDA SAAS — BOT DE WHATSAPP MULTI-TENANT EN PYTHON
Servicio rápido, liviano y desacoplado para atención automática gastronómica.
Conexión directa con Supabase Cloud (https://vmnhystuwcbdbukoxdtz.supabase.co)
Soporta:
  - Multi-tenant por store_id / slug
  - Parsing de pedidos en lenguaje natural
  - Creación automática de comandas en la nube (tabla orders)
  - Endpoints REST para simulación, webhooks y monitoreo
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

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Configuración por defecto de Supabase
DEFAULT_SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://vmnhystuwcbdbukoxdtz.supabase.co")
DEFAULT_SUPABASE_KEY = os.getenv(
    "VITE_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg"
)

# Estado de sesiones conversacionales en memoria (phone -> state)
SESSIONS = {}

# ---------------------------------------------------------------------------
# CLIENTE SUPABASE REST EN PYTHON (Zero-deps, ultra rápido)
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
            with urllib.request.urlopen(req, timeout=8) as res:
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
            with urllib.request.urlopen(req, timeout=8) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"[SupabaseClient POST {table} HTTP {e.code}] Error: {err_body}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"[SupabaseClient POST {table}] Error: {e}", file=sys.stderr)
            return None

    def get_store(self, store_id_or_slug):
        if not store_id_or_slug or store_id_or_slug == "demo":
            query = "slug=eq.demo&limit=1"
        else:
            query = f"or=(id.eq.{store_id_or_slug},slug.eq.{store_id_or_slug})&limit=1"
        res = self.get("stores", query)
        if res and len(res) > 0:
            return res[0]
        # Fallback al primer comercio activo
        fallback = self.get("stores", "is_active=eq.true&limit=1")
        return fallback[0] if fallback and len(fallback) > 0 else None

    def get_products(self, store_id=None):
        if store_id:
            query = f"or=(store_id.eq.{store_id},store_id.is.null)&is_active=eq.true&order=name.asc"
        else:
            query = "is_active=eq.true&order=name.asc"
        return self.get("products", query) or []

    def get_bot_templates(self, store_id=None):
        store_id = store_id or "00000000-0000-0000-0000-000000000001"
        res = self.get("bot_config", f"id=eq.bot_templates_{store_id}&limit=1")
        if res and len(res) > 0 and res[0].get("data"):
            return res[0]["data"]
        return {}

    def get_next_order_number(self, store_id=None):
        orders = self.get("orders", "select=order_number&order=order_number.desc&limit=1")
        if orders and len(orders) > 0 and orders[0].get("order_number"):
            return int(orders[0]["order_number"]) + 1
        return 1

    def create_order(self, order_dict):
        return self.post("orders", order_dict, upsert=False)


# ---------------------------------------------------------------------------
# MOTOR DE CONVERSACIÓN Y PARSING DE COMANDAS GASTRONÓMICAS
# ---------------------------------------------------------------------------
class GastronomyBotEngine:
    def __init__(self, supabase=None):
        self.sb = supabase or SupabaseClient()

    def process_message(self, phone, raw_text, store_id=None):
        phone = re.sub(r"[^\d+]", "", phone or "5491100000000")
        text = (raw_text or "").strip()
        text_lower = text.lower()

        # 1. Resolver tienda
        store = self.sb.get_store(store_id)
        current_store_id = store["id"] if store else "00000000-0000-0000-0000-000000000001"
        store_name = store.get("name", "ComandaFast") if store else "ComandaFast"
        store_slug = store.get("slug", "demo") if store else "demo"
        delivery_fee = store.get("delivery_settings", {}).get("baseFee", 1500) if store else 1500

        # Plantillas del comercio
        templates = self.sb.get_bot_templates(current_store_id)

        # 2. Obtener o crear sesión
        session = SESSIONS.get(phone)
        if not session or (time.time() - session.get("last_seen", 0) > 3600):
            session = {
                "step": "GREETING",
                "phone": phone,
                "store_id": current_store_id,
                "cart": [],
                "customer_name": "",
                "address": "",
                "payment_method": "efectivo",
                "delivery_type": "delivery",
                "last_seen": time.time()
            }
            SESSIONS[phone] = session
        else:
            session["last_seen"] = time.time()

        # 3. Intenciones Rápidas
        if text_lower in ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "menu", "carta", "hola!"]:
            catalog_link = f"https://comandasaas.app/carta/{store_slug}"
            welcome_tpl = templates.get("template_menu") or (
                f"¡Hola! 👋 Te damos la bienvenida a *{store_name}* 🍔\n\n"
                f"📖 Podés ver nuestra carta completa y hacer tu pedido acá:\n{catalog_link}\n\n"
                f"O si preferís, podés escribirnos directamente lo que querés pedir por acá (ej: 'Quiero 2 Burger Clásica para delivery')."
            )
            return {
                "reply": welcome_tpl.replace("{enlace_carta}", catalog_link).replace("{nombre_negocio}", store_name),
                "order_created": None
            }

        # 4. Detección y creación de pedido inteligente
        if any(w in text_lower for w in ["quiero", "pedido", "burger", "papas", "hamburguesa", "promo", "combo"]):
            products = self.sb.get_products(current_store_id)
            matched_items = []
            subtotal = 0

            # Match básico por palabras clave
            for p in products:
                p_name_lower = p.get("name", "").lower()
                # Extraer número antes del producto o 1 por defecto
                pattern = rf"(\d+)?\s*(?:de\s+)?{re.escape(p_name_lower[:12].strip())}"
                match = re.search(pattern, text_lower)
                if match or p_name_lower in text_lower:
                    qty = int(match.group(1)) if match and match.group(1) else 1
                    price = float(p.get("price", 0))
                    item_total = price * qty
                    subtotal += item_total
                    matched_items.append({
                        "id": p.get("id"),
                        "name": p.get("name"),
                        "qty": qty,
                        "unitPrice": price,
                        "notes": "Vía Bot WhatsApp"
                    })

            if matched_items:
                order_num = self.sb.get_next_order_number(current_store_id)
                total = subtotal + delivery_fee

                # Detectar nombre y dirección si vienen en el texto
                name_match = re.search(r"nombre[:\s]+([^\n,]+)", text, re.IGNORECASE)
                addr_match = re.search(r"(?:direccion|dir|calle)[:\s]+([^\n,]+)", text, re.IGNORECASE)
                cust_name = name_match.group(1).strip() if name_match else "Cliente WhatsApp"
                cust_addr = addr_match.group(1).strip() if addr_match else "A coordinar por chat"

                new_order = {
                    "id": f"ord-py-{int(time.time() * 1000)}",
                    "store_id": current_store_id,
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
                    "payment_method": "efectivo",
                    "status": "pendiente",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }

                # Guardar en Supabase Cloud
                created = self.sb.create_order(new_order)
                created_record = created[0] if created and isinstance(created, list) else new_order

                items_text = "\n".join([f"• {it['qty']}x {it['name']} (${int(it['unitPrice'] * it['qty']):,})".replace(",", ".") for it in matched_items])

                reply = (
                    f"✅ *¡Pedido #{order_num} Recibido en {store_name}!* 🎉\n\n"
                    f"📋 *Detalle del Pedido:*\n{items_text}\n\n"
                    f"🛵 Envío: ${int(delivery_fee):,}\n"
                    f"💰 *Total a pagar: ${int(total):,}*\n\n"
                    f"⏱️ Tiempo estimado: 25 a 40 minutos.\n"
                    f"¡Ya estamos preparando tu comanda en cocina! 🔥"
                ).replace(",", ".")

                return {
                    "reply": reply,
                    "order_created": created_record
                }

        # Respuesta genérica amigable
        return {
            "reply": (
                f"Gracias por comunicarte con *{store_name}* 🍔.\n"
                f"¿En qué podemos ayudarte hoy? Podés pedir la carta digital o indicarnos tu pedido directamente."
            ),
            "order_created": None
        }


# ---------------------------------------------------------------------------
# SERVIDOR HTTP REST & WEBHOOK EN PYTHON
# ---------------------------------------------------------------------------
bot_engine = GastronomyBotEngine()

class BotApiHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        if path in ["/", "/health"]:
            self._send_json(200, {
                "status": "online",
                "service": "ComandaFast WhatsApp Python Bot",
                "version": "2.0.0",
                "supabase_target": DEFAULT_SUPABASE_URL,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        elif path == "/api/status":
            self._send_json(200, {
                "status": "connected",
                "phone": "+54 9 11 0000-0000",
                "name": "ComandaFast Bot Python Daemon",
                "qr": None,
                "uptime": time.time()
            })
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

        # 1. Simulador de Chat para testing desde la web
        if path == "/api/simulate-chat":
            msg = payload.get("message", "")
            phone = payload.get("phone", "5491100000000")
            store_id = payload.get("store_id")

            result = bot_engine.process_message(phone, msg, store_id)
            self._send_json(200, result)

        # 2. Webhook Estándar WhatsApp (Meta Cloud API / Baileys / Evolution API)
        elif path == "/api/webhook/whatsapp":
            # Extraer mensaje de formato plano o Meta payload
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

            result = bot_engine.process_message(phone, msg, store_id)
            self._send_json(200, result)

        else:
            self._send_json(404, {"error": "Endpoint POST no encontrado"})


def run_server(port=3002):
    server_address = ("", port)
    httpd = HTTPServer(server_address, BotApiHandler)
    print(f"============================================================")
    print(f"🤖 COMANDA FAST — SERVIDOR DE BOT PYTHON ACTIVO EN PUERTO {port}")
    print(f"🌐 Destino Supabase: {DEFAULT_SUPABASE_URL}")
    print(f"📡 Webhook WhatsApp: http://localhost:{port}/api/webhook/whatsapp")
    print(f"🧪 Simulador Chat:   http://localhost:{port}/api/simulate-chat")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor de bot...")
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Servidor de Bot WhatsApp Python")
    parser.add_argument("--port", type=int, default=3002, help="Puerto del servidor (default: 3002)")
    args = parser.parse_args()
    run_server(args.port)
