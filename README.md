# Explorer Share

Datei-Sharing mit Windows-7-Explorer-Oberfläche, am Layout von mirrors.equipable.org orientiert. Eigenständige Node.js-Anwendung mit CodeMirror-Editor im Notepad++-Stil, fflate für ZIP und PHP 8.4 als isolierte WebAssembly-Vorschau. Symbole und Quellen: public/icons/ATTRIBUTION.md.

## Start

Node.js ab 24.18 installieren, im Projektordner die Abhängigkeiten mit `pnpm install` installieren und `pnpm build` ausführen. Dann `pnpm start` oder `node server.mjs` starten. Das gebaute public/editor.bundle.js liegt bereits bei. Die Anmeldung liegt ausschließlich auf http://localhost:3000/login. Dort beim ersten Aufruf lokal ein Administratorkonto mit mindestens 12 Zeichen Passwort anlegen. Es gibt keine Standard-Zugangsdaten und keinen öffentlichen Login-Knopf.

Dateien und Kontodaten liegen dauerhaft in `data/`. Diesen Ordner einschließlich `database.json` zusammen sichern. Eine Instanz pro Datenverzeichnis betreiben. Bestehende Ein-Konto-Datenbanken werden automatisch migriert; die bisherige Datenbank wird vorher als database.before-multiuser.json gesichert. Dateien werden in die echte Struktur unter data/Explorer/Users/<Benutzer>/ übernommen; die alten ID-Dateien bleiben als Sicherung erhalten.

## Benutzer und Pfade

- Unter Computer → Windows (C:) → Users liegt das eigene Benutzerverzeichnis mit Desktop, Downloads, Documents, Music, Pictures und Videos.
- Private Pfade: `/C/Users/<Benutzername>/Documents/Ordner/Datei.txt`. Öffentliche Freigaben: `/C/Users/share/Ordner/Datei.txt`. URLs lassen sich direkt öffnen; die Identität wird serverseitig geprüft, ein Benutzername im Pfad erteilt keine Berechtigung.
- Jede Person sieht und verwaltet nur die eigenen privaten Dateien. Administratoren können auf `/login` über „Benutzer verwalten“ weitere Konten anlegen. Benutzer melden sich mit Benutzername und Passwort an und haben eigene Profilbilder.
- Neue Dateien und Ordner direkt im Host-Speicher werden ohne Neustart eingelesen; eine offene Ordneransicht aktualisiert sich alle drei Sekunden. Eigene Freigaben werden dabei nicht automatisch gesetzt.
- Alle neuen Benutzer erhalten eigene Standardordner. Auch im Benutzer-Hauptordner sind neue Dateien und Ordner möglich.

## Nutzung

- Doppelklick öffnet Ordner, Bilder, Text-/Programmierdateien und HTML/PHP-Vorschauen. PNG, JPEG, GIF, WebP und BMP werden unterstützt. Andere Binärdateien werden heruntergeladen. JAR und EXE erhalten eigene klassische Dateisymbole.
- Bilder öffnen in der Fotoanzeige mit Bildwechsel, Zoom, Verschieben, Drehen der Ansicht, Diashow, Vollbild und Bildinformationen. Drehungen verändern die Originaldatei nicht.
- Musik und Video öffnen in einem Player im klassischen VLC-Stil: Abspielen/Pause, Stopp, Vor/Zurück, Zeitregler, Lautstärke, Stummschaltung, Geschwindigkeit, Vollbild, Wiederholung, Zufallswiedergabe und Wiedergabeliste aus den sichtbaren Medien desselben Ordners. Videos können lokale WebVTT-Untertitel laden. Streaming unterstützt HTTP-Range und prüft für jede Anfrage die Zugriffsrechte. Die Wiedergabe nutzt die Browser-Codecs; es ist keine libVLC-Engine und keine serverseitige Transkodierung enthalten. Nicht unterstützte Formate können heruntergeladen werden.
- Desktop, Downloads, Documents, Music, Pictures und Videos sind getrennte Speicherbereiche. Ordner, Uploads und Verknüpfungen werden im geöffneten Bereich bzw. Unterordner angelegt. Vorhandene Einträge ohne Bereich bleiben unter Downloads erhalten.
- Nach Anmeldung erscheint die Verwaltungsleiste. Die öffentliche Ansicht enthält keinen Menü- oder Login-Knopf. Rechtsklick auf die freie Dateifläche bietet nach Login ebenfalls Verwaltungsaktionen.
- Nach Login: Upload per Schaltfläche oder Drag-and-drop, Ordner erstellen, Umbenennen, Löschen und Freigeben per Rechtsklick oder „Organisieren“. Auf freier Fläche bietet Rechtsklick auch „Neue Textdatei“.
- Rechtsklick auf Text- oder Programmierdateien → „Bearbeiten“ öffnet den Editor. Er bietet Syntaxfarben, Zeilennummern, Code-Faltung, Menü- und Symbolleiste, Suchen/Ersetzen, Rückgängig/Wiederholen, Einrückung, Zeilenumbruch und Statusanzeige. Speichern auch mit Strg+S. UTF-8 und UTF-16 LE werden unterstützt; LF/CRLF bleiben erhalten. Limit: 2 MB. Bei konkurrierender Änderung wird ein veralteter Speicherstand abgewiesen.
- HTML, HTM, PHP und PHTML öffnen als Website in einem sandboxed iframe. Relative CSS-, JS- und Bilddateien desselben Ordnerbaums werden bei passenden Zugriffsrechten geladen. PHP läuft pro Aufruf in einer frischen WebAssembly-Umgebung ohne eingebundenes Host-Dateisystem oder Netzwerk. Keine persistenten PHP-Sitzungen, Datenbanken oder Schreibzugriffe auf die gespeicherten Projektdateien. Limits: 6 Sekunden, 64 MB PHP-Speicher, 100 Projektdateien, 16 MB Projektinhalt, 2 MB Ausgabe. Diese Vorschau ersetzt keinen vollständigen PHP-Webhost.
- Rechtsklick auf eine Datei oder einen Unterordner → „ZIP erstellen“. Rechtsklick auf ZIP → „Hier entpacken“. Das Archiv bzw. der neue Zielordner liegt neben der Quelldatei. Limits: 1000 Einträge, 64 MB unkomprimierter Inhalt und 32 MB hochgeladenes ZIP zum Entpacken. Unsichere Pfade und Namenskonflikte werden abgewiesen. Entpacken überschreibt keine vorhandenen Dateien und setzt keine eigenen öffentlichen Freigaben.
- Dateien, Ordner und Internetverknüpfungen können mit Strg+X / Strg+V oder per Rechtsklick ausgeschnitten und eingefügt werden. Ziehen auf einen Ordner verschiebt die Auswahl; mögliche Ziele werden hervorgehoben. Ordner im linken Baum klappen nach kurzem Verweilen auf. Mehrfachauswahl per Ziehrahmen auf freier Fläche, Strg-Klick, Umschalt-Klick oder Strg+A. Namenskonflikte werden ohne Überschreiben abgewiesen; Standardordner können nicht verschoben werden. Eigene Freigaben bleiben erhalten; geerbte Freigaben richten sich nach dem neuen Elternordner.
- Neue Einträge sind privat. Eine Ordnerfreigabe wirkt rekursiv und auch auf später hinzugefügte Inhalte.
- Über „Neue Verknüpfung“ Website-Adresse, Namen und optional eigenes Bild als Icon festlegen. Doppelklick öffnet die Website in einem neuen Tab. HTTP/HTTPS-Adressen sind erlaubt, ausführbare URL-Schemata gesperrt. Verknüpfungen können per Rechtsklick bearbeitet und wie Dateien freigegeben werden.
- Auf `/login` nach Anmeldung „Profilbild ändern“ wählen: originale Windows-7-Kontobilder oder eigenes Bild hochladen. Eigene Bilder werden mittig quadratisch zugeschnitten und als 256-Pixel-PNG gespeichert. Das Profilbild und der Kontoname werden auf der Login-Seite angezeigt.
- Die Anmeldung bietet dauerhaft Benutzername und Passwort als Eingabefelder. Das Benutzerbild bleibt erhalten und passt sich bei bekannten Kontonamen an. Weitere Konten werden vom Administrator unter `/login` → „Benutzer verwalten“ angelegt.
- „Freigabe zurücknehmen“ entfernt auch die Freigaben aller enthaltenen Einträge. Einzelne Dateien oder Unterordner lassen sich von einer geerbten Freigabe ausnehmen und später ausdrücklich erneut freigeben.
- Gäste sehen ausschließlich öffentliche Inhalte. Einzelne Freigaben innerhalb privater Ordner erscheinen im öffentlichen Hauptverzeichnis; private Elternnamen bleiben verborgen. Freigabe-Metadaten und Symbole werden Gästen nicht ausgeliefert.
- Öffentliche Links benötigen kein Login; Uploads sind immer geschützt. Uploadlimit: 1 GB pro Datei. Bildvorschauen prüfen dieselben Zugriffsrechte wie Downloads.

## Serverbetrieb

Docker-Anleitung: [DOCKER.md](DOCKER.md). Im Container ist `/Explorer` der Mountpoint und `/Explorer/Users/<Benutzer>/…` die echte Ordnerstruktur. Lokal liegt dieselbe Struktur standardmäßig unter `data/Explorer/Users/…`; `EXPLORER_ROOT` kann diese Speicherwurzel ändern. Die Grundordner werden für alle Benutzer angelegt. Metadaten bleiben im `DATA_DIR`.

Standardmäßig nur auf 127.0.0.1:3000 erreichbar. Für externen Betrieb hinter einem HTTPS-Reverse-Proxy `HOST=0.0.0.0` und `COOKIE_SECURE=1` in der Serverumgebung setzen. `PORT` und `DATA_DIR` sind optional. Der Proxy muss den öffentlichen Host-Header beibehalten; Request-Body-Limit und Timeouts für große Uploads passend einstellen. Ersteinrichtung zuerst lokal erledigen. Sitzungen laufen nach 8 Stunden ab und werden beim Logout sowie Serverneustart ungültig. Ein Serverprozess, lokaler Dateispeicher und atomare Metadaten-Speicherung; kein Clusterbetrieb.

Noch nicht enthalten: Passwortänderung und Kontolöschung in der Oberfläche, Papierkorb, PDF-/Office-Vorschau, Speicherquoten und zeitlich begrenzte Freigaben. Vor produktivem Internetbetrieb sind die konkrete HTTPS-/Proxy-Konfiguration und ein unabhängiger Sicherheitsreview erforderlich.

## Prüfung

`pnpm test` prüft Berechtigungen, Kontentrennung, Upload/Download, Freigaben, Speicherbereiche, Textbearbeitung mit Versionsprüfung, PHP-Ausgabe, ZIP-Rundlauf und Pfadschutz sowie die verlustfreie Migration. `node scripts/qa-server.mjs` startet eine isolierte Oberfläche mit temporären Testdaten auf Port 3001; das produktive Datenverzeichnis bleibt dabei unberührt.


