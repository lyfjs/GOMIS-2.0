export const API_URL: string = 'http://localhost:5000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
  }
  // Some endpoints may return no content
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return undefined as unknown as T
  return (await res.json()) as T
}

export const http = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body: unknown) => request<T>(p, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(p: string, body: unknown) => request<T>(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p: string) => request<void>(p, { method: 'DELETE' }),
}


