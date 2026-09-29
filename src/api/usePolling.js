import { useCallback, useEffect, useRef, useState } from 'react'

export function usePolling(fetcher, intervalMs, active) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const runRef = useRef(async () => {})

  useEffect(() => {
    let cancelled = false
    let timer

    async function tick() {
      try {
        const result = await fetcherRef.current()
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
      if (!cancelled && active) timer = setTimeout(tick, intervalMs)
    }

    runRef.current = async () => {
      clearTimeout(timer)
      await tick()
    }

    tick()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [intervalMs, active])

  const refetch = useCallback(() => runRef.current(), [])

  return { data, error, refetch }
}
