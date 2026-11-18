// Riff: Lager bleibt sichtbar, Kaufen → Aufstellen, NEU-Band, in drei iPad-Ansichten.
//   node tests/riff.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  for (const ansicht of ['quer', 'hoch', 'klein']) {
    const t = await oeffne({ heute: '2026-10-19', ansicht });
    const { page } = t;
    await page.evaluate("neuerNutzer('Mia', 'finn'); cur().perlen = 600; gehe('riff');");
    await t.warte(400);
    const vh = await page.evaluate('innerHeight');
    const geo = async () => page.evaluate(`(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height) }; }; return { lager: r('.lager'), buehne: r('#buehne'), nav: r('.nav'), vw: innerWidth, vh: innerHeight, scroll: document.querySelector('.main').scrollHeight - document.querySelector('.main').clientHeight }; })()`);
    let g = await geo();
    check(`[${ansicht}] Lager komplett im Bild`, g.lager && g.lager.bottom <= g.vh && g.lager.top > 100, g);
    check(`[${ansicht}] Bühne hat sinnvolle Größe`, g.buehne && g.buehne.h > 250 && g.buehne.right <= g.vw, g);
    check(`[${ansicht}] Seite scrollt nicht`, g.scroll <= 2, g);
    await t.bild(`r1-leer-${ansicht}`);

    // Laden → kaufen → aufstellen
    await t.klick('[data-a="laden"]');
    await t.klick('[data-a="kaufen"][data-v="seegras"]');
    await t.warte(300);
    check(`[${ansicht}] Nach dem Kauf erscheint „Aufstellen“`, !!(await page.$('[data-a="dekoAufstellen"][data-v="seegras"]')));
    await t.bild(`r2-laden-${ansicht}`);
    await t.klick('[data-a="dekoAufstellen"][data-v="seegras"]');
    await t.warte(400);
    check(`[${ansicht}] Seegras steht im Riff`, (await page.evaluate("cur().riff.items.filter(i => i.ref === 'seegras').length")) === 1);
    check(`[${ansicht}] Werkzeugleiste an neuem Stück`, !!(await page.$('#werkzeug')));
    check(`[${ansicht}] Laden ist zu`, !(await page.$('.blatt')));

    // zweites Stück kaufen, im Lager aufheben und von dort aufstellen
    await t.klick('[data-a="laden"]');
    await t.klick('[data-a="kaufen"][data-v="truhe"]');
    await t.klick('[data-a="blattZu"]');
    await t.warte(300);
    const tile = await page.$('.rtile.neu');
    check(`[${ansicht}] Gekauftes im Lager mit NEU-Band`, !!tile);
    g = await geo();
    const tb = await tile.boundingBox();
    check(`[${ansicht}] Lager-Kachel voll sichtbar`, tb.y >= 0 && tb.y + tb.height <= g.vh && tb.x >= 0 && tb.x + tb.width <= g.vw, { tb, vh: g.vh });
    await t.bild(`r3-lager-${ansicht}`);
    await tile.click();
    await t.warte(300);
    check(`[${ansicht}] Truhe aus dem Lager aufgestellt`, (await page.evaluate("cur().riff.items.filter(i => i.ref === 'truhe').length")) === 1 && !(await page.$('.rtile.neu')));
    // eigene Figur ins Riff
    await page.evaluate("cur().riff.items.length; riffSetze('fig', 'finn'); render();");
    await t.warte(300);
    await t.bild(`r4-gefuellt-${ansicht}`);
    check(`[${ansicht}] Keine Fehler`, t.fehler.length === 0, t.fehler);
    await t.ende();
  }
  console.log(`\nRiff: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
