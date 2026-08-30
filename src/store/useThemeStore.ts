import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OpcionColorPrimario } from '@/types'
import { COLOR_PRIMARIO_POR_DEFECTO, aplicarColorPrimario } from '@/lib/theme'

interface ThemeState {
  colorPrimario: OpcionColorPrimario
  setColorPrimario: (opcion: OpcionColorPrimario) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorPrimario: COLOR_PRIMARIO_POR_DEFECTO,

      setColorPrimario: (opcion) => {
        aplicarColorPrimario(opcion)
        set({ colorPrimario: opcion })
      },
    }),
    {
      name: 'game-tracker-color-primario',
      // Al recargar la página, Zustand rehidrata el estado desde localStorage
      // de forma síncrona; este callback reaplica la variable CSS --primary
      // inmediatamente después, evitando cualquier parpadeo con el color por defecto.
      onRehydrateStorage: () => (state) => {
        if (state) aplicarColorPrimario(state.colorPrimario)
      },
    }
  )
)
