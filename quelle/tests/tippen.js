// Tipp-Modus: Prüflogik (Einzelfälle) und ein echter Durchlauf im Browser.
//   node tests/tippen.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'hoch' });
  const { page } = t;
  const pr = (eingabe, loes, artikel) => page.evaluate((e, l, a) => tippPruefung(e, { loes: l, artikel: a || null }).art, eingabe, loes, artikel);
  const faelle = [
    ['move', 'to move', 'richtig'], ['to move', 'to move', 'richtig'], ['Candle', 'candle', 'richtig'], ['candel', 'candle', 'fast'], ['chocolat', 'chocolate', 'fast'], ['xyz', 'candle', 'falsch'], ['', 'candle', 'falsch'],
    ['classe', 'la classe', 'artikel', 'la'], ['La Classe', 'la classe', 'richtig', 'la'], ['a plus', 'À plus !', 'akzent'], ['ca va', 'Ça va ?', 'akzent'], ['A plus!', 'À plus !', 'akzent'],
    ['mitnehmen', 'aufheben; mitnehmen; abholen', 'richtig'], ['bewegen', '(sich) bewegen', 'richtig'], ['sich bewegen', '(sich) bewegen', 'richtig'],
    ["je m'appelle", "je m'appelle + *Name*", 'richtig'], ['je m’appelle', "je m'appelle + *Name*", 'richtig'], ['it’s turn', 'It’s … turn.', 'richtig'], ['Hallo', 'Hallo! *auch:* Tschüss!', 'richtig'],
    ['kerze', 'Kerze', 'richtig'], ['schuerze', 'Schürze', 'falsch'], ['schurze', 'Schürze', 'akzent'],
    // Leerzeichen, Satzzeichen und Sonderzeichen zählen nicht
    ['jemappelle', "je m’appelle + *Name*", 'richtig'], ['je    m appelle', "je m’appelle + *Name*", 'richtig'], ["je m'appelle Mia", "je m’appelle + *Name*", 'richtig'],
    ['Je m’appelle Mia.', "je m’appelle + *Name*", 'richtig'], ['jem appelle, Mia!', "je m’appelle + *Name*", 'richtig'], ['je m’appelle +', "je m’appelle + *Name*", 'richtig'],
    ['je m’appelle + Name', "je m’appelle + *Name*", 'richtig'], ['je m’apelle Mia', "je m’appelle + *Name*", 'fast'], ['ich heiße Mia', 'ich heiße + *Name*', 'richtig'], ['ich heisse', 'ich heiße + *Name*', 'akzent'],
    ['en France', 'en + *Land/Region*', 'richtig'], ['en', 'en + *Land/Region*', 'richtig'], ['english', 'en + *Land/Region*', 'falsch'], ['à Paris', 'à + *Stadt/Dorf*', 'richtig'], ['a Paris', 'à + *Stadt/Dorf*', 'akzent'],
    ["j'ai 11 ans", 'j’ai… ans', 'richtig'], ['j ai onze ans', 'j’ai… ans', 'richtig'], ['jai ans', 'j’ai… ans', 'richtig'], ["j'ai 11", 'j’ai… ans', 'falsch'], ['ich bin 11 Jahre alt', 'ich bin … Jahre alt', 'richtig'],
    ["it's my turn", 'It’s … turn.', 'richtig'], ['Mia ist dran', '… ist dran.', 'richtig'], ['ist dran', '… ist dran.', 'richtig'], ['ich mag Katzen nicht', 'ich mag … nicht, keinen/keine', 'richtig'], ['keine', 'ich mag … nicht, keinen/keine', 'richtig'],
    ['Tu aimes les chats', 'Tu aimes… ?', 'richtig'], ['Magst du Pizza', 'Magst du …?', 'richtig'],
    ['peut être', 'peut-être', 'richtig'], ['peutetre', 'peut-être', 'akzent'], ['  c a n d l e  ', 'candle', 'richtig'], ['candle!!!', 'candle', 'richtig'], ['wie gehts', 'Wie geht’s?', 'richtig'], ['Wie geht es dir', 'Wie geht’s?', 'falsch'],
    ['Geht’s dir gut', 'Wie geht’s? / Geht’s (dir) gut?', 'richtig'], ['geht s gut', 'Wie geht’s? / Geht’s (dir) gut?', 'richtig'], ['jdm helfen', 'jdm. helfen', 'richtig'], ['helfen', 'jdm. helfen', 'richtig'],
    ['bonjour .', 'Bonjour !', 'richtig'], ['Bonjour,', 'Bonjour !', 'richtig'], ['b o n j o u r', 'Bonjour !', 'richtig'], ['la  classe .', 'la classe', 'richtig', 'la'], ['l a classe', 'la classe', 'richtig', 'la']
  ];
  for (const [e, l, erw, art] of faelle) { const r = await pr(e, l, art); check(`tippen "${e}" vs "${l}" → ${erw}`, r === erw, r); }

  // Durchlauf im Browser
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await page.evaluate(`(() => { const u = cur(); window.PF = neuesProjekt(u, { name: 'Französisch', sp: 'fr', lessons: ['F01'], sets: ['DE-FR'], end: '2026-11-02', ziel: 3, ruhe: [] }); u.set.sp = 'fr'; u.set.modus = 'tippen'; u.set.sprechen = 'knopf'; start(); })()`);
  await t.warte(300);
  await page.evaluate("AKT.lernStart({ dataset: { v: PF.id } })");
  await page.waitForSelector('#tippFeld', { timeout: 8000 });
  await t.warte(400);
  await t.bild('t1-tippen-leer');
  const cid = await page.evaluate('LS.cid');
  const loes = await page.evaluate('karteText(LS.cid).loes');
  await page.type('#tippFeld', 'xyz');
  await t.klick('.akzente button:nth-child(1)');
  const wert = await page.$eval('#tippFeld', e => e.value);
  check('Akzent-Taste fügt Zeichen ein', wert === 'xyzé', wert);
  await t.klick('[data-a="tippPruefen"]');
  await t.warte(900);
  await t.bild('t2-tippen-falsch');
  check('Falsche Antwort zeigt Lösung', /Richtig ist/.test(await page.$eval('.tippurteil', e => e.textContent)));
  check('Falsche Antwort zeigt auch die eigene Eingabe (klein)', /Du hast geschrieben:\s*xyzé/.test(await page.$eval('.tippurteil .deins', e => e.textContent)));
  const mk = (e, l, a) => page.evaluate((e, l, a) => eingabeMarkiert(e, l, a || null), e, l, a);
  check('Vergleich: Fehlerbuchstabe wird markiert', (await mk('salot', 'Salut')) === 'sal<mark>o</mark>t', await mk('salot', 'Salut'));
  check('Vergleich: richtig geschrieben ohne Markierung', (await mk('Salut', 'Salut !')) === 'Salut', await mk('Salut', 'Salut !'));
  check('Vergleich: Dreher wird sichtbar', /<mark>/.test(await mk('candel', 'candle')));
  check('Vergleich: Name hinter dem Pflichtteil wird nicht markiert', (await mk("je m'appelle Mia", "je m’appelle + *Name*")) === "je m'appelle Mia", await mk("je m'appelle Mia", "je m’appelle + *Name*"));
  check('Vergleich: Leerzeichen und Satzzeichen werden nie markiert', !/<mark>[\s.,!?'’-]+<\/mark>/.test(await mk('s a l o t !', 'Salut !')), await mk('s a l o t !', 'Salut !'));
  check('Vergleich: leere Eingabe ergibt nichts', (await mk('', 'candle')) === '');
  const roh = await mk('<b>', 'candle');
  check('Vergleich: Zeichen werden maskiert (kein HTML)', /&lt;/.test(roh) && !/<b>/.test(roh), roh);
  await t.klick('[data-a="quizWeiter"]');
  await page.waitForSelector('#tippFeld', { timeout: 5000 });
  await t.warte(400);
  const loes2 = (await page.evaluate('karteText(LS.cid).loes')).replace(/\*/g, '');
  await page.type('#tippFeld', loes2);
  await page.keyboard.press('Enter');
  await t.warte(900);
  await t.bild('t3-tippen-richtig');
  check('Richtige Antwort: grün', await page.$eval('.tippurteil', e => e.classList.contains('gut')), { loes2, urteil: await page.$eval('.tippurteil', e => e.textContent) });
  const stand = await page.evaluate('({ n: cur().stats.antworten, ok: cur().stats.richtig })');
  check('Antworten wurden verbucht', stand.n === 2 && stand.ok === 1, stand);
  void cid; void loes;
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  console.log(`\nTippen: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
