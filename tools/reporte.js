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
// figura(file, pie, antes, despues): '#' en los textos se reemplaza por el número de figura
const sub = (t, n) => t.replace(/#/g, n);
function imgFig(file, pie, alt) {
  const { w, h } = pngSize(file); const k = Math.min(624 / w, 600 / h, 1.6);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: Math.round(w * k), height: Math.round(h * k) }, altText: { title: alt, description: pie, name: path.basename(file) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 }, children: [new TextRun({ text: `Figura ${fig}. `, bold: true, size: 19 }), new TextRun({ text: pie, size: 19 })] })
  ];
}
function wrap(body, antes, despues) {
  const out = [];
  if (antes) out.push(P(sub(antes, fig)));
  out.push(...body);
  if (despues) out.push(P(sub(despues, fig)));
  return out;
}
function extra(nombre, pie, antes, despues) {
  const f = path.join(CAPDIR, nombre); if (!fs.existsSync(f)) return [];
  fig++; return wrap(imgFig(f, pie, nombre), antes, despues);
}
function captura(id, antes, despues, pie) {
  const c = CAP[id]; fig++; pie = pie || c.que;
  const vfile = path.join(CAPDIR, c.archivo.replace('.png', '_v.png'));
  const file = fs.existsSync(vfile) ? vfile : path.join(CAPDIR, c.archivo);
  if (fs.existsSync(file)) return wrap(imgFig(file, pie, c.id), antes, despues);
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
        new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: c.archivo, font: 'Courier New', size: 20 })] })
      ]
    })] })]
  });
  const cap = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 }, children: [new TextRun({ text: `Figura ${fig}. `, bold: true, size: 19 }), new TextRun({ text: pie, size: 19 })] });
  return wrap([box, cap], antes, despues);
}
let tab = 0;
const TCAP = t => { tab++; return new Paragraph({ keepNext: true, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: `Tabla ${tab}. `, bold: true, size: 19 }), new TextRun({ text: t, size: 19 })] }); };

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
  P('Antes del rediseño, la red de la empresa tenía cuatro problemas principales. La Tabla 1 resume cada problema y el impacto que tiene en la operación.'),
  TCAP('Problemas detectados en la red actual y su impacto'),
  table(['#', 'Problema', 'Impacto'], [
    ['1', 'Routers caseros independientes, todos en el mismo canal de 2.4 GHz, con una sola clave WPA2-PSK compartida', 'Caídas por interferencia, zonas del almacén sin cobertura y fuga de información: quien deja la empresa conserva la clave'],
    ['2', 'Visitantes conectados a la misma red que los servidores', 'Un visitante puede ver o atacar los servidores internos'],
    ['3', 'Sin monitoreo de temperatura ni detección de humo en el almacén', 'Pérdida de insumos médicos y riesgo de incendio sin alerta'],
    ['4', 'La flotilla queda fuera del alcance del WiFi', 'No se registran las entregas en tiempo real']
  ], [500, 4300, 4560]),
  P('Cada problema de la Tabla 1 se atiende con una parte de la solución de la sección 4: el problema 1 con la WLC y WPA2-Enterprise, el 2 con la VLAN y la ACL de invitados, el 3 con la red de sensores IoT y el 4 con la red celular 4G.'),

  // ---------- 4 ----------
  H1('4. Solución propuesta'),
  H2('4.1 Infraestructura WLAN centralizada'),
  P('Se sustituyen los routers caseros por una Wireless LAN Controller (WLC) y tres Access Points ligeros (LAP): AP-1 en Oficinas y AP-2 y AP-3 en el Almacén. Los APs se registran en la WLC mediante el protocolo CAPWAP, por lo que las redes WiFi, la seguridad y los canales se administran desde un solo punto.'),
  P('Los tres APs anuncian las mismas redes WiFi y forman un ESS (Extended Service Set), lo que permite el roaming: un usuario se desplaza entre zonas sin cambiar de red WiFi ni de dirección IP. Además se asignan los canales no traslapados 1, 6 y 11 para eliminar la interferencia.'),
  ...captura('C22',
    'La Figura # ilustra por qué importa la elección de canales. Se tomó del simulador de canales de la aplicación de estudio del proyecto, porque Packet Tracer no permite cambiar el canal de los APs administrados por la WLC.',
    'En la parte de "antes" (Figura #), los tres APs usan el canal 1 y sus señales se enciman: los equipos compiten por el mismo canal y la red se vuelve lenta. En la parte de "después", cada AP usa un canal distinto (1, 6 y 11), que no se traslapan entre sí, y la interferencia desaparece.'),
  H2('4.2 Seguridad'),
  P('La seguridad se resuelve con un tipo de protección distinto para cada grupo de usuarios:'),
  LI([B('INNOVA-CORP (empleados): '), T('WPA2-Enterprise (802.1X) con cifrado AES. La WLC actúa como autenticador y consulta al servidor RADIUS (192.168.3.10). Cada empleado tiene usuario y contraseña propios; para revocar el acceso de alguien solo se elimina su cuenta.')]),
  LI([B('INNOVA-GUEST (invitados): '), T('WPA2-PSK en la VLAN 20. La ACL extendida ACL-INVITADOS, aplicada de entrada en la subinterfaz G0/0.20 del router, niega todo el tráfico hacia la red interna 192.168.0.0/20 y solo permite DHCP, ping al gateway y salida a Internet.')]),
  LI([B('Endurecimiento: '), T('acceso SSH v2 al router, contraseñas cifradas, banner legal, puertos sin uso apagados y VLAN de gestión separada.')]),
  H2('4.3 Red de sensores IoT (WSN)'),
  P('En el almacén se instalan un sensor de temperatura, un sensor de puerta y un detector de humo, más los actuadores ventilador, sirena y luz. Se conectan por WiFi a la red INNOVA-IOT (VLAN 40) y se registran en el Servidor IoT (192.168.3.11). La Tabla 2 muestra las reglas de automatización que ejecuta el servidor.'),
  TCAP('Reglas de automatización del Servidor IoT'),
  table(['Condición', 'Acción'], [['Temperatura mayor a 25 °C', 'Encender el ventilador'], ['Temperatura de 25 °C o menos', 'Apagar el ventilador'], ['Humo detectado', 'Activar la sirena'], ['Puerta abierta', 'Encender la luz indicadora']], [4680, 4680]),
  P('Cada regla de la Tabla 2 funciona como un "si pasa esto, haz aquello": el sensor reporta su valor al servidor y el servidor ordena la acción al actuador, sin intervención de una persona.'),
  H2('4.4 Conectividad móvil WWAN 4G'),
  P('Se integra una torre celular conectada a un Central Office Server, que asigna direcciones 192.168.6.0/24 a los smartphones de la flotilla. El router R-CORE tiene una ruta estática hacia esa red, y la ACL-CELULAR limita el acceso de los móviles al Servidor Central (portal de entregas por HTTP/HTTPS y DNS).'),

  // ---------- 5 ----------
  H1('5. Topología'),
  P('La red se organiza en tres zonas: Oficinas Corporativas, Almacén Central y Flotilla / Red 4G. El router R-CORE ocupa el centro y une todas las redes.'),
  ...captura('C01',
    'La Figura # muestra la topología completa construida en Packet Tracer.',
    'En la Figura # se distinguen las tres zonas. En Oficinas están SW-CORE, la WLC, AP-1, PC-ADMIN, los tres servidores y las laptops. En el Almacén están SW-ALMACEN, AP-2, AP-3 y los sensores y actuadores IoT. En la zona 4G están la torre celular, el Central Office y los celulares. Las líneas sólidas son cables, la línea punteada es el enlace entre switches y las líneas onduladas son conexiones inalámbricas.'),

  // ---------- 6 ----------
  H1('6. Direccionamiento IP'),
  P('Red asignada: 192.168.0.0/20 (4096 direcciones, de 192.168.0.0 a 192.168.15.255). Se divide en 16 subredes /24 de 254 equipos cada una. La Tabla 3 muestra las 7 subredes que se usan; las otras 9 quedan libres para crecimiento.'),
  TCAP('Subredes /24 y VLANs del proyecto'),
  table(['VLAN', 'Nombre', 'Red', 'Gateway', 'Uso'], [
    ['99', 'Gestión (nativa)', '192.168.0.0/24', '192.168.0.1', 'WLC, APs, switches, PC-ADMIN'],
    ['10', 'Corporativo', '192.168.1.0/24', '192.168.1.1', 'Empleados (INNOVA-CORP)'],
    ['20', 'Invitados', '192.168.2.0/24', '192.168.2.1', 'Visitantes (INNOVA-GUEST)'],
    ['30', 'Servidores', '192.168.3.0/24', '192.168.3.1', 'RADIUS, IoT, Central'],
    ['40', 'IoT', '192.168.4.0/24', '192.168.4.1', 'Sensores (INNOVA-IOT)'],
    ['—', 'Enlace 4G', '192.168.5.0/24', '—', 'R-CORE .1 ↔ Central Office .2'],
    ['—', 'Celular', '192.168.6.0/24', '192.168.6.1', 'Smartphones de la flotilla']
  ], [800, 1700, 1900, 1700, 3260]),
  P('En la Tabla 3, cada VLAN tiene su propia subred y el número de la VLAN coincide con el tercer octeto cuando es posible (VLAN 10 → 192.168.1.x, VLAN 20 → 192.168.2.x), lo que facilita recordar a qué grupo pertenece cada dirección. Las redes 192.168.5.0 y 192.168.6.0 no tienen VLAN porque no pasan por los switches: son el cable entre el router y el Central Office, y la red de los celulares.'),
  P('La Tabla 4 detalla la dirección de cada equipo. Se sigue una regla sencilla: en todas las subredes el router es el .1 (gateway), los equipos de infraestructura tienen direcciones fijas bajas y los clientes inalámbricos reciben su dirección por DHCP a partir del .11.'),
  TCAP('Direccionamiento por dispositivo'),
  table(['Dispositivo', 'Interfaz', 'Dirección IP', 'Gateway'], [
    ['R-CORE', 'Subinterfaces G0/0.99 / .10 / .20 / .30 / .40', '192.168.0.1 / 1.1 / 2.1 / 3.1 / 4.1', '— (es el gateway)'],
    ['R-CORE', 'G0/1', '192.168.5.1/24', '—'],
    ['SW-CORE', 'VLAN 99', '192.168.0.2/24', '192.168.0.1'],
    ['SW-ALMACEN', 'VLAN 99', '192.168.0.3/24', '192.168.0.1'],
    ['WLC', 'Management', '192.168.0.10/24', '192.168.0.1'],
    ['WLC', 'Interfaces dinámicas CORP / GUEST / IOT', '192.168.1.2 / 2.2 / 4.2', '.1 de cada red'],
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
  P('Dos renglones de la Tabla 4 merecen explicación. Primero, R-CORE tiene una sola conexión física hacia SW-CORE (G0/0), pero se divide en cinco subinterfaces lógicas, una por VLAN; cada subinterfaz es el gateway (.1) de su VLAN. Segundo, la WLC tiene su interfaz de administración en la VLAN 99 (192.168.0.10), que es la dirección con la que los APs la encuentran, y además una interfaz dinámica en cada VLAN de usuarios (.2 de cada red). Las interfaces dinámicas no son APs: son la "puerta" de la WLC en cada VLAN, que le indica en qué VLAN colocar a cada cliente según la red WiFi a la que se conecta.'),

  // ---------- 7 ----------
  H1('7. Configuración de los dispositivos'),
  P('Esta sección muestra, con capturas de Packet Tracer, que cada equipo quedó configurado como se diseñó. La configuración completa en texto está en los Anexos A, B y C.'),
  H2('7.1 Router R-CORE'),
  P('R-CORE funciona como router-on-a-stick, con una subinterfaz 802.1Q por VLAN. Además es el servidor DHCP (cuatro pools), tiene una ruta estática hacia la red celular, tres ACLs extendidas nombradas (ACL-INVITADOS, ACL-CELULAR y ACL-IOT) y acceso remoto por SSH.'),
  ...captura('C04',
    'Para comprobar que las subinterfaces están activas se ejecutó el comando show ip interface brief, cuyo resultado aparece en la Figura #.',
    'En la Figura # se ve que G0/0 no tiene dirección (unassigned): es solo el cable físico. Las subinterfaces G0/0.10, .20, .30, .40 y .99 tienen las direcciones 192.168.1.1, 2.1, 3.1, 4.1 y 0.1, y están en estado up/up, es decir, encendidas y funcionando. G0/1 (192.168.5.1) es el enlace hacia el Central Office. Esto demuestra el router-on-a-stick: un solo puerto físico atiende a las cinco VLANs.'),
  ...captura('C14',
    'Para verificar la ACL de invitados se usó el comando show access-lists, mostrado en la Figura #.',
    'La Figura # presenta las cuatro líneas de ACL-INVITADOS en el orden en que el router las revisa: 10 permite DHCP, 20 permite el ping al gateway, 30 niega el acceso a toda la red interna 192.168.0.0/20 y 40 permite lo demás (Internet). La línea 30 muestra "4 match(es)": son los cuatro pings de la laptop de visitante hacia el servidor que la ACL bloqueó, lo que prueba que la regla funciona.'),
  ...captura('C19',
    'La ruta hacia los celulares se comprobó con show ip route (Figura #).',
    'En la Figura # aparecen con la letra C las redes conectadas directamente al router (una por subinterfaz y la del enlace 192.168.5.0), con la letra L la dirección propia del router en cada una, y al final, con la letra S, la ruta estática 192.168.6.0/24 vía 192.168.5.2. Esa ruta le dice a R-CORE que, para llegar a los celulares, debe enviar los paquetes al Central Office.'),
  H2('7.2 Switches'),
  P('Ambos switches tienen las VLANs 10, 20, 30, 40 y 99. Los enlaces hacia el router, entre switches y hacia la WLC son troncales 802.1Q con VLAN nativa 99. Los puertos de los APs también son troncales, porque en Packet Tracer los APs trabajan en modo FlexConnect y entregan el tráfico de los clientes ya separado por VLAN. Los puertos de equipos finales son de acceso con PortFast y los puertos sin uso están apagados.'),
  ...captura('C02',
    'Las VLANs creadas en SW-CORE se verifican con show vlan brief (Figura #).',
    'En la Figura # se ven las VLANs 10 (CORPORATIVO), 20 (INVITADOS), 30 (SERVIDORES), 40 (IOT) y 99 (GESTION), todas activas, y los puertos de acceso de cada una: Fa0/10 a Fa0/12 (servidores) en la VLAN 30 y Fa0/20 (PC-ADMIN) en la VLAN 99. La VLAN 1 "default" es la que trae el switch de fábrica: ahí quedan los puertos que no se asignaron a ninguna VLAN, que en este diseño están apagados. Los puertos troncales no aparecen en esta lista porque llevan todas las VLANs; se ven en la siguiente figura.'),
  ...captura('C03',
    'Los enlaces troncales se verifican con show interfaces trunk (Figura #).',
    'En la Figura # aparecen Fa0/1, Gig0/1 y Gig0/2 en modo trunking, con encapsulación 802.1q, VLAN nativa 99 y las VLANs 10, 20, 30, 40 y 99 permitidas. Es decir, por esos cables viajan todas las VLANs al mismo tiempo, cada paquete con su etiqueta. Este comando se ejecuta en el switch porque el trunk es una configuración de los puertos del switch; el router no usa "switchport", sino subinterfaces.'),
  H2('7.3 WLC'),
  P('La WLC (192.168.0.10) tiene una interfaz dinámica por VLAN de usuarios y tres WLANs, que se resumen en la Tabla 5.'),
  TCAP('Redes WiFi (WLANs) configuradas en la WLC'),
  table(['Red WiFi', 'VLAN', 'Seguridad'], [['INNOVA-CORP', '10', 'WPA2-Enterprise (802.1X) contra RADIUS 192.168.3.10'], ['INNOVA-GUEST', '20', 'WPA2-PSK'], ['INNOVA-IOT', '40', 'WPA2-PSK']], [2600, 1200, 5560]),
  P('Como muestra la Tabla 5, cada red WiFi se asocia a su propia VLAN: así, aunque todos usan las mismas antenas, cada grupo de usuarios queda en una subred distinta. Solo la red de empleados usa 802.1X, porque es la única donde cada persona necesita su propia cuenta.'),
  P('Los tres APs obtuvieron su dirección por DHCP en la VLAN 99 y se registraron en la WLC. Durante la implementación, las antenas no volvieron a conectarse tras un reinicio: el switch mostraba sus puertos en estado down/down, lo que indicaba una falla del lado del AP. Se reemplazaron por APs nuevos que, sin ninguna configuración manual, obtuvieron IP, descubrieron la WLC y descargaron su configuración, lo que demuestra la ventaja de los APs ligeros administrados de forma centralizada.'),
  ...captura('C06',
    'La Figura # muestra la sección Wireless → All APs de la WLC.',
    'En la Figura # aparecen los tres APs registrados en la WLC. Esto significa que cada AP encontró a la WLC por CAPWAP y recibió de ella las redes WiFi y su configuración; ningún AP se configuró a mano.'),
  ...captura('C08',
    'La Figura # muestra la lista de WLANs de la WLC.',
    'En la Figura # se ven las tres redes WiFi de la Tabla 5 (INNOVA-CORP, INNOVA-GUEST e INNOVA-IOT) habilitadas. La WLC las envía a los tres APs, por lo que las tres redes se anuncian en todo el edificio.'),
  H2('7.4 Servidores'),
  P('SRV-RADIUS tiene el servicio AAA con la WLC como cliente y una cuenta por empleado. SRV-IOT ejecuta el servicio IoT con las reglas de automatización. SRV-CENTRAL ofrece HTTP, HTTPS (portal de entregas) y DNS.'),
  ...captura('C09',
    'La configuración del servidor RADIUS se muestra en la Figura #.',
    'En la Figura # se ve el servicio AAA encendido en el puerto 1812, la WLC dada de alta como cliente (IP 192.168.0.10, tipo Radius y clave compartida) y tres cuentas de empleados (jlopez, mgarcia y almacen01). Cuando un empleado se conecta a INNOVA-CORP, la WLC envía su usuario y contraseña a este servidor, que responde si lo acepta o lo rechaza.'),
  ...captura('C15',
    'La Figura # muestra los dispositivos registrados en el Servidor IoT.',
    'En la Figura # aparecen los sensores (temperatura, puerta y humo) y los actuadores (ventilador, sirena y luz) conectados al servidor. Que estén en la lista significa que cada dispositivo obtuvo IP en la VLAN 40 y se registró en 192.168.3.11; solo así el servidor puede leer sus valores y darles órdenes.'),
  ...captura('C16',
    'Las reglas de automatización configuradas aparecen en la Figura #.',
    'La Figura # corresponde a las reglas de la Tabla 2, capturadas en la sección Conditions del servidor. Cada regla tiene una condición (por ejemplo, "la puerta está abierta") y una acción (por ejemplo, "encender la luz").'),
  H2('7.5 Central Office y torre celular'),
  P('El Central Office se conecta a R-CORE por su puerto Backbone (192.168.5.2) y a la torre por cable coaxial. Asigna a los celulares direcciones de la red 192.168.6.0/24, con gateway 192.168.6.1 y DNS 192.168.3.12.'),
  ...captura('C18',
    'La configuración del Central Office aparece en la Figura #.',
    'En la parte superior de la Figura # se ve el puerto Backbone con la dirección 192.168.5.2 y gateway 192.168.5.1 (R-CORE). En la parte inferior, la interfaz Cell Tower tiene la dirección 192.168.6.1, que funciona como gateway de los celulares. La torre celular no lleva dirección IP: solo transmite la señal entre los celulares y el Central Office.'),

  // ---------- 8 ----------
  H1('8. Pruebas y resultados'),
  P('Para validar la solución se realizaron las pruebas de la Tabla 6. Cada prueba indica qué se esperaba y si se cumplió; después se presentan las evidencias de cada una.'),
  TCAP('Resumen de pruebas realizadas'),
  table(['Prueba', 'Resultado esperado', 'Resultado'], [
    ['PC-ADMIN (VLAN 99) hace ping al Servidor Central (VLAN 30)', 'Responde: el enrutamiento entre VLANs funciona', 'Correcto'],
    ['Laptop conectada al ESS hace ping a su gateway', 'Responde con la misma red WiFi en todo el edificio', 'Correcto'],
    ['Empleado se conecta con usuario válido', 'Se conecta y recibe IP 192.168.1.x', 'Correcto'],
    ['Empleado con contraseña incorrecta', 'El RADIUS lo rechaza', 'Correcto'],
    ['Invitado hace ping a un servidor, antes y después de la ACL', 'Antes responde; después falla', 'Correcto'],
    ['Sensor IoT intenta llegar al Servidor Central y a un empleado', 'Bloqueado por ACL-IOT; solo llega al Servidor IoT', 'Correcto'],
    ['Puerta del almacén abierta (regla IoT)', 'Se enciende la luz automáticamente', 'Correcto'],
    ['Celular abre el portal de entregas', 'Se ve la página', 'Correcto'],
    ['Celular intenta llegar al RADIUS', 'Bloqueado por ACL-CELULAR', 'Correcto']
  ], [4000, 3800, 1560]),
  P('Todas las pruebas de la Tabla 6 dieron el resultado esperado. En las de seguridad, el resultado correcto es que la comunicación falle, porque eso demuestra que la ACL bloquea lo que debe bloquear.'),

  H2('8.1 Pruebas generales de conectividad (Simple PDU)'),
  ...extra('extra_pruebas_pdu.png', 'Resumen de pruebas con Simple PDU: todo exitoso excepto el visitante hacia el Servidor Central, bloqueado por la ACL',
    'Con la herramienta Simple PDU de Packet Tracer se enviaron pings de prueba entre distintos equipos. La Figura # resume los resultados.',
    'En la Figura #, las pruebas Successful son comunicaciones permitidas (por ejemplo, PC-ADMIN hacia el Servidor Central y los empleados hacia los servidores) y la prueba Failed es la de la laptop de visitante hacia el Servidor Central, que bloquea ACL-INVITADOS. El visitante sí llega a su gateway (R-CORE), porque la ACL lo permite para diagnóstico.'),
  ...captura('C05',
    'La Figura # muestra la prueba de enrutamiento entre VLANs desde PC-ADMIN.',
    'En la Figura #, PC-ADMIN, que está en la VLAN 99, hace ping a 192.168.3.12, en la VLAN 30, y recibe respuesta; además abre el portal de entregas en el navegador. Como están en VLANs distintas, el tráfico tuvo que pasar por el router: esto confirma que el router-on-a-stick funciona.'),
  ...captura('C07',
    'La Figura # muestra a LAP-EMPLEADO-1 conectada a la red WiFi del ESS, con un ping a su gateway, y la vista física del edificio.',
    'En la Figura #, la laptop recibe respuesta de 192.168.1.1 sin pérdidas, y en la vista física se ven los tres APs cubriendo el edificio. Como los tres APs anuncian la misma red con la misma seguridad, el cliente puede moverse entre ellos sin cambiar de red ni de IP. En Packet Tracer la cobertura de cada AP alcanza todo el plano, por lo que no se observa el cambio de AP; en un edificio real, el cliente se reasociaría al AP con mejor señal manteniendo su dirección.',
    'LAP-EMPLEADO-1 conectada al ESS: ping sin pérdidas a su gateway y vista física de los tres APs'),

  H2('8.2 Autenticación de empleados (802.1X / RADIUS)'),
  ...captura('C10',
    'La Figura # muestra una laptop de empleado conectada a INNOVA-CORP con un usuario válido.',
    'En la Figura #, la laptop obtuvo por DHCP la dirección 192.168.1.11, con gateway 192.168.1.1 y DNS 192.168.3.12, que pertenece a la VLAN 10 de empleados. Eso significa que el RADIUS aceptó sus credenciales y que la WLC la colocó en la VLAN correcta. A la derecha, la laptop hace ping al Servidor Central y recibe respuesta; el primer paquete se pierde porque el equipo todavía está averiguando la dirección física (ARP) del gateway, algo normal en el primer ping.'),
  ...captura('C11',
    'La Figura # muestra el intento de conexión con una contraseña incorrecta.',
    'En la Figura #, arriba se ve la laptop configurada para INNOVA-CORP con WPA2 (Enterprise), usuario mgarcia y una contraseña incorrecta; abajo, el resultado: "DHCP failed. APIPA is being used" y una dirección 169.254.x.x, que la computadora se pone sola cuando no logra conectarse. Es decir, el RADIUS rechazó las credenciales y la laptop nunca entró a la red. Esta es la ventaja de 802.1X frente a una clave compartida: el acceso depende de cada usuario y se puede quitar a una sola persona sin cambiar la clave de todos.'),

  H2('8.3 Aislamiento de invitados (ACL-INVITADOS)'),
  ...captura('C12',
    'La Figura # muestra un ping de la laptop de visitante hacia un servidor interno, antes de aplicar la ACL.',
    'En la Figura #, el ping responde: sin la ACL, un visitante puede alcanzar los servidores de la empresa. Este es precisamente el problema 2 de la Tabla 1.'),
  ...captura('C13',
    'La Figura # muestra el mismo ping después de aplicar ACL-INVITADOS en la subinterfaz G0/0.20.',
    'En la Figura #, el ping ya no responde: el router descarta el tráfico del visitante hacia la red interna. Estos son los paquetes que aparecen como coincidencias en la línea deny de la Figura 4.'),

  H2('8.4 Red IoT: segmentación y automatización'),
  ...extra('extra_acl_iot_pdu.png', 'ACL-IOT: el detector de humo llega al Servidor IoT, pero no al Servidor Central ni a las laptops de empleados',
    'Para limitar el alcance de los sensores se aplicó ACL-IOT en la subinterfaz G0/0.40. La Figura # muestra las pruebas con Simple PDU.',
    'En la Figura #, el detector de humo sí se comunica con el Servidor IoT (Successful), que es lo único que necesita, pero no llega al Servidor Central ni a las laptops de empleados (Failed). Así, si un sensor fuera comprometido, no podría usarse para atacar el resto de la red.'),
  ...captura('C17',
    'La Figura # muestra una regla de automatización en funcionamiento.',
    'En la Figura #, a la izquierda la puerta está cerrada y la luz apagada; a la derecha la puerta se abrió y el servidor encendió la luz automáticamente, como indica la regla "Puerta abierta → encender la luz" de la Tabla 2. En el panel del servidor se ven el estado Open de la puerta y la luz encendida.',
    'Regla IoT en acción: al abrir la puerta del almacén se enciende la luz automáticamente'),

  H2('8.5 Acceso móvil 4G (ACL-CELULAR)'),
  ...captura('C20',
    'La Figura # muestra el celular de un chofer abriendo el portal de entregas.',
    'En la Figura #, el celular, conectado por la red 4G, carga la página del Servidor Central usando su dirección IP. El tráfico viaja del celular a la torre, de la torre al Central Office y de ahí a R-CORE, que lo deja pasar porque ACL-CELULAR permite el portal web.'),
  ...captura('C21',
    'La Figura # muestra el mismo celular intentando hacer ping al servidor RADIUS.',
    'En la Figura #, el ping falla: ACL-CELULAR solo permite llegar al Servidor Central (web, DNS y ping) y niega todo lo demás. Así, un celular robado o perdido no puede alcanzar el resto de la red interna.'),

  // ---------- 9-10 ----------
  H1('9. Conclusiones'),
  P('La WLC centralizó la administración de los tres APs, que forman un ESS con las mismas redes WiFi en todo el edificio, y el uso de canales no traslapados evita la saturación del espectro. WPA2-Enterprise eliminó la clave compartida al autenticar a cada usuario contra RADIUS, y la combinación de VLAN y ACL garantizó que los visitantes no alcancen la red interna.'),
  P('La red de sensores IoT da telemetría y respuesta automática ante condiciones de riesgo para los insumos médicos, y la red 4G extiende la conectividad a la flotilla de forma controlada. El esquema de direccionamiento deja nueve subredes libres para crecimiento.'),
  H1('10. Recomendaciones para una implementación real'),
  LI('Usar WPA3-Enterprise y certificados (EAP-TLS) en lugar de usuario y contraseña.'),
  LI('Habilitar la banda de 5 GHz para tener más canales y menos interferencia.'),
  LI('Alimentar los APs con switches PoE.'),
  LI('Agregar un portal cautivo y límite de ancho de banda para invitados.'),
  LI('Usar VPN IPsec para la flotilla sobre la red del operador celular.'),
  LI('Agregar redundancia: una segunda WLC y un RADIUS secundario.'),

  H1('11. Referencias'),
  P('Las siguientes fuentes sustentan los estándares, protocolos y configuraciones usados en este proyecto (formato APA 7).'),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Bautista López, V. E., Sánchez López, A., León Chávez, M. Á. y Torres León, J. E. (s. f.). Programa de la asignatura ICCS 260 Redes inalámbricas. Facultad de Ciencias de la Computación, Benemérita Universidad Autónoma de Puebla.")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Calhoun, P., Montemurro, M. y Stanley, D. (2009). Control And Provisioning of Wireless Access Points (CAPWAP) Protocol Specification (RFC 5415). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc5415")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Cisco Networking Academy. (2020). CCNA: Switching, Routing, and Wireless Essentials (SRWE) v7. Cisco Systems.")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Cisco Systems. (s. f.). Cisco Packet Tracer. Cisco Networking Academy. https://www.netacad.com/cisco-packet-tracer")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Cisco Systems. (s. f.). Cisco Wireless Controller Configuration Guide. https://www.cisco.com/c/en/us/support/wireless/wireless-lan-controller-software/products-installation-and-configuration-guides-list.html")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Droms, R. (1997). Dynamic Host Configuration Protocol (RFC 2131). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2131")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("IEEE. (2020). IEEE Standard for Local and Metropolitan Area Networks: Port-Based Network Access Control (IEEE Std 802.1X-2020).")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("IEEE. (2021). IEEE Standard for Information Technology: Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications (IEEE Std 802.11-2020).")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("IEEE. (2022). IEEE Standard for Local and Metropolitan Area Networks: Bridges and Bridged Networks (IEEE Std 802.1Q-2022).")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Kurose, J. F. y Ross, K. W. (2021). Computer Networking: A Top-Down Approach (8.ª ed.). Pearson.")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J. y Lear, E. (1996). Address Allocation for Private Internets (RFC 1918). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc1918")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Rigney, C., Willens, S., Rubens, A. y Simpson, W. (2000). Remote Authentication Dial In User Service (RADIUS) (RFC 2865). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc2865")] }),
  new Paragraph({ spacing: { after: 120 }, indent: { left: 720, hanging: 720 }, children: [new TextRun("Tanenbaum, A. S., Feamster, N. y Wetherall, D. J. (2021). Computer Networks (6.ª ed.). Pearson.")] }),

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
