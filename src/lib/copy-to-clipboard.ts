/**
 * Copy text to clipboard with fallback support for non-secure contexts.
 * Works on HTTPS, localhost, and http://192.168.0.x (via fallback).
 *
 * @param text - The text to copy
 * @returns Promise<boolean> - true if successful, false if failed
 */
export async function copyToClipboard (text: string | number): Promise<boolean> {
  const textToCopy = String(text)

  // Try modern Clipboard API first (works on HTTPS and localhost)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      return true
    } catch (err) {
      // If Clipboard API fails, fall through to fallback
      console.warn('Clipboard API failed:', err)
    }
  }

  // Fallback for non-secure contexts (http://192.168.0.x, etc.)
  try {
    const textarea = document.createElement('textarea')
    textarea.value = textToCopy
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)

    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  } catch (err) {
    console.error('Copy to clipboard failed:', err)
    return false
  }
}
