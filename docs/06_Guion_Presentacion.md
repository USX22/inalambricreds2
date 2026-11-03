# 6. Guion de la Presentación (≈ 12–15 minutos)

Reparte las diapositivas entre los integrantes. Cada bloque dice **qué poner en la diapositiva** y
**qué decir**. Menos texto en pantalla, más imágenes (capturas de PT).

---

### Diapositiva 1 – Portada (30 s)
**Pantalla:** Título del proyecto, logo, nombres, materia.
**Decir:** "Somos el equipo consultor contratado por InnovaLogistics Puebla para rediseñar su red
inalámbrica e integrar IoT y conectividad celular."

### Diapositiva 2 – La empresa (45 s)
**Pantalla:** Mapa simple: Oficinas, Almacén, Flotilla.
**Decir:** "Distribuye insumos médicos e industriales en el Parque Industrial Chachapa. Tiene dos
edificios y una flotilla en ruta. Los insumos médicos necesitan control de temperatura."

### Diapositiva 3 – Problemática (1 min)
**Pantalla:** 4 íconos: WiFi saturado 🔴, visitantes 👤, termómetro 🌡️, camión 🚚.
**Decir:** "Encontramos cuatro problemas: routers caseros en el mismo canal con una clave para todos;
visitantes en la misma red que los servidores; cero monitoreo ambiental; y la flotilla
desconectada."

### Diapositiva 4 – Solución general (1 min)
**Pantalla:** Topología completa de PT.
**Decir:** "Nuestra solución tiene cuatro pilares: WLAN centralizada con WLC, seguridad
WPA2-Enterprise con RADIUS y VLAN de invitados, red de sensores IoT y red celular 4G. Todo validado
en Packet Tracer."

### Diapositiva 5 – Direccionamiento (1 min)
**Pantalla:** Tabla de VLANs y subredes.
**Decir:** "Nos asignaron la 192.168.0.0/20. La dividimos en /24: prestamos 4 bits y obtenemos 16
subredes de 254 hosts. Usamos 7: gestión, corporativo, invitados, servidores, IoT, enlace 4G y
celular. Quedan 9 para crecimiento."

### Diapositiva 6 – Infraestructura base (1 min)
**Pantalla:** Captura de `show vlan brief` y `show interfaces trunk`.
**Decir:** "Configuramos 5 VLANs, troncales 802.1Q con VLAN nativa 99, router-on-a-stick para el
enrutamiento entre VLANs y DHCP en el router con un pool por VLAN."

### Diapositiva 7 – WLC y CAPWAP (1.5 min)
**Pantalla:** Captura "All APs" con los 3 APs registrados + diagrama LAP → túnel CAPWAP → WLC.
**Decir:** "Los tres APs son lightweight. Al encender piden IP, encuentran la WLC y forman un túnel
CAPWAP: puerto 5246 de control y 5247 de datos. Toda la configuración vive en la WLC. Asignamos
canales 1, 6 y 11 para eliminar la interferencia."

### Diapositiva 8 – SSIDs y Roaming (1.5 min)
**Pantalla:** Tabla de los 3 SSIDs + captura del ping continuo durante el roaming.
**Decir:** "Los tres APs anuncian los mismos SSIDs formando un ESS. Cuando un empleado camina del
edificio de oficinas al almacén, cambia de AP sin perder conexión y conserva su IP porque la WLC lo
mantiene en la VLAN 10."
**DEMO EN VIVO:** ping -t y arrastrar la laptop.

### Diapositiva 9 – Seguridad 802.1X / RADIUS (1.5 min)
**Pantalla:** Diagrama Suplicante → Autenticador (WLC) → Servidor (RADIUS) con flechas EAPOL/RADIUS.
**Decir:** "Eliminamos la clave compartida. Cada empleado tiene su usuario. La laptop es el suplicante,
la WLC el autenticador y el servidor RADIUS valida. Si un empleado deja la empresa, solo borramos su
usuario."
**DEMO:** contraseña correcta vs incorrecta.

### Diapositiva 10 – Aislamiento de invitados (1 min)
**Pantalla:** La ACL-INVITADOS y captura del ping fallido.
**Decir:** "Los visitantes tienen su SSID en la VLAN 20 y una ACL extendida que niega toda la
192.168.0.0/20. Pueden navegar, pero no ven nada interno."
**DEMO:** ping desde visitante al servidor → falla.

### Diapositiva 11 – IoT en el almacén (1.5 min)
**Pantalla:** Captura del servidor IoT con las reglas.
**Decir:** "Sensores de temperatura, puerta y humo se conectan por WiFi al SSID IoT y se registran en
el servidor IoT. Las reglas: más de 25 °C enciende el ventilador; humo activa la sirena; puerta
abierta enciende la luz."
**DEMO:** subir temperatura → ventilador; humo → sirena.

### Diapositiva 12 – Red celular 4G (1 min)
**Pantalla:** Torre → Central Office → Router → Servidor.
**Decir:** "Los choferes usan 4G. El Central Office les da IP 192.168.6.x, una ruta estática regresa el
tráfico, y una ACL solo les permite llegar al portal de entregas por HTTPS."
**DEMO:** celular abre el portal.

### Diapositiva 13 – Resultados (45 s)
**Pantalla:** Tabla de pruebas con ✔.

### Diapositiva 14 – Conclusiones y mejoras (45 s)
**Decir:** "Logramos cobertura total con roaming, seguridad por usuario, invitados aislados,
monitoreo automático y flotilla conectada. Como mejora real: WPA3, 5 GHz, WLC redundante y VPN."

### Diapositiva 15 – Preguntas

---

## Consejos para la demo en vivo
1. Abre el `.pkt` **antes** de pasar y deja que converja (los APs tardan en registrarse). Usa *Fast Forward*.
2. Ten preparados los Command Prompt abiertos en LAP-EMPLEADO-1 y LAP-VISITANTE.
3. Si algo falla, no entres en pánico: explica qué revisarías (`show ip dhcp binding`, `show interfaces trunk`, secret de RADIUS). El docente evalúa que **sepas diagnosticar**.
4. Ten una copia del `.pkt` funcionando guardada aparte y capturas de respaldo en las diapositivas.
