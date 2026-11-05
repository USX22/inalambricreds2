# 7. Revisión del proyecto contra el PDF y la rúbrica

Revisión hecha el 5 de noviembre de 2026. Compara cada requisito del PDF y cada criterio de la
rúbrica con lo que está diseñado, configurado y documentado en este repositorio.

## 7.1 Requisitos del PDF

| Requisito del PDF | Cómo se cumple | Dónde está | Cómo se demuestra |
|---|---|---|---|
| WLC con 3 Access Points | WLC + AP-1 (Oficinas), AP-2 y AP-3 (Almacén) como LAPs en CAPWAP | App lecc. 10 · `docs/02` Fase 4 | WLC → Wireless → All APs: 3 registrados |
| Topología ESS con roaming transparente | Mismos SSIDs en los 3 APs, misma WLC y misma VLAN por SSID | App lecc. 11 | `ping -t` mientras la laptop se mueve en la vista Physical; misma IP |
| Cobertura total | Un AP en Oficinas y dos en el Almacén, canales 1/6/11 | `docs/01` §1.7 | Clientes asociados en ambos edificios |
| WPA2-Enterprise (802.1X) con RADIUS para el personal | SSID INNOVA-CORP, 802.1X, AES, RADIUS 192.168.3.10 | App lecc. 12 | Usuario correcto conecta; contraseña incorrecta no conecta |
| SSID independiente para invitados aislado mediante VLAN | INNOVA-GUEST en VLAN 20 + ACL-INVITADOS | App lecc. 11 y 13 | Ping del invitado a la red interna falla; `show access-lists` |
| Monitoreo de temperatura, puerta y humo en el Almacén | Temperature Monitor, Door y Smoke Detector registrados en el servidor IoT | App lecc. 14 | Servidor IoT → lista de dispositivos |
| Servidor IoT con acciones automáticas (ventiladores/alarmas) | 6 reglas SI/ENTONCES: ventilador, sirena y luz | App lecc. 14 | Subir temperatura → ventilador; humo → sirena |
| Torre celular para dispositivos móviles hacia el Servidor Central | Cell Tower + Central Office + ruta estática en R-CORE | App lecc. 15 | Celular abre el portal de entregas |
| Comunicación segura de los móviles | HTTPS + ACL-CELULAR (solo el portal y DNS) | App lecc. 15 | Celular → RADIUS falla |
| Red 192.168.0.0/20 dividida en /24 | 16 subredes /24; se usan 7 | `docs/01` §1.2 | Tabla de direccionamiento |
| Evidencias: reporte, .pkt, presentación | Borrador del reporte, guía para el .pkt, guion de 20 min | `docs/04`, `docs/02`, `docs/06` | — |

**Resultado:** todos los requisitos del PDF están cubiertos en el diseño.

## 7.2 Criterios de la rúbrica (nivel "Excelente")

| Criterio (peso) | Lo que pide "Excelente" | Cubierto por |
|---|---|---|
| Infraestructura base (20 %) | VLANs, trunking 802.1Q, inter-VLAN y DHCP sin errores de subneteo | `configs/SW-CORE.txt`, `SW-ALMACEN.txt`, `R-CORE.txt` (bloques 1 y 2) |
| WLC, WLANs y roaming (25 %) | WLC configurada, LAPs en CAPWAP, SSIDs creados, roaming sin pérdida | Lecciones 10 y 11 |
| Seguridad (25 %) | WPA2-Enterprise con RADIUS funcional e invitados totalmente aislados por ACL | Lecciones 12 y 13 |
| IoT/WSN/WWAN (20 %) | Sensores/actuadores con reglas automáticas y red 4G para clientes externos | Lecciones 14 y 15 |
| Documentación (10 %) | Reporte con topología y tabla de direccionamiento; defensa ante pruebas de falla | `docs/04`, `docs/03`, pestaña Defensa de la app |

## 7.3 Revisión de las configuraciones

Se revisó línea por línea `configs/R-CORE.txt`, `SW-CORE.txt` y `SW-ALMACEN.txt`:

- Las VLANs 10, 20, 30, 40 y 99 existen en ambos switches.
- Los tres trunks (router, entre switches y WLC) tienen la misma VLAN nativa (99) y las mismas VLANs permitidas.
- El router usa `encapsulation dot1Q 99 native` en la subinterfaz de gestión, igual que los switches.
- Cada subinterfaz tiene la IP .1 de su subred; no hay subredes encimadas.
- Las direcciones excluidas del DHCP cubren todos los equipos con IP fija (router, switches, WLC, PC-ADMIN). Los APs reciben .21 en adelante.
- ACL-INVITADOS: el DHCP se permite antes del `deny`; la wildcard 0.0.15.255 cubre toda la /20. Como la WLC reenvía el DHCP de los clientes al router (desde 192.168.2.2 hacia 192.168.2.1, UDP 67), la primera línea también lo permite.
- ACL-CELULAR: solo permite HTTPS, HTTP, DNS y ping hacia 192.168.3.12, y el regreso lo resuelve la ruta estática.
- SSH v2 con usuario local; puertos sin uso apagados.
- Las contraseñas, IPs y SSIDs coinciden en todos los documentos, la app y las configuraciones (revisado con un script).
- Las configuraciones de la app son idénticas a las de `configs/` (lo verifica `tests/app.test.js`).

## 7.4 Problemas encontrados y corregidos en esta revisión

| # | Problema | Riesgo | Corrección |
|---|---|---|---|
| 1 | Las instrucciones de roaming decían "arrastra la laptop", pero en Packet Tracer la cobertura WiFi depende de la posición en la vista **Physical**. Moviéndola en la vista Logical no pasa nada. | Alto: el roaming vale parte del 25 % y es una demo en vivo | Pasos nuevos para separar los APs y mover la laptop en la vista Physical (app lecc. 11 y 16, `docs/00`, `docs/02`, `docs/03`, `docs/06`) |
| 2 | Si tu versión no acepta `ping -t`, la demo de roaming se quedaba sin ping continuo | Medio | Alternativa `ping -n 200` |
| 3 | La ACL de invitados dice "Internet permitido" y el DNS de invitados es 8.8.8.8, pero el .pkt no tiene Internet | Medio: pregunta probable del docente | Explicación agregada en las lecciones 7 y 13 |
| 4 | Si el Central Office de tu versión traduce las IPs de los celulares, ACL-CELULAR bloquearía todo | Bajo a medio | Diagnóstico agregado en la lección 15 |

## 7.5 Lo que solo se puede confirmar dentro de Packet Tracer

Esta revisión no pudo ejecutar Packet Tracer. Estos puntos dependen de la versión instalada y se
confirman al construir el .pkt. Si alguno falla, la app tiene el paso de diagnóstico correspondiente.

| Punto | Lección donde se confirma | Plan B |
|---|---|---|
| La WLC muestra los campos de IP en la pestaña Config | 10 | Usar la WLC-2504 |
| Los APs se unen a la WLC por broadcast con el DHCP del router | 10 | Revisar VLAN 99 y energía; si persiste, avisar para usar un servidor DHCP con el campo "WLC Address" |
| La WLC permite elegir el canal de cada AP | 11 | Explicar el plan 1/6/11 en la exposición |
| `ping -t` funciona | 11 | `ping -n 200` |
| El Central Office no traduce las IPs de los celulares | 15 | Ver contadores de ACL-CELULAR |
| Los sensores IoT se conectan por WiFi con PT-IOT-NM-1W | 14 | Conectarlos por cable a SW-ALMACEN Fa0/5–10 (VLAN 40) |

## 7.6 Mejora opcional

Agregar un router "ISP" con un servidor web externo (fuera de 192.168.0.0/20) en el puerto G0/2 de
R-CORE. Así se demostraría que el invitado **sí** navega a Internet pero **no** llega a la red
interna. No es requisito del PDF.
