# LUCKNOW SCR — Design Spec

Date: 2026-08-17

## Product

Open-source static board for Lucknow property demand. Anyone can list what they want. Listings live in the visitor’s browser (`localStorage`). Other visitors do not see each other’s lists.

Brand: **LUCKNOW SCR** — where all Lucknow city property is connected.

## Pages

| File | Role |
|---|---|
| `index.html` | Landing: two actions — List, View property |
| `list.html` | Demand form |
| `view.html` | All demands + filters |

Shared: `css/styles.css`, `js/app.js`, `images/hero.jpg`

## Visual

- Sky-blue to white gradient over a real-estate photo
- Fonts: Cinzel 700 (display), Josefin Sans 600–700 (UI). No thin weights
- Cards: white List, sky-blue View
- Inner pages keep the same palette and **LUCKNOW SCR** nav

## Demand fields

City is always Lucknow (not editable).

Required: type (house/land), intent (buy/rent), locality, area, facing, document, rate, budget, contact  
Required for house only: bedrooms  
Optional: landmark, front area, back area, caste, note

No “how soon” field.

## Storage

Key: `lucknow-scr-demands`  
First visit seeds a few sample Lucknow demands so View is not empty.  
New posts append. User can delete a card in this browser.

## Filters (View)

- Type: All / House / Land
- Locality: dropdown of localities present in the list

## Constraints

- No server, no accounts
- Static hosting (GitHub Pages or any static host)
- MIT license
