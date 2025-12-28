import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/domains/auth/useAuth';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { CourseLayout } from '@/pages/CourseLayout';
import { OverviewPage } from '@/pages/OverviewPage';
import { ChatPage } from '@/pages/ChatPage';
import { SimPage } from '@/pages/SimPage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { ResourcesPage } from '@/pages/ResourcesPage';

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:courseId" element={<CourseLayout />}>
                            <Route index element={<Navigate to="overview" replace />} />
                            <Route path="overview" element={<OverviewPage />} />
                            <Route path="chat" element={<ChatPage />} />
                            <Route path="simulation" element={<SimPage />} />
                            <Route path="assignments" element={<AssignmentsPage />} />
                            <Route path="resources" element={<ResourcesPage />} />
                        </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/courses" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
