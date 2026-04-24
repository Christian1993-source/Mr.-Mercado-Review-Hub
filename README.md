# Pirate Equation Battle

A fullscreen, touchscreen-optimized classroom chemistry game for balancing equations in a two-team pirate battle format.

## Stack
- HTML
- CSS
- JavaScript (no backend)
- Canvas for ocean animation and layered effects

## Included Files
- `index.html` – layered cinematic game UI
- `style.css` – 16:9 responsive smartboard visual styling and animation
- `app.js` – game state, interaction logic, scoring, battle flow, SFX
- `equations.js` – 100 categorized balancing equations and validation helpers
- `assets/` – placeholder folders for future production art/audio

## Gameplay
- Two sides: **Red Team** and **Blue Team**
- Drag/tap coefficient tiles (1–10) into blank slots
- Per side buttons: **Check**, **Clear**
- Correct check:
  - `Direct Hit! Balanced! +10 Points`
  - enemy loses 1 ship health segment
  - cannon shot animation + impact
- Incorrect check:
  - `Not balanced yet`
  - optional atom mismatch summary

## Teacher Controls
- Mode toggle:
  - Same Equation Mode
  - Different Equation Mode
- `Next Equation`
- `Show Answer`
- `Start Next Battle`
- `Pause` / `Resume`
- `End Game`
- `Mute` toggle

## Battle Rules
- Ship health = 7 segments
- Every correct answer removes 1 enemy segment
- At 0 health:
  - sinking animation
  - battle point awarded to winner
  - gameplay waits for teacher to press **Start Next Battle**
- Session never auto-ends; teacher controls pacing

## Equation Data Model
Each equation object contains:
- `id`
- `type`
- `reactants`
- `products`
- `display`
- `correctCoefficients`
- `atomCounts`

Categories included (100 total):
- synthesis
- decomposition
- single replacement
- double replacement
- combustion

## Run
Open `index.html` in any modern browser on a 16:9 touchscreen/smartboard.
