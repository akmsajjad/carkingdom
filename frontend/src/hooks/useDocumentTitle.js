import { useEffect } from 'react'
import { SITE } from '../data/site'

/**
 * Sets the document title for a page.
 *
 * Deliberately does not restore the previous title on unmount: React runs the
 * cleanup of the outgoing page and the effect of the incoming one in the same
 * commit, so a restore would only ever be overwritten — and under StrictMode's
 * double-invoke it would restore the wrong value. Every page that matters sets
 * its own title, and `index.html` supplies the fallback for the rest.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return
    document.title = `${title} | ${SITE.name}`
  }, [title])
}
