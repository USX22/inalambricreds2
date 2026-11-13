# Comandos a la mano: InnovaLogistics (Packet Tracer)

> Todos los `show` se escriben en modo privilegiado: `enable` → aparece `R-CORE#` o `SW-CORE#`.
> Para configurar: `configure terminal`. Para salir: `end`. Para guardar: `write memory`.

## 🔀 Switches (SW-CORE / SW-ALMACEN)

| Comando | ¿Para qué sirve? | ¿Qué debe mostrar? |
|---|---|---|
| `show vlan brief` | Ver las VLANs creadas y qué puertos de acceso tiene cada una | VLAN 10, 20, 30, 40 y 99 **active**; Fa0/10–12 en la 30, Fa0/20 en la 99 |
| `show interfaces trunk` | Ver los puertos troncales | Fa0/1, Gig0/1, Gig0/2 (y los de APs) en **trunking**, **802.1q**, nativa **99**, VLANs 10,20,30,40,99 |
| `show interfaces status` | Ver todos los puertos y si están conectados | `connected` en los usados, `disabled` en los apagados |
| `show running-config` | Ver toda la configuración actual | Lo que está en configs/SW-CORE.txt |

## 🌐 Router (R-CORE)

| Comando | ¿Para qué sirve? | ¿Qué debe mostrar? |
|---|---|---|
| `show ip interface brief` | Ver todas las interfaces, su IP y si funcionan | G0/0 *unassigned*; G0/0.10/.20/.30/.40/.99 con 1.1/2.1/3.1/4.1/0.1 **up up**; G0/1 192.168.5.1 |
| `show ip route` | Ver la tabla de rutas (a qué redes sabe llegar) | **C** = redes conectadas, **L** = IP propia del router, **S 192.168.6.0/24 via 192.168.5.2** = ruta a celulares |
| `show access-lists` | Ver las ACLs y cuántos paquetes coincidieron | ACL-INVITADOS, ACL-CELULAR, ACL-IOT; la línea **deny** con *(N matches)* |
| `show ip dhcp binding` | Ver qué IP regaló el DHCP y a quién (MAC) | 192.168.0.21–23 (APs), 192.168.1.11+ (empleados), 2.11+, 4.11+ |
| `show ip dhcp pool` | Ver los pools de DHCP | GESTION-APs, CORPORATIVO, INVITADOS, IOT |
| `show running-config` | Ver toda la configuración | Lo que está en configs/R-CORE.txt |
| `show ip ssh` | Ver que SSH está activo | *SSH Enabled - version 2.0* |

## 💻 PCs, laptops y celulares (Desktop → Command Prompt)

| Comando | ¿Para qué sirve? | ¿Qué debe mostrar? |
|---|---|---|
| `ipconfig` | Ver la IP, máscara y gateway que recibió el equipo | Empleado 192.168.1.x / gw 192.168.1.1; si sale **169.254.x.x** = no obtuvo IP (DHCP falló) |
| `ping 192.168.3.12` | Probar si llega a un equipo | *Reply from…* = llega; *Request timed out* = no llega (o lo bloquea una ACL) |
| `tracert 192.168.3.12` | Ver por qué routers pasa el paquete | Primer salto = el gateway (.1) |
| `ssh -l admin 192.168.0.1` | Entrar al router a distancia (desde PC-ADMIN) | Pide contraseña y entra a R-CORE |

## 📡 WLC (navegador de PC-ADMIN → http://192.168.0.10)

| Dónde | ¿Para qué? | ¿Qué debe mostrar? |
|---|---|---|
| Wireless → All APs | Ver los APs registrados | 3 APs (AP-1, AP-2, AP-3) |
| WLANs | Ver las redes WiFi | INNOVA-CORP, INNOVA-GUEST, INNOVA-IOT habilitadas |
| Controller → Interfaces | Ver la interfaz management y las dinámicas | management 192.168.0.10; corp 1.2, guest 2.2, iot 4.2 |
| Security → RADIUS | Ver el servidor RADIUS | 192.168.3.10, puerto 1812 |

## 🧠 Letras de `show ip route`

- **C** (Connected): red conectada directamente a una interfaz del router.
- **L** (Local): la IP exacta del propio router en esa red (/32).
- **S** (Static): ruta escrita a mano con `ip route`.

## 🧪 Simple PDU (sobre)

Clic en el sobre → clic en origen → clic en destino → abajo dice **Successful** (llegó) o **Failed** (no llegó).
