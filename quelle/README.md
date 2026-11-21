# Wortriff – Vokabel-Lern-App fürs iPad (Arbeitstitel)

Eine einzelne HTML-Datei (`Wortriff_V04.html`; ältere Fassungen V01–V03 bleiben daneben liegen), gebaut aus `src/`. **Nie die HTML direkt ändern**, sondern in `src/` arbeiten und neu bauen. Seit V03 gibt es dieselbe App zusätzlich als **Web-App** für GitHub Pages (Update-Knopf, Kartenpakete aus dem Repo, Home-Bildschirm): `node repo-bauen.js` erzeugt dafür ein fertiges Repo und eine ZIP-Datei.

```
node bauen.js                 # baut Wortriff_<VERSION>.html, VERSION oben in bauen.js (Schriften sind eingebettet, läuft offline)
node repo-bauen.js            # baut ../Wortriff_Repo/ und ../Wortriff_Repo.zip (Web-App + Kartenpakete aus repo-karten/ + Quellcode)
node tests/logik.js           # Lernlogik ohne Browser (SRS, Plan, Serie, Muscheln, Dateinamen, Lieblingsplätze)
node tests/smoke.js           # Ablauf in Edge: Nutzer, Import (Dateien, ZIP mit Deflate), Projekt, Runde, Muschel, Riff, Neuladen
node tests/ablegen.js         # echtes Ziehen und Ablegen von Ordnern (Chromium-Drag-Ereignisse)
node tests/tippen.js          # Tipp-Modus: Prüflogik, Vergleich mit der eigenen Eingabe, Durchlauf
node tests/riff.js            # Riff: Lager sichtbar, Kaufen → Aufstellen, in drei iPad-Ansichten
node tests/riff_welt.js       # Riff-Erweiterungen: Kaufen (Preise, Zone, Perlen), Scrollen, Übersicht, Ziehen bis zum Rand
node tests/leben.js           # Lebendiges Riff: Bewegung, Lieblingsplätze, Freude, Futter, Tag/Nacht, Sprechblase, Ziehen, Ruhe-Schalter
node tests/entwicklung.js     # Korallenfunken: Stern stärken, Entwicklungs-Animation, Muschel mit Entwicklung, Riff/Profilbild in der neuen Form
node tests/bibliothek.js      # Lektion entfernen/neu einlesen, Sicherung, Nutzer wechseln/löschen
node tests/pwa.js             # Web-App gegen einen Testserver wie GitHub Pages: Service Worker, Offline-Start, App-Update, Kartenpakete, Umzug in einen zweiten Speicher
node tests/neu04.js           # V04: Augen zu bei Nacht, Sperre im Riff, Mythen (Muschel, Album, Riff), Generalprobe, Überraschungspakete (62 Prüfungen)
node tests/verhalten.js       # V04: neue Verhaltensweisen (spielen, verstecken, staunen, buddeln, Fangen, folgen, blinzeln, Locken) und Licht/Teilchen (26 Prüfungen)
node tests/riffbild.js nacht 7 name   # Bild vom Riff (tag|nacht) zum Ansehen der Effekte, landet in tests/bilder/
node tests/fragen.js          # V04: Vokabel-Modus im Riff („?“, Frage-Fenster, Belohnung, Tagesgrenze, an/aus; 23 Prüfungen)
node tests/vollbild.js        # V04: Riff im Vollbild (quer und hoch), kompakter Generalprobe-Knopf (26 Prüfungen)
node tests/ereignis.js        # V04: Überraschungs-Ereignisse (goldener Stern, Blasenregen, goldener Krebs, Bonus, Tagesgrenze, Schalter; 28 Prüfungen)
node tests/namen.js           # doppelte globale Namen in src/js (alle Dateien teilen sich einen Bereich)
node tests/webp.js            # WebP-Kartensatz als ZIP: einlesen, Bilder unverändert gespeichert, Runde zeigt sie (braucht ../ausgabe/Franzoesisch_Lektion02.zip)
node tests/verben.js          # Verbkarten (Satz VERB, E01_VERB_V01…): einlesen, Bibliothek, Umdreh-Runde (braucht ../ausgabe/Englisch_Unit01)
node tests/ansichten.js quer  # Rundgang mit großem ZIP + 7 simulierten Lerntagen, Screenshots in tests/bilder/ (auch: hoch)
node tests/monkey.js 3000 7   # Zufalls-Klicktest (Schritte, Startwert)
node tests/art_blatt.js out.png arten|katalog|deko|abzeichen|evo   # Kontaktblatt der Zeichnungen
node tests/webkit.js "iPad Pro 11" neuNutzer,hafen,karte      # Safari-nahe Prüfung in WebKit (Playwright), Screenshots in tests/bilder/wk-*
node werkzeuge/icons-finn.js  # zeichnet das Home-Bildschirm-Symbol mit Finn Flosse (Entwürfe A/B + vorschau.png nach icons-finn/); UEBERNEHMEN=A macht Entwurf A zum Symbol (repo-icons/). Die erste Fassung mit Flo (icons.js) liegt in icons-archiv/flo/
```
Voraussetzung: `npm install` in diesem Ordner (puppeteer-core, playwright-core; Schriften liegen in `src/fonts/`) und Edge unter `C:\Program Files (x86)\Microsoft\EdgeCore`. Die Tests mit Browser (alles außer `logik.js`, `namen.js`) auf Windows über PowerShell starten.

**Zeilenenden:** Die Quelldateien haben CRLF. Wer sie per Skript ändert, muss das berücksichtigen (Vorlage: `tests/_tmp/editlib.js` mit `edit(datei, [[alt, neu]])`).

## Karten hineinbringen
Der Kartenbau (`../bauen.js`) schreibt pro Lektion `Englisch_Unit04/…` bzw. `Franzoesisch_Lektion01/…` mit den Bildpaaren und einer **`lektion.json`** (Wörter als Text). Seit 01.11.2026 sind die Bilder WebP mit 1500 px (etwa ein Zehntel der früheren PNG); ältere Sätze sind PNG. In die App ziehen (Ordner), „Dateien wählen“ oder ZIP.
Alles Nötige steckt im Dateinamen: `E04_DE-EN_011_1-vorne.webp` (oder `.png`/`.jpg`) = Sprache E/F, Lektion 04, Kartensatz DE-EN, Nr. 011, Seite 1 (vorne) / 2 (hinten). Der Nummernteil ist `011` (Vokabel), `B1` (Bildkarte) oder `V01` (Verbkarte, Satz `VERB`: nur Umdreh-Karte ohne Quiz/Tippen, intern Nr. 1000+V, damit sie nie zu Vokabel Nr. 1 gehört). Ordnerstruktur ist egal. Ohne `lektion.json` laufen Karten nur als Umdreh-Karten (kein Vorlesen, Quiz, Tippen). Beim Einlesen werden PNG (und Bilder über 1500 px) auf max. 1500 px breit verkleinert und als JPEG gespeichert (~29 % des Platzes; Schalter „Original“ in der Bibliothek). WebP/JPEG bis 1500 px werden unverändert übernommen.

## Aufbau (src/js, alphabetisch zusammengesetzt)
| Datei | Inhalt |
|---|---|
| 00-util | Helfer, Datum (`heute()` überschreibbar per `window.__heute`), Zufall (`rand`) |
| 01-speicher | IndexedDB (`kv` = Zustand, `img` = Karten-Bilder), Sicherung als JSON (`sicherungInhalt`, Teilen-Blatt `sicherungTeilen`, Download `sicherungsDatei`, Laden `sicherungLaden`) |
| 02-zip | ZIP-Leser mit eigenem Inflate (gespeichert + deflate, kein ZIP64) |
| 03-import | Dateinamen lesen, Ordner-Drop, Verkleinern, Bibliothek (`S.lib.lessons`) |
| 04-daten | Nutzer, Projekte, **Anki-ähnlicher Wiederholungsplan**, Tagesplan, Serie |
| 05-arten / 05-evo-a…d / 06-katalog | 16 Meerwesen-Arten × Paletten × Zubehör (Stufe 1), ihre Entwicklungsformen (Stufe 2 und 3, eigene Körper), Figuren (34), Deko (19), Lieblingsplätze (`LIEBLING`), Abzeichen, alles als SVG |
| 06m-mythos | **Mythen der Tiefe**: 10 Fabelwesen und Gegenstände (SVG mit Aura und Funkeln), `MYTH`, `MYTH_CHANCE` |
| 07-belohnung | Perlen, XP, Ränge, Muscheln (Chancen, Schutz), Abzeichen-Regeln, Wohlfühlen im Riff (`riffWohl`), Rundenende |
| 08-ton | Klänge (WebAudio) und Vorlesen (SpeechSynthesis) |
| 09–13 | Oberfläche: Router/Rahmen/Effekte, Profile + Hafen, Bibliothek, Projekte, Lernen |
| 13b-ui-probe | **Generalprobe** (Auswahl, Schnellfilter, Auswertung) und **Überraschungspaket** (Bild, Auspacken) |
| 14-ui-sammlung | Muschel, Album, Riff (Welt aus Kacheln, Laden, Ziehen) |
| 14zz-ereignis | **Überraschungs-Ereignisse** im Riff (goldener Stern, zwei Geschicklichkeitsspiele, Bonus) |
| 14z-riffleben | **Lebendiges Riff** (Bewegung, Freude, Futter, Tag/Nacht, Teilchen, Sprechblasen) |
| 15-ui-karte-ich | Karte, Ich (Daten, Sicherung, Panel „App und Updates“) |
| 16-update | **Web-App**: Update-Prüfung, Service-Worker-Anbindung, Kartenpakete aus dem Repo, Umzug (Sicherung prüfen/übernehmen/rückgängig), Installationshinweis |
| 99-main | Start (`updAutoStart()`, dann `__bereit`) |

## Web-App und Repo (seit V03)
**Zwei Bauarten, ein Quelltext.** `bauen()` in `bauen.js` liefert `{html, id, stand, version, kb}`. Die Kennung `APP_ID` ist ein SHA-1 über den Inhalt, deshalb ändert sie sich nur, wenn sich die App ändert. Der lokale Bau (`Wortriff_V03.html`) bleibt eine Datei zum Ziehen aufs iPad; der Web-Bau (`bauen({web:true})`) setzt zusätzlich Manifest und Symbol-Link an die Stelle `<!--PWA-->` in `src/index.html`. In der lokalen Datei ist `UPD.web` falsch, Update und Repo-Karten sind dort aus.

**Das Repo** (`node repo-bauen.js` → `../Wortriff_Repo/`, dasselbe als `../Wortriff_Repo.zip`, Wurzel der Pages-Seite, Branch `main`, Ordner `/`):

| Pfad | Inhalt |
|---|---|
| `index.html` | die Web-App |
| `sw.js` | Service Worker aus `repo-vorlage/sw.template.js`, Cache `wortriff-<Fassung>-<Kennung>`, Dateiliste wird eingesetzt |
| `manifest.webmanifest`, `icon-180/192/512.png` | Home-Bildschirm (Symbol Finn Flosse aus `repo-icons/`, Vorlage 1024 px: `repo-icons/icon-finn-1024.png`) |
| `version.json` | `{id, version, stand}`; `stand` bleibt gleich, solange die Kennung gleich bleibt |
| `karten/*.zip`, `karten/index.json` | Kartenpakete (aus `repo-karten/`) und ihr Verzeichnis (Dateiname, Größe, Git-Blob-SHA, Lektionen mit Schlüssel/Titel/Kartenzahl) |
| `quelle/` | `src`, `bauen.js`, `repo-bauen.js`, `package.json`, `README.md`, `werkzeuge`, `repo-vorlage`, `repo-icons`, `tests` (ohne Bilder/ZIP/PNG und ohne `_tmp`) |
| `LIESMICH.md` | aus `repo-vorlage/LIESMICH.md` (Platzhalter `{{VERSION}} {{ID}} {{STAND}} {{PAKETE}}`) |
| `.nojekyll` | GitHub Pages liefert die Dateien unverändert |

Die ZIP schreibt `werkzeuge/zipschreiben.js` (eigener Schreiber: Text per Deflate, ZIP/WebP/PNG/JPG/WOFF2 nur gespeichert). `karten-vorbereiten.ps1` macht aus Kartenbau-Ergebnissen (`../ausgabe/`) WebP-Pakete in `repo-karten/` (nutzt `webp.py` und `zip.py` im Projektordner über `app/`; neue Pakete aus dem Kartenbau sind schon WebP und können direkt nach `repo-karten/` oder ins Repo).

**Service Worker** (`sw.template.js`, Muster wie beim GT-Portal): beim Installieren werden alle Dateien aus `__FILES__` mit `cache: 'reload'` geladen; die neue Fassung **wartet**, bis die Seite `skip` schickt. Dann `skipWaiting`, beim Aktivieren werden alte `wortriff-*`-Caches gelöscht und `clients.claim()` aufgerufen. Abgerufen wird Cache zuerst (ohne Suchanteil). Ausnahme: `karten/` und `version.json` gehen immer ans Netz. Die Seite registriert `sw.js` mit `updateViaCache: 'none'`; ein `controllerchange` lädt neu (nicht bei der ersten Installation).

**Update-Ablauf** (`16-update.js`):
- Prüfung 2,5 s nach dem Start, beim Zurückkehren in die App, bei `online` und alle 30 Minuten (höchstens alle 15 Minuten; abschaltbar). Ohne Service Worker (z. B. Browser ohne Unterstützung) vergleicht die App `version.json` mit `APP_ID`.
- Eine neue App-Fassung wird im Hintergrund geholt. **Von selbst eingespielt wird sie nur auf Start-/Profilseiten, wenn gerade ≥ 2,5 s nichts angetippt wurde** (`updRuhig`); sonst erscheint die Leiste „Neue Version bereit – Jetzt installieren“. Mitten in der Lernrunde lädt die App nie neu.
- Zustand auf dem Gerät (nicht Teil der Sicherung): `kv['repo']` = welche Pakete mit welchem SHA geladen sind. Einstellungen in `S.einst` (`autoUpdate`, `autoKarten`, `kartenOk`, `installBis`).

**Kartenpakete aus dem Repo**: Die Liste ist `karten/index.json` ⊕ GitHub-Verzeichnis (`/repos/<owner>/<repo>/contents/karten`); Besitzer und Name werden aus `<owner>.github.io/<repo>/` abgeleitet (oder `index.repo`). Die ZIP kommt von `karten/<datei>`, ersatzweise von der `download_url` (raw). Regeln:
- Neue oder geänderte Pakete werden von selbst geladen, solange **zusammen höchstens 15 MB** anstehen. Darüber fragt die App einmal („Ja“ merkt sich die Erlaubnis in `S.einst.kartenOk`). Von Hand geht immer alles: *Karten → „Kartenpakete im Repo“* zeigt die Liste mit „Laden“ je Paket und „Alle neuen laden“.
- Geändert (anderer SHA) → nur aktualisieren, wenn die Lektion noch in der Bibliothek ist. **Bewusst entfernte Lektionen kommen nicht ungefragt zurück.**
- Ist eine Lektion schon vollständig da (alle Bilder), wird das Paket nur vermerkt, nicht geladen.
- `kartenLuecken()` zählt Karten ohne Bild; `kartenNachladen()` holt genau die passenden Pakete (Knopf „Kartenprüfung“ unter *Ich*, „Fehlende Bilder nachladen“ unter *Karten*).
- Die GitHub-API ist ohne Anmeldung auf 60 Abfragen pro Stunde und Netzwerk begrenzt. Wird das knapp, gilt `index.json`; der Index ist also die verlässliche Quelle, die API nur der Komfort („einfach ZIP hochladen“).

**Umzug in die Home-Bildschirm-App** (der Grund für die Sicherungsfunktionen): Nach dem Stand der WebKit-Unterlagen teilen sich Safari-Tab, Home-Bildschirm-App und eine lokal geöffnete `file://`-Datei **keinen** Speicher. Eine neue Adresse oder ein neues Symbol startet leer. Lösung ohne Datenverlust, ohne etwas am alten Speicher zu ändern:
1. Alte Version: *Ich → Daten → „Fortschritt sichern“* (auf dem iPad über das Teilen-Blatt, `navigator.share` mit Datei; ersatzweise Download) oder *„Als Text kopieren“* (Zwischenablage, ersatzweise Textfeld zum Markieren).
2. Neue Version: *„Sicherung laden“* / *„Aus Text laden“* (auch auf der Profil- und Neu-Seite). `sicherungPruefen` zeigt eine **Vorschau** (Nutzer, XP, Lektionen, Karten, Antworten); *Übernehmen* legt vorher eine Kopie des bisherigen Stands in `kv['state_vorher']` ab (*Rückgängig* holt sie zurück).
3. Die Kartenbilder sind nicht in der Sicherung (zu groß). `kartenNachladen()` holt sie nach dem Übernehmen aus dem Repo; fehlt eine Lektion im Repo, nennt die App sie und verweist auf *Karten → ZIP hineinziehen*. Der Lernstand der Karten ist dann schon da.
4. Im Browser-Tab des iPads (nicht installiert) zeigt die App einen Hinweis zum Home-Bildschirm („Später erinnern“ merkt sich 3 Tage); `navigator.storage.persist()` wird angefragt, der Zustand steht unter *Ich → App und Updates*.

Geprüft in `tests/pwa.js` (36 Prüfungen), u. a.: Offline-Start, App-Update (neue Kennung → Leiste/Einspielen), Paketfund per Index und per Verzeichnis, geänderte/entfernte Pakete, **Umzug in einen zweiten Ursprung** mit identischem Zustand, Rückgängig, Textsicherung, Teilen-Blatt, `repoAdresse`, Installationshinweis. Der Testserver (`tests/_server.js`) verhält sich wie GitHub Pages (Unterpfad `/<repo>/`, Verzeichnisantwort der API).

## Generalprobe und Überraschungspakete (seit V04)
Im Projekt (Hafen-Karte und Details) gibt es die **Generalprobe**: alle oder selbst gewählte Karten noch einmal abfragen, etwa am Tag vor dem Test. Das Fenster (`probeBlatt`, 13b) listet alle Karten des Projekts mit Haken und Lernstand-Punkt. Schnellfilter: Alle, Noch nicht sicher (Box < 3 oder Lernphase), Schon mal falsch (lapses > 0), Noch nie geübt, Zufällig 20, Keine; bei mehreren Lektionen lassen sich einzelne Lektionen an/aus schalten. Abfrageart Karten/Quiz/Tippen wählbar. Die Runde läuft in der normalen Lern-Ansicht mit `LS.probe = true`: **nichts wird im Lernplan verbucht** (`verbucheProbe` statt `verbuche`: kein `bewerte`, keine XP/Perlen, kein Tagesziel, keine Serie), jede Karte wird genau einmal gefragt. Am Ende `probeErg`: gewusst / wackelig / nicht gewusst, Liste zum Nacharbeiten, „Nur diese nochmal“, Abzeichen „Generalprobe“ (ab 5 Karten).
**Überraschungspaket** (`PAKET` in 07-belohnung): ab 5 / 15 / 30 / 60 abgefragten Karten gibt es ein Paket der Stufe 1–4 (1–4 Plätze), höchstens eins je Projekt und Tag (`P.paketAm`). Jeder Platz enthält Perlen, Korallenfunken, einen Freund (Seltenheit nach Stufe, nur erreichte Zonen, Dubletten wie bei Muscheln) oder einen besonderen Gegenstand (Riff-Deko, teure wahrscheinlicher; in den Stufen 2 / 3 / 4 mit 2 / 8 / 18 % ein Mythos). Gespeichert wird `u.pakete` = { 1..4: Anzahl }; geöffnet wird in `paketOeffnen`, angezeigt in `ANSICHT.paket` (die Preise erscheinen nacheinander). Zahlen justieren: `PAKET`.

## Mythen der Tiefe (seit V04)
`06m-mythos.js`: 5 Fabelwesen (Hippokamp Selene, Seedrache Naga, Glutqualle Ignis, Sternenschildkröte Atlas, Himmelswal Cirrus) und 5 Gegenstände (Poseidons Dreizack, Wunschperle, Krone des Meereskönigs, Gezeitentor, Mondkristall). Nicht im Riff-Laden, nicht bei den Freunden: sehr selten in Muscheln (`MYTH_CHANCE`: Perlmuschel 0,8 %, Schatzmuschel 2,5 %, ab 10 m Tauchtiefe; ein Fund setzt den Schutzzähler zurück) und in Paketen. Gespeichert: `u.myth[id] = { n, ts, neu }`; Dubletten geben 25 Perlen und 15 Funken. Im Album eine eigene Reihe, im Riff-Lager aufstellbar (`kind: 'myth'`). Fabelwesen schwimmen wie Freunde (`BEWEGUNG['m_<id>']`, `lebenBeweglich`), Gegenstände schweben und funkeln (`emit`); alle leuchten (CSS `--mg`), nachts stärker. Neues Mythos-Stück: Eintrag `def(...)` in 06m. Kontaktblatt: `node tests/art_blatt.js out.png mythen`. Abzeichen: Mystisches Leuchten, Mythensammler, Hüter der Mythen, Überraschung!, Generalprobe, Prüfungsprofi.

## Verhaltensweisen und Effekte im Riff (seit V04)
**Verhalten** (`lebenAktivitaet` in 14z-riffleben): Mit etwa 34 % Wahrscheinlichkeit tut ein Freund statt Herumschwimmen etwas Besonderes, wenn die Umgebung passt: *spielen* (Wasserball hüpft, Sprungreifen schwingt, `lebenDekoSpiel`), *verstecken* (Schüchterne, `VERSTECKER`, hinter Höhle/Kelp/Seegras/Bogen/Wrack …, Ebene unter der Deko über `a.hinterZ`, taucht später wieder auf), *staunen* (bewundert ein Mythos-Stück, Glitzer), *buddeln* (Bodenbewohner: Sandwölkchen, manchmal glitzert etwas), *jagen* (Fangen mit einem Nachbarn, Rollen wechseln beim Fangen, schneller `a.tempoF`) und *folgen* (schwimmt hinter einem anderen her). Dazu im Leerlauf *blinzeln* (manchmal doppelt) und *strecken*. Ein **Tipp ins freie Wasser** (`lebenLocken`) lässt eine Ringwelle laufen und die drei nächsten Freunde vorbeischauen (auch bei gesperrten Tieren). Neue Aktivität: Zweig in `lebenAktivitaet`, Modus ggf. in `lebenSchritt`/`lebenAnkunft`.
**Effekte**: Laterne = weiches, flackerndes Licht; Leuchtturm = Lichtschein plus Lichtkegel, der per `rotate` kreist (`::before`/`::after`, `--lh` = Helligkeit, nachts 1; `translate` und `rotate` sind getrennte Eigenschaften, damit sich nichts überschreibt). Wasser: schwingende Lichtbahnen (`.strahl`), flirrende Oberfläche (`.oberflaeche`), wandernde Lichtnetze auf dem Sand (`.sand::after`). Teilchen (`#teile`, Typen in `TEIL`): Blasen wie Glas (Glanzpunkt, schlängelnd, platzen oben), Herzen/Sterne mit Schein, `ring` (Ringwelle), `leucht` (Leuchtplankton, nur nachts), `sand`, `glitzer`. Alles Neue steht gebündelt am Ende von `style.css` („Riff-Effekte (V04)“); im Ruhe-Modus (`.ruhe`) sind alle Animationen aus.

## Vollbild-Riff (seit V04)
Sechster runder Knopf im Riff (`AKT.riffVoll`, Symbole `voll`/`vollzu`): `body.riffvoll` blendet Navigation, Kopfleiste, Riff-Kopf und Lager aus, das Riff füllt den ganzen Bildschirm; zusätzlich echtes Vollbild des Browsers, wo es das gibt (`requestFullscreen`, auf dem iPad Safari je nach Version; nicht bei Automatisierung). Beenden: Knopf, „Vollbild beenden“ oben rechts, Escape, oder Verlassen des Riffs (`gehe` ruft `riffVollEnde`). Im Vollbild darf die Kachel hochkant werden (`riffFit`: Seitenverhältnis ab 0,8), damit das Hochformat gefüllt ist. Der Zustand wird nicht gespeichert.

## Überraschungs-Ereignisse (seit V04)
`14zz-ereignis.js`: Ganz selten taucht im Riff ein goldener Stern auf (Würfel alle 10 s mit 1,2 % Chance, erst nach 90 s im Riff, höchstens einmal am Tag über `u.riff.ereTag`, nicht während einer Vokabelfrage oder eines Fensters). Antippen öffnet eine Karte mit den Regeln, „Los!“ startet nach 3-2-1 ein Spiel von 12 s: **Blasenregen** (Blasen antippen; golden = 3 Punkte, Seeigel = −2) oder **Goldener Krebs** (flitzt über den Sand, wird mit jedem Treffer schneller). Sterne je Spiel in `EREIGNIS.sterne`; Bonus `EREIGNIS.perlen` = 1 / 2 / 4 / 6 Perlen, bei 3 Sternen +3 Korallenfunken (bewusst klein, die Lektions-Perlen sollen ihren Wert behalten). Abzeichen Glückspilz / Riff-Akrobat. Abschalten: *Ich → Einstellungen → „Überraschungen im Riff“* (`u.set.ereignisse`). Neues Spiel: Eintrag in `EREIGNIS_INFO`/`EREIGNIS.sterne` und ein `ereignis…Tick` wie bei den beiden vorhandenen.

## Vokabel-Modus: Freunde fragen Vokabeln (seit V04)
Ein eigener **Modus** im Riff, beim Start immer aus. Der Buch-Knopf (5. runder Knopf, `AKT.riffFragenAn`) ruft ihn auf, eine grüne Leiste „Vokabel-Modus an … [Aus]“ zeigt ihn an, Knopf oder „Aus“ schalten ihn ab (`LEBEN.fragenModus`, bewusst nicht gespeichert, damit das Riff nie ungefragt Fragen stellt). Ist er an, erscheint alle 12–25 s über einem wachen Freund ein „?“ (`lebenFrageSchritt`, Knopf `.fragezeichen`, wandert mit). Tipp auf das „?“ oder den Freund (`lebenGruss`) öffnet ein Fenster: Wortfrage aus den schon gelernten Karten (`frageKarte`, wacklige öfter, Quiz mit 3 Antworten über `quizOptionen`), richtige Lösung wird markiert und vorgelesen. **Lernplan unberührt** (kein `bewerte`). Belohnung bewusst knapp, damit die Lektions-Perlen (15–25 am Lerntag) ihren Wert behalten: nur **jede zweite** richtige Antwort bringt 1 Perle, höchstens `FRAGE_MAX` (6) richtige Antworten zählen am Tag (also **höchstens 3 Perlen**), keine Korallenfunken, nach `FRAGE_FEHLER` (3) falschen Antworten am Tag gibt es nichts mehr (kein Belohnen fürs Raten, das „?“ kommt nicht mehr); die Frage hat bis zu 4 Antworten. Danach darf man weiter üben, es gibt nur nichts mehr. Nachts und beim Füttern fragt niemand; das „?“ bleibt auch bei gesperrten Tieren antippbar. Statistik `u.stats.riffFragen`, Tageszähler `u.riff.frage`, Abzeichen Neugieriger Freund / Riff-Schüler / Vokabel-Flüsterer.

## Schlaf und Sperre im Riff (seit V04)
Augen sind in `eye()`/`augeA()` (05-arten) als `.aug > .auf` (offen) und `.zu` (Bogen, `display="none"`) gezeichnet. Schläft ein Freund (`a.modus === 'schlafen'`), setzt `lebenAnwenden` die Klasse `.schlaf` auf `.fx`, das CSS zeigt nur den Bogen; ein angetippter Schläfer macht kurz die Augen auf (`a.wachBis`). Im Ruhe-Modus bei Nacht sind alle Augen zu. **Sperre**: vierter runder Knopf im Riff (Schloss, `u.riff.sperre`): `.riffbuehne.gesperrt .ritem { pointer-events: none }`, damit Scrollen, Zoomen und Füttern nicht aus Versehen ein Tier anwählen.

## Lebendiges Riff (seit V03)
`14z-riffleben.js` bringt das Riff zum Leben, **gespeichert wird dafür nur** `u.riff.leben` (an/aus; ohne Eintrag richtet sich die App nach „Bewegung reduzieren“ des Geräts) und `u.riff.zeit` (`auto`/`tag`/`nacht`). Die Stücke behalten ihren **Heimatplatz** (`x`, `y` = dort, wo du sie hingestellt hast); die Bewegung ist ein Versatz `(ox, oy)` darum herum (`riffSicht` liefert die sichtbare Stelle). Markup je Stück: `.ritem > .swim > .dr > .fl (Spiegelung) > .fx (Freude) > svg`.
- **Bewegungsarten** je Art (`BEWEGUNG`: Tempo in Einheiten/s, Streifraum): Schwimmer, Gleiter (Manta), Schweber (Seepferd), Treiber (Qualle), Krabbler (Oktopus, Krebs, Seestern). Modi: `bleiben`, `gehe`, `verweilen`, `schlafen`, `fressen`.
- **Lieblingsplätze** (`LIEBLING` in 06-katalog, jede Figur mag mindestens ein Deko-Stück): Die Wahl des Ziels bevorzugt sie; `riffWohl(u)` (07) zählt „wohl“, wenn die Figur innerhalb von 16/22 Einheiten von einem Lieblingsstück steht. Dort verweilt sie länger und **freut sich** (`FREUDE_ANIM` je Art: wippen, hopser, sprung, dreh, puls, wackeln) mit Herzen/Sternen/Noten, dazu ein Klang (`freude`). Zu sehen im Album („Mag am liebsten …“) und im Riff-Laden („Beliebt bei …“). Abzeichen: Lieblingsplatz, Gemütliches Riff (5 wohlfühlende Freunde), Futterzeit.
- **Deko in Bewegung** (`EMITTER`): Blasensäulen steigen als Teilchen auf, Kelp und Seegras wiegen, Helm, Truhe, Muschel, Amphore, Wrack und Höhle blubbern oder funkeln; fünf neue Deko-Stücke (Kelpwald, Wasserball, Sprungreifen, Felshöhle, Piratenwrack → 19). Deko-Klassen tragen das Präfix `d-` (sonst Kollision mit anderen Stilen).
- **Futter** (Knopf am Riff): Flocken sinken, die nächsten Freunde schwimmen hin und fressen („mampf!“). **Tag/Nacht**: im Modus `auto` ist es von 20 bis 6 Uhr Nacht (Überlagerung `.nachthaut`, Freunde schlafen mit Zzz). **Sprechblase** beim Antippen: Gruß, Hinweis auf den Lieblingsplatz oder ein Wort, das du schon gelernt hast (auf Wunsch mit Vorlesen). **Ziehen** funktioniert von der sichtbaren Stelle aus; beim Loslassen wird der neue Ort der Heimatplatz.
- **Ruhe**: Knopf „Leben an/aus“ (`.ruhe` friert die Animationen ein). Teilchen sind auf 70 gleichzeitig begrenzt, Teilchen und Töne entstehen nur im sichtbaren Ausschnitt (`lebenSichtbar`), die Schleife (`lebenTick`, `requestAnimationFrame`) läuft nur auf der Riff-Seite.
- **Test-Haken**: `window.__stunde` (Uhrzeit überschreiben), `window.__heute` (Datum). `tests/leben.js` prüft deterministisch (32 Prüfungen).

## Lernmodell (Startwerte, ungeprüft an der Praxis)
Lernstand gehört zur **Karte** (`u.cards[cid]`): `{ b, due, iv, ease, lapses, step, n, ok, last }`.
- Neue Karte: zwei „Gut“ nötig (Lernphase `step`), danach 1 Tag; „Leicht“ springt auf 4 Tage.
- Wiederholung wie Anki/SM-2: Gut = Intervall × Leichtigkeit (Start 2,5), Schwer × 1,2 (Leichtigkeit −0,15), Leicht × Leichtigkeit × 1,3 (+0,15), überfällige Tage zählen anteilig; Fehler: Leichtigkeit −0,2, neues Intervall 25 %, zurück in die Lernphase. Höchstens 365 Tage, Leichtigkeit 1,3 bis 3,2.
- **Projekt mit Enddatum** deckelt das Intervall auf die Hälfte der Restzeit (die Karte kommt vor dem Termin wieder). **Dauerprojekt** (ohne Ende) lässt die Intervalle wachsen; Ziel „Langzeit“ = Intervall ab 21 Tagen.
- Tiefe `b` (0 neu, 1 Lernphase, 2 gelernt, 3 sicher, 4 prüfungsfit, 5 tief) zählt erfolgreiche Wiederholungen und speist Projektziel, Tauchtiefe und Karte.
- Tagesplan: fällige Karten (relative Überfälligkeit) + neue Karten, gedeckelt durch Tempo (16/28/45). Neue Karten pro Tag = Rest / Lerntage (Reserve vor dem Termin). Freies Üben („Bonusrunde“) ändert den Plan nicht.
- Serie („Strömung“) zählt nur im Projekt, Ruhetage reißen sie nicht ab, eine automatische „Flossenpause“ pro Woche, Dauerprojekt hat statt Serie ein Wochenziel (3 Tage).

## Tempo der Belohnungen (nach dem ersten iPad-Test deutlich gedrosselt)
Eingestellt über `tests/logik.js` (14-Tage-Simulation, wird bei jedem Lauf ausgegeben). Stand: ein Lerntag bringt rund 100 XP, etwa 15–25 Perlen (Perlen nur für echten Fortschritt: Karte neu gelernt, jede zweite fällige Karte erfolgreich wiederholt) und etwa eine Muschel (Tagesziel = Perlmuschel; Strömung Tag 3 = Extra-Perlmuschel, alle 7 Tage Schatzmuschel; Meilensteine 50/75 % Perlmuschel, 100 % Schatzmuschel). Rang „Seepferdchen“ ab 300 XP (etwa Tag 4), „Bronze-Schwimmer“ ab 900 (etwa Tag 10), „Meereskönig“ ab 50 000 XP (rund 3 Jahre), danach alle 8000 XP ein Stern. Deko kostet 25 bis 220 Perlen. Alles in `R`, `RAENGE` (07-belohnung) und `DEKO` (06-katalog).

## Tippen: was als Fehler zählt (und was nicht)
Verglichen werden nur Buchstaben und Ziffern (`kern` in 13-ui-lernen). Groß-/Kleinschreibung, fehlende oder überzählige Leerzeichen, Satzzeichen, Apostrophe, Bindestriche und Sonderzeichen wie „+“ und „…“ sind egal. Dazu: „+ *Name*“-Platzhalter (nur der Teil davor ist Pflicht, danach darf alles folgen, aber Wortgrenzen zählen: „en France“ passt zu „en“, „english“ nicht), „…“ als Lücke für beliebigen Text („j’ai … ans“), Bedeutungen mit „;“ oder „ / “, „(sich)“ und „to“ optional, „jdn./etw./sth“ dürfen fehlen, bei „Hallo! Tschüss!“ genügt jede Hälfte. „Schwer“ statt „Gut“ gibt es bei fehlendem Artikel, falschen Akzenten (auch ß/ss) oder einem Tippfehler. Prüffälle: `tests/tippen.js` (77).

## Tauchtiefe schaltet Wesen frei
Jede Seltenheit lebt in einer Zone (`RAR` in 06-katalog): Gewöhnlich 0 m (Sonnenlicht-Zone), Selten ab 10 m (Korallenriff), Episch ab 100 m (Tiefsee), Legendär ab 400 m (Abgrund). Muscheln enthalten nur Wesen freigeschalteter Zonen; die Chancen werden darauf neu verteilt, der Schutzzähler für Episches läuft erst ab der Tiefsee. Tauchtiefe = 1 m je Karte „sicher“ (Box ≥ 3), +1 m „prüfungsfit“ (≥ 4), +1 m „Langzeit“ (Intervall ≥ 21 Tage); die tiefste erreichte Tiefe geht nie verloren (`u.tiefeMax`). Nach einem 14-Tage-Projekt mit ~60 Karten sind es etwa 90 m. Eine neue Zone gibt eine Schatzmuschel. Sichtbar im Tiefenmesser auf der Karte, im Album (Schloss an gesperrten Serien) und unter „Chancen“.

## Korallenfunken und Entwicklung
Doppelte Figuren geben neben Perlen **Korallenfunken** (2 / 4 / 6 / 8 je Seltenheit, `R.funken`). Damit stärkt man im Album gezielt einen Freund: Stern 2 / 3 / 4 / 5 kosten 5 / 10 / 16 / 24 Funken (`R.sternKosten`, `sternKaufen` in 07-belohnung). Die Sterne aus Funden (2., 4., 7., 11. Fund) gelten weiter, beides führt zum selben `owned[id].stern`. **Entwicklung**: Stern 1–2 = Stufe 1, Stern 3–4 = Stufe 2, Stern 5 = Stufe 3 (`figStufe`, 06-katalog). Gespeichert wird nichts Neues außer `u.funken`; die Stufe leitet sich aus dem Stern ab. Gezeichnet wird sie pro Art als **eigener Körper** in `src/js/05-evo-a.js` bis `05-evo-d.js` (je vier Arten; Register `ART.evo[art] = { 2: p => ({ hd, svg, rot? }), 3: … }`, `figur` in 05-arten baut daraus Bild, Aura und Funkeln). Stufe 1 ist der Rundling (nur Kopf), Stufe 2 bekommt Rumpf, Flossen/Arme, Muster und ein erstes Merkmal der Art (z. B. Oktopus „Tintenmeister“ mit Pinsel, Seehund „Wellenhüpfer“ mit Ball), Stufe 3 wird größer und prächtiger („Tintenkaiser“, „Robben-Champion“ mit Pokal). Baukasten `ART.kit`: `sym` (links zeichnen, rechts spiegeln), `klinge` (Flosse/Stachel, `k` > 0 hohl, < 0 bauchig), `stacheln`, `welle`, `brauen`, `augeA`, `funkel`, `mix`, dazu die Helfer der Grundfiguren; `hd` verankert das Zubehör (Hut, Kopfhörer, Brille …) am Kopf, `rot` kippt die ganze Figur (Delfin). Neue Art: Eintrag in `ART.evo` für Stufe 2 und 3 ergänzen (`tests/logik.js` prüft, dass jede Art beide hat), in `BEINAME` (06-katalog) zwei Beinamen und in `BEWEGUNG`/`FREUDE_ANIM`/`ART_PL` (14z-riffleben) eintragen. Kontaktblatt zum Ansehen: `node tests/art_blatt.js out.png evo alle 215` oder für einzelne Figuren/Arten `… evo finn,okko 440`. Die Entwicklungs-Animation (`zeigeEntwicklung`, 14-ui-sammlung) läuft beim Stern-Stärken und in der Muschel; im Riff sind entwickelte Freunde etwas größer (`STUFENGROESSE`). Abzeichen „Erste Entwicklung“ / „Volle Kraft“.

## Riff erweitern (Welt aus Kacheln)
Das Riff ist ein Raster aus Bildschirm-Kacheln (Start 1 × 1). Im „Riff-Laden“ bzw. über „Erweitern“ kauft man Spalten links/rechts (je max. 2) und Reihen nach unten (max. 3). Die Reihen sind die Tiefenzonen: Reihe 1 Korallenriff, 2 Tiefsee, 3 Abgrund; **tiefer geht es erst, wenn die Zone erreicht ist** (`zoneFrei`). Preise in `RIFF_EXT` (07-belohnung): 120, 200, 320, 500, danach je +200, steigend mit jedem Kauf, egal in welche Richtung. Gespeichert wird nur `u.riff.ext = {l, r, d}`; Positionen der Stücke sind in Einheiten (100 = eine Kachel, Ursprung = Start-Kachel, Werte dürfen negativ oder über 100 sein), alte Stände bleiben gültig. Darstellung: scrollbarer Bereich `#riffwrap` mit der Welt `#buehne` (CSS-Variablen `--u`/`--v` = Pixel je Einheit, gesetzt in `riffFit`); Finger scrollt auf Wasser, auf Stücken ziehen sie, am Rand scrollt die Ansicht mit; Maus zieht auch das Wasser; „Übersicht“ zoomt alles auf einen Blick. Hintergrund: Wasser dunkelt Zone für Zone ab, pro Zone Silhouetten (`SIL` in 14-ui-sammlung) und ein Zonenschild je Kachel.

## Ordner-Ziehen am iPad
Safari auf dem iPad gibt ganze Ordner nicht heraus (im Test bestätigt); mehrere markierte Dateien oder eine ZIP gehen. Die App bricht das Lesen nach 8 s ab, erkennt den Fall, nennt den Ausweg und zeigt unter „Technische Info“ auf, was der Browser geliefert hat. „Ordner wählen“ ist nur für den Rechner gedacht (am iPad ungeprüft). In der Web-Version entfällt das Ziehen für Kartenpakete aus dem Repo ganz.

## Erweitern
- **Neuer Kartensatz** (z. B. `FR-DE`): in `03-import.js` Eintrag in `SATZ` (+ `SATZ_REIHE`); der Kartenbau schreibt ihn nach Dateinamen-Schema.
- **Neue Sprache**: `SPRACHE` in 03-import (Buchstabe, Farben, TTS), Kartenbau-Präfix, Zeile in `SPRECHE_NAME` (10-ui-start).
- **Neue Figur**: Zeile in `FIG` (06-katalog) – Art, Palette, Zubehör, Seltenheit, Text, dazu ein Lieblingsplatz in `LIEBLING` (`tests/logik.js` prüft, dass jede Figur einen hat). **Neue Art**: siehe „Korallenfunken und Entwicklung“. **Deko**: Eintrag in `DEKO` (Preis, SVG; optional Teilchen in `EMITTER`, Animation in `style.css` mit Präfix `d-`) und mindestens eine Figur, die sie mag. **Abzeichen**: `BADGES` + Bedingung in `pruefeAbzeichen` (07).
- **Neuer Lernmodus**: `modusFuer`, `steuerHtml`, Aktionen in 13-ui-lernen; Auswahl in Kopfzeile und Einstellungen.
- **Neue Aktion** (Knopf mit `data-a="…"`): Eintrag in `AKT`; Aktionen, die Daten löschen oder ersetzen, gehören in die Verbotsliste von `tests/monkey.js`.
- Alle Belohnungszahlen stehen gebündelt in `R`, `MUSCHEL`, `RAENGE` (07-belohnung).
- **Globale Namen**: Alle Dateien von `src/js` landen in einem gemeinsamen Bereich. `node tests/namen.js` meldet doppelte Namen (kam vor: `kartenListe`).

## Neue Fassung veröffentlichen
1. In `src/` ändern, `node bauen.js` und die Tests laufen lassen.
2. `VERSION` in `bauen.js` nur bei größeren Schritten erhöhen (neue Datei `Wortriff_V0x.html`, alte bleiben liegen). Die Kennung ändert sich bei jeder Inhaltsänderung von selbst.
3. `node repo-bauen.js`, dann `index.html`, `sw.js`, `version.json` (und alles, was sich sonst geändert hat) im Repo ersetzen. Die Geräte holen die neue Fassung bei der nächsten Prüfung.
4. Neue Karten: ZIP nach `repo-karten/` legen und `repo-bauen.js` ausführen, oder die ZIP direkt in den Ordner `karten/` des Repos laden (dann findet die App sie über das GitHub-Verzeichnis; `index.json` kann beim nächsten Bau nachgezogen werden). **Dateinamen von Paketen und Bildern nie ändern**, daran hängt der Lernstand.

## Grundsätze
Belohnungen gehören dem Kind dauerhaft, nichts verfällt. Kein Druck ohne selbst gewähltes Projekt. Chancen der Muscheln sind in der App einsehbar („Chancen“). Keine Käufe, keine Werbung. Figuren und Namen sind frei erfunden (nicht die Originalfiguren der Bücher). Die Update-Prüfung lädt nur die eigenen Repo-Dateien und schickt keine Nutzerdaten weg. Verbindungen gehen ausschließlich zu GitHub (die Seite selbst, `api.github.com` für das Kartenverzeichnis, ersatzweise `raw.githubusercontent.com`), ohne Anmeldung.

## Nicht geprüft
Auf einem echten iPad (Safari/„Dokumente“-App/Home-Bildschirm) wurde noch nichts ausprobiert: Ordner-Ziehen, Ordnerauswahl, **Hinzufügen zum Home-Bildschirm und das Verhalten des Speichers dort**, Service Worker und Offline-Start auf iPadOS, Teilen-Blatt mit JSON-Datei, Zwischenablage, Vorlesestimmen, Bildschirmtastatur im Tipp-Modus, Ton, Flüssigkeit des lebendigen Riffs bei vielen Figuren. Getestet ist in Edge (iPad-Maße) und teils in WebKit/Playwright gegen einen lokalen Testserver. Außerdem offen: Verhalten bei mehr als 60 API-Abfragen pro Stunde (dann gilt `index.json`), Urheberrecht öffentlicher Kartenpakete auf GitHub Pages (das Repo ist öffentlich lesbar). Fortschritt deshalb regelmäßig unter „Ich → Daten“ sichern.
