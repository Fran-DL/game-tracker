import type { IGDBJuegoCrudo, ResultadoBusquedaJuego } from '@/types'

type TamañoCaratula = 'cover_big' | 'cover_small' | 'thumb'

/**
 * Construye la URL de la carátula de un juego a partir del `image_id` de IGDB.
 * Por defecto usa "cover_big" (~264x374), el tamaño recomendado por la spec
 * para tarjetas y el modal de edición.
 */
export function urlCaratula(imageId: string, tamaño: TamañoCaratula = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${tamaño}/${imageId}.jpg`
}

/**
 * Convierte un juego "crudo" de IGDB (tal como llega de la API) al formato
 * normalizado `ResultadoBusquedaJuego` que consume el resto de la app
 * (buscador, Top 100, modal de edición).
 */
export function mapearJuegoIGDB(crudo: IGDBJuegoCrudo): ResultadoBusquedaJuego {
  return {
    id: crudo.id,
    titulo: crudo.name,
    caratula: crudo.cover?.image_id ? urlCaratula(crudo.cover.image_id) : '',
    año: crudo.first_release_date
      ? new Date(crudo.first_release_date * 1000).getUTCFullYear()
      : null,
    generos: crudo.genres?.map((genero) => genero.name) ?? [],
  }
}