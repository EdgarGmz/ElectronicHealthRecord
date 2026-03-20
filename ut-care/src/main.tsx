import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/config'
import './index.css'
import App from './App'
import { useThemeStore } from './store/theme.store'
import { useFontSizeStore } from './store/fontSize.store'

useThemeStore.getState().apply()
useFontSizeStore.getState().apply()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
