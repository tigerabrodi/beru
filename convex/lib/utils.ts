/**
 * Shared utility functions
 */
export async function handlePromise<PromiseResult>(
  promise: Promise<PromiseResult>
): Promise<[Error | null, PromiseResult | null]> {
  try {
    const result = await promise
    return [null, result]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}
