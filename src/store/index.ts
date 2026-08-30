export { useLibraryStore, MAX_FAVORITOS } from './useLibraryStore'
export type { CamposEditablesJuego } from './useLibraryStore'
export { useProfileStore } from './useProfileStore'
export { useThemeStore } from './useThemeStore'

import { useLibraryStore } from './useLibraryStore'
import { useProfileStore } from './useProfileStore'
import { useThemeStore } from './useThemeStore'

/**
 * Solo en desarrollo: expone los stores en `window` para poder probarlos
 * a mano desde la consola del navegador antes de tener la UI real, ej.:
 *
 *   useLibraryStore.getState().agregarJuego({
 *     id: 1942, titulo: 'The Witcher 3', caratula: '', año: 2015, generos: ['RPG'],
 *   })
 *   useLibraryStore.getState().juegos
 *   useThemeStore.getState().setColorPrimario(
 *     useThemeStore.getState().colorPrimario // reaplica el actual, o pasa otra opción
 *   )
 *   useProfileStore.getState().setNombreUsuario('Ada')
 */
if (import.meta.env.DEV) {
  Object.assign(window, {
    useLibraryStore,
    useProfileStore,
    useThemeStore,
  })
}
