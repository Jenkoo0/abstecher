# Fortschritt ABSTECHER (Arbeitstitel, Favorit „CALM DOWN“)

Stand: 10.11.2026. Nichts umbenannt, nichts gemergt, nichts deployed.

Die fünf Punkte sind als reine, getestete Module gebaut. Sie hängen nicht an einer Szene, weil die Spiellogik in diesem Repository-Stand fehlt. `sim`, `view3d`, `draw` und `src/components/Abstecher` wurden nicht nachgebaut.

## Ausgangslage

Der letzte Commit heißt „Add stations, sim, view3d, draw and Abstecher component“, enthält diese Dateien aber nicht.

Vor dieser Arbeit war `npm run build` nicht lauffähig:

- kein `tsconfig.json`, kein `vite.config.ts`, kein `index.html`, kein Einstieg
- `src/game/stations.ts` war nur der ungültige Bezeichner `PLACEHOLDER_STATIONS`
- `src/routes/index.tsx` importiert `@/components/Abstecher`, die Datei gibt es nicht
- keine Bewegung, kein Kampf, kein Render-Loop

Minimal repariert, damit `tsc && vite build` läuft:

- `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `src/vite-env.d.ts`
- `src/main.ts` ist nur ein Build-Einstieg. Er startet kein Spiel.
- `src/game/stations.ts` exportiert den Marker jetzt als String `PLACEHOLDER_STATIONS`. Es gibt weiterhin keine Bahnhofsliste.
- `src/routes` ist in `tsconfig.json` ausgeschlossen, weil die Route die fehlende Abstecher-Komponente importiert. Die Route-Datei selbst ist unverändert.

`npm test` ist neu (`vitest run`, devDependency `vitest` und `@types/node`).

## 1. Bahnhofsdurchsagen

**Status:** Logik und Textauswahl fertig. Kein Banner in einer laufenden Szene, weil es die Szene nicht gibt. Sprachausgabe ist anschließbar und abschaltbar.

**Gebaut:** Satirische Zeilen im DB-Ton für Rundenstart, Zugeinfahrt, Vorsteher und Game Over. Die sechs Startbahnhöfe (Kiel, Hamburg, Köln, Frankfurt, München, Berlin) haben eigene Zeilen, alles andere fällt auf eine allgemeine Fassung zurück. Game Over sagt „Wir bitten um Ihr Verständnis. Ihre Reise endet hier.“ Vorsteher und Game Over unterbrechen, Zug und Runde warten in einer kurzen Schlange. Neue Texte nutzen Fantasienamen (`Turbostaub`), keine echten Drogennamen. `speakAnnouncement` spricht nur, wenn ein Ausgang da ist und die Stimme an ist. Ohne `speechSynthesis` bleibt es beim Text.

**Dateien:** `src/game/feel/announcements.ts`, `src/game/feel/speech.ts`, `src/game/feel/stepFeel.ts`, Tests daneben.

**Einbau:** Die Sim ruft bei den vier Ereignissen `pickAnnouncement` auf und gibt das Ergebnis an `stepFeel` als `announcement`. `speechCue` geht an `speakAnnouncement`, gesteuert von Taste `N`. Sichtbare Opacity und der Versatz kommen aus `announcementPresentation` (Punkt 5), der Text aus diesem Modul. `tickBanner` bekommt die echte Framezeit, nicht die Hitstop-Zeit.

**Grenzen:** Keine echte Stimme im Test (Node ohne Browser). Kein Gong, keine Per-Land-Audio. Die Schlange fasst drei Zeilen. Ein Vorsteher wirft wartende Kleinanzeigen weg.

## 2. Hitstop

**Status:** Zeitskala fertig. Kein Kamerarig in der Szene. Der Shake ist ein Versatz, den nur die Kamera lesen darf.

**Gebaut:** Treffer 50 ms, Wurf 74 ms, Kill 90 ms, hartes Einfrieren (`timeScale` 0). Ein kürzerer Treffer schneidet einen längeren nicht ab und Zeiten werden nicht addiert. Der Shake liegt in Schlagrichtung, in Metern: 0,05 / 0,10 / 0,15. Er klingt in 100 ms linear ab und geht nicht in die Sim-Zeit.

**Dateien:** `src/game/feel/hitstop.ts`, `src/game/feel/stepFeel.ts`.

**Einbau:** Einmal pro Frame `stepFeel` (oder `triggerHitstop` + `tickHitstop`) mit der echten Framezeit. Physik, KI, Cooldowns, Sprung und Slide bekommen nur `simDtMs`. `shake` geht an `stepCamera`, nicht an den Körper. So bleiben die Systeme beieinander.

**Grenzen:** Keine Zeitlupe. Der Shake ist schon in Metern und darf nur auf die Kamera.

## 3. Slide und Dash

**Status:** Zustandsmaschine fertig. Keine Figur, die sie abspielt.

**Gebaut:** Slide nur am Boden, nur im Sprint und nur ab 6 m/s. Taste ist Q (`KeyQ`). C bleibt Stechen, Strg ist nicht belegt. Dash bleibt Umschalt (14 m/s, 180 ms) und geht auch aus der Luft. Slide (9,5 m/s) und Dash gleichzeitig starten den Slide und brechen ihn nach 80 ms in den Dash ab. Unverwundbar sind nur die ersten 100 ms des Dash. Getrennte Cooldowns.

**Dateien:** `src/game/feel/slideDash.ts`, `src/game/feel/controls.ts`.

**Einbau:** Kanten von Q und Umschalt als `slidePressed` und `dashPressed`, zusammen mit Boden, Sprint-Flag und Geschwindigkeit in m/s. `dtMs` ist `simDtMs`. `speed` aus dem Modul ersetzt die Laufgeschwindigkeit, solange der Modus nicht `free` ist. `heightScale` ist der Hinweis fürs Ducken unter Bänke und bleibt auch bei Reduced Motion eine Hitbox-Frage. Die sichtbare Pose kommt aus `locomotionPose`.

**Grenzen:** Kein Messerstich aus dem Slide, kein Bewegungsunschärfe-Effekt. Die Hitbox muss die Sim selbst verkleinern.

## 4. Sprungphysik

**Status:** Schrittfunktion fertig. Kein Charakter-Controller.

**Gebaut:** Coyote Time 100 ms inklusive, Jump-Buffer 120 ms inklusive, frühes Loslassen kürzt die Aufwärtsgeschwindigkeit einmal (`JUMP_CUT` 0,48). Einheiten sind Meter: Absprung 10,5 m/s, Aufstieg 23 m/s² (Scheitel etwa 2,4 m), Fall 52 m/s². Ein zweiter Sprung über Coyote nach einem echten Absprung geht nicht. Solange `vy > 0`, klebt ein noch gemeldeter Boden den Sprung nicht ab.

**Dateien:** `src/game/feel/jump.ts`.

**Einbau:** `stepJump` mit `simDtMs`. `grounded` aus der Kollision. Wenn `jumped` wahr ist, den Körper in diesem Frame nicht wieder auf den Boden snappen. `vy` ist Meter pro Sekunde.

**Grenzen:** Kein Wandlauf, keine variable Schwerkraft über Pickups. Die Sim muss dieselbe Meter-Skala verwenden.

## 5. Animationen

**Status:** Reine Werte über die Zeit. Nichts schreibt in eine Three.js-Szene. Reduced motion ist an jeder Stelle anschließbar.

**Gebaut:**

- Easing (`easeOutCubic`, `easeInQuad`, `easeOutBack`) und Tweens für Zahlen und Vektoren. Reduced motion springt ans Ziel.
- Squash and Stretch: Absprung streckt Y und zieht X/Z ein, Landung staucht Y und hält das Volumen. Klingt aus. Reduced motion bleibt bei Skala 1.
- Slide-Pose (nickt rein, geht runter) und Dash-Pose (kürzer geneigt, in Laufrichtung gestreckt). Reduced motion zeigt sofort die neutrale Ruhepose, Skala 1, ohne Überblendung.
- Kamera folgt nur mit `simDtMs`, steht also im Hitstop. Shake liegt nur auf der ausgegebenen Position. Reduced motion schüttelt nicht und setzt außerhalb des Hitstops hart aufs Ziel.
- Landungsstaub als Punkte mit Leben und Geschwindigkeit. Reduced motion spawnt keinen.
- Durchsage blendet in 280 ms ein und in den letzten 360 ms aus, mit einem kleinen Versatz nach unten. Reduced motion ist sofort deckend und ohne Rutschen.

**Dateien:** `src/game/anim/` (`easing`, `tween`, `squashStretch`, `pose`, `camera`, `impulses`, `announceFade`, `motion`, `present`, `docks`). `stepPresentation` bündelt einen Frame, sobald die Sim Position, `vy`, Modus, Shake und Bannerzeit kennt.

**Einbau, sobald view3d und draw existieren:**

| Wert | Wohin |
| --- | --- |
| `stepSquash().scale` | Skalierung der Spielergruppe, nicht der Hitbox |
| `locomotionPose()` | Rotation und Höhenversatz der Figur |
| `stepCamera().position` / `lookAt` | Kamera. Shake nicht auf den Körper |
| `tickImpulses()` | kurzlebige Punkte in draw, Deckkraft aus `lifeMs / maxLifeMs` |
| `announcementPresentation()` | CSS-Opacity und `translateY` des Textbanners |

Dieselben Sätze stehen in `ANIM_DOCKS`. `prefersReducedMotion` liest ein übergebenes Media-Query. `readReducedMotionFromWindow` ist der einzige Browser-Blick und liefert ohne Fenster `false`.

**Grenzen:** Keine Knochen, keine echten Partikel-Meshes, keine Bewegungsunschärfe, kein Schulterwechsel. Die Nachführung ist eine gedämpfte Verfolgung des Spielers, kein fertiges Shoulder-Rig. Staub kennt nur die Sorte `dust`.

## Testergebnis

`npm test` (`vitest run`): 19 Dateien, 54 Tests, alle grün.

`npm run build` (`tsc && vite build`): grün, nachdem die oben genannten Build-Dateien ergänzt und `src/routes` vom Typecheck ausgenommen wurden. Der vorherige Stand ließ sich nicht bauen.

## Bekannte Grenzen, gesammelt

- Ohne sim/view3d/draw/Abstecher ist nichts davon im Spiel spürbar. Die Module sind der Einbaupunkt, nicht der Einbau.
- Welt-Einheit ist der Meter. Die fehlende Sim muss dieselbe Skala benutzen.
- `src/routes/index.tsx` kompiliert erst, wenn `src/components/Abstecher.tsx` wirklich existiert. Bis dahin bleibt der Ordner in `tsconfig.json` ausgeschlossen.
- Die Produktions-Seite aus `index.html` zeigt kein Spiel. Sie ist der Vite-Einstieg.

## Entscheidungen (10.11.2026)

Julian, 01:59 Europe/Berlin, über den Koordinator. Wo eine Vorgabe technisch hakt, steht die Begründung dabei.

1. **Stimme:** Standard an, wenn eine Stimme mit dem Tag `de-DE` da ist, sonst aus. Nur `de-AT` zählt nicht als dieser Default, wird aber beim Sprechen einer deutschen Stimme vor Englisch bevorzugt. Der Untertitel läuft immer. N schaltet um. Gespeichert wird erst die Taste, im Feld `save.voice`. `null` heißt noch keine Wahl, damit ein später geladenes `voiceschanged` den Default nicht festnagelt. `mute` bleibt der Effekt-Ton und ist unabhängig, sonst schaltet eine Ansage die Stich-Sounds mit.
2. **Slide-Taste:** Q (`KeyQ`). Strg ist nicht belegt. Strg+W würde im Browser den Tab schließen, und W ist Laufen. Q kollidiert nicht mit WASD, C, F, V, N, Umschalt, Leertaste oder den Maustasten.
3. **Hitstop:** Hartes Einfrieren, `timeScale` 0. Zeiten bleiben 50, 74 und 90 ms.
4. **Dash:** Unverwundbar nur die ersten 100 ms von 180 ms. Danach ist der Dash noch schnell, aber treffbar.
5. **Welt-Einheiten:** 1 Einheit = 1 Meter. Sprung 10,5 m/s, Aufstieg 23 m/s², Fall 52 m/s², Scheitel etwa 2,4 m. Sprint-Schwelle 6 m/s, Slide 9,5 m/s, Dash 14 m/s. Kamera sitzt 1,6 m über und 6 m hinter der Figur. Staub rechnet in m/s.
6. **Bahnhofs-IDs:** `kiel`, `hamburg`, `koeln`, `frankfurt`, `muenchen`, `berlin` in `STATION_IDS`. Neue Maps werden als weiterer Kleinbuchstaben-Slug ohne Umlaut ergänzt. Unbekannte IDs, zum Beispiel `bremen`, nutzen die allgemeine Zeile und werfen nicht.
7. **Reduced Motion:** Sofort die neutrale Ruhepose (Neigung 0, Höhenfaktor 1, keine Streckung), Squash bleibt bei Skala 1, Kamera-Shake ist 0. Die Slide-Hitbox aus `heightScale` duckt weiter. Das ist Kollision, keine Animation, sonst verliert der Slide unter Bänken seine Funktion.
8. **Shake:** 0,05 m bei einem Treffer, 0,10 m beim Wurf, 0,15 m beim Kill, lineares Abklingen in 100 ms. Der Wert ist schon Meter und wird nur auf die Kamera addiert.

Coyote Time bleibt 100 ms, der Jump-Buffer 120 ms, der Slide-Abbruch in den Dash 80 ms. Das waren gesetzte Zeiten und keine offenen Fragen.
