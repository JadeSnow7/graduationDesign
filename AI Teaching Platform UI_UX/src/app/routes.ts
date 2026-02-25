import { createBrowserRouter } from 'react-router'
import Root from './Root'
import Learning from './pages/Learning'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LocalAI from './pages/LocalAI'
import Workspace from './pages/Workspace'
import AISettings from './pages/AISettings'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Learning },
      { path: 'courses', Component: Courses },
      { path: 'courses/:id', Component: CourseDetail },
      { path: 'courses/:id/simulation', Component: Workspace },
      { path: 'local-ai', Component: LocalAI },
      { path: 'workspace', Component: Workspace },
      { path: 'settings/ai', Component: AISettings },
    ],
  },
])
