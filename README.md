# PROPERTY DEKHO — LUCKNOW SCR

Open-source static board for Lucknow property demand. Anyone can list what they are looking for and browse every demand saved in their browser.

No server. No account.

## Pages

- `index.html` — landing with two actions: **List** and **View property**
- `list.html` — post a house or land demand
- `view.html` — browse and filter by house, land, and locality

## How listings are stored

Demands are saved in `localStorage` under `lucknow-scr-demands`. They stay on that device and browser. Other people do not see them.

The first visit seeds a few sample Lucknow listings so the board is not empty.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```

Then visit the printed local URL.

## License

MIT. See `LICENSE`.
