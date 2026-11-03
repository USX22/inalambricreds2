# 3. Pruebas y Validación

Haz cada prueba, toma **captura de pantalla** y pégala en el reporte. La columna "Resultado esperado"
es lo que debes ver. Las pruebas marcadas con ⚠️ son las típicas "pruebas de falla" del docente.

## 3.1 Infraestructura base (VLANs, trunks, DHCP, routing)

| # | Prueba | Dónde / Comando | Resultado esperado |
|---|--------|-----------------|--------------------|
| 1 | VLANs creadas | SW-CORE: `show vlan brief` | VLAN 10, 20, 30, 40, 99 activas con sus puertos |
| 2 | Trunks | SW-CORE: `show interfaces trunk` | G0/1, G0/2, Fa0/1 trunk, native 99, VLANs 10,20,30,40,99 |
| 3 | Subinterfaces | R-CORE: `show ip interface brief` | G0/0.10, .20, .30, .40, .99 y G0/1 en up/up |
| 4 | DHCP | R-CORE: `show ip dhcp binding` | IPs entregadas a APs (192.168.0.x), laptops, IoT |
| 5 | Inter-VLAN | PC-ADMIN: `ping 192.168.3.10` | Respuesta (VLAN 99 → VLAN 30 vía router) |
| 6 | Tabla de rutas | R-CORE: `show ip route` | 5 redes conectadas (C) + 192.168.5.0 + ruta estática S 192.168.6.0 |

## 3.2 WLC, WLANs y roaming

| # | Prueba | Dónde | Resultado esperado |
|---|--------|-------|--------------------|
| 7 | APs registrados | WLC web → Wireless → All APs | 3 APs con estado *Registered* |
| 8 | SSIDs | WLC web → WLANs | INNOVA-CORP, INNOVA-GUEST, INNOVA-IOT habilitadas |
| 9 | Clientes | WLC web → Monitor → Clients | Laptops/tablet/IoT asociados indicando AP y WLAN |
| 10 | ⚠️ **Roaming** | LAP-EMPLEADO-1: Command Prompt `ping -t 192.168.3.12`, luego **arrastra la laptop** de la zona de AP-1 a la de AP-2/AP-3 | La laptop cambia de AP, **conserva la misma IP** y el ping sigue (a lo más 1 paquete perdido) |
| 11 | ⚠️ Caída de un AP | Quita el cable de AP-1 (o apágalo) | Los clientes cercanos se reasocian a otro AP del ESS |

**¿Por qué conserva la IP en el roaming?** Porque los tres APs anuncian el mismo SSID (ESS) y todo el
tráfico pasa por la misma WLC, que lo deja en la misma VLAN 10. El cliente nunca cambia de subred.

## 3.3 Seguridad

| # | Prueba | Dónde | Resultado esperado |
|---|--------|-------|--------------------|
| 12 | Autenticación 802.1X correcta | LAP-EMPLEADO-1 con `jlopez`/`Corp2026` | Se asocia y recibe 192.168.1.x |
| 13 | ⚠️ Contraseña incorrecta | Cambia la contraseña a `xxxx` | **No** se conecta (RADIUS rechaza) |
| 14 | ⚠️ RADIUS caído | Apaga el servicio AAA o desconecta SRV-RADIUS, reconecta una laptop | La laptop **no** puede autenticarse; los invitados (PSK) siguen funcionando |
| 15 | Invitado obtiene IP | LAP-VISITANTE `ipconfig` | 192.168.2.x, gateway 192.168.2.1 |
| 16 | ⚠️ **Aislamiento de invitados** | LAP-VISITANTE: `ping 192.168.3.12`, `ping 192.168.1.11`, `ping 192.168.0.10` | **Todos fallan** ("Destination host unreachable") |
| 17 | Invitado ve su gateway | LAP-VISITANTE: `ping 192.168.2.1` | Responde |
| 18 | Coincidencias de la ACL | R-CORE: `show access-lists` | Contadores "(x match(es))" en la línea `deny` después de la prueba 16 |
| 19 | SSH al router | PC-ADMIN: `ssh -l admin 192.168.0.1` | Pide contraseña y entra |

## 3.4 IoT / WSN

| # | Prueba | Acción | Resultado esperado |
|---|--------|--------|--------------------|
| 20 | Registro | Servidor IoT web → Devices | Los 6 dispositivos en línea |
| 21 | ⚠️ Temperatura alta | Sube la temperatura (Heating Element / Environment) | Al pasar 25 °C el **VENTILADOR se enciende** |
| 22 | Temperatura normal | Baja la temperatura | Ventilador se apaga |
| 23 | ⚠️ Humo | Enciende el Old Car / sube humo | **SIRENA suena** (ícono rojo) |
| 24 | Puerta | Alt+clic en la puerta | LUZ-PUERTA se enciende al abrir y se apaga al cerrar |
| 25 | Monitoreo remoto | TAB-ALMACEN → navegador → `http://192.168.3.11` | El almacenista ve el estado de los sensores |

## 3.5 Red celular 4G

| # | Prueba | Acción | Resultado esperado |
|---|--------|--------|--------------------|
| 26 | IP celular | CEL-CHOFER-1 → IP Configuration | 192.168.6.x |
| 27 | Acceso al servidor | Web Browser `https://entregas.innovalogistics.local` | Se ve el Portal de Entregas |
| 28 | ⚠️ Seguridad del acceso móvil | CEL-CHOFER-1: `ping 192.168.3.10` | Falla (ACL-CELULAR solo permite el servidor central) |
| 29 | Ruta | R-CORE: `show ip route static` | `S 192.168.6.0/24 [1/0] via 192.168.5.2` |

## 3.6 Modo Simulación (para explicar en vivo)

En **Simulation Mode** filtra por los protocolos y muestra los paquetes:
- **CAPWAP**: tráfico AP ↔ WLC (los APs encapsulan todo hacia la WLC).
- **RADIUS**: WLC → SRV-RADIUS cuando un empleado se conecta (Access-Request / Access-Accept).
- **DHCP**: el proceso DORA de una laptop.
- **ICMP**: el ping del invitado que muere en el router (verás la X en R-CORE por la ACL).
