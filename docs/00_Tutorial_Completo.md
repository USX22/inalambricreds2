# Tutorial completo desde cero
## Proyecto InnovaLogistics: aprende cada concepto mientras lo construyes

**Cómo usar este tutorial**

- Síguelo **en orden**. Cada módulo tiene la misma estructura:
  - 📘 **Concepto**: qué es, explicado desde lo básico.
  - 🎯 **Para qué lo usamos aquí**: cómo se relaciona con el problema de la empresa.
  - 🛠️ **Hazlo**: los pasos en Packet Tracer.
  - ✅ **Compruébalo**: cómo saber que quedó bien.
  - 🗣️ **Si te preguntan**: la respuesta corta para la exposición.
- Guarda tu archivo al terminar cada módulo: `Innova_M1.pkt`, `Innova_M2.pkt`, etc. Si algo se rompe, regresas al anterior.
- Tiempo estimado: de 6 a 10 horas repartidas en varios días. No intentes hacerlo todo en una sola sesión.

**Índice**

- Módulo 0: Fundamentos de redes (lo mínimo que necesitas saber)
- Módulo 1: Entender el caso y el diseño
- Módulo 2: Subneteo de la red 192.168.0.0/20
- Módulo 3: Colocar y cablear los equipos
- Módulo 4: VLANs y trunks en los switches
- Módulo 5: Router: enrutamiento entre VLANs (router-on-a-stick)
- Módulo 6: DHCP
- Módulo 7: Servidores
- Módulo 8: Fundamentos de WiFi
- Módulo 9: WLC, Access Points y CAPWAP
- Módulo 10: SSIDs, interfaces dinámicas y roaming
- Módulo 11: Seguridad: WPA2-Enterprise, 802.1X y RADIUS
- Módulo 12: Aislar a los invitados con ACLs
- Módulo 13: IoT y la red de sensores (WSN)
- Módulo 14: La red celular 4G (WWAN)
- Módulo 15: Pruebas finales y defensa

---

# MÓDULO 0: Fundamentos de redes

Si ya dominas esto, pásalo rápido. Si no, **no te lo saltes**: todo lo demás se apoya aquí.

## 0.1 ¿Qué es una red?
Un conjunto de dispositivos (computadoras, celulares, impresoras, sensores) conectados para
intercambiar información. Se clasifican por tamaño:

| Tipo | Significa | Ejemplo en el proyecto |
|------|-----------|------------------------|
| **LAN** | Local Area Network | La red cableada de oficinas y almacén |
| **WLAN** | Wireless LAN | El WiFi de la empresa |
| **WAN** | Wide Area Network | Internet, enlaces entre ciudades |
| **WWAN** | Wireless WAN | La red celular 4G de los camiones |
| **WSN** | Wireless Sensor Network | Los sensores del almacén |

## 0.2 El modelo OSI (versión práctica)
Sirve para ubicar en qué "nivel" trabaja cada cosa. Basta con que recuerdes estas capas:

| Capa | Nombre | Qué maneja | Equipo típico | En el proyecto |
|------|--------|-----------|---------------|----------------|
| 1 | Física | Cables, señales de radio | Cable, antena | Cables y ondas WiFi/4G |
| 2 | Enlace de datos | Direcciones **MAC**, tramas | **Switch**, Access Point | VLANs, trunks, 802.11 |
| 3 | Red | Direcciones **IP**, rutas | **Router** | Subredes, ruteo, ACL |
| 4 | Transporte | **Puertos** TCP/UDP | — | RADIUS (1812), HTTP (80) |
| 7 | Aplicación | Servicios | Servidores | DHCP, DNS, HTTP, RADIUS |

## 0.3 Dirección MAC vs dirección IP
- **MAC**: identificador físico grabado en la tarjeta de red (ej. `00D0.BC3A.1F22`). Funciona *dentro* de una misma red local. Es como el **número de serie** de una persona.
- **IP**: dirección lógica que se asigna (ej. `192.168.1.15`). Sirve para llegar a otras redes. Es como la **dirección postal**: cambia si te mudas.

## 0.4 Dirección IP, máscara y gateway
Una IPv4 tiene 32 bits escritos en 4 números (octetos) de 0 a 255: `192.168.1.15`.

La **máscara** dice qué parte de la IP es la "colonia" (red) y qué parte es la "casa" (host):
- `255.255.255.0` = `/24` → los primeros 3 octetos son la red, el último es el host.
- `192.168.1.15/24` → red `192.168.1.0`, host `15`.

Dentro de cada red hay dos direcciones que no se pueden asignar a equipos:
- La **dirección de red** (`.0`) identifica a la red.
- El **broadcast** (`.255`) es "para todos los de la red".
- Por eso una /24 tiene 256 − 2 = **254 hosts útiles**.

El **gateway** (puerta de enlace) es el router por donde sales cuando el destino está **en otra
red**. Analogía: para mandar algo a otra colonia se lo das al cartero (router).

**Regla de oro:** dos equipos en la misma red se hablan directamente (por el switch). En redes
distintas, necesitan un **router**.

## 0.5 Switch vs Router
- **Switch** (capa 2): conecta equipos **de la misma red**. Aprende qué MAC está en qué puerto y entrega las tramas solo a quien corresponde.
- **Router** (capa 3): conecta **redes distintas**. Decide por dónde mandar los paquetes usando su **tabla de rutas**.

## 0.6 Puertos TCP y UDP
La IP lleva el paquete a la computadora correcta; el **puerto** lo lleva a la aplicación correcta,
como el número de departamento dentro de un edificio.
- **TCP**: confiable, confirma la entrega (web, SSH).
- **UDP**: rápido, sin confirmación (DHCP, DNS, RADIUS, CAPWAP).

Puertos que usarás en este proyecto:

| Servicio | Protocolo/Puerto |
|----------|------------------|
| HTTP / HTTPS | TCP 80 / 443 |
| DNS | UDP 53 |
| DHCP | UDP 67 (servidor) y 68 (cliente) |
| SSH | TCP 22 |
| RADIUS | UDP 1812 (autenticación) y 1813 (registro) |
| CAPWAP | UDP 5246 (control) y 5247 (datos) |

## 0.7 Cómo moverte en la línea de comandos (CLI) de Cisco
Al dar clic en un router o switch → pestaña **CLI**:

```
Router>                    Modo usuario (solo ver poco)
Router> enable             → entra a modo privilegiado
Router#                    Modo privilegiado (ver todo, guardar, comandos "show")
Router# configure terminal → entra a configuración global
Router(config)#            Aquí se configura
Router(config)# interface g0/0  → entra a configurar una interfaz
Router(config-if)#
Router(config-if)# exit    → regresa un nivel
Router(config)# end        → regresa a Router#
Router# write memory       → GUARDA la configuración (si no, se pierde al reiniciar)
```

Trucos:
- **Tab** autocompleta (`conf` + Tab → `configure`).
- **?** muestra las opciones disponibles.
- Los comandos se pueden abreviar: `conf t`, `int g0/0`, `sh ip int br`.
- `no` antes de un comando lo deshace (`no shutdown` enciende una interfaz).
- Los comandos `show ...` se ejecutan en modo `#`. Desde `(config)#` antepón `do`: `do show vlan brief`.

---

# MÓDULO 1: Entender el caso y el diseño

## 📘 Qué pide el proyecto (en palabras sencillas)
La empresa tiene 4 problemas, y cada requerimiento del docente resuelve uno:

| Problema | Qué vamos a construir |
|----------|-----------------------|
| WiFi lento, se cae, una sola clave para todos | Una **controladora (WLC)** que maneja **3 antenas (APs)** coordinadas |
| Visitantes conectados a la misma red que los servidores | Un **WiFi separado para invitados**, encerrado en su propia **VLAN** con un "candado" (**ACL**) |
| No hay alarma de temperatura ni humo en el almacén | **Sensores IoT** que encienden ventiladores y sirenas solos |
| Los camiones no pueden reportar entregas | Una **torre celular 4G** conectada a la red de la empresa |

## 📘 La topología (el "mapa")
Abre `01_Diseno_y_Direccionamiento.md` y mira el diagrama. En palabras:

1. En el centro está el **router R-CORE**: conecta todas las redes entre sí.
2. Del router sale un cable al **SW-CORE** (switch de oficinas). Ahí se conectan la WLC, el AP-1, los 3 servidores y la PC de administración.
3. Del SW-CORE sale un cable al **SW-ALMACEN**, donde están el AP-2 y el AP-3.
4. Por WiFi se conectan las laptops, la tablet y los sensores.
5. Por otro puerto, el router se conecta al **Central Office Server**, que a su vez tiene la **torre celular**, y a ella se conectan los celulares de los choferes.

## 🗣️ Si te preguntan "¿cómo está organizada su red?"
"Tenemos un router central que conecta cinco VLANs y la red celular. Un switch por edificio, una
WLC que controla tres access points, y tres servidores: RADIUS para autenticar, IoT para los
sensores y un servidor central para el portal de entregas."

---

# MÓDULO 2: Subneteo de la red 192.168.0.0/20

## 📘 Concepto: ¿qué es subnetear?
Es **partir una red grande en redes más pequeñas**. Ventajas: orden, seguridad (cada grupo en su
red) y menos tráfico de broadcast.

## 📘 Leer el "/20"
El número después de la diagonal (el **prefijo**) dice cuántos bits de los 32 son de red:

```
/20 = 11111111.11111111.11110000.00000000 = 255.255.240.0
       (8 bits)  (8 bits)  (4 bits)
```
- Bits de red: 20. Bits de host: 32 − 20 = 12 → 2¹² = **4096 direcciones**.
- El rango va de **192.168.0.0 a 192.168.15.255**.

¿Por qué hasta el .15? El tercer octeto tiene 4 bits de red y 4 de host. Los 4 bits de host van de
0000 (0) a 1111 (15).

## 📘 Partirla en /24
El docente pide subredes /24. Pasar de /20 a /24 significa **tomar prestados 4 bits**:
- Número de subredes = 2⁴ = **16**.
- Hosts por subred = 2⁸ − 2 = **254**.
- Las subredes son: 192.168.**0**.0, 192.168.**1**.0, 192.168.**2**.0 … 192.168.**15**.0.

## 🎯 Cómo las repartimos
| Subred | Para qué | Por qué separada |
|--------|----------|------------------|
| 192.168.0.0/24 | Gestión (VLAN 99) | Los equipos de red no se mezclan con usuarios |
| 192.168.1.0/24 | Empleados (VLAN 10) | Acceso a servidores internos |
| 192.168.2.0/24 | Invitados (VLAN 20) | Se bloquean hacia todo lo interno |
| 192.168.3.0/24 | Servidores (VLAN 30) | Zona protegida |
| 192.168.4.0/24 | IoT (VLAN 40) | Los sensores son poco seguros; se aíslan |
| 192.168.5.0/24 | Enlace router ↔ Central Office | Conexión punto a punto |
| 192.168.6.0/24 | Celulares 4G | Dispositivos externos |
| 192.168.7–15.0 | Libres | Crecimiento futuro |

**Convención que usamos:** el `.1` de cada red es siempre el router (gateway). Así es fácil de recordar.

## 🗣️ Si te preguntan
"La /20 tiene 4096 direcciones. Al llevarla a /24 prestamos 4 bits: 2 a la 4 da 16 subredes de 254
hosts. Usamos 7 y dejamos 9 libres para crecer."

**Ejercicio:** sin ver, escribe en una hoja las 7 subredes con su uso y su gateway.

---

# MÓDULO 3: Colocar y cablear los equipos

## 📘 Conceptos
- **Cable directo (straight-through)**: une equipos *distintos* (PC–switch, router–switch).
- **Cable cruzado (cross-over)**: une equipos *iguales* (switch–switch). Los equipos modernos detectan esto solos (auto-MDIX), pero en Packet Tracer usa el correcto.
- **Coaxial**: el cable que une la torre celular con el Central Office.
- **FastEthernet (Fa)** = 100 Mbps. **GigabitEthernet (G)** = 1000 Mbps. Usamos los G para los enlaces importantes (router y entre switches).
- **Lightweight AP (LAP)**: antena WiFi "tonta" que obedece a la WLC (lo explicamos en el Módulo 9).

## 🛠️ Hazlo
1. Coloca los equipos según la tabla de la **FASE 0** en `02_Guia_Packet_Tracer.md`.
2. Renombra cada uno: clic → pestaña **Config** → *Display Name*.
3. Cablea según la tabla de la **FASE 1**. Usa el cable correcto y el **puerto exacto**: las configuraciones dependen de eso.
4. Si los APs aparecen apagados: pestaña **Physical**, arrastra el **Power Adapter** al AP.
5. Dibuja rectángulos de color para "Oficinas", "Almacén" y "Flotilla".

## ✅ Compruébalo
Los puntos de los cables se ponen **verdes** (o naranjas mientras arrancan). Si alguno queda en rojo
después de un minuto, ese puerto está apagado (es normal en el router hasta que lo configuremos).

---

# MÓDULO 4: VLANs y trunks en los switches

## 📘 Concepto: VLAN
Una **VLAN** (Virtual LAN) divide **un switch físico en varios switches lógicos**. Los equipos en
la VLAN 10 no ven a los de la VLAN 20, aunque estén en el mismo switch, como si fueran edificios
separados.

- Cada VLAN es un **dominio de broadcast** separado: los mensajes "para todos" no salen de su VLAN.
- **Regla en este proyecto:** 1 VLAN = 1 subred (VLAN 10 ↔ 192.168.1.0/24).
- Para que dos VLANs se comuniquen se necesita un **router** (Módulo 5).

## 📘 Concepto: puerto de acceso vs puerto trunk
- **Access**: pertenece a **una sola VLAN**. Se usa para equipos finales: PC, servidor y también el AP (lo explicamos en el Módulo 9).
- **Trunk**: transporta **varias VLANs por un solo cable**. Se usa entre switches, del switch al router y del switch a la WLC.

## 📘 Concepto: 802.1Q y la VLAN nativa
Por un trunk viajan tramas de muchas VLANs. ¿Cómo sabe el otro lado a qué VLAN pertenece cada una?
Con una **etiqueta (tag) 802.1Q**: 4 bytes que se insertan en la trama con el número de VLAN.

La **VLAN nativa** es la única que viaja **sin etiqueta**. Debe ser **la misma en ambos lados**
del trunk; si no, aparece el error *native VLAN mismatch*.
Usamos la **99** como nativa porque la WLC manda su tráfico de gestión sin etiqueta, y ese tráfico
debe caer en la VLAN 99.

## 📘 Concepto: PortFast
Los switches usan **STP** (Spanning Tree) para evitar bucles; al conectar algo, un puerto espera unos
30 segundos antes de pasar tráfico. **PortFast** omite esa espera en los puertos de equipos finales.
**Nunca** se pone en un trunk.

## 🎯 Para qué aquí
Separar empleados, invitados, servidores, sensores y gestión aunque compartan cables y switches.

## 🛠️ Hazlo
Pega `configs/SW-CORE.txt` en el CLI del SW-CORE y `configs/SW-ALMACEN.txt` en el del SW-ALMACEN.

**Entiende lo que pegaste** (fragmentos clave):

```
vlan 10                         ← crea la VLAN 10
 name CORPORATIVO               ← le pone nombre (solo descriptivo)

interface GigabitEthernet0/1
 switchport mode trunk                         ← este puerto es trunk
 switchport trunk native vlan 99               ← la VLAN sin etiqueta es la 99
 switchport trunk allowed vlan 10,20,30,40,99  ← solo estas VLANs pasan (seguridad)

interface FastEthernet0/2
 switchport mode access          ← puerto de acceso
 switchport access vlan 99       ← pertenece a la VLAN 99 (gestión, para el AP)
 spanning-tree portfast          ← arranca rápido

interface range Fa0/3 - 9 ...
 shutdown                        ← apaga los puertos sin uso (nadie puede conectarse a ellos)

interface vlan 99
 ip address 192.168.0.2 255.255.255.0  ← IP para administrar el switch a distancia
ip default-gateway 192.168.0.1         ← su gateway (el switch no enruta)
```

## ✅ Compruébalo
```
SW-CORE# show vlan brief          → ves las VLANs 10,20,30,40,99 y qué puertos tiene cada una
SW-CORE# show interfaces trunk    → G0/1, G0/2 y Fa0/1 en modo trunk con Native vlan 99
```
Los puertos trunk **no aparecen** en `show vlan brief`. Es normal: pertenecen a todas las VLANs permitidas.

## 🗣️ Si te preguntan
- "¿Qué es una VLAN?" → "Una división lógica del switch que separa grupos en dominios de broadcast distintos, aunque compartan el mismo equipo."
- "¿Qué es un trunk?" → "Un enlace que transporta varias VLANs, identificándolas con etiquetas 802.1Q."

---

# MÓDULO 5: Router: enrutamiento entre VLANs (router-on-a-stick)

## 📘 Concepto
Las VLANs están separadas, pero los empleados (VLAN 10) **sí** necesitan llegar a los servidores
(VLAN 30). Eso lo hace un router.

**Router-on-a-stick** (router en un palo): en lugar de usar un cable por VLAN, se usa **un solo
cable trunk** y el puerto del router se divide en **subinterfaces** virtuales: `G0/0.10`, `G0/0.20`…
Cada subinterfaz:
- Entiende una VLAN (`encapsulation dot1Q 10`).
- Tiene la IP que funciona como **gateway** de esa VLAN (`192.168.1.1`).

Así un paquete que viene de la VLAN 10 hacia la 30 sube al router por el trunk, el router lo enruta
y lo baja por el mismo cable con la etiqueta de la VLAN 30.

## 📘 Concepto: tabla de rutas
El router sabe llegar a:
- **Redes conectadas (C)**: las que tiene configuradas en sus interfaces.
- **Rutas estáticas (S)**: las que tú le escribes a mano. Necesitamos una hacia la red celular, que está "detrás" del Central Office.

## 🛠️ Hazlo
Pega `configs/R-CORE.txt` en el CLI del router (todo de una vez). Explicación de cada bloque:

```
hostname R-CORE                     ← nombre del equipo
no ip domain-lookup                 ← si escribes mal un comando, no se queda "buscándolo" en DNS
service password-encryption         ← las contraseñas no se ven en texto plano en la configuración
enable secret Innova2026            ← contraseña cifrada para entrar a modo #
banner motd # ... #                 ← aviso legal al conectarse

ip domain-name innovalogistics.local       ┐
username admin privilege 15 secret ...     │ Acceso remoto seguro por SSH
crypto key generate rsa ... modulus 1024   │ (genera llaves de cifrado)
ip ssh version 2                           │
line vty 0 4 / login local / transport input ssh ┘ (solo SSH, no Telnet)

interface GigabitEthernet0/0
 no shutdown                   ← enciende el puerto físico (las subinterfaces dependen de él)

interface GigabitEthernet0/0.10
 encapsulation dot1Q 10        ← esta subinterfaz atiende la VLAN 10
 ip address 192.168.1.1 255.255.255.0  ← y es el gateway de la VLAN 10

interface GigabitEthernet0/0.99
 encapsulation dot1Q 99 native ← la VLAN 99 llega SIN etiqueta (nativa)

interface GigabitEthernet0/1
 ip address 192.168.5.1 ...    ← enlace al Central Office (red 4G)

ip route 192.168.6.0 255.255.255.0 192.168.5.2
   ↑ "para llegar a los celulares (192.168.6.0/24) manda los paquetes al 192.168.5.2"
```
(El DHCP y las ACL del mismo archivo se explican en los Módulos 6 y 12.)

## ✅ Compruébalo
```
R-CORE# show ip interface brief   → G0/0.10 .20 .30 .40 .99 y G0/1 en "up up"
R-CORE# show ip route             → líneas "C" para 192.168.0–5 y "S 192.168.6.0/24 via 192.168.5.2"
```
G0/1 puede salir *down* hasta que configures el Central Office (Módulo 14). Es normal.

## 🗣️ Si te preguntan
"Usamos router-on-a-stick: un solo enlace trunk con una subinterfaz por VLAN. Cada subinterfaz es el
gateway de su VLAN y el router enruta entre ellas."

---

# MÓDULO 6: DHCP

## 📘 Concepto
**DHCP** (Dynamic Host Configuration Protocol) entrega **automáticamente** IP, máscara, gateway y DNS
a los equipos. Sin DHCP tendrías que configurar a mano cada laptop, sensor y AP.

Funciona en 4 pasos, **DORA**:
1. **D**iscover: el cliente grita "¿hay algún servidor DHCP?" (broadcast).
2. **O**ffer: el servidor responde "te ofrezco la 192.168.1.11".
3. **R**equest: el cliente contesta "la quiero".
4. **A**cknowledge: el servidor confirma "es tuya por X tiempo".

- **Pool**: el rango de IPs que reparte para una red.
- **Excluded-address**: IPs que el DHCP **no** debe repartir porque ya están reservadas (gateway, WLC, servidores).

## 🎯 Para qué aquí
El router es el servidor DHCP de las VLANs 99 (para los APs), 10, 20 y 40. Los servidores no usan
DHCP: tienen IP **fija**, porque todos los buscan por esa dirección.

## 🛠️ Ya está en R-CORE.txt
```
ip dhcp excluded-address 192.168.0.1 192.168.0.20   ← reserva .1 a .20 (router, switches, WLC, PC-ADMIN)
ip dhcp pool CORPORATIVO
 network 192.168.1.0 255.255.255.0    ← reparte IPs de esta red
 default-router 192.168.1.1           ← gateway que entrega
 dns-server 192.168.3.12              ← DNS que entrega
```

## ✅ Compruébalo (después del Módulo 9)
`R-CORE# show ip dhcp binding` lista qué IP se entregó a qué MAC.

## 🗣️ Si te preguntan
"El router hace de servidor DHCP con un pool por VLAN; excluimos las direcciones de los equipos con IP fija."

---

# MÓDULO 7: Servidores

## 📘 Conceptos
- **Servidor RADIUS (AAA)**: verifica usuario y contraseña de los empleados (Módulo 11).
- **Servidor IoT**: recibe los datos de los sensores y ejecuta las reglas (Módulo 13).
- **Servidor Central**: el portal web de entregas (**HTTP/HTTPS**) y el **DNS**.
- **DNS**: traduce nombres a IPs (`entregas.innovalogistics.local` → `192.168.3.12`), como una agenda de contactos.
- **HTTPS**: HTTP cifrado con TLS; nadie en el camino puede leer los datos.

## 🛠️ Hazlo
Sigue la **FASE 3** de `02_Guia_Packet_Tracer.md`: IPs estáticas, AAA, HTTP/HTTPS, DNS e IoT.

## ✅ Compruébalo
Desde PC-ADMIN → Command Prompt:
```
ping 192.168.0.1      → responde (su gateway)
ping 192.168.3.12     → responde (otra VLAN: ¡el router-on-a-stick funciona!)
```
Desde PC-ADMIN → Web Browser → `entregas.innovalogistics.local` → se ve el portal (DNS y HTTP funcionan).

**Si el ping a otra VLAN falla**, revisa en orden: IP y gateway de la PC → puerto del switch en la
VLAN correcta (`show vlan brief`) → trunk (`show interfaces trunk`) → subinterfaz del router.

---

# MÓDULO 8: Fundamentos de WiFi

Lee esto antes de tocar la WLC. Es la base teórica de la materia.

## 📘 8.1 Qué es el WiFi
Es la familia de estándares **IEEE 802.11**. Transmite datos con ondas de radio en lugar de cables.

| Estándar | Nombre comercial | Banda | Velocidad máx. aprox. |
|----------|------------------|-------|-----------------------|
| 802.11b | — | 2.4 GHz | 11 Mbps |
| 802.11a | — | 5 GHz | 54 Mbps |
| 802.11g | — | 2.4 GHz | 54 Mbps |
| 802.11n | WiFi 4 | 2.4 / 5 GHz | 600 Mbps |
| 802.11ac | WiFi 5 | 5 GHz | ~3.5 Gbps |
| 802.11ax | WiFi 6/6E | 2.4 / 5 / 6 GHz | ~9.6 Gbps |

## 📘 8.2 Bandas y canales
- **2.4 GHz**: mayor alcance y atraviesa mejor las paredes, pero tiene más interferencia (microondas, Bluetooth) y **solo 3 canales que no se enciman: 1, 6 y 11**.
- **5 GHz**: más canales y más velocidad, pero menor alcance.

Los canales de 2.4 GHz están separados 5 MHz, pero cada uno ocupa unos 20–22 MHz, así que se enciman
con sus vecinos. Solo 1, 6 y 11 quedan libres entre sí.

**Problema de la empresa:** todos los routers estaban en el mismo canal. En WiFi, si dos equipos
transmiten a la vez en el mismo canal, chocan. Por eso usa **CSMA/CA** (escuchar antes de hablar y
esperar turno): con muchos APs en el mismo canal todos esperan → lentitud y caídas. A esto se le
llama **interferencia co-canal**.
**Solución:** AP-1 en el canal 1, AP-2 en el 6 y AP-3 en el 11.

## 📘 8.3 SSID, BSS, ESS
- **SSID**: el nombre de la red que ves en tu celular ("INNOVA-CORP").
- **BSSID**: la MAC del radio de un AP (identifica a cada antena).
- **BSS** (Basic Service Set): **un** AP y sus clientes.
- **ESS** (Extended Service Set): **varios** APs con el **mismo SSID**, unidos por la red cableada. Para el usuario es una sola red grande. ← **Esto pide el proyecto.**
- **IBSS / ad-hoc**: equipos conectados entre sí sin AP.

## 📘 8.4 Roaming
Es cambiar de AP sin desconectarse, como cuando hablas por celular y cambias de antena sin que se
corte la llamada. Lo decide el **cliente** cuando la señal del AP actual se debilita.
Requisitos: mismo SSID, misma seguridad, coberturas que se enciman un poco (15–20 %) y canales
distintos en APs vecinos.

## 🗣️ Si te preguntan
"Usamos un ESS: tres APs con el mismo SSID en canales 1, 6 y 11, que no se enciman. El usuario ve una
sola red y hace roaming entre APs sin perder conexión."

---

# MÓDULO 9: WLC, Access Points y CAPWAP

## 📘 Concepto: AP autónomo vs AP ligero
- **AP autónomo**: tiene "cerebro" propio; cada uno se configura por separado (como los routers caseros que tenía la empresa).
- **Lightweight AP (LAP)**: no se configura solo. Obedece a una **WLC**.

## 📘 Concepto: WLC (Wireless LAN Controller)
Es el **cerebro central** de todos los APs. Ahí se configuran **una vez** los SSIDs, la seguridad,
los canales y las VLANs, y la WLC se los manda a todos los APs.

**Split-MAC**: el trabajo se divide.
- El **AP** hace lo inmediato: transmitir la señal, enviar *beacons* (los anuncios del SSID), confirmar recepción, cifrar en el aire.
- La **WLC** hace la gestión: decidir quién se conecta, autenticar, asignar la VLAN, controlar el roaming.

## 📘 Concepto: CAPWAP
**CAPWAP** es el "túnel" que une cada AP con la WLC.
- **UDP 5246**: canal de **control** (órdenes y configuración), cifrado con DTLS.
- **UDP 5247**: canal de **datos** (el tráfico de los usuarios va encapsulado aquí).

**Cómo encuentra el AP a la WLC (discovery):**
1. El AP enciende y pide IP por DHCP (pool `GESTION-APs`, VLAN 99).
2. Envía un mensaje de descubrimiento por **broadcast**. La WLC está en la misma VLAN 99, lo oye y responde.
3. Se forma el túnel y el AP descarga su configuración.

(Si la WLC estuviera en otra subred se usaría la **opción 43 de DHCP** o un registro **DNS**.)

## 📘 ¿Por qué el puerto del AP es *access* y el de la WLC es *trunk*?
- El AP solo envía CAPWAP en la VLAN 99. El tráfico de los usuarios va **dentro** del túnel, así que no necesita etiquetas → **access**.
- La WLC saca el tráfico del túnel y lo entrega en la VLAN de cada usuario (10, 20, 40), además de su gestión (99) → necesita **trunk**.

## 🛠️ Hazlo
Sigue los pasos **4.1, 4.2 y 4.3** de `02_Guia_Packet_Tracer.md`: IP de la WLC, entrar a su web
desde PC-ADMIN y verificar los APs.

## ✅ Compruébalo
- WLC web → **Wireless → All APs** → aparecen los 3 APs.
- `R-CORE# show ip dhcp binding` → 3 IPs 192.168.0.x (las de los APs).
- En **Simulation Mode** filtra **CAPWAP** y verás los paquetes entre los APs y la WLC.

## 🗣️ Si te preguntan
"Los APs son lightweight. Obtienen IP por DHCP, descubren la WLC por broadcast en la VLAN de gestión y
forman un túnel CAPWAP: puerto 5246 para control y 5247 para datos. Toda la configuración vive en la WLC."

---

# MÓDULO 10: SSIDs, interfaces dinámicas y roaming

## 📘 Concepto: interfaz dinámica
La WLC necesita "una pata" en cada VLAN de usuarios para soltar ahí su tráfico. Cada pata es una
**interfaz dinámica** con su VLAN y su IP:
- Interfaz `CORP` → VLAN 10 (192.168.1.2)
- Interfaz `GUEST` → VLAN 20 (192.168.2.2)
- Interfaz `IOT` → VLAN 40 (192.168.4.2)

Luego cada **SSID** se amarra a una interfaz: **SSID → interfaz → VLAN**.

```
Laptop conecta a "INNOVA-CORP" → AP → túnel CAPWAP → WLC → interfaz CORP → VLAN 10 → trunk → router
```

## 🛠️ Hazlo
Pasos **4.4 a 4.7** de la guía (RADIUS, interfaces, WLANs y canales), luego **FASE 5** (clientes).
Por ahora conecta solo al **visitante** (PSK). El empleado se prueba en el Módulo 11.

## ✅ Compruébalo: roaming
1. LAP-EMPLEADO-1 cerca de AP-1 (después del Módulo 11).
2. Command Prompt: `ping -t 192.168.3.12` (ping continuo).
3. Arrastra la laptop hacia el AP-2.
4. El ping sigue y la IP **no cambia** (`ipconfig`).

¿Por qué no cambia la IP? Porque los tres APs pertenecen a la misma WLC y esta mete al usuario
siempre en la VLAN 10, sin importar por qué AP llegue. Es **roaming de capa 2 dentro del mismo controlador**.

## 🗣️ Si te preguntan
"Cada SSID está asociado a una interfaz dinámica de la WLC, que corresponde a una VLAN. Así,
conectarse a INNOVA-CORP te coloca en la VLAN 10 sin importar el AP."

---

# MÓDULO 11: Seguridad: WPA2-Enterprise, 802.1X y RADIUS

## 📘 Evolución de la seguridad WiFi
| Protocolo | Cifrado | Estado |
|-----------|---------|--------|
| WEP | RC4 | Roto, nunca usar |
| WPA | TKIP | Obsoleto |
| **WPA2** | **AES-CCMP** | Estándar actual (el que usamos) |
| WPA3 | AES + SAE | El más nuevo (Packet Tracer no lo soporta completo) |

## 📘 Personal (PSK) vs Enterprise (802.1X)
- **WPA2-Personal / PSK**: **una sola clave para todos**. Si un empleado se va de la empresa se lleva la clave, y hay que cambiarla en todos los equipos. ← Problema original.
- **WPA2-Enterprise**: **cada persona tiene su usuario y contraseña**, validados por un servidor. Para quitarle el acceso a alguien solo borras su usuario.

## 📘 802.1X: los 3 actores
Como entrar a un edificio con guardia:

| Rol | Analogía | En el proyecto |
|-----|----------|----------------|
| **Suplicante** | La persona que quiere entrar | La laptop del empleado |
| **Autenticador** | El guardia de la puerta | La **WLC** |
| **Servidor de autenticación** | La oficina que revisa la lista de empleados | El **servidor RADIUS** |

El guardia (WLC) **no decide**: pregunta a la oficina (RADIUS) y obedece.

## 📘 El proceso paso a paso
1. La laptop se asocia al SSID `INNOVA-CORP`.
2. La WLC le pide su identidad usando **EAP** (el "lenguaje" de autenticación; entre laptop y WLC viaja como **EAPOL**).
3. La WLC empaqueta esos datos en un mensaje **RADIUS Access-Request** y lo manda al servidor (UDP 1812), firmado con el **shared secret** (una contraseña que solo conocen la WLC y el RADIUS).
4. El RADIUS revisa usuario y contraseña → responde **Access-Accept** (o **Access-Reject**).
5. Se generan las llaves de cifrado (**4-way handshake**) y desde ahí todo viaja cifrado con **AES**.
6. La laptop pide IP por DHCP en la VLAN 10.

## 📘 AAA
- **A**uthentication: ¿quién eres?
- **A**uthorization: ¿qué puedes hacer?
- **A**ccounting: ¿qué hiciste? (registro)

## 🛠️ Hazlo
1. SRV-RADIUS → Services → **AAA** (paso 3.1 de la guía). **El Client IP debe ser 192.168.0.10** (la WLC, porque es ella quien le pregunta, no la laptop).
2. WLC → RADIUS (paso 4.4) con el **mismo secret**.
3. WLAN INNOVA-CORP con **802.1X** (paso 4.6).
4. Laptop: SSID `INNOVA-CORP`, Authentication **WPA2** (no WPA2-PSK), usuario y contraseña.

## ✅ Compruébalo
- Usuario correcto → conecta y recibe 192.168.1.x.
- Contraseña incorrecta → **no conecta**.
- Simulation Mode, filtro **RADIUS** → ves el viaje WLC → RADIUS → WLC.

## 🗣️ Si te preguntan
"La laptop es el suplicante, la WLC el autenticador y el RADIUS el servidor de autenticación. La WLC
reenvía las credenciales al RADIUS con un secreto compartido; si las acepta, se cifra con AES. Cada
empleado tiene su propia cuenta, así que no hay clave compartida."

---

# MÓDULO 12: Aislar a los invitados con ACLs

## 📘 Concepto: ACL
Una **ACL** (Access Control List) es una lista de reglas de **permitir/denegar** que el router aplica
a los paquetes. Funciona como un **guardia con una lista**:

1. Lee las reglas **de arriba hacia abajo**.
2. La **primera regla que coincide** decide; las demás ya no se leen.
3. Al final hay un **"deny any" invisible** (implícito): lo que no se permitió explícitamente, se bloquea.

**Tipos:**
- **Estándar**: solo mira la IP de origen. Se coloca **cerca del destino**.
- **Extendida**: mira origen, destino, protocolo y puerto. Se coloca **cerca del origen**. ← La que usamos.

**Dirección:**
- `in`: revisa el tráfico que **entra** al router por esa interfaz.
- `out`: revisa el tráfico que **sale** del router por esa interfaz.

## 📘 Concepto: wildcard (máscara comodín)
Es la máscara "al revés": `0` = este bit debe coincidir, `1` = no importa.
Se calcula restando la máscara a 255.255.255.255:
- /24 → 255.255.255.255 − 255.255.255.0 = **0.0.0.255**
- /20 → 255.255.255.255 − 255.255.240.0 = **0.0.15.255** (cubre de 192.168.0.0 a 192.168.15.255, toda la empresa)

## 🎯 La ACL de invitados, línea por línea
```
ip access-list extended ACL-INVITADOS
 permit udp any any eq bootps
   ↑ deja pasar el DHCP (puerto 67). Si no, el deny implícito bloquearía y el invitado no tendría IP.
 permit icmp 192.168.2.0 0.0.0.255 host 192.168.2.1
   ↑ el invitado puede hacer ping a su gateway (solo para pruebas)
 deny ip 192.168.2.0 0.0.0.255 192.168.0.0 0.0.15.255
   ↑ BLOQUEA todo lo que vaya de invitados hacia cualquier red de la empresa (la /20 entera)
 permit ip 192.168.2.0 0.0.0.255 any
   ↑ todo lo demás (Internet) se permite

interface GigabitEthernet0/0.20
 ip access-group ACL-INVITADOS in
   ↑ se aplica al tráfico que ENTRA al router desde la VLAN de invitados
```

**El orden importa:** si el `deny` estuviera antes del `permit udp ... bootps`, el DHCP también
quedaría bloqueado.

## 🎯 Doble protección
1. **VLAN 20**: los invitados están en otro dominio de broadcast.
2. **ACL**: aunque el router podría enrutarlos, la ACL lo impide.

## ✅ Compruébalo
Desde LAP-VISITANTE:
```
ping 192.168.2.1    → responde
ping 192.168.3.12   → falla
ping 192.168.1.11   → falla
```
`R-CORE# show access-lists` → la línea `deny` muestra "(X matches)": ahí se ve que la regla funcionó.

## 🗣️ Si te preguntan
"Los invitados están en la VLAN 20, y una ACL extendida aplicada de entrada en su subinterfaz niega
todo hacia la 192.168.0.0/20 con wildcard 0.0.15.255. Solo permite DHCP, ping a su gateway e Internet."

---

# MÓDULO 13: IoT y la red de sensores (WSN)

## 📘 Conceptos
- **IoT** (Internet of Things): objetos cotidianos conectados a la red.
- **Sensor**: **mide** algo (temperatura, puerta abierta, humo). Es como los sentidos.
- **Actuador**: **hace** algo (ventilador, sirena, luz). Es como los músculos.
- **Servidor IoT / gateway**: el **cerebro**. Recibe los datos de los sensores y aplica reglas.
- **Regla (condición)**: `SI <algo pasa> ENTONCES <haz algo>`. Ejemplo: SI temperatura > 25 °C ENTONCES ventilador encendido.
- **WSN**: red de sensores que se comunican **sin cables**. En la vida real se usan Zigbee, LoRaWAN, BLE o WiFi; en Packet Tracer usamos WiFi.

## 🎯 Para qué aquí
Los insumos médicos deben guardarse por debajo de 25 °C (temperatura ambiente controlada: 15–25 °C)
y el almacén necesita detectar incendios. Con la automatización, el sistema reacciona aunque nadie
esté mirando.

**¿Por qué los sensores van en una VLAN aparte (40)?** Los dispositivos IoT suelen tener poca
seguridad. Si alguien hackea un sensor, no debe poder llegar a las laptops ni a los servidores
(**segmentación**).

## 🛠️ Hazlo
**FASE 6** de la guía:
1. Ponles adaptador WiFi (PT-IOT-NM-1W) y conéctalos a `INNOVA-IOT`.
2. Regístralos en el servidor IoT (192.168.3.11).
3. Crea las reglas en la web del servidor IoT.

## ✅ Compruébalo
- Alt+clic en la puerta → se enciende la luz.
- Sube la temperatura → arranca el ventilador.
- Genera humo → suena la sirena.

## 🗣️ Si te preguntan
"Los sensores envían sus lecturas por WiFi al servidor IoT. El servidor evalúa reglas SI/ENTONCES y
ordena a los actuadores encender el ventilador o la sirena. Están en una VLAN propia por seguridad."

---

# MÓDULO 14: La red celular 4G (WWAN)

## 📘 Conceptos
- **WWAN**: red inalámbrica de **área amplia**, la que dan los operadores celulares (3G, 4G LTE, 5G).
- **Torre celular (Cell Tower)**: la antena que da cobertura de radio. En LTE se llama **eNodeB**.
- **Central Office Server**: en Packet Tracer simula la **central del operador** (en LTE, el núcleo **EPC**). Hace dos cosas:
  1. Les da IP a los celulares (como un DHCP).
  2. Conecta la red celular con la red de la empresa por su puerto **Backbone**.

## 🎯 Recorrido de un paquete del chofer al servidor
```
Celular (192.168.6.10)
  → por radio 4G → Torre
  → por coaxial → Central Office (192.168.5.2)
  → por cable → R-CORE G0/1 (192.168.5.1)   [aquí revisa la ACL-CELULAR]
  → subinterfaz G0/0.30 → SW-CORE → Servidor Central (192.168.3.12)
```
**De regreso**, el router necesita saber dónde está la red 192.168.6.0. Para eso sirve la **ruta
estática** `ip route 192.168.6.0 255.255.255.0 192.168.5.2`.

## 🎯 Comunicación segura
- `ACL-CELULAR` solo permite que los celulares lleguen al Servidor Central por HTTPS, HTTP y DNS. Todo lo demás se bloquea.
- **HTTPS** cifra el contenido.
- En la vida real también se usaría una **VPN** o un **APN privado** del operador.

## 🛠️ Hazlo
**FASE 7** de la guía.

## ✅ Compruébalo
- Celular → IP 192.168.6.x.
- Navegador → `https://entregas.innovalogistics.local` → se ve el portal.
- `ping 192.168.3.10` (RADIUS) desde el celular → **falla** (la ACL funciona).

## 🗣️ Si te preguntan
"Los móviles se conectan a la torre 4G y el Central Office les asigna IP de la 192.168.6.0. El router
tiene una ruta estática hacia esa red, y una ACL limita el acceso de los móviles solo al portal de
entregas por HTTPS."

---

# MÓDULO 15: Pruebas finales y defensa

## 🛠️ Hazlo
1. Ejecuta todas las pruebas de `03_Pruebas_y_Validacion.md` y toma captura de cada una.
2. Pega las capturas en el reporte (`04_Reporte_Tecnico.md` → Word).
3. Arma las diapositivas con `06_Guion_Presentacion.md`.
4. Estudia el banco de preguntas de `05_Guia_de_Estudio.md`.

## 🧠 Cómo diagnosticar en vivo (lo que más valora el docente)
Cuando algo no funciona, revisa **de abajo hacia arriba** (capas OSI):

| Paso | Pregunta | Comando / lugar |
|------|----------|-----------------|
| 1. Física | ¿El cable está verde? ¿El AP tiene energía? | Vista lógica, pestaña Physical |
| 2. Enlace | ¿El puerto está en la VLAN correcta? ¿El trunk está arriba? | `show vlan brief`, `show interfaces trunk` |
| 3. Red | ¿Tiene IP correcta y gateway? ¿El router conoce la ruta? | `ipconfig`, `show ip route`, `ping` |
| 4. Seguridad | ¿Una ACL lo bloquea? ¿RADIUS rechaza? | `show access-lists`, secret de RADIUS |
| 5. Servicio | ¿El servicio está encendido en el servidor? | Pestaña Services |

Aunque algo falle en la exposición, si explicas este razonamiento demuestras que entiendes la red.

## ✔️ Checklist final
- [ ] Puedo dibujar la topología de memoria.
- [ ] Puedo explicar el subneteo /20 → /24.
- [ ] Sé qué es VLAN, trunk, VLAN nativa y router-on-a-stick.
- [ ] Sé explicar DORA.
- [ ] Sé qué hace la WLC, qué es CAPWAP y sus puertos.
- [ ] Sé explicar BSS, ESS, roaming y por qué los canales 1, 6 y 11.
- [ ] Sé los 3 roles de 802.1X y el flujo con RADIUS.
- [ ] Sé leer la ACL de invitados línea por línea y calcular la wildcard.
- [ ] Sé explicar sensor, actuador, servidor IoT y reglas.
- [ ] Sé el recorrido de un paquete del celular al servidor.
- [ ] Tengo el `.pkt`, el reporte y la presentación listos.
