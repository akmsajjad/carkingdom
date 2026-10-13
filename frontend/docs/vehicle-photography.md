# Vehicle photography

How to replace the generated vehicle artwork with real photographs. No code
change is needed — drop files in, run one command.

## The short version

1. Name each photograph `<slug>-<frame>.<ext>` and put it in
   `frontend/public/images/vehicles/`.
2. Run `npm run photos` from `frontend/`.
3. Reload. That's it.

For example, for the 2022 Toyota RAV4 XLE:

```
frontend/public/images/vehicles/2022-toyota-rav4-xle-1.webp
frontend/public/images/vehicles/2022-toyota-rav4-xle-2.webp
frontend/public/images/vehicles/2022-toyota-rav4-xle-3.webp
frontend/public/images/vehicles/2022-toyota-rav4-xle-4.webp
frontend/public/images/vehicles/2022-toyota-rav4-xle-5.webp
```

## Naming

`<slug>-<frame>.<ext>`, where `<slug>` is the vehicle's `slug` field in
`src/data/vehicles.js` and `<frame>` is its position in the gallery, 1 to 5.

To list every slug:

```bash
cd frontend && node -e "import('./src/data/vehicles.js').then(m => m.VEHICLES.forEach(v => console.log(v.slug)))"
```

## What each frame should show

The gallery has five slots, and the order is what a buyer expects to page
through. Frame 1 is the one that appears on the vehicle card in the inventory
grid and the home page, so it is the one worth getting right.

| Frame | Shot |
|---|---|
| 1 | Side profile — a full side elevation, both wheels visible |
| 2 | Front view — head-on |
| 3 | Interior — cabin, front seats and dashboard |
| 4 | Rear view — head-on |
| 5 | Wheels & trim — a wheel or close detail |

Frames are independent. If you have only the side profile for a vehicle, supply
`-1` and the other four slots keep their generated placeholder; the gallery is
photographed where you have photographs and drawn where you do not. A gallery
does not fall back to placeholders wholesale because one frame is missing.

## Format and size

**Format:** WebP. AVIF, JPEG and PNG also work; the scan prefers WebP, then
AVIF, then JPEG, then PNG, and takes the first it finds for each slot. A folder
mixing formats is fine.

**Aspect ratio:** 4:3. The card and the gallery both render into a 4:3 box with
`object-fit: cover`, so anything else is cropped. 1600×1200 is a good target;
the largest the image is ever displayed is roughly 800 px wide.

**File size:** aim under 200 KB each. The images are lazy-loaded below the fold,
so they will not block the first paint, but 25 vehicles × 5 frames at 1 MB each
is 125 MB of assets.

**Consistency:** shoot or generate the whole set the same way — same lighting,
same background, same framing distance. A mix of studio and street shots in one
grid looks worse than placeholders do, because the inconsistency reads as error
rather than as style.

## Commands

```bash
npm run photos   # rescan the folder and rewrite the manifest
npm run images   # regenerate all placeholder artwork, then rescan
```

`npm run images` is the one to run after changing anything in `src/data/`.
`npm run photos` alone is enough when you have only added or removed
photographs.

Both write `src/data/vehicle-photos.js`. That file is generated — do not edit
it by hand, the next run overwrites it.

## How it works

`scripts/sync-vehicle-photos.mjs` scans `public/images/vehicles/` and writes
`src/data/vehicle-photos.js`, a plain map of slug to frame number to path.
`vehicleImage(slug, index)` in `src/utils/images.js` reads that map and returns
the photograph when there is one, falling back to the placeholder when there is
not:

```js
export function vehicleImage(slug, index = 1) {
  return VEHICLE_PHOTOS[slug]?.[index] ?? vehiclePlaceholder(slug, index)
}
```

Nothing else changes. The components, the routes, the vehicle records, the
pricing, the filters and the favourites all keep working, because none of them
know whether the path they were handed points at a photograph or at a drawing.

Photographs are never deleted by these scripts. `npm run images` overwrites the
generated `.svg` files and leaves every `.webp` alone.

## Why the placeholders exist at all

The demo ships with generated SVG artwork rather than stock photography, because
stock photography of the wrong car is worse than an honest illustration. The
generated art is vehicle-specific — six body types with their own proportions,
each vehicle in its own exterior colour, and a different drawing per gallery
slot — so the inventory is legible before any photography exists.

It is still illustration. When real photographs of these actual cars are
available, this is how they go in.
