import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ErrorBoundary } from './components/ErrorBoundary'
import { AppStateProvider } from './components/providers/AppStateProvider'
import { initAnalytics } from './lib/analytics'
import { initErrorMonitoring } from './lib/errorMonitoring'
import { registerPwaInstallListeners } from './lib/pwaInstall'
import { router } from './lib/router'
import './index.css'

// Fire-and-forget. No-ops cleanly when env keys are missing.
void initErrorMonitoring()
void initAnalytics()
registerPwaInstallListeners()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </ErrorBoundary>
  </StrictMode>,
)
