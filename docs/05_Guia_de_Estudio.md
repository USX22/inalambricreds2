# 5. Guía de Estudio para la Defensa

Lee cada tema, luego tapa las respuestas del banco de preguntas e intenta contestarlas en voz alta.

---

## Tema 1 – Conceptos WLAN básicos

- **WLAN:** red de área local inalámbrica, estándar **IEEE 802.11**.
- **Estándares:** 802.11b/g (2.4 GHz), 802.11a (5 GHz), 802.11n (WiFi 4, 2.4/5), 802.11ac (WiFi 5, 5 GHz), 802.11ax (WiFi 6, 2.4/5/6).
- **2.4 GHz vs 5 GHz:** 2.4 llega más lejos y atraviesa mejor paredes, pero sólo tiene **3 canales sin traslape (1, 6, 11)** y más interferencia (microondas, Bluetooth). 5 GHz tiene más canales y más velocidad, pero menor alcance.
- **Interferencia co-canal:** varios APs en el mismo canal compiten por el aire (CSMA/CA), se esperan unos a otros → lentitud y caídas. Era el problema 1 de la empresa.
- **SSID:** nombre de la red. **BSSID:** MAC del radio del AP (identifica a cada AP).
- **BSS:** un AP + sus clientes. **ESS:** varios BSS (varios APs) con el **mismo SSID** unidos por la red cableada → permite **roaming**. **IBSS:** ad-hoc, sin AP.
- **CSMA/CA:** método de acceso al medio en WiFi (evita colisiones porque no se pueden detectar en el aire).

## Tema 2 – AP autónomo vs Lightweight + WLC

| AP autónomo | LAP + WLC |
|-------------|-----------|
| Cada AP se configura por separado | Todo se configura en la WLC |
| Difícil coordinar canales y potencia | La WLC hace RRM (canales/potencia automáticos) |
| Roaming limitado | Roaming transparente |
| Bueno para casa / oficina pequeña | Empresas con varios APs |

- **Split-MAC:** el LAP hace las funciones en tiempo real (beacons, ACKs, cifrado del aire) y la WLC hace la gestión (autenticación, asociación, políticas, mapeo a VLAN).
- **CAPWAP** (Control And Provisioning of Wireless Access Points, RFC 5415): túnel entre LAP y WLC.
  - **UDP 5246** → control (cifrado con DTLS).
  - **UDP 5247** → datos de los clientes.
- **Cómo encuentra el AP a la WLC (discovery):** broadcast en la misma subred (nuestro caso), **DHCP opción 43**, DNS (`CISCO-CAPWAP-CONTROLLER`), o IP configurada manualmente / WLC previamente conocida.
- **Modo Local:** todo el tráfico de clientes viaja por CAPWAP a la WLC (switching central) — es el que usamos. **FlexConnect:** el AP puede conmutar tráfico localmente (sucursales).
- **Interfaz de gestión** de la WLC (192.168.0.10): por donde habla con los APs y con RADIUS.
- **Interfaces dinámicas:** una por VLAN de clientes; así la WLC mete a cada SSID en su VLAN.
- **Puerto de la WLC al switch = trunk**, porque por ese cable salen clientes de varias VLANs.
- **Puerto del LAP al switch = access** (VLAN 99), porque el AP sólo manda CAPWAP; las VLANs de clientes van *dentro* del túnel.

## Tema 3 – Roaming

- Roaming = el cliente cambia de AP sin desconectarse.
- Lo decide el **cliente** (cuando la señal RSSI del AP actual baja, busca otro AP con el mismo SSID).
- **Intra-controlador (Capa 2):** los APs son de la misma WLC y el cliente queda en la misma VLAN → **conserva su IP**. Es nuestro caso.
- Requisitos: mismo SSID, misma seguridad, cobertura traslapada ~15-20 %, canales distintos en APs vecinos.
- Con 802.1X el roaming puede ser más lento (reautenticación); se acelera con **PMK caching / OKC / 802.11r (Fast Transition)**.

## Tema 4 – Seguridad inalámbrica

- **WEP** (roto) → **WPA** (TKIP) → **WPA2** (AES-CCMP) → **WPA3** (SAE).
- **WPA2-Personal (PSK):** todos usan la misma clave. Si un empleado se va, hay que cambiar la clave a todos. Problema original de la empresa.
- **WPA2-Enterprise (802.1X):** cada usuario tiene sus credenciales; se valida contra un servidor.
- **Roles de 802.1X:**
  - **Suplicante:** el cliente (laptop).
  - **Autenticador:** la **WLC** (en un switch cableado sería el switch).
  - **Servidor de autenticación:** **RADIUS**.
- **EAP:** protocolo que transporta la autenticación (EAP-PEAP, EAP-TLS…). Entre cliente y WLC va como **EAPOL**; entre WLC y servidor va dentro de **RADIUS**.
- **RADIUS:** UDP **1812** autenticación, **1813** accounting. Usa un **shared secret** entre WLC y servidor.
- **AAA:** Authentication (¿quién eres?), Authorization (¿qué puedes hacer?), Accounting (¿qué hiciste?).
- **4-way handshake:** después de autenticarse, cliente y AP derivan las llaves de cifrado (PTK) a partir de la PMK.
- **RADIUS vs TACACS+:** RADIUS (UDP, cifra sólo la contraseña, usado para acceso de usuarios a red); TACACS+ (TCP 49, cifra todo, usado para administración de dispositivos, Cisco).

## Tema 5 – VLANs, trunks, inter-VLAN, DHCP

- **VLAN:** divide un switch en dominios de broadcast separados → seguridad y orden.
- **802.1Q:** etiqueta de 4 bytes en la trama con el ID de VLAN; se usa en los **trunks**.
- **VLAN nativa:** la que viaja **sin etiqueta** por el trunk. Debe coincidir en ambos extremos. Usamos la 99 porque la gestión de la WLC sale sin etiqueta.
- **Router-on-a-stick:** un solo puerto físico del router dividido en subinterfaces (una por VLAN) con `encapsulation dot1Q`. Es el gateway de todas las VLANs → inter-VLAN routing.
- **DHCP (DORA):** Discover → Offer → Request → Acknowledge. `excluded-address` reserva IPs para gateways y equipos estáticos.
- **¿Por qué los servidores tienen IP estática?** Porque los clientes, la WLC y los sensores los buscan por una IP fija.
- **PortFast:** el puerto pasa directo a *forwarding* (sin esperar ~30 s de STP); sólo en puertos hacia equipos finales/APs.

## Tema 6 – ACLs

- **Estándar** (1-99): filtra sólo por IP origen → se pone **cerca del destino**.
- **Extendida** (100-199 o nombrada): filtra por origen, destino, protocolo y puerto → se pone **cerca del origen**. Las nuestras son extendidas nombradas aplicadas *in* en la subinterfaz del origen.
- **Wildcard:** inverso de la máscara. /20 = 255.255.240.0 → wildcard **0.0.15.255**. /24 → 0.0.0.255.
- Se leen **de arriba hacia abajo**, la primera coincidencia gana y al final hay un **deny any implícito**.
- Por eso en `ACL-INVITADOS` el `permit udp any any eq bootps` (DHCP) va **antes** del deny; si no, los invitados no obtendrían IP.
- `ACL-INVITADOS`: niega 192.168.2.0/24 → 192.168.0.0/20 (toda la empresa) y permite lo demás (Internet).

## Tema 7 – IoT y WSN

- **IoT:** objetos con sensores/actuadores conectados a la red.
- **Sensor:** mide (temperatura, puerta abierta, humo). **Actuador:** actúa (ventilador, sirena, luz).
- **WSN (Wireless Sensor Network):** red de sensores que comunican de forma inalámbrica; en la industria real se usan Zigbee, LoRaWAN, BLE o WiFi; en PT usamos WiFi (adaptador PT-IOT-NM-1W).
- **Servidor IoT / Gateway:** registra los dispositivos y ejecuta reglas **IF condición THEN acción** (automatización por eventos).
- **¿Por qué VLAN separada para IoT?** Los dispositivos IoT suelen ser poco seguros; si uno se compromete, no debe alcanzar la red corporativa (segmentación).
- **¿Por qué 25 °C?** Rango típico de almacenamiento a "temperatura ambiente controlada" de medicamentos (15–25 °C).

## Tema 8 – WWAN / Red celular

- **WWAN:** red inalámbrica de área amplia, provista por operadores (3G, **4G LTE**, 5G).
- **Cell Tower (eNodeB en LTE):** la estación base que da cobertura radio.
- **Central Office Server:** simula el núcleo del operador (en LTE el **EPC**: MME, S-GW, P-GW). Asigna IPs a los móviles y los conecta a la red de la empresa por su puerto *Backbone*.
- **¿Cómo llega el tráfico de regreso?** Ruta estática en R-CORE: `192.168.6.0/24 via 192.168.5.2`.
- **Seguridad:** la ACL `ACL-CELULAR` sólo deja llegar al portal de entregas (HTTPS 443, HTTP 80, DNS 53). En la vida real se agregaría **VPN IPsec** o APN privado del operador.

## Tema 9 – Subneteo de la /20

- 192.168.0.0/20 → máscara 255.255.240.0 → 4096 direcciones (192.168.0.0 a 192.168.15.255).
- /24 = 8 bits de host → 256 direcciones, 254 usables.
- De /20 a /24 se prestan 4 bits → 2⁴ = **16 subredes**.
- Subredes: 192.168.0.0, 1.0, 2.0 … 15.0 (el tercer octeto avanza de 1 en 1).

---

## Banco de preguntas (con respuesta)

**1. ¿Por qué usaron WLC en lugar de routers inalámbricos?**
Porque centraliza la configuración de los 3 APs, coordina canales y potencia, permite roaming
transparente y aplica la misma seguridad en todos. Con routers caseros cada uno es una red aislada,
mismo canal e interferencia.

**2. ¿Qué es CAPWAP y qué puertos usa?**
Protocolo de túnel entre LAP y WLC. UDP 5246 control (DTLS) y UDP 5247 datos.

**3. ¿Cómo encontraron los APs a la WLC?**
Están en la misma VLAN de gestión (99) que la WLC; tras obtener IP por DHCP envían un *discovery*
broadcast y la WLC responde. En redes distintas usaríamos DHCP opción 43 o DNS.

**4. ¿Por qué el puerto de la WLC es trunk y el de los APs es access?**
La WLC entrega tráfico de clientes de varias VLANs (10, 20, 40) más su gestión, necesita etiquetas.
El AP sólo envía CAPWAP en la VLAN 99; el tráfico de clientes va encapsulado dentro.

**5. ¿Qué es ESS y por qué permite roaming?**
Varios APs con el mismo SSID conectados a la misma infraestructura. El cliente ve una sola red y se
mueve al AP con mejor señal sin reconectarse; como la WLC lo mantiene en la misma VLAN, conserva la IP.

**6. Si apago un AP, ¿qué pasa?**
Los clientes se reasocian al siguiente AP con cobertura del mismo ESS. La WLC sigue funcionando.

**7. ¿Y si se cae la WLC?**
Los LAPs en modo Local pierden el servicio (punto único de falla). Solución real: WLC redundante (N+1 o HA SSO).

**8. Diferencia entre WPA2-Personal y WPA2-Enterprise.**
Personal: una clave compartida (PSK) para todos. Enterprise: cada usuario se autentica con sus
credenciales contra un RADIUS usando 802.1X/EAP; se puede revocar a una persona sin afectar al resto.

**9. Explica el proceso de autenticación de un empleado.**
La laptop (suplicante) se asocia al SSID → la WLC (autenticador) le pide identidad por EAPOL → la WLC
reenvía al RADIUS en un Access-Request (usando el shared secret) → RADIUS valida usuario/contraseña y
responde Access-Accept → se genera la PMK, se hace el 4-way handshake, se cifra con AES → la laptop pide
IP por DHCP en la VLAN 10.

**10. ¿Qué pasa si el shared secret de la WLC y el RADIUS no coinciden?**
El RADIUS descarta las solicitudes y ningún empleado se puede conectar.

**11. ¿Qué pasa si se cae el servidor RADIUS?**
Los empleados nuevos no pueden autenticarse (los ya conectados siguen hasta reautenticar). Invitados
e IoT (PSK) no se afectan. En producción se pone un segundo RADIUS.

**12. ¿Cómo aislaron a los invitados?**
Doble capa: VLAN 20 propia (dominio de broadcast separado) + ACL extendida en la subinterfaz G0/0.20
que niega todo hacia 192.168.0.0/20 y sólo permite DHCP, ping a su gateway e Internet.

**13. ¿Por qué la ACL va en la subinterfaz .20 y en dirección "in"?**
Es extendida → se coloca lo más cerca del origen para descartar el tráfico antes de que use recursos
del router. "In" = el tráfico que entra al router desde la VLAN de invitados.

**14. ¿Por qué la wildcard es 0.0.15.255?**
Porque cubre la /20 completa: 255.255.255.255 − 255.255.240.0 = 0.0.15.255.

**15. ¿Qué hace el `permit udp any any eq bootps`?**
Permite los mensajes DHCP (puerto 67) hacia el router; sin él, el deny implícito bloquearía DHCP y el
invitado no tendría IP.

**16. ¿Qué es router-on-a-stick?**
Un puerto físico del router con subinterfaces 802.1Q, cada una es la puerta de enlace de una VLAN; así
se enruta entre VLANs con un solo cable.

**17. ¿Qué es la VLAN nativa y por qué la 99?**
La que viaja sin etiqueta en el trunk. La gestión de la WLC sale sin etiqueta, por eso hicimos la 99
nativa en todos los trunks (y `encapsulation dot1Q 99 native` en el router). Debe coincidir en ambos lados.

**18. Explica el subneteo.**
/20 tiene 4096 IPs. Prestando 4 bits llegamos a /24: 16 subredes de 254 hosts. Usamos 7 (gestión,
corporativo, invitados, servidores, IoT, enlace 4G y celular) y quedan 9 para crecer.

**19. ¿Qué es una WSN y cómo funciona la automatización?**
Red de sensores inalámbricos. Los sensores envían lecturas al servidor IoT; éste evalúa reglas
IF/THEN (ej. temperatura > 25 °C → ventilador ON) y envía la orden al actuador. No interviene nadie.

**20. ¿Por qué los sensores en una VLAN aparte?**
Por segmentación: los dispositivos IoT son vulnerables; si se comprometen no alcanzan a los empleados
ni servidores (con la ACL-IOT opcional sólo hablan con el servidor IoT).

**21. ¿Cómo llega el celular del chofer al servidor central?**
Smartphone → torre 4G → Central Office Server (le dio IP 192.168.6.x) → backbone 192.168.5.2 → R-CORE
G0/1 → ACL-CELULAR lo permite sólo hacia 192.168.3.12 → VLAN 30 → servidor. El regreso usa la ruta
estática 192.168.6.0/24 vía 192.168.5.2.

**22. ¿Es seguro mandar datos por la red celular?**
En el proyecto lo limitamos con ACL y HTTPS (cifrado TLS). En una red real se agregaría VPN IPsec o un
APN privado del operador.

**23. ¿Por qué canales 1, 6 y 11?**
En 2.4 GHz los canales miden 20/22 MHz y están separados 5 MHz; sólo 1, 6 y 11 no se traslapan.
Así cada AP vecino no interfiere con el otro.

**24. ¿Qué es split-MAC?**
División de funciones 802.11: el AP hace lo de tiempo real (beacons, ACKs, cifrado del aire), la WLC
hace gestión (asociación, autenticación, políticas, roaming).

**25. ¿Por qué no usaron WPA3?**
Packet Tracer no lo soporta completamente; en implementación real se recomienda WPA3-Enterprise.

**26. ¿Qué es AES-CCMP?**
El cifrado de WPA2: AES en modo contador con CBC-MAC; da confidencialidad e integridad. Reemplazó a TKIP/RC4.

**27. ¿Qué es SSH y por qué no Telnet?**
SSH cifra la sesión de administración; Telnet manda todo en texto plano (contraseñas incluidas).

**28. ¿Qué mejoras harías?**
5 GHz, WPA3/EAP-TLS, PoE, WLC redundante, RADIUS secundario, portal cautivo para invitados, VPN para la
flotilla, monitoreo SNMP/Syslog.

---

## Prueba rápida (autoevaluación)

1. ¿Puerto UDP de datos de CAPWAP? → *5247*
2. ¿Rol de la WLC en 802.1X? → *Autenticador*
3. ¿Puerto de autenticación RADIUS? → *UDP 1812*
4. ¿Cuántas subredes /24 caben en una /20? → *16*
5. ¿Wildcard de /24? → *0.0.0.255*
6. ¿Dónde se coloca una ACL extendida? → *Cerca del origen*
7. ¿Qué tiene al final toda ACL? → *deny any implícito*
8. ¿Qué es BSSID? → *La MAC del radio del AP*
9. ¿Qué dispositivo de PT le da IP a los celulares? → *Central Office Server*
10. ¿Qué adaptador WiFi usan los IoT en PT? → *PT-IOT-NM-1W*
