export function baseUrl() {
  return process.env.NODE_ENV == 'development'? '/api/' : '/'
}