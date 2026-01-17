import { useState, useEffect } from 'react';
import { useAuth } from '@/domains/auth/useAuth';
import { adminApi, type SystemStats, type UserItem, type CreateUserRequest, type UpdateUserRequest } from '@/api/admin';
import './AdminPage.css';

type ModalMode = 'closed' | 'create' | 'edit';

interface FormData {
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'assistant' | 'student';
    name: string;
}

export function AdminPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>('closed');
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        role: 'student',
        name: '',
    });

    // Only admin can access this page
    if (user?.role !== 'admin') {
        return (
            <div className="admin-page">
                <div className="error">您没有权限访问此页面</div>
            </div>
        );
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsData, usersData] = await Promise.all([
                adminApi.getSystemStats(),
                adminApi.listUsers(),
            ]);
            setStats(statsData);
            setUsers(usersData);
        } catch (err) {
            setError('加载数据失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ username: '', password: '', role: 'student', name: '' });
        setEditingUser(null);
        setModalMode('create');
    };

    const openEditModal = (u: UserItem) => {
        setFormData({ username: u.username, password: '', role: u.role, name: u.name });
        setEditingUser(u);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode('closed');
        setEditingUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await adminApi.createUser(formData as CreateUserRequest);
            } else if (modalMode === 'edit' && editingUser) {
                const updateData: UpdateUserRequest = {};
                if (formData.password) updateData.password = formData.password;
                if (formData.role !== editingUser.role) updateData.role = formData.role;
                if (formData.name !== editingUser.name) updateData.name = formData.name;
                await adminApi.updateUser(editingUser.id, updateData);
            }
            closeModal();
            loadData();
        } catch (err) {
            console.error(err);
            alert('操作失败');
        }
    };

    const handleDelete = async (u: UserItem) => {
        if (!confirm(`确定要删除用户 "${u.name}" 吗？`)) return;
        try {
            await adminApi.deleteUser(u.id);
            loadData();
        } catch (err) {
            console.error(err);
            alert('删除失败');
        }
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: '管理员',
            teacher: '教师',
            assistant: '助教',
            student: '学生',
        };
        return labels[role] || role;
    };

    if (loading) {
        return <div className="admin-page"><div className="loading">加载中...</div></div>;
    }

    if (error) {
        return <div className="admin-page"><div className="error">{error}</div></div>;
    }

    const maxUsers = Math.max(...Object.values(stats?.users_by_role || { admin: 0 }), 1);

    return (
        <div className="admin-page">
            <h1>管理面板</h1>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>用户总数</h3>
                    <div className="value">{stats?.total_users || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>课程数</h3>
                    <div className="value">{stats?.total_courses || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>作业数</h3>
                    <div className="value">{stats?.total_assignments || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>提交数</h3>
                    <div className="value">{stats?.total_submissions || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>测验数</h3>
                    <div className="value">{stats?.total_quizzes || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>资源数</h3>
                    <div className="value">{stats?.total_resources || 0}</div>
                </div>
            </div>

            {/* Role Breakdown */}
            <div className="role-breakdown">
                <h2>用户角色分布</h2>
                <div className="role-bars">
                    {['admin', 'teacher', 'assistant', 'student'].map((role) => (
                        <div key={role} className="role-bar">
                            <span className="label">{getRoleLabel(role)}</span>
                            <div className="bar">
                                <div
                                    className={`bar-fill ${role}`}
                                    style={{ width: `${((stats?.users_by_role[role] || 0) / maxUsers) * 100}%` }}
                                />
                            </div>
                            <span className="count">{stats?.users_by_role[role] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Users Panel */}
            <div className="users-panel">
                <div className="users-header">
                    <h2>用户管理</h2>
                    <button onClick={openCreateModal}>+ 新建用户</button>
                </div>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>用户名</th>
                            <th>姓名</th>
                            <th>角色</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.name}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>
                                        {getRoleLabel(u.role)}
                                    </span>
                                </td>
                                <td>{u.created_at}</td>
                                <td className="actions">
                                    <button className="edit-btn" onClick={() => openEditModal(u)}>编辑</button>
                                    <button className="delete-btn" onClick={() => handleDelete(u)}>删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalMode !== 'closed' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{modalMode === 'create' ? '新建用户' : '编辑用户'}</h3>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <label>
                                用户名
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={modalMode === 'edit'}
                                    required={modalMode === 'create'}
                                />
                            </label>
                            <label>
                                密码 {modalMode === 'edit' && '(留空不修改)'}
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={modalMode === 'create'}
                                    minLength={6}
                                />
                            </label>
                            <label>
                                姓名
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                角色
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as FormData['role'] })}
                                >
                                    <option value="admin">管理员</option>
                                    <option value="teacher">教师</option>
                                    <option value="assistant">助教</option>
                                    <option value="student">学生</option>
                                </select>
                            </label>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>取消</button>
                                <button type="submit" className="submit-btn">
                                    {modalMode === 'create' ? '创建' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
