# Mr. Mercado Science Hub

A classroom-friendly review hub for Physics & Chemistry with timed quizzes, a teacher admin area, simulator links, and a fun Snake break after three incorrect answers in a row.

## Features
- Student Area with course selection, timed quizzes, and results feedback
- Teacher Admin dashboard (password gate) to create/edit reviews
- Question parser using `Q:` and `A)–D)` with `*` marking the correct answer
- Fill-in-the-blank questions using `Answer:`
- Fixed 45-minute time limit for every review
- Simulator Hub links (title + link)
- LocalStorage persistence + export/import
- Snake mini‑game triggered by 3 consecutive wrong answers

## How to run
Open `index.html` in a browser.

## Teacher Admin
- Button: **Teacher Admin** (top right)
- First time: set the password you want.

## Fixed admin password (multiple computers)
This project includes `admin-config.js` with a SHA-256 hash of the admin password, so the same password works on any computer without re‑setting it.

> Security note: this is a frontend-only gate. For real security, use a backend auth provider (Firebase/Supabase).

## Snake controls
- Keyboard: Arrow keys or WASD
- Mobile/Touch: tap inside the game board to steer

## Files
- `index.html`
- `style.css`
- `app.js`
- `profile.png`

## Optional
If you want a license file (MIT/Apache/GPL), tell me which one.
