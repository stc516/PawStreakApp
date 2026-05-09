import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { AppStateProvider } from './components/providers/AppStateProvider'
import { initAnalytics } from './lib/analytics'
import { registerPwaInstallListeners } from './lib/pwaInstall'
import { router } from './lib/router'
import './index.css'

// Fire-and-forget. No-ops cleanly when env keys are missing.
void initAnalytics()
registerPwaInstallListeners()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  </StrictMode>,
)
