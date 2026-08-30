import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './store' // aplica el color primario persistido y expone los stores en window (modo dev)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
