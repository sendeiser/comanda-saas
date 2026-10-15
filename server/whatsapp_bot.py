#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
COMANDAFAST — BOT DE WHATSAPP EMPRESARIAL PORTABLE (.EXE)
Lanzador maestro multi-tenant oficial con conexión Baileys Multi-Device.
Sincronización bidireccional directa con Supabase Cloud:
  - Validación dinámica de comercios por SLUG (stores)
  - Conexión real 24/7 con WhatsApp Web oficial (Cero costos de API)
  - Generación de Código QR en terminal y en navegador web (/qr)
  - Persistencia de sesión (data/baileys_auth) para reconexión automática
  - Notificaciones en tiempo real e inyección directa al sistema POS
=============================================================================
"""

import os
import sys
import json
import time
import shutil
import socket
import argparse
import subprocess
import urllib.request
import urllib.error
import urllib.parse
import webbrowser

# Configurar encoding UTF-8 en consolas Windows
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Credenciales canónicas de Supabase Cloud
DEFAULT_SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://vmnhystuwcbdbukoxdtz.supabase.co")
DEFAULT_SUPABASE_KEY = os.getenv(
    "VITE_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg"
)

def get_base_dir():
    """Retorna el directorio base temporal si está congelado con PyInstaller (_MEIPASS), o el del script."""
    if hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def get_app_dir():
    """Retorna el directorio permanente donde reside el ejecutable .exe o la raíz del proyecto."""
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    # Si se ejecuta como script en server/, la raíz es el directorio padre
    cur = os.path.dirname(os.path.abspath(__file__))
    if os.path.basename(cur).lower() == "server":
        return os.path.dirname(cur)
    return cur

CONFIG_FILE_PATH = os.path.join(get_app_dir(), "comanda_bot_config.json")

def load_local_config():
    """Carga la configuración persistente guardada localmente."""
    if os.path.exists(CONFIG_FILE_PATH):
        try:
            with open(CONFIG_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_local_config(config_dict):
    """Guarda la configuración persistente junto al ejecutable."""
    try:
        current = load_local_config()
        current.update(config_dict)
        with open(CONFIG_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[Aviso] No se pudo guardar configuración local: {e}", file=sys.stderr)
        return False

def get_local_ip():
    """Detecta la IP local de la máquina en la red Wi-Fi / Ethernet."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

# ---------------------------------------------------------------------------
# CLIENTE REST SUPABASE PARA VALIDACIÓN DE COMERCIOS
# ---------------------------------------------------------------------------
class SupabaseClient:
    def __init__(self, url=DEFAULT_SUPABASE_URL, key=DEFAULT_SUPABASE_KEY):
        self.url = url.rstrip("/")
        self.key = key

    def _headers(self):
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    def get(self, table, query=""):
        url = f"{self.url}/rest/v1/{table}"
        if query:
            url += f"?{query}"
        req = urllib.request.Request(url, headers=self._headers(), method="GET")
        try:
            with urllib.request.urlopen(req, timeout=8) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as e:
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

        # 3. Búsqueda aproximada
        fallback = self.get("stores", f"slug=ilike.*{urllib.parse.quote(clean)}*&limit=1")
        if fallback and len(fallback) > 0:
            return fallback[0]

        return None

# ---------------------------------------------------------------------------
# LOCALIZACIÓN Y GESTIÓN DE NODE.JS Y SERVER SCRIPT
# ---------------------------------------------------------------------------
def find_node_executable():
    """Localiza el ejecutable de Node.js en la carpeta portable, en PATH o en el sistema."""
    app_dir = get_app_dir()
    
    # 1. Junto a ComandaBot.exe
    candidate_app = os.path.join(app_dir, "node.exe")
    if os.path.exists(candidate_app):
        return candidate_app

    # 2. En carpeta temporal _MEIPASS (si fue empaquetado)
    if hasattr(sys, "_MEIPASS"):
        m_cand = os.path.join(sys._MEIPASS, "node.exe")
        if os.path.exists(m_cand):
            return m_cand

    # 3. En PATH del sistema
    which_node = shutil.which("node")
    if which_node:
        return which_node

    # 4. Rutas comunes en Windows
    for p in [
        r"D:\Archivos de Programas\NodeJs\node.exe",
        r"C:\Program Files\nodejs\node.exe",
        r"C:\Program Files (x86)\nodejs\node.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\node\node.exe")
    ]:
        if os.path.exists(p):
            return p

    # 5. Descarga automática si no existe en la máquina
    print("\n⚠️ No se encontró Node.js en este equipo.")
    print("Descargando runtime portable de Node.js (solo una vez, ~35 MB)...")
    try:
        target_node = os.path.join(app_dir, "node.exe")
        urllib.request.urlretrieve("https://nodejs.org/dist/v20.18.0/win-x64/node.exe", target_node)
        if os.path.exists(target_node):
            print("✅ Runtime de Node.js descargado e integrado con éxito.")
            return target_node
    except Exception as e:
        print(f"❌ Error al descargar node.exe: {e}")

    return None

def find_server_script():
    """Localiza server/whatsappBotServer.js en la carpeta permanente o temporal."""
    app_dir = get_app_dir()
    candidates = [
        os.path.join(app_dir, "server", "whatsappBotServer.js"),
        os.path.join(app_dir, "whatsappBotServer.js"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "whatsappBotServer.js"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "server", "whatsappBotServer.js")
    ]
    if hasattr(sys, "_MEIPASS"):
        candidates.append(os.path.join(sys._MEIPASS, "server", "whatsappBotServer.js"))

    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)

    return candidates[0]

def free_port_if_occupied(port=3002):
    """Detecta y libera el puerto 3002 si una instancia zombie previa quedó en ejecución."""
    if sys.platform != "win32":
        return
    try:
        output = subprocess.check_output(f'netstat -aon | findstr :{port}', shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in output.strip().splitlines():
            if "LISTENING" in line:
                parts = line.strip().split()
                pid = parts[-1]
                if pid and pid.isdigit() and int(pid) != os.getpid():
                    print(f"ℹ️ Puerto {port} ocupado por proceso previo (PID {pid}). Liberando...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
                    time.sleep(1.2)
                    break
    except Exception:
        pass

# ---------------------------------------------------------------------------
# INTERFAZ INTERACTIVA PARA EL USUARIO
# ---------------------------------------------------------------------------
def prompt_for_store_slug(client):
    """Solicita interactivamente el SLUG del negocio y valida con Supabase."""
    cfg = load_local_config()
    saved_slug = cfg.get("last_slug", "").strip()
    saved_name = cfg.get("last_store_name", "").strip()

    print("\n" + "=" * 70)
    print("🍔 COMANDA FAST — ASISTENTE WHATSAPP OFICIAL (MULTI-DEVICE)")
    print("📡 Sincronización en la nube con Supabase Cloud y Sistema POS")
    print("=" * 70)

    # Si hay un slug previamente guardado en esta máquina
    if saved_slug:
        prompt_info = f"\n👉 Negocio guardado en esta PC: '{saved_slug}'"
        if saved_name:
            prompt_info += f" ({saved_name})"
        print(prompt_info)
        try:
            choice = input(f"Presioná ENTER para continuar con '{saved_slug}', o escribí un nuevo SLUG: ").strip()
        except (EOFError, KeyboardInterrupt):
            choice = ""

        if not choice:
            print(f"Verificando negocio '{saved_slug}' en Supabase...")
            store = client.get_store_by_slug_or_id(saved_slug)
            if store:
                return store
            else:
                print(f"⚠️ El negocio previo '{saved_slug}' ya no está disponible en la base de datos.")
        else:
            print(f"Verificando negocio '{choice}' en Supabase...")
            store = client.get_store_by_slug_or_id(choice)
            if store:
                save_local_config({"last_slug": store["slug"], "last_store_name": store.get("name", "")})
                return store
            else:
                print(f"❌ No se encontró ningún comercio con el SLUG '{choice}'.")

    # Solicitar obligatoriamente el SLUG del negocio
    while True:
        print("\n" + "-" * 60)
        print("✍️  Por favor, escribí el SLUG de tu negocio (ej: fastburga-centro):")
        print("    [Tip: escribí '?' o 'lista' para ver los comercios activos]")
        print("-" * 60)

        try:
            user_slug = input("SLUG de tu negocio > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nOperación cancelada.")
            sys.exit(0)

        if not user_slug:
            print("⚠️ El SLUG no puede estar vacío.")
            continue

        if user_slug.lower() in ["?", "lista", "list", "ver", "comercios"]:
            print("\nConsultando comercios en Supabase Cloud...")
            stores = client.list_all_stores()
            if stores:
                print("\nComercios activos encontrados:")
                for idx, s in enumerate(stores, 1):
                    print(f"  [{idx}] {s.get('slug', ''):<25} -> {s.get('name')}")
                try:
                    sub_pick = input("\nEscribí el número [1..N] o el SLUG de tu negocio: ").strip()
                except (EOFError, KeyboardInterrupt):
                    continue
                if sub_pick.isdigit():
                    pick_idx = int(sub_pick) - 1
                    if 0 <= pick_idx < len(stores):
                        target = stores[pick_idx]
                        save_local_config({"last_slug": target["slug"], "last_store_name": target.get("name", "")})
                        return target
                elif sub_pick:
                    target = client.get_store_by_slug_or_id(sub_pick)
                    if target:
                        save_local_config({"last_slug": target["slug"], "last_store_name": target.get("name", "")})
                        return target
            else:
                print("⚠️ No se pudieron obtener comercios desde la nube.")
            continue

        print(f"Verificando '{user_slug}'...")
        store = client.get_store_by_slug_or_id(user_slug)
        if store:
            save_local_config({"last_slug": store["slug"], "last_store_name": store.get("name", "")})
            return store
        else:
            print(f"❌ No se encontró ningún comercio con el SLUG '{user_slug}'. Verificá e intentá nuevamente.")

def show_action_menu(store):
    """Muestra el menú de acciones para vincular celular o conectar normalmente."""
    print("\n" + "=" * 70)
    print(f"🍔 COMERCIO SELECCIONADO: {store.get('name')} ({store.get('slug')})")
    print("=" * 70)
    print("\n¿Cómo deseas iniciar el bot de WhatsApp?")
    print("  [1] Conectar Bot normalmente (usa la sesión guardada si ya vinculaste)")
    print("  [2] Vincular NUEVO celular (Muestra CÓDIGO QR en pantalla y navegador)")
    print("  [3] Cambiar comercio / SLUG de negocio")
    print("  [4] Abrir Simulador Web de Pedidos")
    print("  [5] Salir")
    print()
    try:
        op = input("Elegí una opción [1, 2, 3, 4 o 5] (Por defecto 1): ").strip()
    except (EOFError, KeyboardInterrupt):
        return "5"
    if not op:
        return "1"
    return op

def run_bot(node_bin, server_script, slug, reset=False):
    """Ejecuta el servidor de Baileys conectando la consola e invocando el navegador."""
    app_dir = get_app_dir()
    free_port_if_occupied(3002)

    cmd = [node_bin, server_script, "--store", slug]
    if reset:
        cmd.append("--reset")

    env = os.environ.copy()
    env["STORE_SLUG"] = slug
    env["PORT"] = "3002"

    for nm in [
        os.path.join(app_dir, "node_modules"),
        os.path.join(os.path.dirname(server_script), "..", "node_modules"),
        os.path.join(os.path.dirname(server_script), "node_modules")
    ]:
        if os.path.exists(nm):
            env["NODE_PATH"] = os.path.abspath(nm)
            break

    local_ip = get_local_ip()
    print("\n" + "=" * 70)
    if reset:
        print("📲 MODO VINCULACIÓN: GENERANDO CÓDIGO QR DE WHATSAPP...")
        print("   -> Abrí WhatsApp en tu celular > Dispositivos vinculados > Vincular")
    else:
        print("🚀 INICIANDO BOT DE WHATSAPP COMANDAFAST (MODO BAILEYS MULTI-DEVICE)...")
    print(f"   👉 Estado & Conexión QR:  http://localhost:3002/qr")
    print(f"   👉 Simulador Web:         http://localhost:3002/simulador")
    print(f"   👉 Acceso móvil en Wi-Fi: http://{local_ip}:3002/qr")
    print("=" * 70 + "\n")

    try:
        proc = subprocess.Popen(cmd, cwd=app_dir, env=env)
        proc.wait()
    except KeyboardInterrupt:
        print("\n[Sistema] Deteniendo bot de WhatsApp...")
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
        print("[Sistema] Bot detenido con éxito.")

# ---------------------------------------------------------------------------
# PUNTO DE ENTRADA PRINCIPAL
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="ComandaFast WhatsApp Bot Portable")
    parser.add_argument("--slug", "-s", help="SLUG del comercio en Supabase", default=None)
    parser.add_argument("--reset", "-r", "--qr", help="Forzar generación de nuevo Código QR", action="store_true")
    args = parser.parse_args()

    client = SupabaseClient()
    
    # Resolver comercio
    if args.slug:
        store = client.get_store_by_slug_or_id(args.slug)
        if not store:
            print(f"⚠️ Comercio '{args.slug}' no encontrado en Supabase. Usando 'demo'...")
            store = {"name": "Comanda Gastronómica Demo", "slug": "demo"}
    else:
        store = prompt_for_store_slug(client)

    # Menú interactivo si no se pasaron flags por línea de comando
    reset_mode = args.reset
    if not args.slug and not args.reset:
        while True:
            choice = show_action_menu(store)
            if choice == "1":
                reset_mode = False
                break
            elif choice == "2":
                reset_mode = True
                break
            elif choice == "3":
                store = prompt_for_store_slug(client)
                continue
            elif choice == "4":
                # Abrir simulador web
                webbrowser.open("http://localhost:3002/simulador")
                reset_mode = False
                break
            elif choice == "5":
                print("Saliendo...")
                sys.exit(0)
            else:
                reset_mode = False
                break

    # Localizar Node.js
    node_bin = find_node_executable()
    if not node_bin:
        print("\n❌ [ERROR CRÍTICO] No se encontró Node.js en este equipo.")
        print("Para ejecutar el bot portátil:")
        print("1. Descarga e instala Node.js desde: https://nodejs.org/")
        print("2. O copia el archivo 'node.exe' junto a este ejecutable ComandaBot.exe.")
        input("\nPresioná ENTER para salir...")
        sys.exit(1)

    # Localizar script del servidor Baileys
    server_script = find_server_script()
    if not os.path.exists(server_script):
        print(f"\n❌ [ERROR CRÍTICO] No se encontró el archivo del servidor: {server_script}")
        print("Asegurate de que la carpeta 'server/' con whatsappBotServer.js esté junto a ComandaBot.exe.")
        input("\nPresioná ENTER para salir...")
        sys.exit(1)

    # Ejecutar bot con los parámetros seleccionados
    run_bot(node_bin, server_script, store["slug"], reset=reset_mode)

if __name__ == "__main__":
    main()
