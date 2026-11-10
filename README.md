# ABSTECHER

3D-Arcade-Messerspiel an den deutschen Hauptbahnhöfen.

## Features
- Third-Person / First-Person (V)
- 16 Stationen (Bundesländer)
- Junkie-Skins
- Springen + erhöhte Plattformen / Treppen / Dächer
- Höhenvorteil (mehr Reichweite, weniger Schaden)
- Messer werfen (verfehlen = entwaffnet)
- Items: Koks, Stein, Pille, Flasche
- Züge als Hazard
- Runden-System

## Steuerung
- WASD / Stick: Laufen
- Maus / BLICK: Umsehen
- Klick / C / STICH: Stechen
- F / Rechtsklick / WURF: Messer werfen
- Umschalt / DASH: Ausweichen. Während eines Slides bricht Umschalt den Slide ab und verlängert ihn in den Dash.
- Q / SLIDE: Aus dem Sprint über den Boden rutschen. C bleibt Stechen. Strg ist nicht belegt.
- Leertaste / SPRUNG: Springen (früh loslassen = niedriger)
- V: First-Person
- N: Stimme der Bahnhofsdurchsage an oder aus. Das Textbanner bleibt. Standard ist an, wenn eine de-DE-Stimme da ist, sonst aus. Die Wahl wird gespeichert.

Bewegung rechnet in Metern (1 Einheit = 1 m).

Animationen (Squash, Pose, Kameranachführung, Staub, Einblendung) liegen als reine Werte in `src/game/anim` und respektieren `prefers-reduced-motion`, sobald view3d sie liest. Die Spiellogik dafür ist in diesem Stand nicht im Repo.

## Tech
Three.js + React + TanStack Router / Start

Entwickelt mit Grok.
