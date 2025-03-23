import { useConvex } from 'convex/react'
import { FunctionReference } from 'convex/server'
import { useCallback } from 'react'

export function usePrefetchQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  options: {
    timeoutMs?: number
  } = { timeoutMs: 20000 }
) {
  const convex = useConvex()

  const prefetch = useCallback(
    (args: Query['_args']) => {
      const watch = convex.watchQuery(query, args)
      // Just subscribe to keep the data in cache
      const unsubscribe = watch.onUpdate(() => {})

      setTimeout(() => {
        unsubscribe()
      }, options.timeoutMs)

      return unsubscribe
    },
    [convex, options.timeoutMs, query]
  )

  return prefetch
}
