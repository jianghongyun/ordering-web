export function baseUrl() {
  return process.env.NODE_ENV == 'development'? '/api/' : 'http://192.168.16.220:3000/'
}