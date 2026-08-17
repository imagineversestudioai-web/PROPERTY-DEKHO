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

## Deploy on Render

This is a static site. No Node build.

1. Open [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New → Static Site**.
3. Connect `imagineversestudioai-web/PROPERTY-DEKHO`.
4. Use these settings:

   | Field | Value |
   |---|---|
   | **Name** | `property-dekho` |
   | **Branch** | `main` |
   | **Build Command** | leave empty, or `echo "No build step"` |
   | **Publish Directory** | `.` |

5. Click **Deploy Static Site**.

Render gives a URL like `https://property-dekho.onrender.com`. Later pushes to `main` auto-deploy.

You can also apply the included `render.yaml` Blueprint: **New → Blueprint** and select this repo.

## License

MIT. See `LICENSE`.
