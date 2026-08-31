import type { CacheTop100, ResultadoBusquedaJuego } from '@/types'
import { igdbFetch } from './igdbClient'
import { mapearJuegoIGDB } from './igdbMappers'

const CLAVE_CACHE_TOP_100 = 'game-tracker-top100-cache'
const DURACION_CACHE_MS = 24 * 60 * 60 * 1000 // 24 horas

/** Campos base que se piden a IGDB para cualquier juego (búsqueda, top 100, detalle). */
const CAMPOS_JUEGO = 'id,name,cover.image_id,first_release_date,genres.name'

/**
 * Busca juegos por nombre en IGDB. La usan tanto el buscador global de la
 * navbar como el modal de gestión de favoritos.
 */
export async function buscarJuegos(termino: string, limite = 20): Promise<ResultadoBusquedaJuego[]> {
  const terminoLimpio = termino.trim()
  if (!terminoLimpio) return []

  // Escapamos comillas para no romper la sintaxis del query de Apicalypse.
  const terminoEscapado = terminoLimpio.replace(/"/g, '\\"')

  const query = `
    fields ${CAMPOS_JUEGO};
    search "${terminoEscapado}";
    limit ${limite};
  `

  const crudos = await igdbFetch('/games', query)
  return crudos.map(mapearJuegoIGDB)
}

/**
 * Obtiene el detalle de un juego específico por su id de IGDB.
 * Se usa al seleccionar un resultado de búsqueda o del Top 100.
 */
export async function obtenerDetalleJuego(id: number): Promise<ResultadoBusquedaJuego> {
  const query = `
    fields ${CAMPOS_JUEGO};
    where id = ${id};
  `

  const crudos = await igdbFetch('/games', query)
  const [crudo] = crudos
  if (!crudo) {
    throw new Error(`No se encontró información en IGDB para el juego con id ${id}.`)
  }
  return mapearJuegoIGDB(crudo)
}

function leerCacheTop100(): CacheTop100 | null {
  try {
    const crudo = localStorage.getItem(CLAVE_CACHE_TOP_100)
    if (!crudo) return null
    return JSON.parse(crudo) as CacheTop100
  } catch {
    return null
  }
}

function guardarCacheTop100(juegos: ResultadoBusquedaJuego[]): void {
  const cache: CacheTop100 = { juegos, timestamp: Date.now() }
  try {
    localStorage.setItem(CLAVE_CACHE_TOP_100, JSON.stringify(cache))
  } catch {
    // Si falla (cuota llena, modo privado) simplemente no se cachea;
    // la próxima carga volverá a pedir los datos a IGDB.
  }
}

function cacheTop100Valida(cache: CacheTop100): boolean {
  return Date.now() - cache.timestamp < DURACION_CACHE_MS
}

/**
 * Obtiene los 100 juegos más populares de IGDB (ordenados por cantidad de
 * valoraciones totales), cacheando el resultado en localStorage durante
 * 24 horas para evitar peticiones innecesarias.
 *
 * Pasá `{ forzarActualizacion: true }` para ignorar la caché (ej. un botón
 * "Actualizar" en la pantalla de Top 100).
 */
export async function obtenerTop100(opciones?: {
  forzarActualizacion?: boolean
}): Promise<ResultadoBusquedaJuego[]> {
  if (!opciones?.forzarActualizacion) {
    const cache = leerCacheTop100()
    if (cache && cacheTop100Valida(cache)) {
      return cache.juegos
    }
  }

  const query = `
    fields ${CAMPOS_JUEGO},total_rating_count;
    where total_rating_count != null & cover != null;
    sort total_rating_count desc;
    limit 100;
  `

  const crudos = await igdbFetch('/games', query)
  const juegos = crudos.map(mapearJuegoIGDB)
  guardarCacheTop100(juegos)
  return juegos
}