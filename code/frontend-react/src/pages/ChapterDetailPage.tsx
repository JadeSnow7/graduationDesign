import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    CheckCircle,
    BarChart3,
    FileText,
    Video,
    Link as LinkIcon,
    ExternalLink,
    Loader2,
    ChevronLeft,
    Save,
    Lightbulb,
    Users,
} from 'lucide-react';
import { chapterApi, type Chapter, type ChapterStudentStats, type ChapterClassStats } from '@/api/chapter';
import { authStore } from '@/lib/auth-store';
import { clsx } from 'clsx';

// ============ Study Time Tracker Hook ============

function useStudyTimeTracker(chapterId: number | undefined) {
    const intervalRef = useRef<number | undefined>(undefined);
    const user = authStore.getUser();
    const isStudent = user?.role === 'student';

    useEffect(() => {
        if (!chapterId || !isStudent) return;

        const sendHeartbeat = () => {
            chapterApi.heartbeat(chapterId).catch(console.error);
        };

        // Send first heartbeat immediately
        sendHeartbeat();

        // Send heartbeat every 30 seconds
        intervalRef.current = window.setInterval(sendHeartbeat, 30000);

        // Handle visibility change
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                sendHeartbeat();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [chapterId, isStudent]);
}

// ============ Main Component ============

export function ChapterDetailPage() {
    const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [stats, setStats] = useState<ChapterStudentStats | null>(null);
    const [classStats, setClassStats] = useState<ChapterClassStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', summary: '', knowledgePoints: '' });

    const user = authStore.getUser();
    const isTeacher = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'assistant';
    const isStudent = user?.role === 'student';

    // Start study time tracking for students
    useStudyTimeTracker(chapterId ? parseInt(chapterId) : undefined);

    useEffect(() => {
        if (!chapterId) return;
        loadChapter();
    }, [chapterId]);

    const loadChapter = async () => {
        if (!chapterId) return;
        setIsLoading(true);
        try {
            const ch = await chapterApi.get(parseInt(chapterId));
            setChapter(ch);
            setEditForm({
                title: ch.title,
                summary: ch.summary || '',
                knowledgePoints: ch.knowledge_points || '[]',
            });

            // Load stats
            if (isStudent) {
                const s = await chapterApi.getMyStats(parseInt(chapterId));
                setStats(s);
            } else if (isTeacher) {
                const cs = await chapterApi.getClassStats(parseInt(chapterId)).catch(() => null);
                setClassStats(cs);
                // Also load student-view stats for resource display
                const s = await chapterApi.getMyStats(parseInt(chapterId)).catch(() => null);
                setStats(s);
            }
        } catch (err: any) {
            console.error('Failed to load chapter:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!chapterId || !chapter) return;
        try {
            let kpArray: string[] = [];
            try {
                kpArray = JSON.parse(editForm.knowledgePoints);
            } catch {
                // If not valid JSON, split by newline
                kpArray = editForm.knowledgePoints.split('\n').filter((s) => s.trim());
            }

            await chapterApi.update(parseInt(chapterId), {
                title: editForm.title,
                summary: editForm.summary,
                knowledge_points: kpArray,
            });
            setIsEditing(false);
            loadChapter();
        } catch (err: any) {
            alert('保存失败: ' + err.message);
        }
    };

    const parseKnowledgePoints = (kp: string | undefined): string[] => {
        if (!kp) return [];
        try {
            const parsed = JSON.parse(kp);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return Video;
            case 'paper':
                return FileText;
            default:
                return LinkIcon;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">章节不存在</p>
            </div>
        );
    }

    const knowledgePoints = stats?.knowledge_points || parseKnowledgePoints(chapter.knowledge_points);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/courses/${courseId}/chapters`}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    {isEditing ? (
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="text-2xl font-bold bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-white">
                            第{chapter.order_num}章：{chapter.title}
                        </h1>
                    )}
                </div>
                {isTeacher && (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    保存
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                            >
                                编辑章节
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-gray-300 font-medium">学习时间</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.study_duration_formatted}</p>
                        {isTeacher && classStats && (
                            <p className="text-sm text-gray-500 mt-1">
                                班级平均: {Math.floor(classStats.avg_study_duration_seconds / 60)}分钟
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-gray-300 font-medium">作业正确率</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {stats.assignment_stats.graded > 0
                                ? `${(stats.assignment_stats.accuracy_rate * 100).toFixed(1)}%`
                                : '暂无'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.assignment_stats.submitted}/{stats.assignment_stats.total} 已提交，
                            {stats.assignment_stats.graded} 已批改
                        </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-gray-300 font-medium">测验成绩</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {stats.quiz_stats.attempted > 0
                                ? `${stats.quiz_stats.avg_score.toFixed(1)}分`
                                : '暂无'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.quiz_stats.attempted}/{stats.quiz_stats.total} 已完成
                        </p>
                    </div>
                </div>
            )}

            {/* Knowledge Points */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-white">知识要点</h2>
                </div>
                {isEditing ? (
                    <textarea
                        value={editForm.knowledgePoints}
                        onChange={(e) => setEditForm({ ...editForm, knowledgePoints: e.target.value })}
                        placeholder='每行一个知识点，或输入 JSON 数组格式 ["知识点1", "知识点2"]'
                        className="w-full h-32 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : knowledgePoints.length > 0 ? (
                    <ul className="space-y-2">
                        {knowledgePoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-300">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">暂无知识要点</p>
                )}
            </div>

            {/* Chapter Summary */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-3">章节总结</h2>
                {isEditing ? (
                    <textarea
                        value={editForm.summary}
                        onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                        placeholder="输入章节总结..."
                        className="w-full h-24 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : (
                    <p className="text-gray-300">{chapter.summary || '暂无总结'}</p>
                )}
            </div>

            {/* Resources */}
            {stats && stats.resources.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">本章资源</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.resources.map((resource) => {
                            const Icon = getTypeIcon(resource.type);
                            return (
                                <a
                                    key={resource.ID}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="p-2 bg-blue-600/20 rounded-lg">
                                        <Icon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{resource.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {resource.type === 'video' ? '视频' : resource.type === 'paper' ? '论文' : '链接'}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Class Stats (Teachers Only) */}
            {isTeacher && classStats && classStats.student_progress.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">学生学习情况</h2>
                        <span className="text-sm text-gray-500">({classStats.total_students} 人选课)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-700">
                                    <th className="pb-2">学生</th>
                                    <th className="pb-2">学习时间</th>
                                    <th className="pb-2">作业均分</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classStats.student_progress.map((sp) => (
                                    <tr key={sp.student_id} className="border-b border-gray-700/50">
                                        <td className="py-2 text-white">{sp.student_name}</td>
                                        <td className="py-2 text-gray-300">
                                            {Math.floor(sp.study_duration_seconds / 60)}分钟
                                        </td>
                                        <td className="py-2">
                                            <span
                                                className={clsx(
                                                    'px-2 py-0.5 rounded text-xs',
                                                    sp.assignment_avg_score >= 80
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : sp.assignment_avg_score >= 60
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : sp.assignment_avg_score > 0
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                )}
                                            >
                                                {sp.assignment_avg_score > 0 ? `${sp.assignment_avg_score.toFixed(1)}分` : '暂无'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
