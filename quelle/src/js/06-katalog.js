'use strict';
// ---------- Katalog: Figuren (Album), Riff-Deko, Abzeichen ----------
const PAL = {
  blau: { m: '#4FA3D8', d: '#2D78B0', b: '#E8F6FF', a: '#FFC83D' },
  tuerkis: { m: '#2CC0C0', d: '#1B8F9A', b: '#E3FAF6', a: '#FF8A5B' },
  koralle: { m: '#FF7A59', d: '#D2512F', b: '#FFE9DD', a: '#FFD866' },
  rosa: { m: '#FF9DC2', d: '#E0679A', b: '#FFE8F1', a: '#8E6BE0' },
  gelb: { m: '#FFD25A', d: '#E0A100', b: '#FFF4CF', a: '#FF7A59' },
  gruen: { m: '#5CC98A', d: '#2F9C66', b: '#E4F8EA', a: '#FFD25A' },
  violett: { m: '#8E6BE0', d: '#6445B8', b: '#EEE7FF', a: '#FFD866' },
  grau: { m: '#8DA2BC', d: '#5E7694', b: '#EEF3F9', a: '#FF8A5B' },
  orange: { m: '#FF8A2B', d: '#D2631A', b: '#FFE9CF', a: '#FFFFFF' },
  nacht: { m: '#34497F', d: '#1F2F58', b: '#D8E3FF', a: '#7DF9FF' },
  orca: { m: '#1E2B45', d: '#0F1830', b: '#FFFFFF', a: '#FFC83D' },
  gold: { m: '#FFC83D', d: '#D69B00', b: '#FFF3C4', a: '#FF7A59' },
  purpur: { m: '#5B3C9A', d: '#3C2670', b: '#C9B8F0', a: '#FFE680' },
  rot: { m: '#E5484D', d: '#B02A30', b: '#FFD9D6', a: '#FFD866' },
  mint: { m: '#7FE0C4', d: '#35B393', b: '#EAFFF8', a: '#FF9DC2' },
  aurora: { m: '#6EE7D8', d: '#2A9DB8', b: '#F2FFFE', a: '#FF9DEB' }
};
// Jede Seltenheit lebt in einer Tiefenzone: Muscheln enthalten nur Wesen, deren Zone das Kind schon erreicht hat (Tauchtiefe in Metern, siehe tiefeMeter).
const RAR = [
  { id: 0, name: 'Gewöhnlich', farbe: '#7FA6BD', gew: 62, serie: 'Flachwasser-Freunde', tiefe: 0, zone: 'Sonnenlicht-Zone' },
  { id: 1, name: 'Selten', farbe: '#2F8FE0', gew: 25, serie: 'Riff-Helden', tiefe: 10, zone: 'Korallenriff' },
  { id: 2, name: 'Episch', farbe: '#8E5BE0', gew: 10, serie: 'Tiefsee-Wesen', tiefe: 100, zone: 'Tiefsee' },
  { id: 3, name: 'Legendär', farbe: '#F0A800', gew: 3, serie: 'Legenden der Gezeiten', tiefe: 400, zone: 'Abgrund' }
];
const FIG = {};
[
  // Flachwasser-Freunde (gewöhnlich) – die ersten acht sind als Startbild wählbar
  ['finn', 'Finn Flosse', 'hai', 'blau', null, 0, 'Schwimmt jeden Morgen eine Vokabelrunde, bevor das Frühstück kommt.', 1],
  ['mimo', 'Mimo', 'clown', 'orange', 'maske', 0, 'Hat die Taucherbrille immer auf. Man weiß ja nie.', 1],
  ['knips', 'Knips', 'krebs', 'rot', 'brille', 0, 'Zählt alles zweimal und knipst gern dazwischen.', 1],
  ['stella', 'Stella', 'seestern', 'rosa', 'schleife', 0, 'Kann fünf Dinge gleichzeitig. Meistens Vokabeln.', 1],
  ['pip', 'Pip', 'seepferd', 'gelb', null, 0, 'Klein, schnell und immer ein bisschen aufgeregt.', 1],
  ['bubbo', 'Bubbo', 'kugel', 'gruen', null, 0, 'Wenn er sich freut, wird er rund. Er freut sich oft.', 1],
  ['mokka', 'Mokka', 'seehund', 'grau', null, 0, 'Pflegt seinen Schnurrbart und seinen Wortschatz.', 1],
  ['wella', 'Wella', 'manta', 'tuerkis', null, 0, 'Gleitet durchs Wasser, als hätte sie alle Zeit der Welt.', 1],
  ['wobbel', 'Wobbel', 'qualle', 'rosa', null, 0, 'Wackelt beim Denken. Das hilft angeblich.'],
  ['tuck', 'Tuck', 'schildkroete', 'gruen', 'blume', 0, 'Hat es nie eilig und kommt trotzdem überall an.'],
  ['nixi', 'Nixi', 'delfin', 'tuerkis', 'schleife', 0, 'Pfeift Vokabeln als Melodien.'],
  ['okko', 'Okko', 'oktopus', 'violett', 'brille', 0, 'Acht Arme, acht Karteikästen.'],
  // Riff-Helden (selten)
  ['knurr', 'Kapitän Knurr', 'hai', 'grau', 'piraten', 1, 'Brummt viel, hat ein weiches Herz und eine geheime Schatzkarte.'],
  ['nero', 'Nero', 'orca', 'orca', 'kopfhoerer', 1, 'Hört nur Meeresrauschen-Beats.'],
  ['lumi', 'Lumi', 'qualle', 'mint', 'stern', 1, 'Leuchtet, wenn eine Antwort stimmt.'],
  ['brisa', 'Brisa', 'delfin', 'rosa', 'blume', 1, 'Springt vor Freude aus dem Wasser.'],
  ['zacko', 'Zacko', 'krebs', 'orange', 'piraten', 1, 'Fechtmeister der Vokabel-Duelle.'],
  ['corvin', 'Corvin', 'seepferd', 'violett', 'zylinder', 1, 'Der Gentleman des Riffs.'],
  ['tilda', 'Tilda', 'schildkroete', 'tuerkis', 'kopfhoerer', 1, 'Trägt die Perlenkette ihrer Oma.'],
  ['rocco', 'Rocco', 'seehund', 'blau', 'maske', 1, 'Taucht tiefer als alle anderen Robben.'],
  ['perla', 'Perla', 'oktopus', 'rosa', 'perle', 1, 'Hat immer eine Perle zur Hand, für richtige Antworten.'],
  ['blubb', 'Doktor Blubb', 'kugel', 'gelb', 'brille', 1, 'Kennt jede Vokabel und alle Blasen.'],
  // Tiefsee-Wesen (episch)
  ['glimmer', 'Glimmer', 'angler', 'purpur', null, 2, 'Sein Licht zeigt den Weg durch die dunkelste Tiefe.'],
  ['nox', 'Nox', 'manta', 'nacht', 'stern', 2, 'Fliegt lautlos durch die Dämmerzone.'],
  ['aurelia', 'Aurelia', 'qualle', 'violett', 'krone', 2, 'Königin des Leuchtens.'],
  ['thalor', 'Thalor', 'narwal', 'blau', null, 2, 'Sein Horn weist immer nach vorn.'],
  ['abyss', 'Abyss', 'oktopus', 'nacht', 'maske', 2, 'Kennt das Meer bis zum Grund.'],
  ['kora', 'Kora', 'seestern', 'orange', 'blume', 2, 'Hat auf jedem Arm eine andere Lieblingsvokabel.'],
  ['basalt', 'Basalt', 'wal', 'grau', 'schal', 2, 'Singt tiefe Lieder, die man im Bauch spürt.'],
  ['vega', 'Vega', 'delfin', 'nacht', 'stern', 2, 'Folgt den Sternen, auch unter Wasser.'],
  // Legenden der Gezeiten (legendär)
  ['tidalia', 'Tidalia', 'manta', 'aurora', 'krone', 3, 'Ruft die Strömung, und die Strömung antwortet.'],
  ['lenni', 'Lenni der Große', 'wal', 'gold', 'krone', 3, 'Der größte Wal im ganzen Wortriff. Und der freundlichste.'],
  ['kai', 'Kraken-Kai', 'oktopus', 'aurora', 'piraten', 3, 'Acht Arme, tausend Geschichten.'],
  ['zephyr', 'Sternenhai Zephyr', 'hai', 'gold', 'kopfhoerer', 3, 'Schwimmt durchs Sternenlicht der Tiefsee.']
].forEach(([id, name, art, pal, acc, rar, text, start]) => { FIG[id] = { id, name, art, pal, acc, rar, text, start: !!start, serie: RAR[rar].serie }; });

// Entwicklung: Stern 1–2 = Stufe 1, Stern 3–4 = Stufe 2, Stern 5 = Stufe 3 (gezeichnet in 05-arten). Der Beiname gehört zur Art.
const figStufe = stern => (stern >= 5 ? 3 : stern >= 3 ? 2 : 1);
const stufeVon = (u, id) => (u && u.owned && u.owned[id] ? figStufe(u.owned[id].stern) : 1);
const BEINAME = {
  hai: ['Wellenjäger', 'Sturmflosse'], orca: ['Schattenwal', 'Meeresdonner'], delfin: ['Sprungkünstler', 'Wellenfürst'], manta: ['Gleitflügel', 'Himmelsgleiter'],
  schildkroete: ['Panzerweiser', 'Ur-Panzer'], seepferd: ['Funkelreiter', 'Kronenreiter'], qualle: ['Leuchtschleier', 'Glanzgestirn'], oktopus: ['Tintenmeister', 'Tintenkaiser'],
  kugel: ['Großkugel', 'Sternenkugel'], clown: ['Streifenstar', 'Riff-Legende'], angler: ['Lichtfänger', 'Tiefenlicht'], krebs: ['Scherenmeister', 'Scheren-Champion'],
  narwal: ['Hornträger', 'Polarlicht'], seestern: ['Glitzerstern', 'Sternenwunder'], wal: ['Tiefensänger', 'Ozeanstimme'], seehund: ['Wellenhüpfer', 'Robben-Champion']
};
const figName = (id, stufe) => (stufe > 1 ? `${FIG[id].name} – ${BEINAME[FIG[id].art][stufe - 2]}` : FIG[id].name);
const FIGSVG = {};
function figSvg(id, stufe) {
  stufe = stufe || stufeVon(cur(), id);
  const key = id + stufe;
  if (FIGSVG[key]) return FIGSVG[key];
  const f = FIG[id];
  return (FIGSVG[key] = ART.figur(f.art, PAL[f.pal], f.acc, id, stufe));
}
const figIds = () => Object.keys(FIG);
const figNachSeltenheit = r => figIds().filter(i => FIG[i].rar === r);
const STARTER = figIds().filter(i => FIG[i].start);

// ---------- Riff-Deko ----------
const DEKO = {};
(() => {
  const W = b => `<svg class="dk" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${b}</g></svg>`;
  const T = ART.T;
  const defs = [
    ['seegras', 'Seegras', 25, W(`${T('M40 112 C30 84 50 66 38 38', 9, '#3FBF7F')}${T('M58 112 C58 80 70 62 62 22', 10, '#2FA66A')}${T('M78 112 C84 86 70 70 82 46', 9, '#5CD08F')}`)],
    ['rotkoralle', 'Rote Koralle', 35, W(`${T('M60 112 V64 M60 84 L34 58 M60 70 L88 40 M88 40 L98 22 M34 58 L30 36 M60 64 L56 30', 12, '#FF6B5E')}<circle cx="30" cy="34" r="6" fill="#FF9A8F"/><circle cx="98" cy="20" r="6" fill="#FF9A8F"/><circle cx="56" cy="28" r="6" fill="#FF9A8F"/>`)],
    ['faecher', 'Fächerkoralle', 40, W(`<path d="M60 112 L60 92" stroke-width="9"/><path d="M60 94 C20 84 10 40 28 20 C44 30 52 24 60 14 C68 24 76 30 92 20 C110 40 100 84 60 94Z" fill="#FF8FC0"/><path d="M60 92 V28 M60 90 L36 40 M60 90 L84 40 M60 90 L24 62 M60 90 L96 62" fill="none" stroke="#E0679A" stroke-width="3"/>`)],
    ['hirn', 'Hirnkoralle', 40, W(`<path d="M18 112 C10 70 34 38 62 38 C90 38 112 70 102 112Z" fill="#FFD25A"/><path d="M34 100 C30 80 42 62 56 66 M54 104 C48 84 62 70 74 76 M76 104 C74 90 84 82 90 88" fill="none" stroke="#E0A100" stroke-width="4"/>`)],
    ['anemone', 'Seeanemone', 50, W(`<path d="M32 112 C28 96 36 86 40 82 L80 82 C84 86 92 96 88 112Z" fill="#8E6BE0"/>${[28, 40, 52, 64, 76, 88].map((x, i) => T(`M${x + 2} 84 C${x - 8 + (i % 2) * 14} 62 ${x + 10 - (i % 2) * 14} 46 ${x + (i - 2.5) * 5} 28`, 6, '#C9A8FF')).join('')}${[28, 52, 76].map((x, i) => `<circle cx="${x + (i - 1) * 6 - 2}" cy="28" r="5" fill="#FF9DC2"/>`).join('')}`)],
    ['muschel', 'Perlmuschel', 55, W(`<path d="M12 86 C10 44 36 22 60 22 C84 22 110 44 108 86 C96 100 24 100 12 86Z" fill="#FFB38A"/><path d="M60 24 V98 M38 30 L34 94 M82 30 L86 94 M22 48 L26 90 M98 48 L94 90" fill="none" stroke="#E0784A" stroke-width="3"/><circle cx="60" cy="86" r="14" fill="#FFF7EC"/><path d="M54 80 a8 8 0 0 1 8 -6" fill="none" stroke="#fff" stroke-width="3.5"/>`)],
    ['truhe', 'Schatztruhe', 110, W(`<rect x="14" y="56" width="92" height="52" rx="8" fill="#B77A3C"/><path d="M14 70 C14 36 106 36 106 70Z" fill="#CF9150"/><rect x="14" y="66" width="92" height="9" fill="#FFC83D"/><rect x="50" y="62" width="20" height="26" rx="5" fill="#FFC83D"/><circle cx="60" cy="74" r="3.5" fill="${INK}" stroke="none"/><path d="M24 98 H96" stroke="#8E5A24" stroke-width="3" fill="none"/><circle cx="34" cy="44" r="5" fill="#FFE680" stroke-width="3"/><circle cx="52" cy="38" r="4" fill="#FFE680" stroke-width="3"/>`)],
    ['anker', 'Alter Anker', 70, W(`${T('M60 28 V96', 9, '#7A8CA3')}${T('M34 52 H86', 9, '#7A8CA3')}${T('M22 78 C26 100 46 108 60 108 C74 108 94 100 98 78', 9, '#7A8CA3')}<circle cx="60" cy="22" r="10" fill="none" stroke-width="7"/>`)],
    ['amphore', 'Amphore', 65, W(`<path d="M44 14 H76 L72 30 C94 40 98 92 80 108 H40 C22 92 26 40 48 30Z" fill="#D9824B"/><path d="M30 60 H90 M32 78 H88" fill="none" stroke="#FFD9B0" stroke-width="5"/><path d="M44 18 C28 20 28 46 40 50 M76 18 C92 20 92 46 80 50" fill="none" stroke-width="5"/>`)],
    ['laterne', 'Tiefsee-Laterne', 90, W(`<circle cx="60" cy="58" r="40" fill="#FFE680" opacity=".35" stroke="none"/><rect x="40" y="38" width="40" height="52" rx="12" fill="#BDF0F7"/><circle cx="60" cy="64" r="11" fill="#FFE680"/><rect x="36" y="30" width="48" height="12" rx="5" fill="#34497F"/><rect x="36" y="88" width="48" height="12" rx="5" fill="#34497F"/><path d="M50 30 C50 14 70 14 70 30" fill="none" stroke-width="5"/>`)],
    ['bogen', 'Steinbogen', 120, W(`<path d="M8 110 V60 C8 14 112 14 112 60 V110 H88 V62 C88 40 32 40 32 62 V110Z" fill="#9FB3C8"/><path d="M20 86 H30 M92 76 H102 M16 66 H28 M96 94 H106" fill="none" stroke="#6F849C" stroke-width="3.5"/><path d="M10 110 C14 92 26 92 28 110" fill="#3FBF7F"/>`)],
    ['blasen', 'Blasensäule', 60, W(`<circle class="b1" cx="60" cy="96" r="14" fill="#E3F7FF"/><circle class="b2" cx="46" cy="68" r="10" fill="#E3F7FF"/><circle class="b3" cx="70" cy="46" r="8" fill="#E3F7FF"/><circle class="b4" cx="52" cy="26" r="6" fill="#E3F7FF"/><circle class="b5" cx="76" cy="14" r="4" fill="#E3F7FF"/><path d="M52 92 a8 8 0 0 1 4 -8 M42 64 a5 5 0 0 1 3 -4" fill="none" stroke="#fff" stroke-width="3"/>`)],
    ['helm', 'Taucherhelm', 150, W(`<path d="M20 112 C20 94 30 84 60 84 C90 84 100 94 100 112Z" fill="#C98A3A"/><circle cx="60" cy="52" r="40" fill="#E0A04A"/><circle cx="60" cy="52" r="22" fill="#BDF0F7"/><path d="M48 46 C52 40 58 38 64 40" fill="none" stroke="#fff" stroke-width="4"/><circle cx="26" cy="52" r="6" fill="#F3C47A" stroke-width="3"/><circle cx="94" cy="52" r="6" fill="#F3C47A" stroke-width="3"/><circle cx="60" cy="14" r="5" fill="#F3C47A" stroke-width="3"/>`)],
    ['leuchtturm', 'Mini-Leuchtturm', 220, W(`<path d="M42 110 L48 40 H72 L78 110Z" fill="#fff"/><path d="M45 86 H75 L77 104 H43Z M48 52 H72 L74 70 H46Z" fill="#E5484D"/><rect x="44" y="24" width="32" height="16" rx="4" fill="#FFE680"/><path d="M42 24 H78 L60 8Z" fill="#E5484D"/><path d="M30 32 L8 24 M30 38 L8 40 M90 32 L112 24 M90 38 L112 40" fill="none" stroke="#FFE680" stroke-width="4"/>`)],
    ['kelp', 'Kelpwald', 55, W(`${T('M28 114 C14 94 42 78 26 54 C16 38 34 24 28 8', 9, '#3FBF7F')}${T('M60 114 C46 92 76 72 58 48 C48 32 68 18 60 4', 10, '#2FA66A')}${T('M92 114 C106 96 78 80 96 58 C106 42 88 28 94 10', 9, '#5CD08F')}<ellipse cx="22" cy="86" rx="9" ry="4.5" transform="rotate(-28 22 86)" fill="#5CD08F"/><ellipse cx="40" cy="70" rx="9" ry="4.5" transform="rotate(24 40 70)" fill="#3FBF7F"/><ellipse cx="72" cy="86" rx="9" ry="4.5" transform="rotate(-24 72 86)" fill="#5CD08F"/><ellipse cx="50" cy="40" rx="8" ry="4" transform="rotate(26 50 40)" fill="#2FA66A"/><circle cx="36" cy="46" r="4.5" fill="#BFF0A0" stroke-width="3"/><circle cx="84" cy="70" r="4.5" fill="#BFF0A0" stroke-width="3"/>`)],
    ['ball', 'Wasserball', 45, W(`<ellipse cx="60" cy="108" rx="30" ry="5" fill="#000" opacity=".14" stroke="none"/><circle cx="60" cy="64" r="40" fill="#fff"/><path d="M60 64 L60 24 A40 40 0 0 1 94.6 44Z" fill="#E5484D" stroke="none"/><path d="M60 64 L94.6 84 A40 40 0 0 1 60 104Z" fill="#4FA3D8" stroke="none"/><path d="M60 64 L25.4 84 A40 40 0 0 1 25.4 44Z" fill="#FFC83D" stroke="none"/><circle cx="60" cy="64" r="40" fill="none"/><circle cx="60" cy="64" r="6" fill="#fff" stroke-width="3.5"/><path d="M38 48 a26 26 0 0 1 16 -14" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>`)],
    ['reifen', 'Sprungreifen', 95, W(`<ellipse cx="60" cy="112" rx="40" ry="6" fill="#9FB3C8"/>${T('M38 112 L54 78', 8, '#8E5A24')}${T('M82 112 L66 78', 8, '#8E5A24')}<circle cx="60" cy="50" r="34" fill="none" stroke-width="18"/><circle cx="60" cy="50" r="34" fill="none" stroke="#FF6B5E" stroke-width="9"/><circle cx="60" cy="50" r="34" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="13 13"/><path d="M36 32 a30 30 0 0 1 14 -10" fill="none" stroke="#fff" stroke-width="3.5" opacity=".7"/>`)],
    ['hoehle', 'Felshöhle', 140, W(`<path d="M4 112 C4 58 30 26 62 26 C94 26 116 58 116 112Z" fill="#8FA2B8"/><path d="M20 60 C30 50 38 50 46 56 M78 44 C90 46 98 54 100 64 M24 92 H34 M90 86 H102" fill="none" stroke="#6F849C" stroke-width="3.5"/><path d="M34 112 C34 78 52 66 62 66 C72 66 90 78 90 112Z" fill="#0F1830"/><g class="augen" stroke="none"><ellipse cx="53" cy="94" rx="5.5" ry="7" fill="#FFE680"/><ellipse cx="72" cy="94" rx="5.5" ry="7" fill="#FFE680"/><circle cx="54" cy="95" r="2.6" fill="#0F1830"/><circle cx="73" cy="95" r="2.6" fill="#0F1830"/></g><path d="M10 82 C14 70 28 70 32 80 C24 78 18 80 10 82Z" fill="#5CC98A"/><path d="M88 48 C94 40 106 44 106 54 C100 50 94 50 88 48Z" fill="#5CC98A"/>`)],
    ['wrack', 'Piratenwrack', 190, W(`<g transform="rotate(-8 60 96)">${T('M60 84 L56 14', 7, '#8E5A24')}<path d="M57 22 C38 26 30 46 36 68 L46 62 L52 70 L58 62Z" fill="#F3E6C4"/><path d="M40 40 l8 6 M36 54 l10 4" fill="none" stroke-width="2.6"/><path d="M56 14 L84 22 L56 34Z" fill="#1B2433"/><circle cx="66" cy="23" r="4" fill="#fff" stroke-width="2"/><path d="M62 29 l10 -8 M72 29 l-10 -8" stroke="#fff" stroke-width="2.4"/><path d="M10 78 L110 78 C108 98 94 110 72 110 L48 110 C26 110 12 98 10 78Z" fill="#B77A3C"/><path d="M16 90 H104 M24 100 H96" fill="none" stroke="#8E5A24" stroke-width="3"/><rect x="8" y="72" width="104" height="9" rx="4" fill="#8E5A24"/><circle cx="40" cy="92" r="6" fill="#BDF0F7" stroke-width="3"/><circle cx="66" cy="92" r="6" fill="#BDF0F7" stroke-width="3"/>${T('M100 78 C104 66 96 60 102 50', 6, '#3FBF7F')}</g>`)]
  ];
  defs.forEach(([id, name, preis, svg]) => { DEKO[id] = { id, name, preis, svg }; });
})();
const dekoSvg = id => DEKO[id].svg;

// ---------- Wohlfühl-Plätze: Welcher Freund mag welchen Gegenstand im Riff? (erster Eintrag = Lieblingsplatz) ----------
// Steht der Freund in der Nähe, fühlt er sich wohl, freut sich und besucht den Platz auch beim Schwimmen immer wieder.
const LIEBLING = {
  finn: ['blasen', 'leuchtturm'], mimo: ['anemone', 'hirn'], knips: ['amphore', 'hirn'], stella: ['rotkoralle', 'faecher'], pip: ['seegras', 'kelp'], bubbo: ['hirn', 'rotkoralle'],
  mokka: ['ball', 'bogen'], wella: ['bogen', 'leuchtturm'], wobbel: ['laterne', 'blasen'], tuck: ['seegras', 'kelp'], nixi: ['blasen', 'reifen'], okko: ['amphore', 'hoehle'],
  knurr: ['wrack', 'truhe'], nero: ['bogen', 'helm'], lumi: ['laterne', 'blasen'], brisa: ['reifen', 'blasen'], zacko: ['truhe', 'wrack'], corvin: ['kelp', 'laterne'],
  tilda: ['muschel', 'seegras'], rocco: ['helm', 'ball'], perla: ['muschel', 'amphore'], blubb: ['blasen', 'helm'], glimmer: ['laterne', 'hoehle'], nox: ['laterne', 'bogen'],
  aurelia: ['leuchtturm', 'laterne'], thalor: ['leuchtturm', 'anker'], abyss: ['hoehle', 'wrack'], kora: ['faecher', 'rotkoralle'], basalt: ['anker', 'hoehle'], vega: ['laterne', 'reifen'],
  tidalia: ['leuchtturm', 'bogen'], lenni: ['blasen', 'leuchtturm'], kai: ['wrack', 'anker'], zephyr: ['laterne', 'leuchtturm']
};
const lieblingVon = id => LIEBLING[id] || [];
const lieblingBei = dekoId => Object.keys(LIEBLING).filter(i => LIEBLING[i].indexOf(dekoId) >= 0);          // Figuren, die diesen Gegenstand mögen

// ---------- Abzeichen ----------
const TIER = [
  { name: 'Bronze', a: '#C97B3E', b: '#F2B27A' },
  { name: 'Silber', a: '#8FA6BD', b: '#E2ECF5' },
  { name: 'Gold', a: '#E5A000', b: '#FFE58A' },
  { name: 'Perle', a: '#7E57D8', b: '#F6ECFF' }
];
const BADGES = {};
[
  ['start', 'Erste Welle', 'Die allererste Lernrunde geschafft.', 0, 'welle'],
  ['karten50', 'Kartenfischer', '100 Antworten gegeben.', 0, 'fisch'],
  ['karten250', 'Kartenschwarm', '500 Antworten gegeben.', 1, 'fisch'],
  ['karten1000', 'Kartenmeer', '2500 Antworten gegeben.', 2, 'fisch'],
  ['runde10', 'Rundenläufer', '15 Lernrunden geschafft.', 0, 'kompass'],
  ['runde50', 'Tauchprofi', '75 Lernrunden geschafft.', 1, 'kompass'],
  ['runde200', 'Tiefseeforscher', '300 Lernrunden geschafft.', 2, 'kompass'],
  ['perfekt', 'Volltreffer', 'Eine Runde ohne einen Fehler.', 0, 'stern'],
  ['perfekt5', 'Fünf Volltreffer', '5 Runden ohne Fehler.', 1, 'stern'],
  ['tagesziel1', 'Tagesziel!', 'Zum ersten Mal das Tagesziel erreicht.', 0, 'ring'],
  ['tagesziel10', 'Zehn Tagesziele', '10 Tagesziele erreicht.', 1, 'ring'],
  ['tagesziel50', 'Fünfzig Tagesziele', '50 Tagesziele erreicht.', 2, 'ring'],
  ['serie3', 'Strömung', '3 Lerntage in Folge im Projekt.', 0, 'flamme'],
  ['serie7', 'Starke Strömung', '7 Lerntage in Folge im Projekt.', 1, 'flamme'],
  ['serie14', 'Gezeitenkraft', '14 Lerntage in Folge im Projekt.', 2, 'flamme'],
  ['projekt1', 'Kurs gesetzt', 'Das erste Projekt angelegt.', 0, 'flagge'],
  ['projektfertig', 'Ziel erreicht', 'Ein Projekt bis zum Ziel gebracht.', 1, 'pokal'],
  ['projekt100', 'Alles sitzt!', 'Ein Projekt zu 100 % gemeistert.', 2, 'krone'],
  ['wort100', 'Hundert Wörter', '100 verschiedene Karten kennengelernt.', 1, 'buch'],
  ['sicher50', 'Sitzt!', '50 Karten sicher im Riff.', 1, 'anker'],
  ['album10', 'Sammler', '10 Figuren im Album.', 0, 'muschel'],
  ['album20', 'Großsammler', '20 Figuren im Album.', 1, 'muschel'],
  ['albumalle', 'Albummeister', 'Alle Figuren im Album!', 3, 'muschel'],
  ['selten', 'Seltener Fund', 'Eine seltene Figur gezogen.', 1, 'diamant'],
  ['legende', 'Legende!', 'Eine legendäre Figur gezogen.', 3, 'diamant'],
  ['riff1', 'Riff-Gärtner', 'Das erste Stück ins Riff gestellt.', 0, 'koralle'],
  ['evo1', 'Erste Entwicklung', 'Einen Freund zum ersten Mal weiterentwickelt (3 Sterne).', 1, 'stern'],
  ['evo3', 'Volle Kraft', 'Einen Freund auf die höchste Stufe gebracht (5 Sterne).', 2, 'stern'],
  ['zuhause1', 'Lieblingsplatz', 'Ein Freund sitzt bei seinem Lieblings-Gegenstand im Riff.', 0, 'koralle'],
  ['zuhause5', 'Gemütliches Riff', 'Fünf Freunde sind bei ihrem Lieblings-Gegenstand.', 1, 'muschel'],
  ['futter1', 'Futterzeit', 'Zum ersten Mal Futter ins Riff gestreut.', 0, 'fisch'],
  ['riff10', 'Riff-Baumeister', '10 Stücke im Riff.', 1, 'koralle']
].forEach(([id, name, text, tier, glyph]) => { BADGES[id] = { id, name, text, tier, glyph }; });

const GLYPH = {
  welle: `<path d="M26 58 q8 -14 17 0 t17 0 t17 0 M26 74 q8 -14 17 0 t17 0 t17 0" fill="none" stroke="#fff" stroke-width="8"/>`,
  fisch: `<path d="M24 60 C36 40 66 40 78 60 C66 80 36 80 24 60Z" fill="#fff"/><path d="M76 60 L96 44 L96 76Z" fill="#fff"/><circle cx="42" cy="55" r="4" fill="${INK}" stroke="none"/>`,
  kompass: `<circle cx="60" cy="60" r="30" fill="#fff"/><path d="M60 36 L68 60 L60 84 L52 60Z" fill="#E5484D"/><path d="M60 60 L68 60 L60 84 L52 60Z" fill="${INK}" stroke="none" opacity=".3"/><circle cx="60" cy="60" r="4" fill="${INK}" stroke="none"/>`,
  stern: `<path d="${ART.star(60, 60, 34, 15, 5)}" fill="#fff"/>`,
  ring: `<circle cx="60" cy="60" r="28" fill="none" stroke="#fff" stroke-width="10"/><path d="M47 61 L56 70 L74 50" fill="none" stroke="#fff" stroke-width="8"/>`,
  flamme: `<path d="M60 26 C76 46 84 58 80 74 C77 88 68 94 60 94 C52 94 43 88 40 74 C36 58 50 50 60 26Z" fill="#FF8A2B"/><path d="M60 58 C68 68 70 74 66 82 C64 86 62 88 60 88 C58 88 56 86 54 82 C50 74 54 68 60 58Z" fill="#FFE680" stroke="none"/>`,
  flagge: `<path d="M40 28 V94" stroke="#fff" stroke-width="8"/><path d="M44 32 H88 L76 46 L88 60 H44Z" fill="#fff"/>`,
  pokal: `<path d="M40 32 H80 V50 C80 66 70 74 60 74 C50 74 40 66 40 50Z" fill="#fff"/><path d="M40 38 H30 C30 54 36 58 42 58 M80 38 H90 C90 54 84 58 78 58" fill="none" stroke="#fff" stroke-width="6"/><path d="M60 74 V88 M46 92 H74" stroke="#fff" stroke-width="8"/>`,
  krone: `<path d="M32 78 L28 42 L46 58 L60 34 L74 58 L92 42 L88 78Z" fill="#fff"/><path d="M34 88 H86" stroke="#fff" stroke-width="8"/>`,
  buch: `<path d="M26 40 C40 34 52 36 60 44 C68 36 80 34 94 40 V84 C80 78 68 80 60 88 C52 80 40 78 26 84Z" fill="#fff"/><path d="M60 44 V88" fill="none" stroke-width="4"/>`,
  anker: `<path d="M60 36 V90 M42 54 H78" fill="none" stroke="#fff" stroke-width="8"/><path d="M34 70 C36 86 50 92 60 92 C70 92 84 86 86 70" fill="none" stroke="#fff" stroke-width="8"/><circle cx="60" cy="32" r="8" fill="none" stroke="#fff" stroke-width="6"/>`,
  muschel: `<path d="M60 88 L26 62 C22 42 40 28 60 28 C80 28 98 42 94 62Z" fill="#fff"/><path d="M60 88 L40 36 M60 88 L52 30 M60 88 L68 30 M60 88 L80 36 M60 88 L30 52 M60 88 L90 52" fill="none" stroke-width="3.2"/><path d="M48 90 H72" stroke="#fff" stroke-width="8"/>`,
  diamant: `<path d="M38 44 H82 L96 60 L60 94 L24 60Z" fill="#fff"/><path d="M24 60 H96 M46 44 L60 94 M74 44 L60 94 M46 44 L40 60 M74 44 L80 60" fill="none" stroke-width="3.4"/>`,
  koralle: `<path d="M60 94 V50 M60 78 L40 58 M60 66 L80 44 M80 44 L86 30 M40 58 L36 40 M60 50 L56 32" fill="none" stroke="#fff" stroke-width="9"/>`
};
function badgeSvg(id, offen) {
  const b = BADGES[id], t = TIER[b.tier];
  const gid = 'bg_' + id;
  return `<svg class="bd ${offen ? '' : 'zu'}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.b}"/><stop offset="1" stop-color="${t.a}"/></linearGradient></defs>
    <g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M38 88 L28 116 L44 108 L52 118 L58 92Z" fill="#E5484D"/><path d="M82 88 L92 116 L76 108 L68 118 L62 92Z" fill="#C9363B"/>
    <circle cx="60" cy="58" r="50" fill="url(#${gid})"/><circle cx="60" cy="58" r="40" fill="${t.a}"/><circle cx="60" cy="58" r="40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>
    ${GLYPH[b.glyph]}</g>
    <path d="M24 32 a42 42 0 0 1 28 -20" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/></svg>`;
}
