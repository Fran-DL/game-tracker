import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EstadoJuego, Juego, ResultadoBusquedaJuego } from '@/types'
import { mesActual } from '@/lib/fecha'

/** Máximo de juegos que pueden marcarse como favoritos (regla de negocio, sección Perfil). */
export const MAX_FAVORITOS = 10

/** Campos que el usuario puede editar libremente desde el modal de edición. */
export type CamposEditablesJuego = Partial<
  Omit<Juego, 'id' | 'titulo' | 'caratula' | 'año' | 'generos' | 'fechaAgregado'>
>

interface LibraryState {
  /** Biblioteca completa del usuario. */
  juegos: Juego[]

  // --- Consultas -----------------------------------------------------------
  /** Busca un juego por su id (id de IGDB). */
  obtenerJuego: (id: number) => Juego | undefined
  /** true si el juego ya está en la biblioteca (se usa para evitar duplicados). */
  existeJuego: (id: number) => boolean
  /** Cantidad actual de juegos marcados como favoritos. */
  contarFavoritos: () => number

  // --- Mutaciones ------------------------------------------------------------
  /**
   * Agrega un juego a la biblioteca con estado 'Backlog'.
   * No hace nada si el juego ya existe (evita duplicados).
   * Genera `fechaAgregado` automáticamente y nunca la vuelve a tocar.
   */
  agregarJuego: (datos: ResultadoBusquedaJuego) => void
  /**
   * Actualiza campos editables de un juego (estado, calificación, reseña, fechas,
   * logros, etc). `fechaAgregado` está excluida por tipo y además se protege
   * en runtime, así nunca puede sobreescribirse desde acá.
   */
  actualizarJuego: (id: number, cambios: CamposEditablesJuego) => void
  /** Elimina un juego de la biblioteca. La confirmación se maneja en la UI. */
  eliminarJuego: (id: number) => void
  /** Botón "Empezar" del Backlog: pasa a 'Jugando', fija fechaInicio al mes actual y fechaFin a null. */
  empezarJuego: (id: number) => void
  /** Botón "+1 Rejugado": incrementa el contador y reinicia el período de juego, sin tocar fechaAgregado. */
  incrementarRejugado: (id: number) => void
  /**
   * Alterna el estado de favorito respetando el límite de MAX_FAVORITOS.
   * Devuelve `false` (y no hace nada) si se intenta superar el límite.
   */
  toggleFavorito: (id: number) => boolean
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      juegos: [],

      obtenerJuego: (id) => get().juegos.find((juego) => juego.id === id),

      existeJuego: (id) => get().juegos.some((juego) => juego.id === id),

      contarFavoritos: () => get().juegos.filter((juego) => juego.esFavorito).length,

      agregarJuego: (datos) => {
        if (get().existeJuego(datos.id)) return

        const nuevoJuego: Juego = {
          id: datos.id,
          titulo: datos.titulo,
          caratula: datos.caratula,
          año: datos.año ?? 0,
          generos: datos.generos,
          estado: 'Backlog',
          calificacion: null,
          reseña: '',
          fechaInicio: '',
          fechaFin: null,
          logrosCompletos: false,
          vecesRejugado: 0,
          esFavorito: false,
          fechaAgregado: new Date().toISOString(),
        }

        set((state) => ({ juegos: [...state.juegos, nuevoJuego] }))
      },

      actualizarJuego: (id, cambios) => {
        // Protección extra en runtime: si alguien llega a colar `fechaAgregado`
        // (ej. mediante un `as any`), se descarta antes de aplicar el cambio.
        const cambiosSeguros = { ...cambios } as Partial<Juego>
        delete cambiosSeguros.fechaAgregado
        delete cambiosSeguros.id

        set((state) => ({
          juegos: state.juegos.map((juego) =>
            juego.id === id ? { ...juego, ...cambiosSeguros } : juego
          ),
        }))
      },

      eliminarJuego: (id) => {
        set((state) => ({ juegos: state.juegos.filter((juego) => juego.id !== id) }))
      },

      empezarJuego: (id) => {
        set((state) => ({
          juegos: state.juegos.map((juego) =>
            juego.id === id
              ? {
                  ...juego,
                  estado: 'Jugando' as EstadoJuego,
                  fechaInicio: mesActual(),
                  fechaFin: null,
                }
              : juego
          ),
        }))
      },

      incrementarRejugado: (id) => {
        set((state) => ({
          juegos: state.juegos.map((juego) =>
            juego.id === id
              ? {
                  ...juego,
                  vecesRejugado: juego.vecesRejugado + 1,
                  fechaInicio: mesActual(),
                  fechaFin: null,
                }
              : juego
          ),
        }))
      },

      toggleFavorito: (id) => {
        const juego = get().obtenerJuego(id)
        if (!juego) return false

        const seVaAMarcar = !juego.esFavorito
        if (seVaAMarcar && get().contarFavoritos() >= MAX_FAVORITOS) {
          return false
        }

        set((state) => ({
          juegos: state.juegos.map((j) =>
            j.id === id ? { ...j, esFavorito: !j.esFavorito } : j
          ),
        }))
        return true
      },
    }),
    {
      name: 'game-tracker-biblioteca',
    }
  )
)
