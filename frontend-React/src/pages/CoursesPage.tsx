import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService, type Course } from '@/services/course';
import { useAuth } from '@/domains/auth/useAuth';
import { BookOpen, LogOut, Loader2 } from 'lucide-react';

export function CoursesPage() {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        courseService.list().then((data) => {
            setCourses(data);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xl font-semibold text-white">我的课程</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                            {user?.name} ({user?.role})
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/courses/${course.id}`}
                                className="group block bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {course.name}
                                </h3>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                    {course.description}
                                </p>
                                <p className="text-gray-500 text-sm">{course.instructor}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
