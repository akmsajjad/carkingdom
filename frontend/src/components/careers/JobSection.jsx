import { Check } from 'lucide-react'

/**
 * One titled list of bullets on a job posting.
 *
 * Every one of §36's sections is the same shape — a heading and a list — and
 * the posting has six of them. Written out longhand that is six copies of the
 * same heading scale and list spacing, and the seventh section added later
 * would be the one that came out different.
 *
 * `marker` exists because two of the six mean something different. A tick reads
 * as "included", which is right for skills, qualifications, experience and
 * benefits, and wrong for duties and responsibilities — those are things you
 * will be doing, not things you will be given. Those take a neutral bullet.
 */
export default function JobSection({
  title,
  description,
  items,
  marker = 'check',
  className,
}) {
  if (!items?.length) return null

  return (
    <section className={className}>
      <h2 className="text-xl font-bold text-brand-900">{title}</h2>

      {description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            {marker === 'dot' ? (
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500"
              />
            ) : (
              <Check
                className="mt-0.5 size-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
            )}
            <span className="leading-relaxed text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
