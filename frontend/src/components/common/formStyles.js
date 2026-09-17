/**
 * Shared form styling. Kept in one place so every control — input, select,
 * textarea — has identical height, border, and focus treatment. Without this
 * the controls drift apart as forms are added.
 */

export const controlClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors ' +
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ' +
  'aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/20'

export const controlHeight = 'h-11'

export const labelClasses = 'block text-sm font-medium text-slate-800'

export const hintClasses = 'text-xs text-slate-500'

export const errorClasses = 'text-xs font-medium text-red-600'
