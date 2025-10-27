const API_BASE_PATH = '/api'

export const buildApiUrl = (path: string): string => {
  return `${API_BASE_PATH}${path}`
}
