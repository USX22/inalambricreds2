// Pruebas automáticas de la app de estudio.
// Uso: node tests/app.test.js   (requiere Playwright con Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'app', 'index.html');
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; } else { fail++; console.log('FALLA:', name, extra); } };

function cfgLines(txt) {
  return txt.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('!'))
    .filter(l => !['enable', 'configure terminal', 'end', 'write memory', 'exit'].includes(l));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + '#ruta');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(300);

  // ---------- 1. Integridad de los datos ----------
  const data = await page.evaluate(() => {
    const r = [];
    const ids = new Set(LESSONS.map(l => l.id));
    LESSONS.forEach(l => {
      l.links.forEach(([id]) => { if (!ids.has(id)) r.push(`${l.id}: enlace a lección inexistente ${id}`); });
      l.steps.forEach((s, i) => { if (s.code && !CFG[s.code]) r.push(`${l.id} paso ${i + 1}: config ${s.code} no existe`); });
      l.quiz.forEach((q, i) => {
        if (!(q.a >= 0 && q.a < q.o.length)) r.push(`${l.id} quiz ${i + 1}: respuesta fuera de rango`);
        if (new Set(q.o).size !== q.o.length) r.push(`${l.id} quiz ${i + 1}: opciones repetidas`);
        if (!q.e) r.push(`${l.id} quiz ${i + 1}: sin explicación`);
      });
      l.focus.forEach(n => { if (!NODES[n]) r.push(`${l.id}: nodo ${n} no existe`); });
      if (!l.steps.length || !l.quiz.length || !l.say || !l.verify.length) r.push(`${l.id}: sección vacía`);
    });
    const inDays = DAYS.flatMap(d => d.lessons);
    LESSONS.forEach(l => { if (inDays.filter(x => x === l.id).length !== 1) r.push(`${l.id}: no está exactamente una vez en el calendario`); });
    RUB.forEach(x => { if (!LESSONS.some(l => l.rubk === x.k)) r.push(`criterio ${x.k} sin lecciones`); });
    if (RUB.reduce((a, x) => a + x.w, 0) !== 100) r.push('los pesos de la rúbrica no suman 100');
    if (SEGS.reduce((a, s) => a + s[1], 0) !== 1200) r.push('el plan de la exposición no suma 20 minutos');
    JOURNEYS.forEach(j => j.steps.forEach(([ns]) => ns.forEach(n => { if (!NODES[n]) r.push(`recorrido ${j.n}: nodo ${n}`); })));
    EDGES.forEach(([a, b]) => { if (!NODES[a] || !NODES[b]) r.push(`arista ${a}-${b}`); });
    return { r, lessons: LESSONS.length, quiz: LESSONS.reduce((a, l) => a + l.quiz.length, 0), steps: LESSONS.reduce((a, l) => a + l.steps.length, 0), dist: LESSONS.flatMap(l => l.quiz.map(q => q.a)) };
  });
  data.r.forEach(m => ok(false, 'datos', m));
  ok(data.lessons === 18, '18 lecciones');
  // Que la respuesta correcta no caiga siempre en la misma posición visible
  const shown = await page.evaluate(() => LESSONS.flatMap(l => l.quiz.map((q, i) => orderOf(l.id, i, q.o.length).indexOf(q.a))));
  const count = [0, 0, 0, 0]; shown.forEach(x => count[x]++);
  ok(Math.max(...count) / shown.length < 0.45, 'respuestas correctas repartidas entre las opciones', JSON.stringify(count));

  // ---------- 2. Las configuraciones de la app = las del repositorio ----------
  const cfg = await page.evaluate(() => CFG);
  const file = n => fs.readFileSync(path.join(ROOT, 'configs', n), 'utf8');
  const eqSet = (a, b, name) => {
    const A = new Set(a), B = new Set(b);
    const miss = [...B].filter(x => !A.has(x)), extra = [...A].filter(x => !B.has(x));
    ok(!miss.length && !extra.length, name, JSON.stringify({ faltan_en_app: miss, sobran_en_app: extra }));
  };
  eqSet(cfgLines(cfg.sw_core), cfgLines(file('SW-CORE.txt')), 'SW-CORE igual en app y repo');
  eqSet(cfgLines(cfg.sw_alm), cfgLines(file('SW-ALMACEN.txt')), 'SW-ALMACEN igual en app y repo');
  const rApp = ['r_base', 'r_dhcp', 'r_acl_inv', 'r_cel', 'r_acl_iot'].flatMap(k => cfgLines(cfg[k]));
  const rRepo = cfgLines(file('R-CORE.txt').replace(/^! ?(interface GigabitEthernet0\/0\.40| ip access-group ACL-IOT in| exit)$/gm, '$1'));
  eqSet(rApp, rRepo, 'R-CORE igual en app y repo (por bloques)');

  // ---------- 3. Cada vista se dibuja sin errores ni textos rotos ----------
  const hashes = ['#ruta', '#herramientas', '#defensa', '#rubrica', ...(await page.evaluate(() => LESSONS.map(l => '#leccion-' + l.id)))];
  for (const h of hashes) {
    await page.evaluate(x => location.hash = x, h); await page.waitForTimeout(150);
    const txt = await page.evaluate(() => document.getElementById('main').innerText);
    ok(txt.length > 200, `${h} tiene contenido`);
    ok(!/undefined|NaN|\$\{|\[object/.test(txt), `${h} sin textos rotos`, (txt.match(/.{0,30}(undefined|NaN|\$\{|\[object).{0,30}/) || [''])[0]);
  }
  for (const t of ['calc', 'acl', 'paquete', 'configs', 'tabla', 'diag', 'glosario']) {
    await page.evaluate(() => location.hash = '#herramientas'); await page.waitForTimeout(100);
    const b = await page.$(`[data-act="tool"][data-k="${t}"]`); ok(!!b, `herramienta ${t} existe`); if (b) { await b.click(); await page.waitForTimeout(100); }
  }
  // Enlaces internos válidos
  const badLinks = await page.evaluate(async () => {
    const valid = new Set(['#ruta', '#herramientas', '#defensa', '#rubrica', ...LESSONS.map(l => '#leccion-' + l.id)]);
    const bad = [];
    for (const h of [...valid]) { location.hash = h; await new Promise(r => setTimeout(r, 30));
      document.querySelectorAll('a[href^="#"]').forEach(a => { if (!valid.has(a.getAttribute('href'))) bad.push(h + ' → ' + a.getAttribute('href')); }); }
    return [...new Set(bad)];
  });
  ok(!badLinks.length, 'todos los enlaces internos llevan a una vista', badLinks.join(', '));

  // ---------- 4. Simulador de ACL (casos esperados) ----------
  const aclCases = [
    ['ACL-INVITADOS', '192.168.2.15', '192.168.3.12', 'icmp', '', 'DENEGADO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.1.11', 'tcp', '80', 'DENEGADO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.6.10', 'icmp', '', 'DENEGADO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.15.254', 'icmp', '', 'DENEGADO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.16.1', 'icmp', '', 'PERMITIDO'],
    ['ACL-INVITADOS', '0.0.0.0', '255.255.255.255', 'udp', '67', 'PERMITIDO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.2.1', 'icmp', '', 'PERMITIDO'],
    ['ACL-INVITADOS', '192.168.2.15', '192.168.2.1', 'tcp', '22', 'DENEGADO'],
    ['ACL-INVITADOS', '192.168.2.15', '8.8.8.8', 'udp', '53', 'PERMITIDO'],
    ['ACL-INVITADOS', '192.168.1.11', '192.168.3.12', 'icmp', '', 'Esta ACL no revisa este paquete.'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.12', 'tcp', '443', 'PERMITIDO'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.12', 'tcp', '80', 'PERMITIDO'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.12', 'udp', '53', 'PERMITIDO'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.12', 'tcp', '22', 'DENEGADO'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.11', 'tcp', '443', 'DENEGADO'],
    ['ACL-CELULAR', '192.168.6.10', '192.168.3.10', 'icmp', '', 'DENEGADO'],
    ['ACL-IOT', '192.168.4.12', '192.168.3.11', 'tcp', '80', 'PERMITIDO'],
    ['ACL-IOT', '192.168.4.12', '192.168.3.12', 'tcp', '80', 'DENEGADO'],
    ['ACL-IOT', '192.168.4.12', '192.168.4.1', 'icmp', '', 'PERMITIDO'],
  ];
  await page.evaluate(() => location.hash = '#herramientas'); await page.waitForTimeout(100);
  await page.click('[data-act="tool"][data-k="acl"]');
  for (const [acl, s, d, p, port, exp] of aclCases) {
    await page.selectOption('#aacl', acl); await page.fill('#asrc', s); await page.fill('#adst', d);
    await page.selectOption('#aproto', p); await page.fill('#aport', port);
    const v = (await page.textContent('#averdict')).trim();
    ok(v === exp, `ACL ${acl} ${s}→${d} ${p}/${port}`, `obtuvo "${v}", esperaba "${exp}"`);
  }

  // ---------- 5. Calculadora ----------
  await page.click('[data-act="tool"][data-k="calc"]');
  const calcCases = [
    ['192.168.2.30', '24', ['192.168.2.0/24', '192.168.2.255', '254', 'VLAN 20', '0.0.0.255']],
    ['192.168.0.0', '20', ['192.168.0.0/20', '255.255.240.0', '192.168.15.255', '4,094', '0.0.15.255']],
    ['192.168.9.1', '24', ['libre']],
    ['192.168.16.1', '24', ['Fuera de la red']],
    ['10.0.0.1', '30', ['10.0.0.0/30', '10.0.0.3', '2']],
  ];
  for (const [ip, pre, exps] of calcCases) {
    await page.fill('#cip', ip); await page.fill('#cpre', pre);
    const t = await page.textContent('#cout');
    exps.forEach(e => ok(t.includes(e), `calculadora ${ip}/${pre} muestra "${e}"`, t.slice(0, 200)));
  }
  await page.fill('#cip', '300.1.1.1'); ok((await page.textContent('#cout')).includes('IP válida'), 'calculadora avisa de IP inválida');

  // ---------- 6. Completar todo, recargar y verificar que se guarda ----------
  await page.evaluate(() => {
    LESSONS.forEach(l => { S.steps[l.id] = {}; l.steps.forEach((_, i) => S.steps[l.id][i] = true); S.quiz[l.id] = {}; l.quiz.forEach((q, i) => S.quiz[l.id][i] = q.a); });
    save();
  });
  await page.reload(); await page.evaluate(() => location.hash = '#rubrica'); await page.waitForTimeout(100);
  ok((await page.textContent('#main')).includes('100 / 100'), 'con todo terminado la rúbrica marca 100/100');
  await page.evaluate(() => location.hash = '#ruta'); await page.waitForTimeout(100);
  ok((await page.textContent('.faceplate')).includes('18/18'), 'los 18 LEDs quedan en verde');
  // Quiz por clic: una respuesta mala marca error y permite reintentar
  await page.evaluate(() => { localStorage.clear(); }); await page.reload();
  await page.evaluate(() => location.hash = '#leccion-subneteo'); await page.waitForTimeout(100);
  const wrong = await page.evaluate(() => { const q = LBY.subneteo.quiz[0]; return [...document.querySelectorAll('#q-0 .opt')].findIndex(b => b.textContent !== q.o[q.a]); });
  await page.click(`#q-0 .opt >> nth=${wrong}`);
  ok(!!(await page.$('#q-0 .exp.wrong')), 'respuesta incorrecta se marca en rojo');
  await page.click('#q-0 [data-act="retry"]');
  ok(!(await page.$('#q-0 .exp')), 'reintentar limpia la pregunta');
  // Glosario en las lecciones
  const terms = await page.$$('#main .term');
  ok(terms.length > 3, 'las lecciones marcan términos del glosario', String(terms.length));
  if (terms.length) { await terms[0].click(); ok(!!(await page.$('#gloss-pop:not([hidden])')), 'tocar un término muestra su definición'); }

  // ---------- 7. Celular y modo oscuro ----------
  for (const scheme of ['light', 'dark']) {
    const m = await browser.newPage({ viewport: { width: 375, height: 800 }, colorScheme: scheme });
    m.on('pageerror', e => errors.push(e.message));
    for (const h of hashes) {
      await m.goto(URL + h); await m.waitForTimeout(150);
      const over = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      ok(!over, `${h} sin desbordarse a lo ancho (${scheme})`);
    }
    if (scheme === 'dark') {
      const bg = await m.evaluate(() => getComputedStyle(document.body).backgroundColor);
      ok(bg !== 'rgb(242, 245, 246)', 'el fondo cambia en modo oscuro', bg);
    }
    await m.close();
  }

  ok(!errors.length, 'sin errores de JavaScript', errors.join(' | '));
  console.log(`\n${pass} pruebas correctas, ${fail} fallas.`);
  console.log(`Contenido: ${data.lessons} lecciones, ${data.steps} pasos, ${data.quiz} preguntas.`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
