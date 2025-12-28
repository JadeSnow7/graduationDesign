import { NavLink, Outlet, Link } from 'react-router-dom';
import { CourseProvider, useCourse } from '@/domains/course/useCourse';
import {
    LayoutDashboard,
    MessageSquare,
    Atom,
    FileText,
    FolderOpen,
    ChevronLeft,
    Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { path: 'overview', label: '课程概览', icon: LayoutDashboard },
    { path: 'chat', label: 'AI 答疑', icon: MessageSquare },
    { path: 'simulation', label: '电磁仿真', icon: Atom },
    { path: 'assignments', label: '作业', icon: FileText },
    { path: 'resources', label: '资料', icon: FolderOpen },
];

function CourseLayoutInner() {
    const { course, isLoading } = useCourse();

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
                {/* Back link */}
                <Link
                    to="/courses"
                    className="flex items-center gap-2 px-4 h-16 border-b border-gray-700/50 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>返回课程列表</span>
                </Link>

                {/* Course title */}
                <div className="px-4 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white truncate">
                        {course?.name || '课程'}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">{course?.instructor}</p>
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
