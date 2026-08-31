import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const IGDB_BASE_URL = 'https://api.igdb.com/v4'
/** Prefijo que el navegador usa para hablar con este proxy (same-origin, sin CORS). */
const PREFIJO_PROXY = '/api/igdb'
/** Margen de seguridad (ms) para renovar el token antes de que expire realmente. */
const MARGEN_EXPIRACION_MS = 60_000

interface TokenCacheado {
  accessToken: string
  expiraEn: number // timestamp epoch (ms)
}

/** Cache en memoria del proceso Node de Vite. Vive mientras corra "npm run dev". */
let tokenCacheado: TokenCacheado | null = null

function tokenSigueValido(token: TokenCacheado): boolean {
  return Date.now() < token.expiraEn - MARGEN_EXPIRACION_MS
}

async function obtenerToken(clientId: string, clientSecret: string): Promise<string> {
  if (tokenCacheado && tokenSigueValido(tokenCacheado)) {
    return tokenCacheado.accessToken
  }

  const parametros = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  })

  const respuesta = await fetch(`${TWITCH_TOKEN_URL}?${parametros.toString()}`, { method: 'POST' })
  if (!respuesta.ok) {
    throw new Error(`Twitch respondió ${respuesta.status} al pedir el token de acceso.`)
  }

  const datos = (await respuesta.json()) as { access_token: string; expires_in: number }
  tokenCacheado = {
    accessToken: datos.access_token,
    expiraEn: Date.now() + datos.expires_in * 1000,
  }
  return tokenCacheado.accessToken
}

function leerCuerpo(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let datos = ''
    req.on('data', (chunk) => {
      datos += chunk
    })
    req.on('end', () => resolve(datos))
    req.on('error', reject)
  })
}

/**
 * Plugin de Vite — solo activo durante `npm run dev` — que expone `/api/igdb/*`
 * como un proxy same-origin hacia IGDB. Resuelve dos problemas del enfoque
 * "llamar a IGDB directo desde el navegador":
 *
 * 1. IGDB no habilita CORS para peticiones hechas desde un navegador.
 * 2. El client_secret de Twitch nunca debe terminar en el bundle del cliente.
 *
 * Este middleware corre en el proceso Node de Vite (no en el navegador):
 * obtiene y cachea el token de Twitch usando `clientId`/`clientSecret` (que
 * vite.config.ts lee de variables SIN prefijo VITE_, por lo tanto invisibles
 * para el cliente) y reenvía la query de Apicalypse a IGDB agregando él mismo
 * los headers de autenticación.
 */
export function igdbDevProxy(opciones: { clientId?: string; clientSecret?: string }): Plugin {
  return {
    name: 'igdb-dev-proxy',
    configureServer(server) {
      server.middlewares.use(PREFIJO_PROXY, async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        if (!opciones.clientId || !opciones.clientSecret) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                'Faltan TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET en el .env del servidor (sin prefijo VITE_).',
            })
          )
          return
        }

        try {
          const token = await obtenerToken(opciones.clientId, opciones.clientSecret)
          const cuerpo = await leerCuerpo(req)
          // Connect ya despojó el prefijo PREFIJO_PROXY de req.url (ej: queda "/games").
          const endpointIGDB = `${IGDB_BASE_URL}${req.url}`

          const respuestaIGDB = await fetch(endpointIGDB, {
            method: 'POST',
            headers: {
              'Client-ID': opciones.clientId,
              Authorization: `Bearer ${token}`,
              'Content-Type': 'text/plain',
            },
            body: cuerpo,
          })

          const texto = await respuestaIGDB.text()
          res.statusCode = respuestaIGDB.status
          res.setHeader('Content-Type', 'application/json')
          res.end(texto)
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Error desconocido en el proxy de IGDB.',
            })
          )
        }
      })
    },
  }
}