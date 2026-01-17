import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/auth/useAuth';
import { useCourse } from '@/domains/course/useCourse';
import { announcementApi, type AnnouncementSummary, type Announcement } from '@/api/announcement';
import { attendanceApi, type AttendanceSummary } from '@/api/attendance';
import { assignmentApi, type AssignmentStats } from '@/api/assignment';
import { SummaryCard, Drawer } from '@/components';
import { Megaphone, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import './OverviewPage.css';

export function OverviewPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { courseId, course } = useCourse();

    // State
    const [announcementSummary, setAnnouncementSummary] = useState<AnnouncementSummary | null>(null);
    const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
    const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    // Check-in state
    const [checkinCode, setCheckinCode] = useState('');
    const [checkinLoading, setCheckinLoading] = useState(false);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState<'announcements' | 'attendance' | null>(null);

    // Fetch summaries
    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [annSummary, attSummary, assStats] = await Promise.all([
                    announcementApi.getSummary(courseId),
                    attendanceApi.getSummary(courseId),
                    assignmentApi.getStats(courseId),
                ]);
                setAnnouncementSummary(annSummary);
                setAttendanceSummary(attSummary);
                setAssignmentStats(assStats);
            } catch (error) {
                console.error('Failed to fetch overview data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    // Fetch announcements when drawer opens
    useEffect(() => {
        if (drawerOpen === 'announcements' && courseId) {
            announcementApi.getList(courseId).then(setAnnouncements);
        }
    }, [drawerOpen, courseId]);

    // Mark announcement as read
    const handleMarkRead = async (announcementId: number) => {
        await announcementApi.markRead(announcementId);
        setAnnouncements(prev =>
            prev.map(a => a.id === announcementId ? { ...a, is_read: true } : a)
        );
        if (announcementSummary) {
            setAnnouncementSummary({
                ...announcementSummary,
                unread_count: Math.max(0, announcementSummary.unread_count - 1),
            });
        }
    };

    // Handle Check-in
    const handleCheckin = async () => {
        if (!attendanceSummary?.active_session || !courseId) return;
        setCheckinLoading(true);
        try {
            const res = await attendanceApi.checkin(attendanceSummary.active_session.id, checkinCode);
            alert(res.already_checked_in ? '你已经签到过了！' : '签到成功！');
            setCheckinCode('');
            // Refresh stats
            const newSummary = await attendanceApi.getSummary(courseId);
            setAttendanceSummary(newSummary);
        } catch (err: any) {
            const msg = err.response?.data?.error || '签到失败';
            alert(msg);
        } finally {
            setCheckinLoading(false);
        }
    };

    // Navigate to assignments with filter
    const handleAssignmentsClick = () => {
        if (courseId) {
            navigate(`/courses/${courseId}/assignments?filter=pending`);
        }
    };

    return (
        <div className="overview-page">
            {/* Hero */}
            <div className="overview-hero">
                <h1 className="overview-hero-title">{course?.name}</h1>
                <p className="overview-hero-desc">
                    {course?.semester ? `${course.semester} 学期` : '暂无描述'}
                </p>
                <div className="overview-hero-meta">
                    <Users className="w-4 h-4" />
                    <span>授课教师ID: {course?.teacher_id}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="overview-cards">
                <SummaryCard
                    title="未读公告"
                    value={announcementSummary?.unread_count ?? 0}
                    icon={<Megaphone size={18} />}
                    color="blue"
                    loading={loading}
                    subtitle={announcementSummary?.latest?.title}
                    onClick={() => setDrawerOpen('announcements')}
                />

                <SummaryCard
                    title="待交作业"
                    value={assignmentStats?.pending_count ?? 0}
                    icon={<Calendar size={18} />}
                    color="orange"
                    loading={loading}
                    subtitle={assignmentStats ? `共 ${assignmentStats.total_assignments} 项作业` : '点击查看详情'}
                    onClick={handleAssignmentsClick}
                />

                <SummaryCard
                    title="签到率"
                    value={attendanceSummary?.attendance_rate ?? 0}
                    format="percent"
                    icon={<Users size={18} />}
                    color="green"
                    loading={loading}
                    subtitle={
                        attendanceSummary?.active_session
                            ? `签到进行中` + (attendanceSummary.active_session.code ? ` - ${attendanceSummary.active_session.code}` : '')
                            : `共 ${attendanceSummary?.sessions_count ?? 0} 次签到`
                    }
                    onClick={() => setDrawerOpen('attendance')}
                />
            </div>

            {/* Active Session Alert */}
            {attendanceSummary?.active_session && (
                <div className="overview-active-session">
                    <div className="active-session-icon">
                        <Clock className="animate-pulse" size={20} />
                    </div>
                    <div className="active-session-content">
                        <h3>签到进行中</h3>

                        {user?.role === 'student' ? (
                            <div className="checkin-form">
                                <input
                                    type="text"
                                    value={checkinCode}
                                    onChange={e => setCheckinCode(e.target.value)}
                                    placeholder="输入签到码"
                                    className="checkin-input"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleCheckin}
                                    disabled={checkinLoading || checkinCode.length !== 6}
                                    className="checkin-btn"
                                >
                                    {checkinLoading ? '签到中...' : '立即签到'}
                                </button>
                            </div>
                        ) : (
                            <p>签到码: <strong>{attendanceSummary.active_session.code}</strong></p>
                        )}

                        <p className="active-session-time">
                            截止时间: {new Date(attendanceSummary.active_session.ends_at).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Announcements Drawer */}
            <Drawer
                isOpen={drawerOpen === 'announcements'}
                onClose={() => setDrawerOpen(null)}
                title="公告列表"
                width="lg"
            >
                {announcements.length === 0 ? (
                    <div className="drawer-empty">暂无公告</div>
                ) : (
                    <div className="announcement-list">
                        {announcements.map(announcement => (
                            <div
                                key={announcement.id}
                                className={`announcement-item ${announcement.is_read ? 'read' : 'unread'}`}
                                onClick={() => !announcement.is_read && handleMarkRead(announcement.id)}
                            >
                                <div className="announcement-header">
                                    <h4>{announcement.title}</h4>
                                    {!announcement.is_read && (
                                        <span className="unread-badge">未读</span>
                                    )}
                                </div>
                                <p className="announcement-content">{announcement.content}</p>
                                <time className="announcement-time">
                                    {new Date(announcement.created_at).toLocaleString()}
                                </time>
                            </div>
                        ))}
                    </div>
                )}
            </Drawer>

            {/* Attendance Drawer */}
            <Drawer
                isOpen={drawerOpen === 'attendance'}
                onClose={() => setDrawerOpen(null)}
                title="签到详情"
                width="md"
            >
                <div className="attendance-summary">
                    <div className="attendance-stat">
                        <span className="stat-value">{attendanceSummary?.sessions_count ?? 0}</span>
                        <span className="stat-label">总签到次数</span>
                    </div>
                    <div className="attendance-stat">
                        <span className="stat-value">
                            {Math.round((attendanceSummary?.attendance_rate ?? 0) * 100)}%
                        </span>
                        <span className="stat-label">出勤率</span>
                    </div>
                </div>

                {attendanceSummary?.active_session && (
                    <div className="active-checkin-card">
                        <CheckCircle className="text-green-400" size={24} />
                        <div>
                            <h4>当前签到</h4>
                            <p>签到码: {attendanceSummary.active_session.code}</p>
                        </div>
                    </div>
                )}

                {attendanceSummary?.last_session_at && (
                    <p className="last-session-time">
                        上次签到: {new Date(attendanceSummary.last_session_at).toLocaleString()}
                    </p>
                )}
            </Drawer>
        </div>
    );
}
