const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options) {
  const response = await fetch(base + path, options)
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`)
    error.code = response.status === 422 ? 'invalid' : 'apiError'
    throw error
  }
  return response.json()
}

export function searchPlaces(query, signal) {
  return request('/api/places/search?' + new URLSearchParams({ q: query }), { signal })
}

export function optimizeTrip(payload, signal) {
  return request('/api/trips/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}
