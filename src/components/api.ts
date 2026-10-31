export const sessionId =
  typeof sessionStorage === 'undefined'
    ? ''
    : (sessionStorage.getItem('jencut-session') ??
      (() => {
        const id = crypto.randomUUID()

        sessionStorage.setItem('jencut-session', id)

        return id
      })())

export async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-jencut-client': 'jencut-local-v1'
    },
    ...(body === undefined
      ? {}
      : { method: 'POST', body: JSON.stringify(body) })
  })

  if (!res.ok) {
    const e = await res.json()

    throw new Error(e.message ?? 'El servicio no responde.')
  }

  return res.json()
}
