import { NavLink, Outlet, Link } from 'react-router-dom';
import { CourseProvider, useCourse } from '@/domains/course/useCourse';
import {
    LayoutDashboard,
    MessageSquare,
    BookOpen, // Use BookOpen for chapters
    Atom,
    FileText,
    FolderOpen,
    ChevronLeft,
    Loader2,
    User,
    ClipboardList,
} from 'lucide-react';
import { clsx } from 'clsx';
import { authStore } from '@/lib/auth-store';

const navItems = [
    { path: 'overview', label: '课程概览', icon: LayoutDashboard },
    { path: 'chapters', label: '章节学习', icon: BookOpen },
    { path: 'chat', label: 'AI 答疑', icon: MessageSquare },
    { path: 'simulation', label: '电磁仿真', icon: Atom },
    { path: 'assignments', label: '作业', icon: FileText },
    { path: 'quizzes', label: '测验', icon: ClipboardList },
    { path: 'resources', label: '资料', icon: FolderOpen },
];

function CourseLayoutInner() {
    const { course, isLoading } = useCourse();
    const user = authStore.getUser();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900/80 border-r border-gray-700/50 flex flex-col">
                {/* Back link + Profile */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-gray-700/50">
                    <Link
                        to="/courses"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>返回</span>
                    </Link>
                    <Link
                        to="/profile"
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
                        title="个人中心"
                    >
                        <span className="text-sm text-gray-400 hidden sm:inline">{user?.name}</span>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </Link>
                </div>

                {/* Course title */}
                <div className="px-4 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white truncate">
                        {course?.name || '课程'}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">Teacher ID: {course?.teacher_id}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export function CourseLayout() {
    return (
        <CourseProvider>
            <CourseLayoutInner />
        </CourseProvider>
    );
}
