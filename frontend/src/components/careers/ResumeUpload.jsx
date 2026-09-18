import { useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatFileSize } from '../../utils/format'

/** Kept in step with `RESUME_EXTENSIONS` in `utils/validation.js` — this one
 *  filters the operating system's file picker, that one rejects a file dragged
 *  past it. Both are needed; neither is sufficient. */
const ACCEPT = '.pdf,.doc,.docx'

/**
 * The appearance of each state, as one lookup.
 *
 * Written as a single choice rather than stacked conditionals because `cn` is
 * not `tailwind-merge` — it joins strings and lets the stylesheet decide. Two
 * `border-*` utilities in the same class attribute resolve by which one
 * Tailwind emitted last, not by which one was written last, so
 * `dragging && invalid` would have picked a winner at random.
 */
const TONES = {
  idle: 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
  dragging: 'border-accent-500 bg-accent-50',
  invalid: 'border-red-400 bg-red-50',
}

/**
 * The résumé picker.
 *
 * Presentational on purpose: it reports the file it was given and nothing else.
 * Whether that file is acceptable is decided by `validateResumeFile`, called by
 * the form, so the dropzone and the submit button cannot come to different
 * conclusions about the same file.
 *
 * The whole box is a `<label>` for the hidden input, which makes it clickable
 * and keyboard-reachable without a script. The Remove control lives *outside*
 * that label — a button nested inside a label is one browser disagreement away
 * from opening the file picker instead of removing the file.
 */
export default function ResumeUpload({ id, describedBy, invalid, file, onChange }) {
  const [dragging, setDragging] = useState(false)

  // `dragenter` and `dragleave` both fire for every child element the pointer
  // crosses, so a boolean flag flickers as it passes over the icon and the
  // text. Counting the enter/leave pairs is the version that holds still.
  const dragDepth = useRef(0)

  function takeFiles(files) {
    const picked = files?.[0]
    if (picked) onChange(picked)
  }

  function handleDragEnter(event) {
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  function handleDragLeave() {
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    takeFiles(event.dataTransfer?.files)
  }

  const tone = invalid ? 'invalid' : dragging ? 'dragging' : 'idle'

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name="resume"
          type="file"
          accept={ACCEPT}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="peer sr-only"
          onChange={(event) => {
            takeFiles(event.target.files)
            // Clearing the input is what lets someone re-pick the file they
            // just removed — without it the second `change` never fires,
            // because as far as the browser is concerned nothing changed.
            event.target.value = ''
          }}
        />

        <label
          htmlFor={id}
          onDragEnter={handleDragEnter}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-5 py-6 text-center transition-colors',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500',
            TONES[tone],
          )}
        >
          {file ? (
            <>
              <FileText className="size-6 text-brand-700" aria-hidden="true" />
              <span className="max-w-full truncate text-sm font-semibold text-brand-900">
                {file.name}
              </span>
              <span className="text-xs text-slate-500">
                {formatFileSize(file.size)} · Click to choose a different file
              </span>
            </>
          ) : (
            <>
              <Upload className="size-6 text-slate-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-brand-900">
                Résumé
                <span className="ml-0.5 text-red-500" aria-hidden="true">
                  *
                </span>
              </span>
              <span className="text-sm text-slate-600">
                Drag your file here, or click to browse
              </span>
              <span className="text-xs text-slate-500">
                PDF, DOC or DOCX — up to 5 MB
              </span>
            </>
          )}
        </label>
      </div>

      {file && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <X className="size-3.5" aria-hidden="true" />
            Remove file
          </button>
        </div>
      )}
    </div>
  )
}
