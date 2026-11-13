// Genera entregables/Reporte_InnovaLogistics.docx
// Uso: node tools/reporte.js
const fs = require('fs');
const path = require('path');
const {
  ImageRun, Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat, PageBreak,
  Footer, PageNumber, TableOfContents
} = require('docx');

const ROOT = path.resolve(__dirname, '..');
const CAPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'entregables', 'capturas.json'), 'utf8'));
const CAP = Object.fromEntries(CAPS.map(c => [c.id, c]));
const TEAL = '0B6E78', TEAL_SOFT = 'DCEEF0', GRAY = 'D3DDE1', HEAD = 'E8EEF0';
const W = 9360; // ancho útil en carta con márgenes de 1"

let fig = 0;
const P = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: Array.isArray(text) ? text : [new TextRun(text)] });
const B = t => new TextRun({ text: t, bold: true });
const T = t => new TextRun(t);
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const LI = (t, ref = 'bullets') => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: Array.isArray(t) ? t : [new TextRun(t)] });

const border = { style: BorderStyle.SINGLE, size: 4, color: GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
function table(headers, rows, widths) {
  const cell = (txt, i, head) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    shading: head ? { fill: HEAD, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: String(txt), bold: !!head, size: 19 })] })]
  });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, i, false)) }))]
  });
}

// Si la captura existe en entregables/capturas, se inserta la imagen; si no, el recuadro "Pega aquí"
const CAPDIR = path.join(ROOT, 'entregables', 'capturas');
function pngSize(f) { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
function captura(id) {
  const c = CAP[id]; fig++;
  const vfile = path.join(CAPDIR, c.archivo.replace('.png', '_v.png'));
  const file = fs.existsSync(vfile) ? vfile : path.join(CAPDIR, c.archivo);
  if (fs.existsSync(file)) {
    const { w, h } = pngSize(file); const k = Math.min(624 / w, 600 / h, 1.6);
    return [
      new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: Math.round(w * k), height: Math.round(h * k) }, altText: { title: c.id, description: c.que, name: c.archivo } })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240 }, children: [new TextRun({ text: `Figura ${fig}. `, bold: true, size: 19 }), new TextRun({ text: c.que, size: 19 })] })
    ];
  }
  const dash = { style: BorderStyle.DASHED, size: 12, color: TEAL };
  const box = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ cantSplit: true, height: { value: 2600, rule: 'atLeast' }, children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      borders: { top: dash, bottom: dash, left: dash, right: dash },
      shading: { fill: TEAL_SOFT, type: ShadingType.CLEAR },
      verticalAlign: 'center',
      children: [
        new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: `PEGA AQUÍ LA CAPTURA ${c.id}`, bold: true, color: TEAL, size: 26 })] }),
        new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: c.archivo, font: 'Courier New', size: 20 })] }),
        new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: c.que, italics: true, size: 20 })] }),
        new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: '(Borra este recuadro y pega la imagen en su lugar)', size: 16, color: '55666F' })] })
      ]
    })] })]
  });
  const cap = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240 }, children: [new TextRun({ text: `Figura ${fig}. `, bold: true, size: 19 }), new TextRun({ text: c.que, size: 19 })] });
  return [box, cap];
}

const cfg = n => fs.readFileSync(path.join(ROOT, 'configs', n), 'utf8').split('\n').map(l =>
  new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: l || ' ', font: 'Courier New', size: 16 })] }));

const meta = [['Materia', 'ICCS 260 · Redes inalámbricas'], ['Alumno', '(escribe tu nombre)'], ['Docente', '(escribe el nombre del docente)'],
  ['Fecha de entrega', '13 de noviembre de 2026'], ['Herramienta', 'Cisco Packet Tracer 9.0']];

const children = [
  // ---------- Portada ----------
  new Paragraph({ spacing: { before: 2400, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Proyecto Integrador · Redes Inalámbricas', size: 26, color: '55666F' })] }),
  new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun('Rediseño Inalámbrico e Integración IoT')] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 }, children: [new TextRun({ text: 'InnovaLogistics Puebla S.A. de C.V.', size: 32, color: TEAL, bold: true })] }),
  table(['Dato', ''], meta, [2800, 6560]),
  new Paragraph({ children: [new PageBreak()] }),

  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Contenido')] }),
  new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' }),
  P([new TextRun({ text: 'Al abrir el archivo en Word, haz clic derecho sobre el índice y elige "Actualizar campo" para que aparezcan los números de página.', italics: true, size: 18, color: '55666F' })]),
  new Paragraph({ children: [new PageBreak()] }),

  // ---------- 1 ----------
  H1('1. Introducción'),
  P('InnovaLogistics Puebla distribuye insumos médicos e industriales desde el Parque Industrial Chachapa, en Puebla. Opera dos edificios, las Oficinas Corporativas y el Almacén Central de Distribución, y una flotilla de transporte en ruta.'),
  P('Este reporte presenta el diseño, la configuración y la validación en Cisco Packet Tracer de una solución inalámbrica integral que corrige los problemas de cobertura, seguridad, monitoreo ambiental y conectividad móvil de la empresa.'),

  // ---------- 2 ----------
  H1('2. Objetivos'),
  P([B('Objetivo general: '), T('diseñar e implementar una infraestructura inalámbrica centralizada, segura y escalable que integre sensores IoT y conectividad celular, validada en Cisco Packet Tracer.')]),
  P([B('Objetivos específicos:')]),
  LI('Implementar una WLAN centralizada con una WLC y tres Access Points ligeros en topología ESS, con roaming transparente.', 'nums'),
  LI('Autenticar al personal con WPA2-Enterprise (802.1X) contra un servidor RADIUS.', 'nums'),
  LI('Aislar la red de invitados con una VLAN dedicada y una lista de control de acceso (ACL).', 'nums'),
  LI('Desplegar una red de sensores inalámbricos (WSN) que active ventilación y alarmas automáticamente.', 'nums'),
  LI('Integrar una red celular 4G para que la flotilla reporte sus entregas al servidor central de forma segura.', 'nums'),

  // ---------- 3 ----------
  H1('3. Análisis de la problemática'),
  table(['#', 'Problema', 'Impacto'], [
    ['1', 'Routers caseros independientes, todos en el mismo canal de 2.4 GHz, con una sola clave WPA2-PSK compartida', 'Caídas por interferencia, zonas del almacén sin cobertura y fuga de información: quien deja la empresa conserva la clave'],
    ['2', 'Visitantes conectados a la misma red que los servidores', 'Un visitante puede ver o atacar los servidores internos'],
    ['3', 'Sin monitoreo de temperatura ni detección de humo en el almacén', 'Pérdida de insumos médicos y riesgo de incendio sin alerta'],
    ['4', 'La flotilla queda fuera del alcance del WiFi', 'No se registran las entregas en tiempo real']
  ], [500, 4300, 4560]),

  // ---------- 4 ----------
  H1('4. Solución propuesta'),
  H2('4.1 Infraestructura WLAN centralizada'),
  P('Se sustituyen los routers caseros por una Wireless LAN Controller (WLC) y tres Access Points ligeros (LAP): AP-1 en Oficinas y AP-2 y AP-3 en el Almacén. Los APs se registran en la WLC mediante el protocolo CAPWAP, por lo que las redes WiFi, la seguridad y los canales se administran desde un solo punto.'),
  P('Los tres APs anuncian las mismas redes WiFi y forman un ESS (Extended Service Set), lo que permite el roaming: un usuario se desplaza entre edificios sin perder la conexión ni cambiar de IP. Se asignan los canales no traslapados 1, 6 y 11 para eliminar la interferencia.'),
  ...captura('C22'),
  H2('4.2 Seguridad'),
  LI([B('INNOVA-CORP (empleados): '), T('WPA2-Enterprise (802.1X) con cifrado AES. La WLC actúa como autenticador y consulta al servidor RADIUS (192.168.3.10). Cada empleado tiene usuario y contraseña propios; para revocar el acceso de alguien solo se elimina su cuenta.')]),
  LI([B('INNOVA-GUEST (invitados): '), T('WPA2-PSK en la VLAN 20. La ACL extendida ACL-INVITADOS, aplicada de entrada en la subinterfaz G0/0.20 del router, niega todo el tráfico hacia la red interna 192.168.0.0/20 y solo permite DHCP, ping al gateway y salida a Internet.')]),
  LI([B('Endurecimiento: '), T('acceso SSH v2 al router, contraseñas cifradas, banner legal, puertos sin uso apagados y VLAN de gestión separada.')]),
  H2('4.3 Red de sensores IoT (WSN)'),
  P('En el almacén se instalan un sensor de temperatura, un sensor de puerta y un detector de humo, más los actuadores ventilador, sirena y luz. Se conectan por WiFi a la red INNOVA-IOT (VLAN 40) y se registran en el Servidor IoT (192.168.3.11), que ejecuta estas reglas:'),
  table(['Condición', 'Acción'], [['Temperatura mayor a 25 °C', 'Encender el ventilador'], ['Temperatura de 25 °C o menos', 'Apagar el ventilador'], ['Humo detectado', 'Activar la sirena'], ['Puerta abierta', 'Encender la luz indicadora']], [4680, 4680]),
  H2('4.4 Conectividad móvil WWAN 4G'),
  P('Se integra una torre celular conectada a un Central Office Server, que asigna direcciones 192.168.6.0/24 a los smartphones de la flotilla. El router R-CORE tiene una ruta estática hacia esa red, y la ACL-CELULAR limita el acceso de los móviles al Servidor Central (portal de entregas por HTTPS y DNS).'),

  // ---------- 5 ----------
  H1('5. Topología'),
  P('La red se organiza en tres zonas: Oficinas Corporativas, Almacén Central y Flotilla / Red 4G. El router R-CORE ocupa el centro y une todas las redes.'),
  ...captura('C01'),

  // ---------- 6 ----------
  H1('6. Direccionamiento IP'),
  P('Red asignada: 192.168.0.0/20 (4096 direcciones, de 192.168.0.0 a 192.168.15.255). Se divide en 16 subredes /24 de 254 equipos cada una: se usan 7 y quedan 9 libres para crecimiento.'),
  table(['VLAN', 'Nombre', 'Red', 'Gateway', 'Uso'], [
    ['99', 'Gestión (nativa)', '192.168.0.0/24', '192.168.0.1', 'WLC, APs, switches, PC-ADMIN'],
    ['10', 'Corporativo', '192.168.1.0/24', '192.168.1.1', 'Empleados (INNOVA-CORP)'],
    ['20', 'Invitados', '192.168.2.0/24', '192.168.2.1', 'Visitantes (INNOVA-GUEST)'],
    ['30', 'Servidores', '192.168.3.0/24', '192.168.3.1', 'RADIUS, IoT, Central'],
    ['40', 'IoT', '192.168.4.0/24', '192.168.4.1', 'Sensores (INNOVA-IOT)'],
    ['—', 'Enlace 4G', '192.168.5.0/24', '—', 'R-CORE .1 ↔ Central Office .2'],
    ['—', 'Celular', '192.168.6.0/24', 'Central Office', 'Smartphones de la flotilla']
  ], [800, 1700, 1900, 1700, 3260]),
  P(' '),
  table(['Dispositivo', 'Interfaz', 'Dirección IP', 'Gateway'], [
    ['R-CORE', 'G0/0.99 / .10 / .20 / .30 / .40', '192.168.0.1 / 1.1 / 2.1 / 3.1 / 4.1', '—'],
    ['R-CORE', 'G0/1', '192.168.5.1/24', '—'],
    ['SW-CORE', 'VLAN 99', '192.168.0.2/24', '192.168.0.1'],
    ['SW-ALMACEN', 'VLAN 99', '192.168.0.3/24', '192.168.0.1'],
    ['WLC', 'Management', '192.168.0.10/24', '192.168.0.1'],
    ['WLC', 'Interfaces CORP / GUEST / IOT', '192.168.1.2 / 2.2 / 4.2', '.1 de cada red'],
    ['AP-1, AP-2, AP-3', 'G0', 'DHCP (192.168.0.21+)', '192.168.0.1'],
    ['PC-ADMIN', 'Fa0', '192.168.0.20/24', '192.168.0.1'],
    ['SRV-RADIUS', 'Fa0', '192.168.3.10/24', '192.168.3.1'],
    ['SRV-IOT', 'Fa0', '192.168.3.11/24', '192.168.3.1'],
    ['SRV-CENTRAL', 'Fa0', '192.168.3.12/24', '192.168.3.1'],
    ['CENTRAL-OFFICE', 'Backbone', '192.168.5.2/24', '192.168.5.1'],
    ['Laptops de empleados', 'Wireless0', 'DHCP (192.168.1.11+)', '192.168.1.1'],
    ['Laptop de visitante', 'Wireless0', 'DHCP (192.168.2.11+)', '192.168.2.1'],
    ['Sensores IoT', 'Wireless0', 'DHCP (192.168.4.11+)', '192.168.4.1'],
    ['Celulares', '3G/4G Cell', 'DHCP (192.168.6.x)', '192.168.6.1']
  ], [2200, 2600, 2800, 1760]),

  // ---------- 7 ----------
  H1('7. Configuración de los dispositivos'),
  H2('7.1 Router R-CORE'),
  P('Router-on-a-stick con una subinterfaz 802.1Q por VLAN, servidor DHCP con cuatro pools, ruta estática hacia la red celular, ACLs extendidas nombradas (ACL-INVITADOS y ACL-CELULAR) y acceso SSH. La configuración completa está en el Anexo A.'),
  ...captura('C04'), ...captura('C14'), ...captura('C19'),
  H2('7.2 Switches'),
  P('Ambos switches tienen las VLANs 10, 20, 30, 40 y 99. Los enlaces hacia el router, entre switches y hacia la WLC son troncales 802.1Q con VLAN nativa 99; los puertos de equipos finales son de acceso con PortFast, y los puertos sin uso están apagados (Anexos B y C).'),
  ...captura('C02'), ...captura('C03'),
  H2('7.3 WLC'),
  P('La WLC (192.168.0.10) tiene una interfaz dinámica por VLAN de usuarios y tres WLANs:'),
  table(['Red WiFi', 'VLAN', 'Seguridad'], [['INNOVA-CORP', '10', 'WPA2-Enterprise (802.1X) contra RADIUS 192.168.3.10'], ['INNOVA-GUEST', '20', 'WPA2-PSK'], ['INNOVA-IOT', '40', 'WPA2-PSK']], [2600, 1200, 5560]),
  P(' '),
  P('Los tres APs obtuvieron su dirección por DHCP en la VLAN 99 (192.168.0.22, .23 y .24) y se registraron en la WLC (estado REG). Durante la implementación, las antenas no volvieron a conectarse tras un reinicio: el switch mostraba sus puertos en estado down/down, lo que indicaba una falla del lado del AP. Se reemplazaron por APs nuevos que, sin ninguna configuración manual, obtuvieron IP, descubrieron la WLC y descargaron su configuración, lo que demuestra la ventaja de los APs ligeros administrados de forma centralizada.'),
  ...captura('C06'), ...captura('C08'),
  H2('7.4 Servidores'),
  P('SRV-RADIUS tiene el servicio AAA con la WLC como cliente y una cuenta por empleado. SRV-IOT ejecuta el servicio IoT con las reglas de automatización. SRV-CENTRAL ofrece HTTP, HTTPS (portal de entregas) y DNS.'),
  ...captura('C09'), ...captura('C15'), ...captura('C16'),
  H2('7.5 Central Office y torre celular'),
  P('El Central Office se conecta a R-CORE por su puerto Backbone (192.168.5.2) y a la torre por cable coaxial. Asigna a los celulares direcciones de la red 192.168.6.0/24 con DNS 192.168.3.12.'),
  ...captura('C18'),

  // ---------- 8 ----------
  H1('8. Pruebas y resultados'),
  table(['Prueba', 'Resultado esperado', 'Resultado'], [
    ['PC-ADMIN (VLAN 99) hace ping al Servidor Central (VLAN 30)', 'Responde: el enrutamiento entre VLANs funciona', 'Correcto'],
    ['Asociación de laptops a distintas antenas del ESS', 'Cada laptop se asocia a la antena más cercana con la misma red WiFi', 'Correcto'],
    ['Empleado se conecta con usuario válido', 'Se conecta y recibe IP 192.168.1.x', 'Correcto'],
    ['Empleado con contraseña incorrecta', 'El RADIUS lo rechaza', 'Correcto'],
    ['Invitado hace ping a un servidor, antes y después de la ACL', 'Antes responde; después falla', 'Correcto'],
    ['Puerta del almacén abierta (regla IoT)', 'Se enciende la luz automáticamente; reglas de temperatura y humo configuradas', 'Correcto'],
    ['Celular abre el portal de entregas', 'Se ve la página', 'Correcto'],
    ['Celular intenta llegar al RADIUS', 'Bloqueado por ACL-CELULAR', 'Correcto']
  ], [4000, 3800, 1560]),
  P(' '),
  ...(() => { const f = path.join(CAPDIR, 'extra_pruebas_pdu.png'); if (!fs.existsSync(f)) return []; fig++; const { w, h } = pngSize(f); const k = Math.min(600 / w, 430 / h, 1.4);
    return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(f), transformation: { width: Math.round(w * k), height: Math.round(h * k) }, altText: { title: 'Pruebas Simple PDU', description: 'Resultados Successful y Failed', name: 'extra_pruebas_pdu.png' } })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240 }, children: [new TextRun({ text: `Figura ${fig}. `, bold: true, size: 19 }), new TextRun({ text: 'Resumen de pruebas con Simple PDU: todo exitoso excepto el visitante hacia el Servidor Central, bloqueado por la ACL', size: 19 })] })]; })(),
  ...captura('C05'), ...captura('C07'), ...captura('C10'), ...captura('C11'), ...captura('C12'), ...captura('C13'), ...captura('C17'), ...captura('C20'), ...captura('C21'),

  // ---------- 9-10 ----------
  H1('9. Conclusiones'),
  P('La WLC resolvió la saturación del espectro al coordinar tres APs en canales no traslapados, y permitió el roaming transparente dentro del ESS. WPA2-Enterprise eliminó la clave compartida al autenticar a cada usuario contra RADIUS, y la combinación de VLAN y ACL garantizó que los visitantes no alcancen la red interna.'),
  P('La red de sensores IoT da telemetría y respuesta automática ante condiciones de riesgo para los insumos médicos, y la red 4G extiende la conectividad a la flotilla de forma controlada. El esquema de direccionamiento deja nueve subredes libres para crecimiento.'),
  H1('10. Recomendaciones para una implementación real'),
  LI('Usar WPA3-Enterprise y certificados (EAP-TLS) en lugar de usuario y contraseña.'),
  LI('Habilitar la banda de 5 GHz para tener más canales y menos interferencia.'),
  LI('Alimentar los APs con switches PoE.'),
  LI('Agregar un portal cautivo y límite de ancho de banda para invitados.'),
  LI('Usar VPN IPsec para la flotilla sobre la red del operador celular.'),
  LI('Agregar redundancia: una segunda WLC y un RADIUS secundario.'),

  // ---------- Anexos ----------
  new Paragraph({ children: [new PageBreak()] }),
  H1('Anexo A. Configuración de R-CORE'), ...cfg('R-CORE.txt'),
  new Paragraph({ children: [new PageBreak()] }),
  H1('Anexo B. Configuración de SW-CORE'), ...cfg('SW-CORE.txt'),
  new Paragraph({ children: [new PageBreak()] }),
  H1('Anexo C. Configuración de SW-ALMACEN'), ...cfg('SW-ALMACEN.txt')
];

const doc = new Document({
  creator: 'Proyecto InnovaLogistics',
  title: 'Reporte Técnico – InnovaLogistics Puebla',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: 'Cambria', size: 52, bold: true, color: '132029' }, paragraph: { spacing: { before: 0, after: 200 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Cambria', size: 32, bold: true, color: TEAL }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Cambria', size: 26, bold: true, color: '132029' }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } }
    ]
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: 'nums', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'InnovaLogistics · Proyecto Integrador · ', size: 16, color: '55666F' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '55666F' })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(ROOT, 'entregables', 'Reporte_InnovaLogistics.docx');
  fs.writeFileSync(out, buf);
  console.log('Escrito', out, '· figuras:', fig);
});
