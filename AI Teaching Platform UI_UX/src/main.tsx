import { createRoot } from 'react-dom/client'
import { App } from 'antd'
import { RouterProvider } from 'react-router'
import { router } from './app/routes'
import './styles/index.css'
// Initialize auth store (wires axios interceptors)
import './stores/authStore'

import { ThemeProvider } from './app/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App>
      <RouterProvider router={router} />
    </App>
  </ThemeProvider>
)
