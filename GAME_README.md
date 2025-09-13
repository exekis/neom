Orb Runner — one-file Pygame game

Controls
- Move: WASD or Arrow Keys
- Dash: Shift or Space
- Pause/Resume: P
- Restart: R (on Game Over)
- Quit: Esc

Install (macOS, zsh)
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Run
```bash
python game.py
```

Notes
- Window is resizable with pixel-perfect integer scaling and letterboxing.
- No external assets required; everything is procedural.
