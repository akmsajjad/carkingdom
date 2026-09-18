/**
 * The reasoning behind a comparison table, kept out of the component.
 *
 * Everything here is a pure function of the vehicles being compared, which is
 * what makes it testable without a browser and what keeps `CompareTable` down
 * to layout.
 */

/**
 * The union of every vehicle's features, as rows of a matrix.
 *
 * A feature list cannot go in a single cell, so §26's ninth row is rendered as
 * one row per feature with a tick or a dash under each vehicle. The union
 * rather than the first vehicle's list, because a feature only one car has is
 * exactly the thing the table exists to surface.
 *
 * `sharedByAll` is computed here rather than in the component so the "show only
 * differences" filter has something to filter on. Alphabetical within the
 * union, so the same three vehicles always produce the same order.
 */
export function buildFeatureMatrix(vehicles = []) {
  if (vehicles.length === 0) return []

  const union = new Set()
  for (const vehicle of vehicles) {
    for (const feature of vehicle.features ?? []) union.add(feature)
  }

  return [...union].sort((a, b) => a.localeCompare(b)).map((feature) => {
    const present = vehicles.map((vehicle) =>
      (vehicle.features ?? []).includes(feature),
    )

    return {
      feature,
      present,
      sharedByAll: present.every(Boolean),
      // A feature no vehicle has cannot occur, but a feature only some have is
      // the interesting case and is what "differs" means for this row.
      differs: !present.every(Boolean),
    }
  })
}

/** True when the vehicles do not all agree on one attribute. Drives the "these
 *  differ" emphasis on the eight scalar rows — the whole point of putting two
 *  cars side by side is to find where they part company. */
export function rowDiffers(vehicles = [], key) {
  if (vehicles.length < 2) return false
  const [first, ...rest] = vehicles
  return rest.some((vehicle) => vehicle[key] !== first[key])
}
