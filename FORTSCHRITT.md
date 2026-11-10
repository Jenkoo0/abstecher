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

**Gebaut:** Treffer 50 ms, Wurf 74 ms, Kill 90 ms, alle im Fenster 40–90 ms. `timeScale` ist währenddessen 0, `simDtMs` auch. Ein kürzerer Treffer schneidet einen längeren nicht ab und Zeiten werden nicht addiert. Der Shake liegt in Schlagrichtung, ist bei Kill und Wurf stärker und klingt nach etwa 160 ms aus. Er wird nicht in die Sim-Zeit gemischt.

**Dateien:** `src/game/feel/hitstop.ts`, `src/game/feel/stepFeel.ts`.

**Einbau:** Einmal pro Frame `stepFeel` (oder `triggerHitstop` + `tickHitstop`) mit der echten Framezeit. Physik, KI, Cooldowns, Sprung und Slide bekommen nur `simDtMs`. `shake` geht an `stepCamera`, nicht an den Körper. So bleiben die Systeme beieinander.

**Grenzen:** Hartes Einfrieren, keine Zeitlupe mit Skala 0,2. Der Shake ist einheitslos (etwa 0,12 bis 0,28). view3d muss ihn in Kamerameter übersetzen, sobald die echte Skala feststeht.

## 3. Slide und Dash

**Status:** Zustandsmaschine fertig. Keine Figur, die sie abspielt.

**Gebaut:** Slide nur am Boden, nur im Sprint und nur ab `MIN_SPRINT_SPEED`. Taste ist Strg (`Control`), nicht C. C bleibt Stechen. Dash bleibt Umschalt und geht auch aus der Luft. Slide und Dash gleichzeitig starten den Slide und brechen ihn nach 80 ms in den Dash ab, auch wenn der Dash nur gepuffert war. Das verlängert die Bewegung (Dash ist schneller) und macht im Dash kurz unverwundbar. Getrennte Cooldowns, kein Stapeln im selben Zustand.

**Dateien:** `src/game/feel/slideDash.ts`, `src/game/feel/controls.ts`.

**Einbau:** Kanten von Strg und Umschalt als `slidePressed` und `dashPressed`, zusammen mit Boden, Sprint-Flag und Geschwindigkeit. `dtMs` ist `simDtMs`. `speed` aus dem Modul ersetzt die Laufgeschwindigkeit, solange der Modus nicht `free` ist. `heightScale` ist der Hinweis fürs Ducken unter Bänke. Die Hitbox muss die Sim selbst verkleinern. Die sichtbare Pose kommt aus `locomotionPose`.

**Grenzen:** Geschwindigkeiten (Slide 460, Dash 720, Sprint-Schwelle 220) sind auf das 1600×900-Brett geraten. Unverwundbarkeit ist nur ein Flag. Kein Messerstich aus dem Slide, kein Bewegungsunschärfe-Effekt.

## 4. Sprungphysik

**Status:** Schrittfunktion fertig. Kein Charakter-Controller.

**Gebaut:** Coyote Time 100 ms inklusive, Jump-Buffer 120 ms inklusive, frühes Loslassen kürzt die Aufwärtsgeschwindigkeit einmal (`JUMP_CUT` 0,48), Fallbeschleunigung ist stärker als die im Aufstieg (1500 gegen 3400). Ein zweiter Sprung über Coyote nach einem echten Absprung geht nicht. Solange `vy > 0`, klebt ein noch gemeldeter Boden den Sprung nicht ab.

**Dateien:** `src/game/feel/jump.ts`.

**Einbau:** `stepJump` mit `simDtMs`. `grounded` aus der Kollision. Wenn `jumped` wahr ist, den Körper in diesem Frame nicht wieder auf den Boden snappen. `vy` ist Welt-Einheiten pro Sekunde.

**Grenzen:** Die Sprunghöhe passt erst, wenn die Sim dieselbe Einheit nutzt. Kein Wandlauf, keine variable Schwerkraft über Pickups.

## 5. Animationen

**Status:** Reine Werte über die Zeit. Nichts schreibt in eine Three.js-Szene. Reduced motion ist an jeder Stelle anschließbar.

**Gebaut:**

- Easing (`easeOutCubic`, `easeInQuad`, `easeOutBack`) und Tweens für Zahlen und Vektoren. Reduced motion springt ans Ziel.
- Squash and Stretch: Absprung streckt Y und zieht X/Z ein, Landung staucht Y und hält das Volumen. Klingt aus. Reduced motion bleibt bei Skala 1.
- Slide-Pose (nickt rein, geht runter) und Dash-Pose (kürzer geneigt, in Laufrichtung gestreckt). Reduced motion stellt die Slide-Pose sofort und ohne Streckung hin.
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

`npm test` (`vitest run`): 17 Dateien, 47 Tests, alle grün.

`npm run build` (`tsc && vite build`): grün, nachdem die oben genannten Build-Dateien ergänzt und `src/routes` vom Typecheck ausgenommen wurden. Der vorherige Stand ließ sich nicht bauen.

## Bekannte Grenzen, gesammelt

- Ohne sim/view3d/draw/Abstecher ist nichts davon im Spiel spürbar. Die Module sind der Einbaupunkt, nicht der Einbau.
- Welt-Einheiten sind Annahmen.
- `src/routes/index.tsx` kompiliert erst, wenn `src/components/Abstecher.tsx` wirklich existiert. Bis dahin bleibt der Ordner in `tsconfig.json` ausgeschlossen.
- Die Produktions-Seite aus `index.html` zeigt kein Spiel. Sie ist der Vite-Einstieg.

## Offene Fragen an Julian

1. Soll die Durchsage-Stimme standardmäßig an sein? Hier ist sie nur ein Schalter (`N`), Default muss die Sim setzen. Vorschlag: aus, bis die Zeilen im echten UI sitzen. `save.mute` ist heute nur der Tongenerator, nicht die Stimme. Sollen beide gemeinsam stumm sein?
2. Ist Strg als Slide-Taste in Ordnung, oder soll es eine andere freie Taste sein (zum Beispiel Q)? C ist laut README Stechen und bleibt das.
3. Hitstop ist ein hartes Einfrieren (`timeScale` 0) für 50/74/90 ms. Die Notiz sagte „Einfrieren/Zeitlupe“. Reicht das Einfrieren?
4. Dash setzt ein Flag `invulnerable`. Soll der Dash wirklich kurz unverwundbar sein, oder nur schnell?
5. Sprung-, Slide- und Dash-Zahlen hängen an Welt-Einheiten pro Sekunde. Welche Einheit hat die fehlende Sim (Meter oder das 1600×900-Brett)?
6. Die Bahnhofs-IDs in den Texten sind `kiel`, `hamburg`, `koeln`, `frankfurt`, `muenchen`, `berlin`. Passen die zu der späteren `stations.ts`?
7. Reduced motion dämpft Pose, Shake, Staub und Banner. Die Slide-Hitbox soll trotzdem ducken. Ist die kleine Restpose (leicht geneigt, etwas niedriger) gewollt oder soll bei reduced motion gar keine Posenänderung sichtbar sein?
8. Kamera-Shake ist absichtlich klein und einheitslos. Welchen Ausschlag in Metern soll view3d daraus machen?
