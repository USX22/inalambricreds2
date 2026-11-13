# Proyecto Integrador – Redes Inalámbricas
## Rediseño inalámbrico e integración IoT para **InnovaLogistics Puebla S.A. de C.V.**

Solución completa para el caso de estudio: WLAN centralizada (WLC + 3 LAPs en ESS con roaming),
WPA2-Enterprise con RADIUS, SSID de invitados aislado por VLAN + ACL, red de sensores IoT con
reglas automáticas y conectividad celular 4G hacia el servidor central.

## 🚀 Empieza aquí: la app de estudio

**[`app/index.html`](app/index.html)**: aplicación interactiva para aprender, implementar y defender
el proyecto paso a paso. Funciona sin instalar nada: descarga el archivo y ábrelo con doble clic en
Chrome, Edge o Firefox.

Incluye:
- **Lo básico:** 47 conceptos desde cero (red, IP, router, WiFi, VLAN…) explicados con el ejemplo de un edificio, marcados como *Esencial*, *Bueno saber* o *No te preocupes*, con un diccionario de siglas (qué significa cada abreviatura, en inglés y en español), cómo leer los nombres de tus equipos, prueba rápida y 6 tipos de ejercicios interactivos (¿misma red o router?, leer una IP, ¿en qué red va?, ¿quién lo hace?, sensor o actuador, ordenar pasos).
- **18 lecciones en orden** (6 etapas), repartidas día por día hasta la entrega del **13 de noviembre a las 12:00**.
  Cada una tiene: problema que resuelve → criterio de la rúbrica → teoría con ejemplos → mapa de la red
  resaltado → pasos en Packet Tracer con comandos para copiar → verificación → quiz → "Dilo así" para la exposición → conexiones con otras lecciones.
- **Herramientas:** calculadora de subredes, simulador de ACL, recorrido de paquetes paso a paso,
  configuraciones completas, tabla de direccionamiento, guía de diagnóstico y glosario de 81 términos.
- **Para principiantes:** recorrido por la pantalla de Packet Tracer y palabras técnicas que muestran su definición al tocarlas.
- **Defensa:** cronómetro de 20 minutos por bloques, tarjetas de repaso y pruebas de falla del docente.
- **Rúbrica:** avance estimado por criterio y checklist de evidencias.

El avance se guarda en el navegador donde la abras.

**Entrega:** ICCS 260 Redes inalámbricas · viernes 13 de noviembre de 2026, 12:00 hrs · 20 minutos por proyecto.

**Pruebas automáticas de la app:** `node tests/app.test.js` (requiere Node y Playwright con Chromium).
Revisan 166 puntos: datos coherentes, configuraciones de la app idénticas a las de `configs/`,
simulador de ACL y calculadora con resultados correctos, que el avance se guarde, y que todas las
vistas se vean bien en celular y en modo oscuro.

## ¿Qué hay en este repositorio?

| # | Archivo | Para qué sirve |
|---|---------|----------------|
| ⭐ | [docs/00_Tutorial_Completo.md](docs/00_Tutorial_Completo.md) | Versión en texto del tutorial de la app (sin quizzes ni simuladores): cada concepto explicado y después cómo hacerlo en Packet Tracer. |
| 1 | [docs/01_Diseno_y_Direccionamiento.md](docs/01_Diseno_y_Direccionamiento.md) | Topología, VLANs, subneteo y tabla de direccionamiento (lo primero que debes entender). |
| 2 | [docs/02_Guia_Packet_Tracer.md](docs/02_Guia_Packet_Tracer.md) | Paso a paso para construir el archivo `.pkt` en Cisco Packet Tracer. |
| 3 | [configs/](configs/) | Configuraciones CLI listas para copiar y pegar (router y switches). |
| 4 | [docs/03_Pruebas_y_Validacion.md](docs/03_Pruebas_y_Validacion.md) | Pruebas que debes hacer (y que el docente te puede pedir en vivo). |
| 5 | [docs/04_Reporte_Tecnico.md](docs/04_Reporte_Tecnico.md) | Borrador del **reporte** a entregar (pásalo a Word y agrega capturas). |
| 6 | [docs/05_Guia_de_Estudio.md](docs/05_Guia_de_Estudio.md) | Teoría explicada + banco de preguntas con respuestas para la defensa. |
| 7 | [docs/06_Guion_Presentacion.md](docs/06_Guion_Presentacion.md) | Diapositivas sugeridas y qué decir en cada una. |
| 8 | [docs/07_Revision_del_Proyecto.md](docs/07_Revision_del_Proyecto.md) | Revisión contra el PDF y la rúbrica: requisito por requisito, problemas corregidos y lo que se confirma en Packet Tracer. |

## 📦 Entregables listos para completar

| Archivo | Qué es | Qué te falta |
|---|---|---|
| [`entregables/Reporte_InnovaLogistics.docx`](entregables/Reporte_InnovaLogistics.docx) | Reporte en Word (19 páginas): portada, índice, problemática, solución, topología, direccionamiento, configuración, pruebas, conclusiones y anexos | Tu nombre, el del docente y pegar las 22 capturas |
| [`entregables/Presentacion_InnovaLogistics.pptx`](entregables/Presentacion_InnovaLogistics.pptx) | Presentación de 29 diapositivas (14 de contenido + 15 de evidencia a pantalla completa) para 20 minutos, con lo que debes decir en las notas | Tu nombre y pegar 15 capturas |
| [`entregables/capturas.json`](entregables/capturas.json) | Lista de las 22 capturas: nombre de archivo, lección, sección del reporte y diapositiva | — |

Cada captura tiene un nombre (C01_topologia.png, C02_vlan_brief.png…). La app te dice en qué lección tomarla,
y el Word y el PowerPoint tienen un recuadro "Pega aquí" con ese mismo nombre.

Para volver a generarlos: `node tools/reporte.js` (requiere el paquete `docx`) y `node tools/presentacion.js` (requiere `pptxgenjs`).

## Evidencias que pide el docente

- [ ] **Reporte** → `docs/04_Reporte_Tecnico.md` + capturas de tu `.pkt`
- [ ] **Archivo .pkt** → constrúyelo con `docs/02_Guia_Packet_Tracer.md` (guárdalo en esta carpeta como `InnovaLogistics_Final.pkt`)
- [ ] **Presentación** → `docs/06_Guion_Presentacion.md`

## Resumen del diseño (en una tabla)

| VLAN | Nombre | Red | Uso |
|------|--------|-----|-----|
| 99 | GESTION | 192.168.0.0/24 | WLC, Access Points, switches, PC de administración |
| 10 | CORPORATIVO | 192.168.1.0/24 | SSID `INNOVA-CORP` (WPA2-Enterprise / RADIUS) |
| 20 | INVITADOS | 192.168.2.0/24 | SSID `INNOVA-GUEST` (WPA2-PSK, aislado por ACL) |
| 30 | SERVIDORES | 192.168.3.0/24 | RADIUS, Servidor IoT, Servidor Central |
| 40 | IOT | 192.168.4.0/24 | SSID `INNOVA-IOT` – sensores y actuadores del almacén |
| — | ENLACE-4G | 192.168.5.0/24 | Router ↔ Central Office Server |
| — | CELULAR | 192.168.6.0/24 | Smartphones / tablets de la flotilla (4G) |

Red principal: **192.168.0.0/20** dividida en 16 subredes /24 (se usan 7, quedan 9 libres para crecimiento).

> Diseño pensado para Cisco Packet Tracer 8.x y 9.x (la 9.0 agrega sobre todo equipos industriales; lo que usa este proyecto no cambia). Un .pkt guardado en 9.x no abre en 8.x. No se ha ejecutado dentro de Packet Tracer: los puntos que
> dependen de tu versión y su plan B están en `docs/07_Revision_del_Proyecto.md` §7.5. Si un menú tiene
> otro nombre, revisa "Problemas comunes" en `docs/02_Guia_Packet_Tracer.md`.
