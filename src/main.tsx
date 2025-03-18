import { Toaster } from '@/components/ui/sonner'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
// @ts-expect-error - fontsource-variable/inter is not typed
import '@fontsource-variable/inter'
import { Analytics } from '@vercel/analytics/react'
import { ConvexReactClient } from 'convex/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App.tsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
        <Analytics />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>
)
