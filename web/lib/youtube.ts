/**
 * Minimal loader for the YouTube IFrame API. We need it (rather than a plain
 * iframe) so the transcript panel can seek the player and highlight the line
 * that is currently being spoken.
 */
type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  playVideo: () => void
  destroy: () => void
}

type YTNamespace = {
  Player: new (el: HTMLElement, options: Record<string, unknown>) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let pending: Promise<YTNamespace> | null = null

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending

  pending = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT as YTNamespace)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })

  return pending
}

export type { YTPlayer }
