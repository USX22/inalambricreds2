# Estado del proyecto y siguientes pasos

> **Para una sesión nueva de Claude (por ejemplo, en la app de escritorio con control de pantalla):**
> lee este archivo completo antes de tocar nada. Resume dónde va el alumno, qué ya funciona,
> qué problemas se resolvieron y qué falta. El alumno es principiante: explícale cada paso con
> palabras simples y con el ejemplo del edificio (redes = pisos, router = elevador, gateway =
> puerta del elevador en cada piso, ACL = guardia). Entrega: **13 de noviembre de 2026, 12:00 hrs,
> 20 minutos** (exposición con demostración en vivo).

## Archivos clave del repositorio

| Archivo | Qué es |
|---|---|
| `app/index.html` | App de estudio con 18 lecciones (abrir con doble clic). Lecciones 11 a 18 tienen los pasos que faltan |
| `configs/` | Configuraciones CLI ya aplicadas (router y switches) |
| `entregables/capturas.json` | Las 22 capturas que van en el reporte y la presentación (nombre de archivo, lección, sección, diapositiva) |
| `entregables/Reporte_InnovaLogistics.docx` | Reporte en Word con recuadros "PEGA AQUÍ C0X" |
| `entregables/Presentacion_InnovaLogistics.pptx` | 14 diapositivas con notas del orador |
| `tools/reporte.js`, `tools/presentacion.js` | Generadores del Word y el PowerPoint |

## Lo que YA funciona en el .pkt del alumno

- Equipos colocados, renombrados y cableados en 3 zonas (Oficinas, Almacén, Flotilla 4G). ✅
- SW-CORE y SW-ALMACEN: VLANs 10, 20, 30, 40, 99; trunks con nativa 99. ✅
- R-CORE: router-on-a-stick (G0/0.10/.20/.30/.40/.99 en .1), G0/1 192.168.5.1, SSH, DHCP con 4 pools. ✅
- Servidores con IP fija; SRV-CENTRAL con HTTP/HTTPS y DNS (entregas.innovalogistics.local). Ping PC-ADMIN → 192.168.3.12 OK. ✅
- **WLC-2504** (se cambió desde la 3504) en 192.168.0.10, gestión con VLAN ID 0 (sin etiqueta). ✅
- 3 LAPs registrados (REG) con IP por DHCP en 192.168.0.x. ✅
- Interfaces dinámicas CORP (10, .1.2), GUEST (20, .2.2), IOT (40, .4.2), puerto 1, gateway y DHCP en el .1. ✅
- WLANs INNOVA-GUEST (→ guest, WPA2-PSK `Visitante2026`) e INNOVA-IOT (→ iot, WPA2-PSK `SensorIoT2026`). ✅
- **LAP-VISITANTE conectada a INNOVA-GUEST, recibe 192.168.2.x y hace ping a 192.168.2.1.** ✅

Capturas ya tomadas: C01 (topología), C02, C03, C04, C05. C06 (APs en la WLC) pendiente de retomar con la WLC-2504.

## Problemas encontrados y cómo se resolvieron (importante para no repetirlos)

1. **APs sin IP tras reiniciarlos:** al quitar/poner el adaptador de corriente, los APs no volvían (puerto del switch en down/down). **Solución:** borrar el AP y poner uno nuevo (LAP-PT), cablear a su puerto; se registra solo en la WLC.
2. **Packet Tracer pone los APs en modo FlexConnect y no deja cambiarlo** (clic en el AP → "This feature is not supported in Packet Tracer"), ni con la WLC-3504 ni con la 2504. Con FlexConnect, los clientes caían en la VLAN 99 (recibían 192.168.0.x).
   **Solución que funcionó:**
   - Puertos de los APs en **trunk** (nativa 99, permitidas 10,20,40,99): SW-CORE Fa0/2, SW-ALMACEN Fa0/1 y Fa0/2 (ya en `configs/`).
   - En cada WLAN → pestaña **Advanced** → marcar **FlexConnect Local Switching**.
   - En el cliente: Wireless0 Port Status Off → On y pedir DHCP otra vez.
3. **El asistente de la WLC** amarra la primera WLAN a *management*: hay que cambiarla a la interfaz correcta en WLANs → General → Interface.
4. **Al crear una WLAN** la seguridad queda en WPA (no WPA2) y Disabled: revisar Enabled y solo WPA2 Policy + AES.
5. **Port Number** de las interfaces dinámicas debe ser **1** (el único puerto cableado de la WLC).

## Lo que FALTA (en orden)

| # | Lección app | Tarea | Capturas |
|---|---|---|---|
| 1 | 10 | Tomar C06: WIRELESS → All APs con los 3 APs en REG (renombrar filas viejas no hace falta) | C06 |
| 2 | 11 | Separar los APs en la vista **Physical** y probar roaming con `ping -t` (o `ping -n 200`) moviendo la laptop en Physical | C07 |
| 3 | 12 | SRV-RADIUS → Services → AAA: cliente `WLC` 192.168.0.10, secret `RadiusInnova2026`, usuarios jlopez/mgarcia/almacen01 con `Corp2026`. En la WLC: SECURITY → RADIUS → Authentication → New (192.168.3.10, mismo secret, 1812). Crear WLAN INNOVA-CORP → interfaz corp, WPA2 + AES + **802.1X**, AAA server 192.168.3.10, **marcar FlexConnect Local Switching**. Laptops de empleados con WPC300N, Authentication **WPA2** (enterprise) con usuario y contraseña | C08, C09, C10, C11 |
| 4 | 13 | Antes de la ACL: ping del visitante a 192.168.3.12 responde (C12). Pegar el bloque 3 (ACL-INVITADOS) en R-CORE. Repetir ping: falla (C13). `show access-lists` (C14) | C12, C13, C14 |
| 5 | 14 | SRV-IOT → IoT On; cuenta admin/admin2026 desde PC-ADMIN (http://192.168.3.11). Sensores con adaptador PT-IOT-NM-1W, WiFi INNOVA-IOT; registrar en IoT Server remoto 192.168.3.11. Reglas: Temp > 25 → Fan High; Temp ≤ 25 → Off; Smoke → Siren On; Door open → Light On | C15, C16, C17 |
| 6 | 15 | Central Office: Backbone 192.168.5.2/24 gw .5.1; red celular 192.168.6.0/24, DNS 192.168.3.12. Pegar bloque 4 en R-CORE (ruta estática + ACL-CELULAR). Celular abre https://entregas.innovalogistics.local; ping a 192.168.3.10 falla | C18, C19, C20, C21 |
| 7 | 9 | Captura del simulador de canales de la app (1/1/1 y 1/6/11) | C22 |
| 8 | 17 | Pegar capturas en el Word y el PowerPoint (pedir a Claude que regenere y entregue los archivos al final) | — |
| 9 | 18 | Ensayo cronometrado (pestaña Defensa de la app) | — |

## Datos de referencia

| Qué | Valor |
|---|---|
| Contraseñas de router y switches | `Innova2026` |
| WLC | https://192.168.0.10 · usuario admin (contraseña que eligió el alumno) |
| Secret RADIUS | `RadiusInnova2026` |
| Empleados | jlopez / mgarcia / almacen01 → `Corp2026` |
| WiFi invitados / sensores | `Visitante2026` / `SensorIoT2026` |
| Servidor IoT | 192.168.3.11 · admin / admin2026 |

## Para la exposición: qué contar de lo vivido

- **Reemplazo de antenas:** se cambiaron y se configuraron solas desde la WLC (ventaja de los APs ligeros). Diagnóstico: `show ip interface brief` mostraba down/down en el puerto del AP.
- **FlexConnect:** en Packet Tracer los APs trabajan en FlexConnect: cada AP entrega a los usuarios en su VLAN, por eso sus puertos son trunk y las WLANs usan FlexConnect Local Switching. En una red real se usaría modo Local (todo pasa por la WLC) o FlexConnect con mapeo de VLANs.
