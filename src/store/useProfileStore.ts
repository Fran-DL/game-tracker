import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Perfil } from '@/types'

interface ProfileState extends Perfil {
  setNombreUsuario: (nombreUsuario: string) => void
  setBiografia: (biografia: string) => void
  /** Recibe la imagen ya convertida a Base64 (o null para volver al avatar por defecto). */
  setFotoBase64: (fotoBase64: string | null) => void
}

const PERFIL_POR_DEFECTO: Perfil = {
  nombreUsuario: '',
  biografia: '',
  fotoBase64: null,
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...PERFIL_POR_DEFECTO,

      setNombreUsuario: (nombreUsuario) => set({ nombreUsuario }),
      setBiografia: (biografia) => set({ biografia }),
      setFotoBase64: (fotoBase64) => set({ fotoBase64 }),
    }),
    {
      name: 'game-tracker-perfil',
    }
  )
)
