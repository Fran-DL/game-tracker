import type { IGDBJuegoCrudo } from '@/types'
import { ErrorServicioIGDB } from './errors'

/**
 * Prefijo local que expone el plugin de Vite `vite-plugins/igdbDevProxy.ts`
 * durante `npm run dev`. El navegador nunca habla directo con IGDB: el proxy
 * (que corre en el proceso Node de Vite) agrega las credenciales de Twitch y
 * reenvía la petición, evitando el bloqueo de CORS de la API y evitando que
 * el client_secret viaje al bundle del cliente. Ver README para más detalle.
 */
const IGDB_PROXY_URL = '/api/igdb'

export async function igdbFetch(endpoint: string, query: string): Promise<IGDBJuegoCrudo[]> {
  let respuesta: Response
  try {
    respuesta = await fetch(`${IGDB_PROXY_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
    })
  } catch (error) {
    throw new ErrorServicioIGDB(
      'No se pudo conectar con el proxy local de IGDB. ¿Está corriendo "npm run dev"?',
      error
    )
  }

  let cuerpo: unknown
  try {
    cuerpo = await respuesta.json()
  } catch (error) {
    throw new ErrorServicioIGDB('La respuesta de IGDB no pudo interpretarse correctamente.', error)
  }

  if (!respuesta.ok) {
    const mensaje =
      cuerpo && typeof cuerpo === 'object' && 'error' in cuerpo
        ? String((cuerpo as { error: unknown }).error)
        : `IGDB respondió con un error (${respuesta.status}).`
    throw new ErrorServicioIGDB(mensaje)
  }

  return cuerpo as IGDBJuegoCrudo[]
}