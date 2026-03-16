const rawBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

const normalizedBase = rawBase.replace(/\/+$/, '')

export function apiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath
}
