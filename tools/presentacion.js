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
  const file = path.join(ROOT, 'entregables', 'capturas', c.archivo);
  if (fs.existsSync(file)) {
    const b = fs.readFileSync(file); const iw = b.readUInt32BE(16), ih = b.readUInt32BE(20);
    const k = Math.min(w / iw, h / ih); const dw = iw * k, dh = ih * k;
    s.addImage({ path: file, x: x + (w - dw) / 2, y: y + (h - dh) / 2, w: dw, h: dh, altText: c.que, objectName: 'Captura ' + id });
    return;
  }
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
s.addNotes("TIEMPO: 30 s.\nQUÉ DECIR: \"Buenos días. Soy el consultor contratado por InnovaLogistics Puebla para rediseñar su red inalámbrica, integrar sensores IoT y dar conectividad celular a su flotilla. Todo lo validé en Cisco Packet Tracer.\"");

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
s.addNotes("TIEMPO: 15 s.\nQUÉ DECIR: \"La empresa distribuye insumos médicos e industriales en el Parque Industrial Chachapa. Tiene dos edificios, las oficinas y el almacén, y una flotilla de camiones en la calle. Los insumos médicos necesitan temperatura controlada.\"");

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
s.addNotes("TIEMPO: 1 min.\nQUÉ DECIR (fórmula: antes pasaba ___):\n1. \"Cada área tenía un router casero suelto, todos en el mismo canal de 2.4 GHz; se estorbaban, la señal se caía y había zonas del almacén sin cobertura. Además, todos usaban la misma contraseña: quien renunciaba se la llevaba.\"\n2. \"Los visitantes se conectaban a la misma red que los servidores y podían llegar a ellos.\"\n3. \"Nadie vigilaba la temperatura ni el humo del almacén.\"\n4. \"Los camiones quedaban desconectados al salir del alcance del WiFi y no podían reportar entregas.\"");

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
s.addNotes("TIEMPO: 1 min.\nQUÉ DECIR (antes ___, ahora ___):\n1. WiFi centralizado: \"Ahora una WLC controla tres antenas, una en oficinas y dos en el almacén, en canales distintos (1, 6 y 11). Hay señal en todos lados y puedes caminar de un edificio a otro sin que se corte.\"\n2. Seguridad: \"Cada empleado entra con su propio usuario, que revisa el servidor RADIUS. Los visitantes tienen su propia red WiFi y una regla del router (ACL) les impide llegar a los servidores.\"\n3. IoT: \"Sensores de temperatura, puerta y humo conectados a un servidor IoT que enciende el ventilador o la sirena automáticamente.\"\n4. 4G: \"Una torre celular da señal a los camiones para reportar entregas al servidor central, de forma segura.\"\nSeñala en la topología las 3 zonas: oficinas, almacén y flotilla.\nSI TE PREGUNTAN POR R-CORE: \"Es el router principal: une todas las redes de la empresa y es el único camino entre ellas, por eso ahí se ponen las reglas de seguridad.\"");

// ---------- 5 Direccionamiento ----------
s = content('Solución');
s.addText('Direccionamiento: /20 en subredes /24', { placeholder: 'title' });
tbl(s, [['VLAN', 'Red', 'Uso'], ['99', '192.168.0.0/24', 'Gestión'], ['10', '192.168.1.0/24', 'Empleados'], ['20', '192.168.2.0/24', 'Invitados'], ['30', '192.168.3.0/24', 'Servidores'], ['40', '192.168.4.0/24', 'Sensores IoT'], ['—', '192.168.5.0/24', 'Enlace 4G'], ['—', '192.168.6.0/24', 'Celulares']], 0.5, 1.15, 4.3, [0.7, 1.9, 1.7], 12);
s.addText('192.168.0.0/20 = 4096 direcciones → 16 subredes /24 de 254 equipos. Se usan 7.', { x: 0.5, y: 4.35, w: 4.3, h: 0.7, fontSize: 12, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
cap(s, 'C02', 5.05, 1.15, 4.45, 1.85);
cap(s, 'C05', 5.05, 3.15, 4.45, 1.85);
s.addNotes("TIEMPO: 1 min 30 s.\nQUÉ DECIR: \"Nos asignaron la 192.168.0.0 diagonal 20: 20 bits fijos y 12 libres, o sea 4096 direcciones, de la 192.168.0.0 a la 192.168.15.255. La dividimos en subredes diagonal 24: fijamos 4 bits más, 2 a la 4 son 16 subredes de 254 equipos cada una. Usamos 7, una por grupo, y dejamos 9 libres para crecer.\"\n\"Cada subred es una VLAN: una división lógica del switch. Los equipos de VLANs distintas no se hablan directo: tienen que pasar por el router.\"\n\"El router usa router-on-a-stick: un solo cable trunk y una subinterfaz por VLAN; cada subinterfaz tiene la IP .1, que es el gateway de esa red. El router también reparte IPs por DHCP.\"\nMuestra C05: \"PC-ADMIN, en la VLAN 99, hace ping al servidor en la VLAN 30 y responde: el enrutamiento entre VLANs funciona.\"\nSI TE PREGUNTAN:\n- /24: \"es la máscara 255.255.255.0: los tres primeros números son la red.\"\n- Gateway: \"es la IP del router en mi red; en mi proyecto siempre es el .1.\"\n- VLAN nativa: \"es la que viaja sin etiqueta por los trunks; usamos la 99 porque la WLC manda su gestión sin etiqueta.\"\n- Gestión (VLAN 99): \"la red de los propios aparatos: WLC, antenas, switches y la PC de administración, separada de los usuarios.\"\n- Trunk vs access: \"access lleva una sola VLAN, para equipos finales; trunk lleva varias, con etiquetas 802.1Q, entre switches, al router y a la WLC.\"");

// ---------- 6 WLC ----------
pres.addSection({ title: 'Red inalámbrica' });
s = content('Red inalámbrica');
s.addText('WLC y antenas ligeras', { placeholder: 'title' });
bullets(s, [
  [{ text: 'WLC: ', b: true }, { text: 'el "jefe" que configura las 3 antenas desde un solo lugar' }],
  [{ text: 'APs ligeros: ', b: true }, { text: 'AP-1 en oficinas, AP-2 y AP-3 en el almacén' }],
  [{ text: 'CAPWAP: ', b: true }, { text: 'túnel antena ↔ WLC (UDP 5246 control, 5247 datos)' }],
  [{ text: 'Canales 1, 6 y 11: ', b: true }, { text: 'no se enciman, se acaba la interferencia' }]
], 0.5, 1.15, 4.3, 2.2, 13);
cap(s, 'C22', 0.5, 3.45, 4.3, 1.6);
cap(s, 'C06', 5.0, 1.15, 4.5, 3.9);
s.addNotes("TIEMPO: 1 min 45 s.\nQUÉ DECIR: \"Las tres antenas son ligeras: no se configuran solas, obedecen a la WLC. Al encender piden IP, encuentran a la WLC y forman un túnel CAPWAP: puerto 5246 para control y 5247 para datos. Toda la configuración vive en la WLC.\"\nMuestra C22 (canales): \"Los routers caseros estaban todos en el mismo canal. En WiFi, cada equipo escucha antes de transmitir y, si el canal está ocupado, espera su turno; eso es CSMA/CA. Con todos en el mismo canal se la pasaban esperándose, y la red era lenta y se caía. Cada canal ocupa unos 22 MHz y los canales 1, 6 y 11 están separados 25 MHz, así que no se enciman. Pusimos una antena en cada uno.\"\nDEMO: muestra en la WLC los 3 APs registrados (C06): AP-1, AP-2 y AP-3 con IP 192.168.0.22, .23 y .24 por DHCP y estado REG (registrada).\nEJEMPLO REAL PARA CONTAR: \"Durante la implementación, las tres antenas no volvieron a conectarse después de reiniciarlas. Las reemplacé por antenas nuevas y no tuve que configurar nada en ellas: al encender, pidieron IP por DHCP, encontraron a la WLC y descargaron su configuración solas. Esa es la ventaja de las antenas ligeras: si una se daña, se cambia y la WLC la configura automáticamente.\"\nCÓMO LO DIAGNOSTIQUÉ (por si preguntan): \"En el switch, show ip interface brief mostraba el puerto de la antena en down/down, no en administratively down: el puerto estaba encendido pero del otro lado no había nada funcionando. Así supe que el problema era la antena y no el switch.\" \\nSI TE PREGUNTAN:\\n- \\\"¿Por qué las antenas se conectan al switch y no a la WLC?\\\" \\\"Porque la WLC las administra por la red, a través del túnel CAPWAP; no necesita un cable directo.\\\"\\n- \\\"¿Qué es un AP ligero?\\\" \\\"Uno que no se configura solo: toda su configuración la recibe de la WLC.\\\"\nSI PREGUNTAN POR LOS CANALES: \"El diseño asigna los canales 1, 6 y 11 [muestra C22]. Packet Tracer no permite cambiar la configuración de cada antena en este modelo [muestra la captura extra del aviso 'This feature is not supported']. En un equipo real se haría desde la WLC, en Wireless → Radios → 802.11b/g/n.\"\nSI PREGUNTAN POR FLEXCONNECT: \"En Packet Tracer las antenas trabajan en FlexConnect y no se puede cambiar a modo Local. Por eso los puertos de las antenas son trunk y las redes WiFi usan FlexConnect Local Switching: así cada antena entrega a cada usuario en su VLAN. Lo detectamos porque el visitante recibía una IP de gestión (192.168.0.x) en lugar de 192.168.2.x.\"");

// ---------- 7 WiFi y roaming ----------
s = content('Red inalámbrica');
s.addText('Tres redes WiFi y roaming', { placeholder: 'title' });
tbl(s, [['Red WiFi', 'VLAN', 'Seguridad'], ['INNOVA-CORP', '10', 'Usuario por empleado'], ['INNOVA-GUEST', '20', 'Clave de invitados'], ['INNOVA-IOT', '40', 'Clave de sensores']], 0.5, 1.15, 4.3, [1.6, 0.7, 2.0], 12);
s.addText('Cómo se conecta un visitante', { x: 0.5, y: 2.5, w: 4.3, h: 0.3, fontSize: 13, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
[['Elige INNOVA-GUEST y escribe la clave'], ['La WLC: GUEST → interfaz GUEST → VLAN 20'], ['Pide IP: la WLC lo pasa al router (192.168.2.1)'], ['El DHCP del router le da una 192.168.2.x']].forEach(([t], k) => {
  const y = 2.88 + k * 0.52;
  circleNum(s, 0.5, y + 0.02, k + 1);
  s.addText(t, { x: 1.02, y, w: 3.8, h: 0.46, fontSize: 12, color: C.text1, valign: 'middle', isTextBox: true, margin: 0 });
});
cap(s, 'C08', 5.0, 1.15, 4.5, 1.85);
cap(s, 'C07', 5.0, 3.15, 4.5, 1.85);
s.addNotes("TIEMPO: 1 min 30 s.\nQUÉ DECIR: \"Hay tres redes WiFi y cada una lleva a su VLAN: empleados a la 10, invitados a la 20 y sensores a la 40. Las tres antenas anuncian las mismas tres redes; eso es un ESS, y permite el roaming: cambiar de antena sin que se corte la conexión. La laptop conserva su IP porque la WLC la mantiene en la misma VLAN.\"\nDEMO: ping -t en la laptop; arrástrala en la vista Physical de AP-1 a AP-3. El ping no se detiene y la IP es la misma (C07).\nLA CADENA (señálala en la diapositiva): \"1) El visitante elige INNOVA-GUEST y escribe la clave de invitados. 2) La WLC sabe que INNOVA-GUEST está amarrada a la interfaz GUEST, que está en la VLAN 20. 3) El visitante pide IP y la WLC le pasa la petición al router. 4) El DHCP del router le da una IP 192.168.2.x.\"\nSI TE PREGUNTAN:\n- \"¿Qué es una interfaz dinámica?\" \"Es una puerta de la WLC dentro de cada VLAN de usuarios, como las subinterfaces del router. La WLC tiene la .2 en cada red (el router tiene la .1). Cada red WiFi se amarra a una interfaz, y así la WLC deja a cada usuario en su VLAN.\"\n- \"¿La WLC funciona por cable?\" \"Se conecta por cable al switch, pero solo administra lo inalámbrico. Los equipos por cable no pasan por ella: su VLAN la decide el puerto del switch.\"\n- \"¿Quién da la IP a los usuarios del WiFi?\" \"El router R-CORE con DHCP; la WLC solo le reenvía la petición.\"\nCÓMO SE VE EN PACKET TRACER (C07): \"Cada laptop se conecta a la antena que tiene más cerca: en la vista Logical, LAP-EMPLEADO-2 está en AP-2 y las otras en AP-1. El roaming ocurre cuando un usuario se aleja tanto de su antena que la señal baja: la laptop se cambia a otra sin perder su IP, porque la WLC la mantiene en la misma VLAN. En Packet Tracer la señal de cada antena alcanza todo el edificio, por eso la laptop no necesita cambiar mientras camina; si la reconecto cerca de AP-3, se asocia con AP-3.\"\nDEMO OPCIONAL: pon la laptop junto a AP-3, Config → Wireless0 → Port Status Off → On, y muestra en Logical que su línea ahora va a otra antena.");

// ---------- 8 Seguridad empleados ----------
pres.addSection({ title: 'Seguridad' });
s = content('Seguridad');
s.addText('Empleados: WPA2-Enterprise con RADIUS', { placeholder: 'title' });
arrowRow(s, ['Laptop (suplicante)', 'WLC (autenticador)', 'RADIUS (lista de empleados)'], 1.2);
s.addText('Cada empleado entra con su propio usuario. Si alguien deja la empresa, solo se borra su cuenta: se acabó la clave compartida.', { x: 0.5, y: 2.0, w: 9.0, h: 0.6, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
cap(s, 'C10', 0.5, 2.75, 4.4, 2.3);
cap(s, 'C11', 5.1, 2.75, 4.4, 2.3);
s.addNotes("TIEMPO: 1 min 30 s.\nQUÉ DECIR: \"Eliminamos la contraseña compartida. Usamos WPA2-Enterprise: cada empleado entra con su propio usuario. La laptop es el suplicante, la WLC el autenticador y el servidor RADIUS tiene la lista de empleados. La WLC le pregunta al RADIUS si el usuario es válido; si sí, la conexión se cifra con AES. Si alguien deja la empresa, solo se borra su usuario.\"\nDEMO: conexión con la contraseña correcta (C10) y con una incorrecta (C11).\nSI TE PREGUNTAN: \"WPA2-Enterprise es la regla de pedir usuario por persona; RADIUS es el servidor con la lista. No funciona uno sin el otro.\"\nCÓMO SE VE EN LAS CAPTURAS: con usuario y contraseña correctos, la laptop recibe 192.168.1.11 y llega al servidor (C10). Con la contraseña incorrecta, el RADIUS la rechaza: no recibe IP del DHCP y Windows le pone una 169.254.x.x (APIPA, \"no recibí IP de nadie\") (C11).\nLO QUE APRENDÍ AL CONFIGURARLO: \"Al principio ningún empleado entraba: el RADIUS escuchaba en el puerto 1645 y la WLC le preguntaba por el 1812, y además faltaban los usuarios en la lista. Al igualar el puerto y agregar a los empleados, funcionó.\"");

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
s.addNotes("TIEMPO: 1 min.\nQUÉ DECIR: \"Los visitantes tienen su propia red WiFi, en la VLAN 20. La VLAN los separa dentro del switch, pero el router podría pasarlos a otras redes; por eso pusimos una ACL: una lista de reglas que el router lee de arriba hacia abajo. Niega todo lo que vaya de la red de invitados hacia la 192.168.0.0 diagonal 20, con wildcard 0.0.15.255. Solo permite DHCP, ping a su gateway e Internet.\"\nMuestra C12 y C13: \"Antes de la ACL, el visitante llegaba al servidor; después, ya no.\"\nSI TE PREGUNTAN POR INTERNET: \"En el proyecto no hay Internet; la última línea deja listo el acceso para cuando la empresa contrate un proveedor.\"\nLA CADENA DEL BLOQUEO (cuéntala señalando C13): \"1) El visitante, con IP 192.168.2.x, hace ping al servidor 192.168.3.12. 2) Como el servidor está en otra red, el mensaje va a su gateway, la puerta .20 del router (192.168.2.1). 3) Antes de cruzarlo, el router lee la ACL-INVITADOS de arriba hacia abajo: no es DHCP (línea 10), no va a su gateway (línea 20), y la línea 30 dice 'deny' de invitados hacia toda la 192.168.0.0/20. 4) El router lo tira y le contesta 'Destination host unreachable' desde 192.168.2.1.\"\nEVIDENCIA EN EL ROUTER (C14): \"show access-lists muestra '4 match(es)' en la línea deny: son los 4 pings que bloqueó.\"");

// ---------- 10 IoT ----------
pres.addSection({ title: 'IoT y 4G' });
s = content('IoT y 4G');
s.addText('Sensores IoT en el almacén', { placeholder: 'title' });
tbl(s, [['SI…', 'ENTONCES…'], ['Temperatura > 25 °C', 'Enciende el ventilador'], ['Humo detectado', 'Suena la sirena'], ['Puerta abierta', 'Enciende la luz']], 0.5, 1.15, 4.3, [2.15, 2.15], 12);
s.addText('Los sensores reportan por WiFi (INNOVA-IOT, VLAN 40) al servidor IoT, que decide y actúa solo.', { x: 0.5, y: 2.85, w: 4.3, h: 1.2, fontSize: 14, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
cap(s, 'C16', 5.0, 1.15, 4.5, 1.85);
cap(s, 'C17', 5.0, 3.15, 4.5, 1.85);
s.addNotes("TIEMPO: 1 min 30 s.\nQUÉ DECIR: \"En el almacén hay sensores de temperatura, puerta y humo, y actuadores: ventilador, sirena y luz. Se conectan por la red WiFi de sensores, en la VLAN 40, al servidor IoT. El servidor evalúa reglas SI/ENTONCES: si la temperatura pasa de 25 °C enciende el ventilador; si hay humo activa la sirena. Van en su propia VLAN porque los dispositivos IoT suelen ser poco seguros.\"\nDEMO: sube la temperatura y genera humo (C17).");

// ---------- 11 4G ----------
s = content('IoT y 4G');
s.addText('Red 4G para la flotilla', { placeholder: 'title' });
arrowRow(s, ['Celular', 'Torre 4G', 'Central Office', 'R-CORE (ACL)', 'Servidor Central'], 1.2);
s.addText('El chofer solo puede llegar al portal de entregas (HTTPS); el resto de la red le está bloqueado.', { x: 0.5, y: 2.0, w: 9.0, h: 0.6, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
cap(s, 'C20', 0.5, 2.75, 4.4, 2.3);
cap(s, 'C21', 5.1, 2.75, 4.4, 2.3);
s.addNotes("TIEMPO: 1 min.\nQUÉ DECIR: \"Los choferes se conectan a la torre 4G. El Central Office, que simula la central de la compañía celular, les da una IP de la 192.168.6.0 y los conecta con nuestro router. El router tiene una ruta estática para saber regresar las respuestas, y una ACL solo deja a los celulares llegar al portal de entregas por HTTPS.\"\nDEMO: el celular abre el portal (C20) y no llega al RADIUS (C21).");

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
s.addNotes("TIEMPO: 30 s.\nRecorre la tabla rápido: cada fila ya la demostraste en vivo.");

// ---------- 13 Conclusiones ----------
s = content('Cierre');
s.addText('Conclusiones y mejoras', { placeholder: 'title' });
card(s, 0.5, 1.15, 4.4, 3.9, 'Logros');
s.addText('Logros', { x: 0.75, y: 1.3, w: 3.9, h: 0.45, fontSize: 18, bold: true, color: C.accent3, isTextBox: true, margin: 0 });
bullets(s, ['Cobertura en ambos edificios con roaming', 'Un usuario por empleado', 'Invitados sin acceso a la red interna', 'Almacén vigilado automáticamente', 'Flotilla conectada de forma segura'], 0.75, 1.85, 3.95, 3.1, 14);
card(s, 5.1, 1.15, 4.4, 3.9, 'Mejoras');
s.addText('En una red real', { x: 5.35, y: 1.3, w: 3.9, h: 0.45, fontSize: 18, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
bullets(s, ['WPA3 y certificados (EAP-TLS)', 'Banda de 5 GHz', 'WLC y RADIUS de respaldo', 'VPN para la flotilla', 'Switches PoE para las antenas'], 5.35, 1.85, 3.95, 3.1, 14);
s.addNotes("TIEMPO: 30 s.\nQUÉ DECIR: \"Logramos cobertura en ambos edificios con roaming, un usuario por empleado, invitados aislados, monitoreo automático del almacén y la flotilla conectada de forma segura. En una implementación real agregaríamos WPA3, la banda de 5 GHz, equipos de respaldo y VPN.\"");

// ---------- 14 Preguntas ----------
s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: 'Cierre' });
s.addText('¿Preguntas?', { placeholder: 'title' });
s.addText('Gracias. Puedo demostrar cualquier prueba en Packet Tracer.', { placeholder: 'body' });
s.addNotes("Quedan unos 7 minutos para preguntas y pruebas de falla.\nSi algo falla en vivo, explica cómo lo diagnosticas, de lo cercano a lo lejano: cable → VLAN → IP y gateway (ping al gateway) → ACL → servicio.");

const out = path.join(ROOT, 'entregables', 'Presentacion_InnovaLogistics.pptx');
pres.writeFile({ fileName: out }).then(async () => {
  if (SKILL) { const { applyTheme } = require(path.join(SKILL, 'scripts', 'apply_theme.js')); await applyTheme(out, THEME); }
  console.log('Escrito', out);
});
