const STATIC_BASE_PATH = '/static'

export const buildStaticUrl = (path: string): string => {
  return `${STATIC_BASE_PATH}${path}`
}
