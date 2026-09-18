/**
 * What a comparison actually compares.
 *
 * §26 names nine things: price, year, mileage, engine, transmission, fuel,
 * drivetrain, body type and features. Eight of them are one value per vehicle,
 * so they are described here as data; the ninth is a list, and is built from
 * the vehicles themselves by `utils/comparison`.
 *
 * `format` names a formatter rather than carrying one, so this stays a data
 * file with no presentation in it. `CompareTable` maps the name to the
 * function — §55's rule that business data does not live inside a component
 * applies in both directions.
 *
 * Order is the order a buyer reads them in: what it costs, then what it is,
 * then what is under the hood.
 */
export const COMPARISON_ROWS = [
  { key: 'effectivePrice', label: 'Price', format: 'price' },
  { key: 'year', label: 'Year' },
  { key: 'mileage', label: 'Mileage', format: 'mileage' },
  { key: 'engine', label: 'Engine' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'fuelType', label: 'Fuel' },
  { key: 'drivetrain', label: 'Drivetrain' },
  { key: 'bodyType', label: 'Body type' },
]

/** §26's ninth row. Rendered as a matrix rather than a value, because a list
 *  of features is not something you can put in one cell. */
export const FEATURES_ROW_LABEL = 'Features'
