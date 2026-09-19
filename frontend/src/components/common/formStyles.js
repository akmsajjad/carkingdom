/**
 * Shared form styling. Kept in one place so every control — input, select,
 * textarea — has identical height, border, and focus treatment. Without this
 * the controls drift apart as forms are added.
 */

export const controlClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors ' +
  // The focus treatment matches the global :focus-visible rule in index.css.
  // It used to be `focus:outline-none` plus a 20%-opacity ring, and the
  // outline-none won on specificity — so every control in the site had a focus
  // indicator at roughly 1.2:1, well under the 3:1 that non-text contrast asks
  // for. Declared here rather than inherited so the whole family of controls
  // keeps one treatment.
  'focus:border-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ' +
  'aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus-visible:outline-red-600 '

export const controlHeight = 'h-11'

export const labelClasses = 'block text-sm font-medium text-slate-800'

export const hintClasses = 'text-xs text-slate-500'

export const errorClasses = 'text-xs font-medium text-red-600'
