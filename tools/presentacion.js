// Genera entregables/Presentacion_InnovaLogistics.pptx
// Uso: node tools/presentacion.js
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const SKILL = process.env.PPTX_SKILL;
const ROOT = path.resolve(__dirname, '..');
const CAPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'entregables', 'capturas.json'), 'utf8'));
const CAP = Object.fromEntries(CAPS.map(c => [c.id, c]));

const THEME = {
  name: 'InnovaLogistics',
  headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: { dk1: '132029', lt1: 'FFFFFF', dk2: '0B3A40', lt2: 'EEF3F4',
    accent1: '0B6E78', accent2: 'D49800', accent3: '1E9E57', accent4: 'B93A26', accent5: '55666F', accent6: 'DCEEF0',
    hlink: '0B6E78', folHlink: '55666F' }
};
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'InnovaLogistics – Proyecto Integrador';
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: 'PORTADA', background: { color: THEME.colors.dk2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 1.5, w: 8.8, h: 1.4, fontSize: 36, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'bottom' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 3.0, w: 8.8, h: 1.6, fontSize: 18, color: C.accent6, valign: 'top' }, text: '' } }
  ]
});
pres.defineSlideMaster({
  title: 'CONTENIDO', background: { color: THEME.colors.lt2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.25, w: 9.0, h: 0.7, fontSize: 28, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: 'middle' }, text: '' } }
  ],
  slideNumber: { x: 9.2, y: 5.25, w: 0.5, h: 0.25, fontSize: 10, color: C.accent5 }
});

const shadow = () => ({ type: 'outer', blur: 4, offset: 1, angle: 90, color: '000000', opacity: 0.12 });
function card(s, x, y, w, h, name) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: 'D3DDE1', width: 0.75 }, shadow: shadow(), objectName: name });
}
function circleNum(s, x, y, n, color) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.42, h: 0.42, fill: { color: color || C.accent1 }, line: { type: 'none' } });
  s.addText(String(n), { x, y, w: 0.42, h: 0.42, align: 'center', valign: 'middle', fontSize: 14, bold: true, color: C.background1, isTextBox: true, margin: 0 });
}
function cap(s, id, x, y, w, h) {
  const c = CAP[id];
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1.5, dashType: 'dash' }, objectName: 'Captura ' + id });
  s.addText([
    { text: 'PEGA AQUÍ ' + id, options: { bold: true, color: C.accent1, fontSize: 14, breakLine: true } },
    { text: c.archivo, options: { fontFace: 'Courier New', fontSize: 10, color: C.text1, breakLine: true } },
    { text: c.que, options: { italic: true, fontSize: 10, color: C.accent5 } }
  ], { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: h - 0.1, align: 'center', valign: 'middle', isTextBox: true, objectName: 'Texto captura ' + id });
}
function bullets(s, items, x, y, w, h, size) {
  s.addText(items.map((t, i) => {
    const runs = Array.isArray(t) ? t : [{ text: t }];
    return runs.map((r, j) => ({ text: r.text, options: { bold: !!r.b, bullet: j === 0 ? { indent: 14 } : undefined, breakLine: j === runs.length - 1 && i < items.length - 1, paraSpaceAfter: 6 } }));
  }).flat(), { x, y, w, h, fontSize: size || 14, color: C.text1, valign: 'top', isTextBox: true, margin: 0.05 });
}
function tbl(s, rows, x, y, w, colW, size) {
  s.addTable(rows.map((r, i) => r.map(cell => ({ text: cell, options: { bold: i === 0, fill: { color: i === 0 ? THEME.colors.accent1 : (i % 2 ? 'FFFFFF' : 'F6F9FA') }, color: i === 0 ? 'FFFFFF' : THEME.colors.dk1 } }))),
    { x, y, w, colW, fontSize: size || 11, fontFace: THEME.bodyFontFace, border: { type: 'solid', pt: 0.5, color: 'D3DDE1' }, margin: 0.05, valign: 'middle' });
}
function arrowRow(s, labels, y, color) {
  const n = labels.length, gap = 0.28, w = (9.0 - gap * (n - 1)) / n;
  labels.forEach((l, i) => {
    const x = 0.5 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.62, rectRadius: 0.08, fill: { color: i === n - 1 ? (color || C.accent1) : C.background1 }, line: { color: C.accent1, width: 1 } });
    s.addText(l, { x, y, w, h: 0.62, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: i === n - 1 ? C.background1 : C.text1, isTextBox: true, margin: 0.03 });
    if (i < n - 1) s.addText('→', { x: x + w, y, w: gap, h: 0.62, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
  });
}
const content = (sec) => pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: sec });

// ---------- 1 Portada ----------
pres.addSection({ title: 'Introducción' });
let s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: 'Introducción' });
s.addText('Rediseño inalámbrico e integración IoT', { placeholder: 'title' });
s.addText([
  { text: 'InnovaLogistics Puebla S.A. de C.V.', options: { bold: true, breakLine: true } },
  { text: 'ICCS 260 · Redes inalámbricas · Proyecto integrador', options: { breakLine: true } },
  { text: '(Tu nombre) · 13 de noviembre de 2026' }
], { placeholder: 'body' });
s.addNotes('Tiempo: 30 segundos. "Soy el consultor contratado por InnovaLogistics Puebla para rediseñar su red inalámbrica e integrar IoT y conectividad celular."');

// ---------- 2 La empresa ----------
s = content('Introducción');
s.addText('La empresa', { placeholder: 'title' });
[['Oficinas Corporativas', 'Administración, ventas y la sala de servidores.'],
 ['Almacén Central', 'Insumos médicos e industriales. Los médicos necesitan temperatura controlada.'],
 ['Flotilla en ruta', 'Camiones de reparto y agentes de ventas que trabajan en la calle.']].forEach(([t, d], i) => {
  const x = 0.5 + i * 3.08;
  card(s, x, 1.3, 2.84, 3.2, 'Tarjeta ' + t);
  circleNum(s, x + 0.25, 1.55, i + 1);
  s.addText(t, { x: x + 0.25, y: 2.1, w: 2.4, h: 0.6, fontSize: 18, bold: true, color: C.text1, fontFace: THEME.headFontFace, isTextBox: true, margin: 0 });
  s.addText(d, { x: x + 0.25, y: 2.75, w: 2.4, h: 1.5, fontSize: 14, color: C.accent5, valign: 'top', isTextBox: true, margin: 0 });
});
s.addText('Parque Industrial Chachapa, Puebla', { x: 0.5, y: 4.75, w: 9, h: 0.35, fontSize: 12, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
s.addNotes('Tiempo: 15 segundos (junto con la portada, 45 s). "Distribuye insumos médicos e industriales en el Parque Industrial Chachapa. Tiene dos edificios y una flotilla en ruta. Los insumos médicos necesitan control de temperatura."');

// ---------- 3 Problemática ----------
s = content('Introducción');
s.addText('Problemática actual', { placeholder: 'title' });
[['WiFi saturado e inseguro', 'Routers caseros en el mismo canal y una sola clave para todos'],
 ['Visitantes en la red interna', 'Clientes y proveedores llegan a los servidores'],
 ['Almacén sin monitoreo', 'Sin sensores de temperatura ni de humo'],
 ['Flotilla desconectada', 'Fuera del WiFi no reportan entregas']].forEach(([t, d], i) => {
  const x = 0.5 + (i % 2) * 4.6, y = 1.2 + Math.floor(i / 2) * 1.95;
  card(s, x, y, 4.4, 1.75, 'Problema ' + (i + 1));
  circleNum(s, x + 0.25, y + 0.25, i + 1, C.accent4);
  s.addText(t, { x: x + 0.85, y: y + 0.2, w: 3.35, h: 0.55, fontSize: 17, bold: true, color: C.text1, valign: 'middle', isTextBox: true, margin: 0 });
  s.addText(d, { x: x + 0.85, y: y + 0.8, w: 3.35, h: 0.8, fontSize: 14, color: C.accent5, valign: 'top', isTextBox: true, margin: 0 });
});
s.addNotes('Tiempo: 1 minuto. "Encontramos cuatro problemas: routers caseros en el mismo canal y con una sola contraseña para todos; visitantes en la misma red que los servidores; ningún monitoreo de temperatura ni humo; y la flotilla desconectada al salir del WiFi."');

// ---------- 4 Solución ----------
pres.addSection({ title: 'Solución' });
s = content('Solución');
s.addText('Solución en cuatro pilares', { placeholder: 'title' });
[['WiFi centralizado', 'WLC + 3 antenas, roaming'], ['Seguridad', 'RADIUS por empleado, invitados aislados'], ['Sensores IoT', 'Ventilador y sirena automáticos'], ['Red 4G', 'La flotilla reporta entregas']].forEach(([t, d], i) => {
  const y = 1.2 + i * 0.95;
  circleNum(s, 0.5, y + 0.1, i + 1);
  s.addText(t, { x: 1.05, y, w: 3.2, h: 0.38, fontSize: 16, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText(d, { x: 1.05, y: y + 0.38, w: 3.2, h: 0.4, fontSize: 13, color: C.accent5, isTextBox: true, margin: 0 });
});
cap(s, 'C01', 4.5, 1.15, 5.0, 3.85);
s.addNotes('Tiempo: 1 minuto. "La solución tiene cuatro pilares: WiFi centralizado con una WLC y tres antenas; seguridad con usuario por empleado y red aislada para invitados; sensores IoT con reglas automáticas; y red 4G para la flotilla. Todo validado en Packet Tracer." Señala en la topología las tres zonas.');

// ---------- 5 Direccionamiento ----------
s = content('Solución');
s.addText('Direccionamiento: /20 en subredes /24', { placeholder: 'title' });
tbl(s, [['VLAN', 'Red', 'Uso'], ['99', '192.168.0.0/24', 'Gestión'], ['10', '192.168.1.0/24', 'Empleados'], ['20', '192.168.2.0/24', 'Invitados'], ['30', '192.168.3.0/24', 'Servidores'], ['40', '192.168.4.0/24', 'Sensores IoT'], ['—', '192.168.5.0/24', 'Enlace 4G'], ['—', '192.168.6.0/24', 'Celulares']], 0.5, 1.15, 4.3, [0.7, 1.9, 1.7], 12);
s.addText('192.168.0.0/20 = 4096 direcciones → 16 subredes /24 de 254 equipos. Se usan 7.', { x: 0.5, y: 4.35, w: 4.3, h: 0.7, fontSize: 12, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
cap(s, 'C02', 5.05, 1.15, 4.45, 1.85);
cap(s, 'C05', 5.05, 3.15, 4.45, 1.85);
s.addNotes('Tiempo: 1 minuto 30 segundos. "Nos asignaron la 192.168.0.0 diagonal 20, que tiene 4096 direcciones. La dividimos en 16 subredes diagonal 24 de 254 equipos; usamos 7 y dejamos 9 para crecer. Cada grupo tiene su VLAN. El router R-CORE une las VLANs con router-on-a-stick y reparte las IPs por DHCP." Muestra el ping de PC-ADMIN al servidor: prueba que el enrutamiento entre VLANs funciona.');

// ---------- 6 WLC ----------
pres.addSection({ title: 'Red inalámbrica' });
s = content('Red inalámbrica');
s.addText('WLC y antenas ligeras', { placeholder: 'title' });
bullets(s, [
  [{ text: 'WLC: ', b: true }, { text: 'el "jefe" que configura las 3 antenas desde un solo lugar' }],
  [{ text: 'APs ligeros: ', b: true }, { text: 'AP-1 en oficinas, AP-2 y AP-3 en el almacén' }],
  [{ text: 'CAPWAP: ', b: true }, { text: 'túnel antena ↔ WLC (UDP 5246 control, 5247 datos)' }],
  [{ text: 'Canales 1, 6 y 11: ', b: true }, { text: 'no se enciman, se acaba la interferencia' }]
], 0.5, 1.2, 4.3, 3.8, 15);
cap(s, 'C06', 5.0, 1.15, 4.5, 3.85);
s.addNotes('Tiempo: 1 minuto 45 segundos. "Las tres antenas son ligeras: no se configuran solas. Al encender piden IP, encuentran a la WLC y forman un túnel CAPWAP. Toda la configuración vive en la WLC. Pusimos los canales 1, 6 y 11, los únicos de 2.4 GHz que no se enciman." DEMO: muestra en la WLC los 3 APs registrados.');

// ---------- 7 WiFi y roaming ----------
s = content('Red inalámbrica');
s.addText('Tres redes WiFi y roaming', { placeholder: 'title' });
tbl(s, [['Red WiFi', 'VLAN', 'Seguridad'], ['INNOVA-CORP', '10', 'Usuario por empleado'], ['INNOVA-GUEST', '20', 'Clave de invitados'], ['INNOVA-IOT', '40', 'Clave de sensores']], 0.5, 1.15, 4.3, [1.6, 0.7, 2.0], 12);
s.addText('Las 3 antenas anuncian las 3 redes (ESS). Al caminar de oficinas al almacén, la laptop cambia de antena sin cortarse y conserva su IP.', { x: 0.5, y: 2.85, w: 4.3, h: 1.4, fontSize: 14, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
cap(s, 'C08', 5.0, 1.15, 4.5, 1.85);
cap(s, 'C07', 5.0, 3.15, 4.5, 1.85);
s.addNotes('Tiempo: 1 minuto 30 segundos. "Cada red WiFi lleva a su VLAN. Las tres antenas anuncian las mismas redes, formando un ESS, y eso permite el roaming." DEMO: ping -t en la laptop y arrástrala en la vista Physical de AP-1 a AP-3. El ping no se detiene y la IP es la misma.');

// ---------- 8 Seguridad empleados ----------
pres.addSection({ title: 'Seguridad' });
s = content('Seguridad');
s.addText('Empleados: WPA2-Enterprise con RADIUS', { placeholder: 'title' });
arrowRow(s, ['Laptop (suplicante)', 'WLC (autenticador)', 'RADIUS (lista de empleados)'], 1.2);
s.addText('Cada empleado entra con su propio usuario. Si alguien deja la empresa, solo se borra su cuenta: se acabó la clave compartida.', { x: 0.5, y: 2.0, w: 9.0, h: 0.6, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
cap(s, 'C10', 0.5, 2.75, 4.4, 2.3);
cap(s, 'C11', 5.1, 2.75, 4.4, 2.3);
s.addNotes('Tiempo: 1 minuto 30 segundos. "La laptop es el suplicante, la WLC el autenticador y el RADIUS el servidor con la lista de empleados. La WLC le pregunta al RADIUS si el usuario es válido; si sí, se cifra con AES." DEMO: conexión con la contraseña correcta y luego con una incorrecta.');

// ---------- 9 Invitados ----------
s = content('Seguridad');
s.addText('Invitados aislados con una ACL', { placeholder: 'title' });
s.addText([
  { text: 'permit udp any any eq bootps', options: { breakLine: true } },
  { text: 'permit icmp 192.168.2.0 0.0.0.255 host 192.168.2.1', options: { breakLine: true } },
  { text: 'deny ip 192.168.2.0 0.0.0.255 192.168.0.0 0.0.15.255', options: { bold: true, color: THEME.colors.accent4, breakLine: true } },
  { text: 'permit ip 192.168.2.0 0.0.0.255 any' }
], { x: 0.5, y: 1.15, w: 9.0, h: 1.15, fontFace: 'Courier New', fontSize: 12, color: C.text1, fill: { color: C.background1 }, line: { color: 'D3DDE1', width: 0.75 }, isTextBox: true, margin: 0.12, valign: 'middle' });
cap(s, 'C12', 0.5, 2.5, 4.4, 2.55);
cap(s, 'C13', 5.1, 2.5, 4.4, 2.55);
s.addText('Antes de la ACL', { x: 0.5, y: 5.08, w: 4.4, h: 0.3, fontSize: 11, color: C.accent5, align: 'center', isTextBox: true, margin: 0 });
s.addText('Después de la ACL', { x: 5.1, y: 5.08, w: 4.4, h: 0.3, fontSize: 11, color: C.accent5, align: 'center', isTextBox: true, margin: 0 });
s.addNotes('Tiempo: 1 minuto. "Los invitados están en la VLAN 20. Una ACL extendida en el router niega todo lo que vaya de esa red a la 192.168.0.0/20, con wildcard 0.0.15.255. Solo permite DHCP, ping a su gateway e Internet." DEMO: ping del invitado al servidor: falla. Si preguntan, muestra show access-lists.');

// ---------- 10 IoT ----------
pres.addSection({ title: 'IoT y 4G' });
s = content('IoT y 4G');
s.addText('Sensores IoT en el almacén', { placeholder: 'title' });
tbl(s, [['SI…', 'ENTONCES…'], ['Temperatura > 25 °C', 'Enciende el ventilador'], ['Humo detectado', 'Suena la sirena'], ['Puerta abierta', 'Enciende la luz']], 0.5, 1.15, 4.3, [2.15, 2.15], 12);
s.addText('Los sensores reportan por WiFi (INNOVA-IOT, VLAN 40) al servidor IoT, que decide y actúa solo.', { x: 0.5, y: 2.85, w: 4.3, h: 1.2, fontSize: 14, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
cap(s, 'C16', 5.0, 1.15, 4.5, 1.85);
cap(s, 'C17', 5.0, 3.15, 4.5, 1.85);
s.addNotes('Tiempo: 1 minuto 30 segundos. "Los sensores de temperatura, puerta y humo envían sus lecturas al servidor IoT. El servidor evalúa reglas SI/ENTONCES: más de 25 °C enciende el ventilador; humo activa la sirena. Van en su propia VLAN por seguridad." DEMO: sube la temperatura y genera humo.');

// ---------- 11 4G ----------
s = content('IoT y 4G');
s.addText('Red 4G para la flotilla', { placeholder: 'title' });
arrowRow(s, ['Celular', 'Torre 4G', 'Central Office', 'R-CORE (ACL)', 'Servidor Central'], 1.2);
s.addText('El chofer solo puede llegar al portal de entregas (HTTPS); el resto de la red le está bloqueado.', { x: 0.5, y: 2.0, w: 9.0, h: 0.6, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
cap(s, 'C20', 0.5, 2.75, 4.4, 2.3);
cap(s, 'C21', 5.1, 2.75, 4.4, 2.3);
s.addNotes('Tiempo: 1 minuto. "Los choferes se conectan a la torre 4G. El Central Office les da una IP de la 192.168.6.0 y los conecta con R-CORE. Una ruta estática regresa las respuestas, y una ACL solo les permite llegar al portal de entregas." DEMO: el celular abre el portal.');

// ---------- 12 Resultados ----------
pres.addSection({ title: 'Cierre' });
s = content('Cierre');
s.addText('Resultados de las pruebas', { placeholder: 'title' });
tbl(s, [['Prueba', 'Resultado'],
  ['Enrutamiento entre VLANs (ping PC-ADMIN → servidor)', '✔ Responde'],
  ['3 APs registrados en la WLC', '✔ Registrados'],
  ['Roaming de AP-1 a AP-3', '✔ Sin cortes, misma IP'],
  ['Empleado con usuario válido / inválido', '✔ Entra / ✔ Rechazado'],
  ['Invitado intenta llegar a un servidor', '✔ Bloqueado'],
  ['Temperatura alta / humo', '✔ Ventilador / ✔ Sirena'],
  ['Celular → portal / → RADIUS', '✔ Abre / ✔ Bloqueado']], 0.5, 1.15, 9.0, [6.0, 3.0], 13);
s.addNotes('Tiempo: 30 segundos. Recorre la tabla rápido: cada fila ya la demostraste en vivo.');

// ---------- 13 Conclusiones ----------
s = content('Cierre');
s.addText('Conclusiones y mejoras', { placeholder: 'title' });
card(s, 0.5, 1.15, 4.4, 3.9, 'Logros');
s.addText('Logros', { x: 0.75, y: 1.3, w: 3.9, h: 0.45, fontSize: 18, bold: true, color: C.accent3, isTextBox: true, margin: 0 });
bullets(s, ['Cobertura en ambos edificios con roaming', 'Un usuario por empleado', 'Invitados sin acceso a la red interna', 'Almacén vigilado automáticamente', 'Flotilla conectada de forma segura'], 0.75, 1.85, 3.95, 3.1, 14);
card(s, 5.1, 1.15, 4.4, 3.9, 'Mejoras');
s.addText('En una red real', { x: 5.35, y: 1.3, w: 3.9, h: 0.45, fontSize: 18, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
bullets(s, ['WPA3 y certificados (EAP-TLS)', 'Banda de 5 GHz', 'WLC y RADIUS de respaldo', 'VPN para la flotilla', 'Switches PoE para las antenas'], 5.35, 1.85, 3.95, 3.1, 14);
s.addNotes('Tiempo: 30 segundos. "Logramos cobertura con roaming, seguridad por usuario, invitados aislados, monitoreo automático y flotilla conectada. En una implementación real agregaríamos WPA3, 5 GHz, equipos de respaldo y VPN."');

// ---------- 14 Preguntas ----------
s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: 'Cierre' });
s.addText('¿Preguntas?', { placeholder: 'title' });
s.addText('Gracias. Puedo demostrar cualquier prueba en Packet Tracer.', { placeholder: 'body' });
s.addNotes('Quedan unos 7 minutos para preguntas y pruebas de falla. Si algo falla en vivo, explica cómo lo diagnosticarías: cable → VLAN → IP → ACL → servicio.');

const out = path.join(ROOT, 'entregables', 'Presentacion_InnovaLogistics.pptx');
pres.writeFile({ fileName: out }).then(async () => {
  if (SKILL) { const { applyTheme } = require(path.join(SKILL, 'scripts', 'apply_theme.js')); await applyTheme(out, THEME); }
  console.log('Escrito', out);
});
