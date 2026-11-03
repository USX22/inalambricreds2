# Reporte Técnico – Proyecto Integrador de Redes Inalámbricas

**Rediseño Inalámbrico e Integración IoT para InnovaLogistics Puebla S.A. de C.V.**

| | |
|---|---|
| Materia | Redes Inalámbricas |
| Equipo consultor | *(nombres de los integrantes)* |
| Docente | *(nombre)* |
| Fecha | *(fecha de entrega)* |
| Herramienta | Cisco Packet Tracer 8.x |

> Instrucciones para ti: copia este texto a Word, agrega portada con logo de tu escuela e inserta
> las capturas donde dice **[Captura]**.

---

## 1. Introducción

InnovaLogistics Puebla distribuye insumos médicos e industriales desde el Parque Industrial
Chachapa. Opera dos edificios (Oficinas Corporativas y Almacén Central de Distribución) y una
flotilla de transporte en ruta. Este proyecto presenta el diseño, configuración y validación en
Cisco Packet Tracer de una solución inalámbrica integral que corrige los problemas de cobertura,
seguridad, monitoreo ambiental y conectividad móvil de la empresa.

## 2. Objetivos

**General:** Diseñar e implementar una infraestructura inalámbrica centralizada, segura y escalable
que integre sensores IoT y conectividad celular, validada en Cisco Packet Tracer.

**Específicos:**
1. Implementar una WLAN centralizada con una WLC y tres LAPs en topología ESS con roaming transparente.
2. Autenticar al personal mediante WPA2-Enterprise (802.1X) con servidor RADIUS.
3. Aislar la red de invitados mediante una VLAN dedicada y listas de control de acceso.
4. Desplegar una red de sensores (WSN) que automatice ventilación y alarmas en el almacén.
5. Integrar una red celular 4G para que la flotilla reporte entregas al servidor central.

## 3. Análisis de la problemática

| # | Problema | Impacto |
|---|----------|---------|
| 1 | Routers caseros independientes, WPA2-PSK compartida, todos en el mismo canal de 2.4 GHz | Caídas por interferencia co-canal, zonas sin cobertura en el almacén, riesgo de fuga de información (si un empleado sale, la clave sigue siendo válida) |
| 2 | Visitantes en la misma red que los servidores | Un visitante puede escanear o atacar servidores internos |
| 3 | Sin monitoreo de temperatura ni humo | Pérdida de insumos médicos sensibles, riesgo de incendio sin alerta |
| 4 | Flotilla sin conexión fuera del WiFi | No hay registro en tiempo real de entregas |

## 4. Solución propuesta

### 4.1 Infraestructura WLAN centralizada
Se sustituyen los routers caseros por una **Wireless LAN Controller (WLC)** y **tres Lightweight
Access Points (LAP)**: AP-1 en Oficinas, AP-2 y AP-3 en el Almacén. Los LAPs se registran en la WLC
mediante el protocolo **CAPWAP** (modo *Local*), por lo que la configuración de SSIDs, seguridad y
canales se administra desde un solo punto. Los tres APs anuncian los mismos SSIDs formando un
**ESS (Extended Service Set)**, lo que permite **roaming**: un usuario se desplaza entre edificios sin
perder la conexión ni cambiar de dirección IP. Se asignan los canales no traslapados **1, 6 y 11**
para eliminar la interferencia co-canal.

### 4.2 Seguridad
- **INNOVA-CORP:** WPA2-Enterprise (802.1X/EAP) con cifrado AES-CCMP. La WLC actúa como
  *autenticador* y consulta al **servidor RADIUS (192.168.3.10)**. Cada empleado tiene usuario y
  contraseña individuales; al dar de baja a un empleado sólo se elimina su cuenta.
- **INNOVA-GUEST:** WPA2-PSK en la **VLAN 20**. La ACL extendida `ACL-INVITADOS`, aplicada de
  entrada en la subinterfaz G0/0.20 del router, niega todo tráfico hacia la red interna
  192.168.0.0/20 y sólo permite DHCP, ping al gateway y salida a Internet.
- **Endurecimiento adicional:** SSH v2 en el router, contraseñas cifradas, banner legal, puertos sin
  uso apagados, VLAN de gestión separada.

### 4.3 Red de sensores IoT (WSN)
En el almacén se instalan un sensor de temperatura, un sensor de puerta y un detector de humo,
además de los actuadores ventilador, sirena y luz indicadora. Se conectan de forma inalámbrica al
SSID `INNOVA-IOT` (VLAN 40) y se registran en el **Servidor IoT (192.168.3.11)**, que ejecuta reglas:

| Condición | Acción |
|-----------|--------|
| Temperatura > 25 °C | Encender ventilador |
| Temperatura ≤ 25 °C | Apagar ventilador |
| Humo detectado | Activar sirena |
| Puerta abierta | Encender luz indicadora |

### 4.4 Conectividad móvil WWAN 4G
Se integra una **Torre Celular** conectada a un **Central Office Server**, que asigna direcciones
192.168.6.0/24 a los smartphones de la flotilla. El router R-CORE tiene una ruta estática hacia esa
red y la ACL `ACL-CELULAR` limita el acceso de los móviles exclusivamente al Servidor Central
(portal web HTTPS de entregas y DNS).

## 5. Topología

**[Captura: topología completa de Packet Tracer en vista lógica]**

**[Captura: vista física mostrando edificios y cobertura de los APs]**

## 6. Direccionamiento IP

Red asignada: **192.168.0.0/20**, dividida en 16 subredes /24 (4 bits prestados, 254 hosts por
subred). Se utilizan 7 y se reservan 9 para crecimiento.

| VLAN / Red | Nombre | Red | Gateway |
|------------|--------|-----|---------|
| 99 | Gestión | 192.168.0.0/24 | 192.168.0.1 |
| 10 | Corporativo | 192.168.1.0/24 | 192.168.1.1 |
| 20 | Invitados | 192.168.2.0/24 | 192.168.2.1 |
| 30 | Servidores | 192.168.3.0/24 | 192.168.3.1 |
| 40 | IoT | 192.168.4.0/24 | 192.168.4.1 |
| — | Enlace 4G | 192.168.5.0/24 | — |
| — | Celular | 192.168.6.0/24 | (Central Office) |

*(Pega aquí la tabla completa de direccionamiento de `01_Diseno_y_Direccionamiento.md`, sección 1.4.)*

## 7. Configuración de los dispositivos

### 7.1 Router R-CORE
Router-on-a-stick con subinterfaces 802.1Q para cada VLAN, servidor DHCP con 4 pools, ruta estática
a la red celular, ACLs extendidas nombradas y acceso SSH.
*(Anexo A: configuración completa – `configs/R-CORE.txt`.)*

**[Captura: `show ip interface brief`]** **[Captura: `show ip route`]**

### 7.2 Switches
VLANs 10, 20, 30, 40 y 99; troncales 802.1Q con VLAN nativa 99; puertos de acceso con PortFast.
*(Anexo B y C.)*

**[Captura: `show vlan brief`]** **[Captura: `show interfaces trunk`]**

### 7.3 WLC
**[Captura: APs registrados]** **[Captura: lista de WLANs]** **[Captura: configuración RADIUS]**
**[Captura: interfaces dinámicas]**

### 7.4 Servidores
**[Captura: AAA en SRV-RADIUS]** **[Captura: reglas en el servidor IoT]** **[Captura: DNS]**

### 7.5 Central Office y Torre celular
**[Captura: configuración del Central Office Server]**

## 8. Pruebas y resultados

| Prueba | Resultado esperado | Resultado obtenido |
|--------|-------------------|--------------------|
| Empleado se autentica con usuario válido | Conecta, IP 192.168.1.x | ✔ **[Captura]** |
| Empleado con contraseña incorrecta | Acceso denegado | ✔ **[Captura]** |
| Roaming entre AP-1 y AP-2 con ping continuo | Misma IP, sin pérdida significativa | ✔ **[Captura]** |
| Invitado hace ping a servidor interno | Falla | ✔ **[Captura]** |
| Temperatura > 25 °C | Ventilador encendido | ✔ **[Captura]** |
| Humo detectado | Sirena activada | ✔ **[Captura]** |
| Celular accede al portal de entregas | Página visible | ✔ **[Captura]** |
| Celular intenta llegar al RADIUS | Bloqueado | ✔ **[Captura]** |

*(Lista completa de pruebas en `03_Pruebas_y_Validacion.md`.)*

## 9. Conclusiones

La centralización con WLC resolvió la saturación del espectro al coordinar tres APs en canales no
traslapados y permitió roaming transparente dentro del ESS. WPA2-Enterprise eliminó la clave
compartida al autenticar a cada usuario contra RADIUS, y la combinación VLAN + ACL garantizó que los
visitantes no tengan visibilidad de la red interna. La red de sensores IoT proporciona telemetría y
respuesta automática ante condiciones de riesgo para los insumos médicos, y la red celular 4G
extiende el alcance de la empresa a la flotilla en ruta de manera controlada. El esquema de
direccionamiento /24 dentro de la /20 deja nueve subredes libres para crecimiento futuro.

## 10. Recomendaciones para una implementación real
- Usar WPA3-Enterprise y certificados (EAP-TLS) en lugar de usuario/contraseña.
- Habilitar la banda de 5 GHz para más canales y menor interferencia.
- Usar switches PoE para alimentar los APs.
- Agregar un portal cautivo para invitados y límite de ancho de banda.
- Usar VPN (IPsec) para la flotilla sobre la red pública del operador celular.
- Redundancia: segunda WLC (N+1) y enlace de respaldo.

## Anexos
- A. Configuración R-CORE
- B. Configuración SW-CORE
- C. Configuración SW-ALMACEN
