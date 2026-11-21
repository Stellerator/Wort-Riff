# Wortriff

Vokabel-Lern-App fürs iPad: Fassung **V04** (Kennung `8c74830`, Stand 2026-11-21 16:30). Sie läuft im Browser, lässt sich auf den Home-Bildschirm legen und funktioniert danach auch ohne Netz. Updates und neue Kartenpakete holt sie sich von selbst aus diesem Repo.

## Was liegt in dieser ZIP-Datei?

| Datei / Ordner | Zweck |
|---|---|
| `index.html` | die ganze App (HTML, Schriften, Bilder, Programm) |
| `sw.js` | Offline-Kopie und App-Update (Service Worker) |
| `manifest.webmanifest`, `icon-180.png`, `icon-192.png`, `icon-512.png` | Name und Symbol (Finn Flosse) für den Home-Bildschirm |
| `version.json` | Kennung der Fassung |
| `karten/` | die Kartenpakete (ZIP-Dateien aus dem Kartenbau) und `index.json` (Liste der Pakete) |
| `quelle/` | Quellcode, Bau, Werkzeuge und Tests. Für den Betrieb nicht nötig. |
| `.nojekyll` | leere Datei, sagt GitHub Pages: Dateien unverändert ausliefern (Dateiname beginnt mit einem Punkt, manche Programme blenden ihn aus; fehlt sie nach dem Hochladen: *Add file → Create new file*, Name `.nojekyll`, *Commit*) |

Enthaltene Kartenpakete:

- Englisch · Green Line · Unit 1 (Englisch_Unit01.zip, 8,6 MB, 121 Karten)
- Englisch · Green Line · Verben (Englisch_Verben_Paeckchen2.zip, 1,1 MB, 15 Karten)
- Englisch · Green Line · Unit 1 (Englisch_Vokabeltest_Nr3.zip, 7,6 MB, 98 Karten)
- Französisch · C’est parti ! · C’est parti ! (Franzoesisch_Lektion01.zip, 5,8 MB, 79 Karten)
- Französisch · À plus! · Unité 1 (Franzoesisch_Lektion02.zip, 5,9 MB, 83 Karten)

## 1. Veröffentlichen mit GitHub Pages (einmalig)

1. Auf GitHub ein neues Repository anlegen, z. B. `wortriff`.
2. Die ZIP-Datei entpacken und den **Inhalt** ins Repository bringen (nicht den äußeren Ordner: `index.html` muss ganz oben im Repository liegen):
   - **Im Browser am Rechner:** *Add file → Upload files*, dann alle entpackten Dateien und Ordner in das Fenster ziehen. Ordner ziehen geht nur am Rechner, nicht am iPad. Diese ZIP enthält 87 Dateien (ohne `quelle/` nur 16), die größte ist `karten/Englisch_Unit01.zip (8,6 MB)`. Im Browser nimmt GitHub höchstens 100 Dateien je Upload und 25 MB je Datei an. Wird eine Grenze überschritten, in zwei Uploads teilen: zuerst alles außer `quelle/`, danach `quelle/`.
   - **Mit GitHub Desktop oder git:** Inhalt in den Ordner des geklonten Repositorys kopieren, *Commit*, *Push*. Dabei gelten diese Grenzen nicht.
3. *Settings → Pages → Build and deployment*: Branch `main`, Ordner `/ (root)`.
4. Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/<repository>/` erreichbar.

**Das Repository darf danach nicht umbenannt oder verschoben werden.** Der Lernstand hängt an der Adresse der App. Ändert sich die Adresse, startet die App auf den Geräten mit leerem Speicher (dann hilft die Sicherung, siehe 3.).

**Öffentlich:** GitHub Pages hat keinen Passwortschutz. Jeder mit dem Link kann die App und alle Kartenpakete laden. Die Karten enthalten Vokabeln aus Schulbüchern. Wer das nicht möchte, lässt `karten/` leer und liest Karten wie bisher per ZIP unter „Karten“ ein.

## 2. Auf dem iPad installieren

1. In **Safari** die Adresse der App öffnen.
2. *Teilen* (Quadrat mit Pfeil) → **Zum Home-Bildschirm** → *Hinzufügen*.
3. Ab jetzt immer **über das neue Symbol** starten.

Warum? Safari-Tab und Home-Bildschirm-App haben auf dem iPad nach den Angaben von WebKit **getrennten Speicher**. Außerdem darf iPadOS den Speicher einer Website im Safari-Tab löschen, wenn man sie 7 Tage nicht benutzt hat; Home-Bildschirm-Apps sind davon ausgenommen (eigener Zähler). Unter *Ich → App und Updates* zeigt Wortriff, ob das Gerät den Speicher als „dauerhaft“ zugesagt hat. Im Browser-Tab erinnert die App an die Installation (mit „Später erinnern“).

## 3. Fortschritt und Karten vom alten Gerät oder aus der alten Version mitnehmen

Der Lernstand liegt im Speicher des Browsers, nicht in der HTML-Datei. Eine neue Adresse bedeutet deshalb einen neuen, leeren Speicher. Der Umzug geht über eine **Sicherungsdatei**; die Kartenbilder kommen danach von selbst aus dem Repo.

**In der alten Version (bleibt unverändert, nichts wird gelöscht):**

1. *Ich → Daten → „Fortschritt sichern“*. Die Datei `Wortriff_Sicherung_<Datum>.json` landet im Ordner „Downloads“ bzw. in „Dateien“ (ab Fassung V03 öffnet sich dafür das Teilen-Blatt: „In Dateien sichern“). Vor dem nächsten Schritt nachsehen, ob die Datei wirklich da ist.

**In der neuen App (vom Home-Bildschirm gestartet!):**

2. Erste Seite: *„Sicherung laden“* (oder *Ich → Daten → „Sicherung laden“*), die Datei wählen. Wortriff zeigt eine **Zusammenfassung** (Nutzer, Lektionen, Karten, Antworten). Mit *„Übernehmen“* wird der Stand ersetzt. Eine Kopie des vorherigen Stands bleibt für *„Rückgängig“* erhalten.
3. Die Kartenbilder holt die App jetzt selbst aus dem Repo (unten läuft „Karten 1/5: … laden“). Danach zeigt *Ich → App und Updates → „Kartenprüfung“*: „Alle … Karten haben ihre Bilder.“
4. Fehlen Bilder (z. B. eine Lektion, die nicht im Repo liegt), nennt die App die Lektion. Dann die ZIP-Datei dieser Lektion unter *Karten* hineinziehen. Der Lernstand dieser Karten ist schon da.
5. Erst wenn alles stimmt, die alte Version ablegen. Es gibt keinen Zwang, sie zu löschen.

**Was in der Sicherung steckt:** alle Nutzer mit Lernstand, Projekten, Belohnungen, Album und Riff sowie die Liste der Lektionen und Wörter. **Nicht** enthalten sind die Kartenbilder (sie kommen aus dem Repo) und die Merkliste „welche Pakete sind geladen“ (sie gilt nur für das jeweilige Gerät).

**Mehrere Geräte:** Jedes Gerät hat seinen eigenen Speicher. Der Fortschritt wandert nur per Sicherung, einen automatischen Abgleich gibt es nicht.

**Notweg ohne Datei (erst ab V03):** Unter *Ich → Daten* gibt es **„Als Text kopieren“** und **„Aus Text laden“**. Der Text lässt sich über die Zwischenablage (z. B. über eine Notiz) von einer Umgebung in die andere bringen. Das geht nur, wenn beide Seiten schon V03 oder neuer sind, etwa beim Wechsel vom Safari-Tab der Web-App auf das Home-Bildschirm-Symbol.

## 4. Neue Kartenpakete ins Repo stellen

Pakete sind die ZIP-Dateien aus dem Kartenbau (`Englisch_Unit05.zip`, `Franzoesisch_Lektion03.zip` …). Der Dateiname des Pakets ist frei, die Namen der Bilder darin (`E05_DE-EN_011_1-vorne.webp`) dürfen sich nicht ändern, denn daran hängt der Lernstand.

**Weg A: von Hand, ohne Programme**

1. Im Repository den Ordner `karten` öffnen → *Add file → Upload files* → die ZIP hineinziehen → *Commit*.
2. Nach ein bis zwei Minuten liegt sie auf GitHub Pages. Beim nächsten Update-Check findet die App sie über das GitHub-Verzeichnis und lädt sie. Das klappt bei Adressen der Form `https://<name>.github.io/<repository>/` (und bei einer Seite `https://<name>.github.io/`); GitHub erlaubt dafür 60 Abfragen pro Stunde und Netzwerk. Wird das einmal knapp, nutzt die App die Liste `karten/index.json`. Bei einer eigenen Domain kennt die App das Verzeichnis nicht: Dann entweder Weg B gehen oder in `karten/index.json` `"repo": { "owner": "<name>", "repo": "<repository>" }` ergänzen.

**Weg B: mit dem Werkzeug (Claude)**

1. Die neue ZIP in den Ordner `repo-karten` der Arbeitskopie legen (Quelle: `ausgabe\`, PNG-Pakete vorher mit `werkzeuge\karten-vorbereiten.ps1` in WebP umwandeln).
2. `node repo-bauen.js` erzeugt `karten/index.json` und die ZIP für das Repo neu.
3. Die geänderten Dateien im Ordner `karten/` hochladen.

**Was auf den Geräten passiert**

- **Neues Paket:** wird beim Update-Check automatisch geladen und eingelesen. Stehen mehr als 15 MB auf einmal an, fragt die App einmal nach; sagst du „Ja“, lädt sie künftig auch große Mengen von selbst.
- **Geändertes Paket** (gleicher Dateiname, neuer Inhalt): die Lektion wird aktualisiert, der Lernstand bleibt.
- **Bewusst entfernte Lektion** (Karten → Papierkorb): kommt auch bei Änderungen im Repo nicht ungefragt zurück. Wer sie wieder will, nutzt *Karten → „Kartenpakete im Repo“ → Laden*.
- **Paket aus dem Repo löschen:** hat auf den Geräten keine Wirkung, die Karten bleiben dort.

## 5. Updates

- Die App prüft **von selbst** beim Start, beim Zurückkehren in die App und alle 30 Minuten (abschaltbar unter *Ich → App und Updates*).
- Von Hand: *Ich → App und Updates → „Nach Updates suchen“*.
- Eine neue App-Fassung wird im Hintergrund geladen. Auf den Startseiten installiert sie sich, sobald gerade nichts angetippt wird. Sonst erscheint unten **„Neue Version bereit – Jetzt installieren“**. Mitten in einer Lernrunde lädt die App nie von selbst neu.
- **Neue Fassung veröffentlichen:** `node repo-bauen.js` (die Kennung in `sw.js`, `version.json` und `index.html` wird automatisch gesetzt), dann `index.html`, `sw.js` und `version.json` (und was sich sonst geändert hat) im Repository ersetzen. GitHub Pages braucht danach ein, zwei Minuten.
- Fortschritt und Karten bleiben bei jedem Update erhalten.

## 6. Wenn etwas hakt

- **Die alte Fassung erscheint noch:** *Nach Updates suchen*, zwei Minuten warten, die App ganz schließen (nach oben wischen) und neu öffnen.
- **Nach dem Anlegen des Symbols ist alles leer:** normal, siehe 3. Sicherung laden.
- **Karten fehlen:** *Ich → App und Updates → „Kartenprüfung“* oder *Karten → „Fehlende Bilder nachladen“*.
- **Symbol vom Home-Bildschirm löschen:** entfernt die App und kann ihren Speicher löschen. Vorher sichern.
- **Ohne Netz:** Die App startet aus der Offline-Kopie. Updates und neue Karten warten, bis es wieder Netz gibt.

## 7. Neu in V04

- **Generalprobe:** Im Projekt gibt es den Knopf „Generalprobe“. Du wählst alle Karten oder eine Auswahl (Haken oder Schnellfilter wie „Noch nicht sicher“, „Schon mal falsch“, „Zufällig 20“), dazu Karten, Quiz oder Tippen. Am Ende steht eine Auswertung mit den Karten, die noch wackeln. Der Lernplan ändert sich dabei nicht.
- **Überraschungspakete:** Je mehr Karten in einer Generalprobe abgefragt werden (ab 5, 15, 30 und 60), desto größer das Paket. Darin stecken Perlen, Korallenfunken, Freunde oder besondere Gegenstände. Ein Paket pro Projekt und Tag.
- **Mythen der Tiefe:** Zehn mystische Fabelwesen und Gegenstände mit Leuchten, die es nicht im Riff-Laden gibt. Sehr selten in Muscheln und in großen Paketen, im Album gesammelt und im Riff aufstellbar.
- **Riff lebendiger:** Die Freunde spielen mit Ball und Sprungreifen, verstecken sich, spielen Fangen, schwimmen hinterher, buddeln im Sand, staunen über Mythen und blinzeln. Ein Tipp ins Wasser lockt sie an. Neue, hochwertigere Effekte: Lichtkegel am Leuchtturm, warmes Laternenlicht, Lichtbahnen, Wasseroberfläche, glasige Blasen und nachts leuchtendes Plankton.
- **Vokabel-Modus im Riff:** Mit dem Buch-Knopf lässt du dir von den Freunden Vokabeln abfragen. Ein „?“ über einem Freund zeigt, dass er etwas wissen möchte. Perlen gibt es dafür bewusst nur wenige (jede zweite richtige Antwort, höchstens 3 am Tag), damit die Perlen aus den Lektionen ihren Wert behalten; der Lernplan bleibt unberührt. Der Modus ist beim Start immer aus und lässt sich mit dem Knopf oder der grünen Leiste jederzeit abschalten.
- **Riff:** Schlafende Tiere schließen nachts die Augen. Ein Schloss-Knopf sperrt die Tiere gegen versehentliches Antippen beim Füttern und Zoomen.
- **Update:** Wer V03 schon als Web-App nutzt, bekommt V04 beim nächsten Update-Check von selbst. Lernstand und Karten bleiben erhalten.

## 8. Neu in V03

- Als Web-App aufs iPad: Home-Bildschirm-Symbol, Offline-Start, Update-Prüfung, Kartenpakete aus dem Repo.
- Umzug per Sicherung mit Vorschau, Kartenprüfung und „Rückgängig“; Sicherung über das Teilen-Blatt oder als Text.
- **Lebendiges Riff:** Freunde schwimmen von selbst durchs Riff und haben Lieblings-Gegenstände (im Album und im Riff-Laden nachzulesen). Stehen sie dabei, fühlen sie sich wohl, freuen sich und besuchen den Platz immer wieder. Dazu: Blasensäulen und wiegende Pflanzen, Tag und Nacht (nachts schlafen alle), Futter streuen, Sprechblasen mit Wörtern, die du schon kennst, fünf neue Deko-Stücke (Kelpwald, Wasserball, Sprungreifen, Felshöhle, Piratenwrack) und drei Abzeichen. Alles lässt sich über die Knöpfe am Riff ruhigstellen.

## Technik

Eine einzelne HTML-Datei, gebaut aus `quelle/src/`. Daten liegen in IndexedDB im Browser (`wortriff`: `kv` = Zustand, `img` = Kartenbilder). Der Service Worker (`sw.js`) legt die App-Dateien beim Installieren in den Cache (Name `wortriff-<Fassung>`); `karten/` und `version.json` gehen immer ans Netz. Bauen und Testen: siehe `quelle/README.md`.

Auf einem echten iPad wurde das **noch nicht** ausprobiert (Installation, Teilen-Blatt, Speicherverhalten, Offline-Start). Getestet ist alles in Edge mit iPad-Maßen gegen einen lokalen Testserver, der sich wie GitHub Pages verhält. Fortschritt deshalb regelmäßig sichern.
