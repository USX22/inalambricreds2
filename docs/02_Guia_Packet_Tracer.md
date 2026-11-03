# 2. Guía paso a paso en Cisco Packet Tracer (8.x)

> Consejo: **guarda el `.pkt` después de cada fase** (`InnovaLogistics_fase1.pkt`, `..._fase2.pkt`…).
> Si algo se rompe, regresas a la versión anterior.
> Arma y prueba **en orden**: primero la red cableada, después la WLC, después la seguridad,
> luego IoT y al final el 4G.

---

## FASE 0 – Colocar los equipos

| Cantidad | Equipo en Packet Tracer | Nombre (Config → Display Name) |
|----------|-------------------------|--------------------------------|
| 1 | Network Devices → Routers → **2911** | R-CORE |
| 2 | Network Devices → Switches → **2960** | SW-CORE, SW-ALMACEN |
| 1 | Network Devices → Wireless Devices → **WLC-3504** (o WLC-2504) | WLC |
| 3 | Network Devices → Wireless Devices → **LAP-PT** (o 3702i) | AP-1, AP-2, AP-3 |
| 3 | End Devices → **Server** | SRV-RADIUS, SRV-IOT, SRV-CENTRAL |
| 1 | End Devices → **PC** | PC-ADMIN |
| 3 | End Devices → **Laptop** | LAP-EMPLEADO-1, LAP-EMPLEADO-2, LAP-VISITANTE |
| 1 | End Devices → **Tablet** | TAB-ALMACEN |
| 1 | WAN Emulation → **Central Office Server** | CENTRAL-OFFICE |
| 1 | WAN Emulation → **Cell Tower** | TORRE-4G |
| 2 | End Devices → **Smartphone** | CEL-CHOFER-1, CEL-VENTAS |
| IoT | End Devices → Home / Smart City / Industrial: **Temperature Monitor**, **Door**, **Smoke Detector**, **Ceiling Fan** (o Fan), **Siren**, (opcional **Light**) | TEMP-ALMACEN, PUERTA-ALMACEN, HUMO-ALMACEN, VENTILADOR, SIRENA, LUZ-PUERTA |

Usa **notas** (tecla N) o rectángulos de color para marcar las zonas: *Oficinas*, *Almacén*, *Flotilla 4G*.

## FASE 1 – Cableado

| Desde | Puerto | Hasta | Puerto | Cable |
|-------|--------|-------|--------|-------|
| R-CORE | G0/0 | SW-CORE | G0/1 | Copper Straight-Through |
| R-CORE | G0/1 | CENTRAL-OFFICE | Backbone (Ethernet) | Copper Straight-Through |
| CENTRAL-OFFICE | Coaxial | TORRE-4G | Coaxial | **Coaxial** |
| SW-CORE | G0/2 | SW-ALMACEN | G0/1 | Copper Cross-Over (o straight, PT lo acepta con auto-MDIX) |
| SW-CORE | Fa0/1 | WLC | GigabitEthernet0/1 (puerto 1) | Straight-Through |
| SW-CORE | Fa0/2 | AP-1 | G0 | Straight-Through |
| SW-CORE | Fa0/10 | SRV-RADIUS | Fa0 | Straight-Through |
| SW-CORE | Fa0/11 | SRV-IOT | Fa0 | Straight-Through |
| SW-CORE | Fa0/12 | SRV-CENTRAL | Fa0 | Straight-Through |
| SW-CORE | Fa0/20 | PC-ADMIN | Fa0 | Straight-Through |
| SW-ALMACEN | Fa0/1 | AP-2 | G0 | Straight-Through |
| SW-ALMACEN | Fa0/2 | AP-3 | G0 | Straight-Through |

**Encender los APs:** si un AP aparece con los puertos en rojo/apagado, entra a la pestaña
**Physical** del AP, arrastra el **Power Adapter** al conector de energía (o usa un switch PoE).

## FASE 2 – Router y switches (VLANs, Trunks, Inter-VLAN, DHCP)

1. Abre **R-CORE → CLI**, presiona Enter, y pega todo el contenido de [`configs/R-CORE.txt`](../configs/R-CORE.txt).
2. Abre **SW-CORE → CLI** y pega [`configs/SW-CORE.txt`](../configs/SW-CORE.txt).
3. Abre **SW-ALMACEN → CLI** y pega [`configs/SW-ALMACEN.txt`](../configs/SW-ALMACEN.txt).

> En el router, el comando `crypto key generate rsa ...` puede tardar unos segundos. Si PT te
> pregunta el tamaño de la llave, escribe `1024`.

**Verifica antes de seguir:**

```
R-CORE#  show ip interface brief        (todas las subinterfaces "up up")
SW-CORE# show vlan brief                 (VLANs 10,20,30,40,99 creadas y puertos asignados)
SW-CORE# show interfaces trunk           (G0/1, G0/2 y Fa0/1 en modo trunk, nativa 99)
```

## FASE 3 – Servidores y PC-ADMIN (IP estática)

Desktop → IP Configuration → **Static**:

| Equipo | IP | Máscara | Gateway | DNS |
|--------|----|---------|---------|-----|
| SRV-RADIUS | 192.168.3.10 | 255.255.255.0 | 192.168.3.1 | 192.168.3.12 |
| SRV-IOT | 192.168.3.11 | 255.255.255.0 | 192.168.3.1 | 192.168.3.12 |
| SRV-CENTRAL | 192.168.3.12 | 255.255.255.0 | 192.168.3.1 | 192.168.3.12 |
| PC-ADMIN | 192.168.0.20 | 255.255.255.0 | 192.168.0.1 | 192.168.3.12 |

### 3.1 SRV-RADIUS (Services → AAA)

1. **Service: On**.
2. *Network Configuration* (clientes RADIUS = quien le pregunta, o sea la WLC):
   - Client Name: `WLC` · Client IP: `192.168.0.10` · Secret: `RadiusInnova2026` · ServerType: **Radius** → **Add**.
3. *User Setup* (un usuario por empleado):
   - `jlopez` / `Corp2026` → Add
   - `mgarcia` / `Corp2026` → Add
   - `almacen01` / `Corp2026` → Add
4. Apaga los demás servicios que no uses (HTTP, DHCP, etc.) para que quede limpio.

### 3.2 SRV-CENTRAL (Servidor de entregas)

- **Services → HTTP**: HTTP On y HTTPS On. Edita `index.html` y pon algo como:
  `<h1>InnovaLogistics - Portal de Entregas</h1><p>Registro de estado de entregas de la flotilla.</p>`
- **Services → DNS**: On. Agrega registros tipo A:
  - `entregas.innovalogistics.local` → `192.168.3.12`
  - `iot.innovalogistics.local` → `192.168.3.11`
- **Services → DHCP**: déjalo **Off** (el DHCP lo da el router).

### 3.3 SRV-IOT

- **Services → IoT**: **On**.
- Desde PC-ADMIN → Desktop → Web Browser → `http://192.168.3.11` → **Sign Up Now** →
  usuario `admin`, contraseña `admin2026` → Create. (Aquí después verás los dispositivos y crearás las reglas.)

## FASE 4 – WLC y Access Points (CAPWAP)

### 4.1 IP de administración de la WLC

WLC → **Config** → (Management / Interface):
- IP Address: `192.168.0.10` · Subnet: `255.255.255.0` · Gateway: `192.168.0.1`

### 4.2 Entrar a la interfaz web

PC-ADMIN → Web Browser → `https://192.168.0.10` (o `http://`).
Si es la primera vez, el asistente te pide crear un usuario administrador: `admin` / `Admin2026`.
Si aparece el asistente de configuración inicial, completa: nombre del sistema `WLC-INNOVA`,
IP de gestión 192.168.0.10/24, gateway 192.168.0.1.

### 4.3 Verificar que los APs se unieron

- Los APs piden IP por DHCP en la VLAN 99 (pool `GESTION-APs`) y encuentran la WLC por
  **broadcast** porque están en la misma subred que su IP de gestión.
- En la WLC: **Wireless → All APs** → deben aparecer AP-1, AP-2 y AP-3.
- En el AP, el ícono deja de mostrar el aviso y en el switch: `show ip dhcp binding` en R-CORE muestra 3 IPs 192.168.0.21–23.
- Renombra los APs (clic en el AP → AP Name): `AP-1-OFICINAS`, `AP-2-ALMACEN-A`, `AP-3-ALMACEN-B`.

### 4.4 Servidor RADIUS en la WLC

**Security → AAA → RADIUS → Authentication → New**
- Server IP Address: `192.168.3.10`
- Shared Secret / Confirm: `RadiusInnova2026` (¡exactamente igual que en el servidor!)
- Port: `1812` · Server Status: Enabled → **Apply**

### 4.5 Interfaces dinámicas (una por VLAN de clientes)

**Controller → Interfaces → New**

| Interface Name | VLAN Id | IP | Máscara | Gateway | Puerto físico | Primary DHCP Server |
|----------------|---------|----|---------|---------|---------------|---------------------|
| CORP | 10 | 192.168.1.2 | 255.255.255.0 | 192.168.1.1 | 1 | 192.168.1.1 |
| GUEST | 20 | 192.168.2.2 | 255.255.255.0 | 192.168.2.1 | 1 | 192.168.2.1 |
| IOT | 40 | 192.168.4.2 | 255.255.255.0 | 192.168.4.1 | 1 | 192.168.4.1 |

### 4.6 WLANs (SSIDs)

**WLANs → Create New → Go**

**WLAN 1 – INNOVA-CORP**
- Profile Name / SSID: `INNOVA-CORP`, ID 1 → Apply
- General: Status **Enabled**, Interface: **CORP**
- Security → Layer 2: **WPA+WPA2**, WPA2 Policy ✔, Encryption **AES**, Auth Key Mgmt **802.1X**
- Security → AAA Servers: Authentication Server 1 → `192.168.3.10`
- Apply

**WLAN 2 – INNOVA-GUEST**
- SSID `INNOVA-GUEST`, ID 2, Interface **GUEST**, Enabled
- Layer 2: WPA+WPA2, WPA2 + AES, Auth Key Mgmt **PSK**, PSK Format ASCII: `Visitante2026`
- Apply

**WLAN 3 – INNOVA-IOT**
- SSID `INNOVA-IOT`, ID 3, Interface **IOT**, Enabled
- Layer 2: WPA2 + AES, **PSK**: `SensorIoT2026`
- Apply

### 4.7 Canales (opcional pero suma puntos)

**Wireless → Access Points → Radios → 802.11b/g/n** → clic en cada AP → Channel *Custom*:
AP-1 = 1, AP-2 = 6, AP-3 = 11. (Si tu versión no lo permite, explícalo en la presentación.)

## FASE 5 – Clientes inalámbricos

### Laptops (cambiar tarjeta)
Laptop → **Physical** → apaga el equipo (botón) → arrastra fuera el módulo Ethernet →
arrastra **WPC300N** → enciende.

### LAP-EMPLEADO-1 y 2 (corporativo)
Config → **Wireless0**:
- SSID `INNOVA-CORP`
- Authentication: **WPA2** (es la opción *Enterprise*: pide usuario y contraseña)
- User ID: `jlopez` · Password: `Corp2026` · Encryption: AES
- IP Configuration: **DHCP** → debe recibir 192.168.1.x

### LAP-VISITANTE
- SSID `INNOVA-GUEST` · Authentication **WPA2-PSK** · clave `Visitante2026` · DHCP → 192.168.2.x

### TAB-ALMACEN
- SSID `INNOVA-CORP` · WPA2 · `almacen01` / `Corp2026` · DHCP

Coloca LAP-EMPLEADO-1 cerca de AP-1, TAB-ALMACEN cerca de AP-2 / AP-3.

## FASE 6 – Red de sensores IoT (WSN)

### 6.1 Darles WiFi a los dispositivos IoT
En cada dispositivo IoT: **Config → Advanced** (botón abajo a la derecha) → **I/O Config** →
Network Adapter: **PT-IOT-NM-1W** (adaptador inalámbrico).
Luego **Config → Wireless0**: SSID `INNOVA-IOT`, **WPA2-PSK** `SensorIoT2026`, IP **DHCP**.

> Alternativa si da problemas el WiFi: déjalos con su puerto FastEthernet y conéctalos a
> SW-ALMACEN Fa0/5–Fa0/10 (VLAN 40). La configuración IoT de abajo es igual.

### 6.2 Registrar cada dispositivo en el servidor IoT
**Config → Settings → IoT Server: Remote Server**
- Server Address: `192.168.3.11` · User: `admin` · Password: `admin2026` → **Connect**

Debe decir *Connected*. Hazlo en: TEMP-ALMACEN, PUERTA-ALMACEN, HUMO-ALMACEN, VENTILADOR, SIRENA, LUZ-PUERTA.

### 6.3 Reglas automáticas
PC-ADMIN → Web Browser → `http://192.168.3.11` → login `admin` → **IoT Server Devices** (ves todo
registrado) → **Conditions → Add**:

| Nombre | Si (IF) | Entonces (THEN) |
|--------|---------|-----------------|
| Temp-Alta | TEMP-ALMACEN Temperature **>** 25 °C | VENTILADOR Status = **High** |
| Temp-Normal | TEMP-ALMACEN Temperature **<=** 25 °C | VENTILADOR Status = **Off** |
| Humo-Detectado | HUMO-ALMACEN Alarm = **true** | SIRENA On = **true** |
| Sin-Humo | HUMO-ALMACEN Alarm = **false** | SIRENA On = **false** |
| Puerta-Abierta | PUERTA-ALMACEN Open = **true** | LUZ-PUERTA Status = **On** |
| Puerta-Cerrada | PUERTA-ALMACEN Open = **false** | LUZ-PUERTA Status = **Off** |

(25 °C es el límite típico de conservación de insumos médicos "temperatura ambiente controlada";
puedes justificarlo así en la exposición.)

### 6.4 Cómo provocar los eventos en la demostración
- **Puerta:** mantén **Alt + clic** sobre la puerta para abrirla/cerrarla.
- **Temperatura:** agrega un **Heating Element** / **Furnace** cerca y enciéndelo con Alt+clic, o cambia
  la temperatura ambiente en *Environment* (botón arriba a la derecha en el workspace físico).
- **Humo:** agrega un **Old Car** y enciéndelo con Alt+clic (genera humo) o sube el humo en *Environment*.
- Usa el botón de tiempo **Fast Forward** para que el ambiente cambie más rápido.

## FASE 7 – Red celular 4G (WWAN)

### 7.1 Central Office Server
CENTRAL-OFFICE → **Config**:
- **Backbone** (interfaz Ethernet): IP `192.168.5.2`, máscara `255.255.255.0`, gateway `192.168.5.1`.
- **Cell Tower** (sección de la red celular / DHCP para móviles):
  - Network: `192.168.6.0` · Mask `255.255.255.0`
  - Default Gateway que entrega: `192.168.6.1` · Start IP `192.168.6.10`
  - DNS: `192.168.3.12`

(En algunas versiones viene por defecto 172.16.x.x; cámbialo a 192.168.6.0/24 para respetar la red /20.)

### 7.2 Smartphones
Los Smartphone-PT ya traen tarjeta **3G/4G Cell**. Colócalos cerca de la torre.
Config → 3G/4G Cell1 → deben recibir IP 192.168.6.x automáticamente.
(Si no, en Desktop → IP Configuration usa **DHCP** o presiona "Refresh".)

### 7.3 Ruta de regreso
Ya está en el router: `ip route 192.168.6.0 255.255.255.0 192.168.5.2`.

### 7.4 Prueba
CEL-CHOFER-1 → Web Browser → `https://entregas.innovalogistics.local` (o `https://192.168.3.12`) → ve el portal.
Desde el celular, `ping 192.168.3.10` (RADIUS) **debe fallar** (ACL-CELULAR solo deja el servidor central).

---

## Problemas comunes y solución

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Los APs no aparecen en la WLC | No tienen energía, o no tienen IP, o el puerto del switch no está en VLAN 99 | Power Adapter; `show ip dhcp binding` en R-CORE; `show vlan brief`. Si persiste, en el *pool GESTION-APs* revisa el gateway y que la WLC tenga IP fija 192.168.0.10. |
| No puedo abrir la página de la WLC | PC-ADMIN fuera de VLAN 99 o sin gateway | Fa0/20 en VLAN 99; ping 192.168.0.10. |
| Laptop corporativa no se conecta | Secreto RADIUS distinto, IP de cliente RADIUS mal, usuario mal escrito, AAA Off | Compara el secret en WLC y servidor; Client IP debe ser **192.168.0.10**. |
| Cliente conecta pero no recibe IP | Interfaz dinámica con DHCP mal, VLAN no permitida en el trunk | Revisa Primary DHCP Server de la interfaz y `show interfaces trunk`. |
| Invitado no recibe IP | La ACL bloquea DHCP | Debe existir `permit udp any any eq bootps` antes del deny. |
| IoT no "Connected" | Sin IP o servidor IoT apagado | Verifica IP 192.168.4.x y que Services → IoT esté On. |
| Celular no llega al servidor | Falta ruta en R-CORE o gateway del Central Office | `show ip route` debe mostrar `S 192.168.6.0/24 via 192.168.5.2`. |
| "Native VLAN mismatch" | Un trunk sin `native vlan 99` | Todos los trunks deben tener nativa 99. |
