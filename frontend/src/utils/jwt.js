export function decodeJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

export function getClaims() {
  const token = localStorage.getItem('access')
  if (!token) return null
  return decodeJwt(token)
}
