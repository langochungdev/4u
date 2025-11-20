export function getCookie(name: string): string | null {
  const cookie = document.cookie || ''
  const pattern = new RegExp('(^| )' + name + '=([^;]+)')
  const match = cookie.match(pattern)
  return match && match[2] ? decodeURIComponent(match[2]) : null
}

export function setCookie(name: string, value: string, days = 365) {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
