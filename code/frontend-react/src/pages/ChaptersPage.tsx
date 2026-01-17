import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    BarChart3,
    Trash2,
    Edit,
} from 'lucide-react';
import { chapterApi, type Chapter, type ChapterStudentStats } from '@/api/chapter';
import { authStore } from '@/lib/auth-store';

export function ChaptersPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [chapterStats, setChapterStats] = useState<Record<number, ChapterStudentStats>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const user = authStore.getUser();
    const isTeacher = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'assistant';
    const isStudent = user?.role === 'student';

    useEffect(() => {
        if (!courseId) return;
        loadChapters();
    }, [courseId]);

    const loadChapters = async () => {
        if (!courseId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await chapterApi.listByCourse(parseInt(courseId));
            setChapters(data);

            // Load stats for each chapter (students only)
            if (isStudent) {
                const statsPromises = data.map((ch) =>
                    chapterApi.getMyStats(ch.ID).catch(() => null)
                );
                const statsResults = await Promise.all(statsPromises);
                const statsMap: Record<number, ChapterStudentStats> = {};
                statsResults.forEach((stat, idx) => {
                    if (stat) {
                        statsMap[data[idx].ID] = stat;
                    }
                });
                setChapterStats(statsMap);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load chapters');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (title: string, orderNum: number) => {
        if (!courseId) return;
        try {
            const chapter = await chapterApi.create({
                course_id: parseInt(courseId),
                title,
                order_num: orderNum,
            });
            setShowCreate(false);
            navigate(`/courses/${courseId}/chapters/${chapter.ID}`);
        } catch (err: any) {
            alert('创建失败: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这个章节吗？相关资源和作业的章节关联将被清除。')) return;
        try {
            await chapterApi.delete(id);
            loadChapters();
        } catch (err: any) {
            alert('删除失败: ' + err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <h1 className="text-2xl font-bold text-white">课程章节</h1>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        创建章节
                    </button>
                )}
            </div>

            {/* Chapter List */}
            {chapters.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">暂无章节</p>
                    {isTeacher && <p className="text-sm text-gray-500 mt-2">点击上方按钮创建第一个章节</p>}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {chapters.map((chapter) => {
                        const stats = chapterStats[chapter.ID];
                        return (
                            <div
                                key={chapter.ID}
                                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-blue-500/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <Link
                                        to={`/courses/${courseId}/chapters/${chapter.ID}`}
                                        className="flex-1"
                                    >
                                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2">
                                            第{chapter.order_num}章：{chapter.title}
                                        </h3>
                                    </Link>
                                    {isTeacher && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/courses/${courseId}/chapters/${chapter.ID}`}
                                                className="p-1 text-gray-400 hover:text-blue-400"
                                                title="编辑"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(chapter.ID)}
                                                className="p-1 text-gray-400 hover:text-red-400"
                                                title="删除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                    {chapter.summary || '暂无简介'}
                                </p>

                                {/* Student Stats */}
                                {isStudent && stats && (
                                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-700">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{stats.study_duration_formatted || '0分钟'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>
                                                {stats.assignment_stats.submitted}/{stats.assignment_stats.total} 作业
                                            </span>
                                        </div>
                                        {stats.assignment_stats.graded > 0 && (
                                            <div className="flex items-center gap-1">
                                                <BarChart3 className="w-4 h-4" />
                                                <span>{(stats.assignment_stats.accuracy_rate * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Teacher: Quick Stats */}
                                {isTeacher && (
                                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-700">
                                        <span className="text-gray-400">序号: {chapter.order_num}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <CreateChapterModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                    nextOrderNum={chapters.length + 1}
                />
            )}
        </div>
    );
}

function CreateChapterModal({
    onClose,
    onCreate,
    nextOrderNum,
}: {
    onClose: () => void;
    onCreate: (title: string, orderNum: number) => void;
    nextOrderNum: number;
}) {
    const [title, setTitle] = useState('');
    const [orderNum, setOrderNum] = useState(nextOrderNum);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title, orderNum);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">创建章节</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">章节标题 *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：静电场"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">章节序号</label>
                        <input
                            type="number"
                            value={orderNum}
                            onChange={(e) => setOrderNum(parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                            创建
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
