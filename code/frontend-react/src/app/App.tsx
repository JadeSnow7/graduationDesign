import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './ProtectedRoute'
import AiAssistantPage from '../pages/AiAssistantPage'
import CourseDetailPage from '../pages/CourseDetailPage'
import CourseListPage from '../pages/CourseListPage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import ProfilePage from '../pages/ProfilePage'
import SimulationPage from '../pages/SimulationPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="courses" element={<CourseListPage />} />
            <Route path="courses/:courseId" element={<CourseDetailPage />} />
            <Route path="ai" element={<AiAssistantPage />} />
            <Route path="simulation" element={<SimulationPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
