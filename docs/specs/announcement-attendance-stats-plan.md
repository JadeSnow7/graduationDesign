# 公告/签到/作业统计功能实现计划

## 概述

为教学平台新增公告系统、签到系统，并扩展作业统计功能，提升教师管理效率和学生学习体验。

---

## Phase 0：接口契约确认与字段冻结 (1天)

### 目标
- 确认所有 API 接口契约
- 冻结字段定义，前后端可并行开发

### 签到业务规则

| 规则 | 定义 |
|------|------|
| 签到码格式 | 6位数字，随机生成 |
| 签到超时 | 默认 15 分钟，教师可配置 1-60 分钟 |
| 重复签到 | 幂等处理，返回已签到时间 |
| 补签 | 不支持，超时后无法签到 |
| 防作弊 | 记录 IP 地址，供教师审查 |

### 空态文案定义

| 场景 | 学生视角 | 教师视角 |
|------|----------|----------|
| 无公告 | "暂无公告" | "暂无公告，点击发布" |
| 无签到记录 | "还没有签到记录" | "还没有发起签到" |
| 无待交作业 | "🎉 所有作业已完成" | "暂无作业" |
| 无提交 | - | "还没有学生提交" |

---

## Phase 1：后端数据模型 (1天)

### 数据模型

#### [NEW] models/announcement.go

```go
type Announcement struct {
    ID          uint       `gorm:"primaryKey" json:"id"`
    CourseID    uint       `gorm:"not null;index" json:"course_id"`
    Title       string     `gorm:"size:200;not null" json:"title"`
    Content     string     `gorm:"type:text;not null" json:"content"`
    CreatedByID uint       `gorm:"not null" json:"created_by_id"`
    CreatedAt   time.Time  `json:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at"`
}

type AnnouncementRead struct {
    ID             uint      `gorm:"primaryKey" json:"id"`
    AnnouncementID uint      `gorm:"not null;uniqueIndex:idx_announcement_user" json:"announcement_id"`
    UserID         uint      `gorm:"not null;uniqueIndex:idx_announcement_user" json:"user_id"`
    ReadAt         time.Time `json:"read_at"`
}
```

#### [NEW] models/attendance.go

```go
type AttendanceSession struct {
    ID             uint       `gorm:"primaryKey" json:"id"`
    CourseID       uint       `gorm:"not null;index" json:"course_id"`
    StartedByID    uint       `gorm:"not null" json:"started_by_id"`
    StartAt        time.Time  `json:"start_at"`
    EndAt          time.Time  `json:"end_at"`
    TimeoutMinutes int        `gorm:"default:15" json:"timeout_minutes"`
    Code           string     `gorm:"size:6;not null" json:"code"`
    IsActive       bool       `gorm:"default:true" json:"is_active"`
}

type AttendanceRecord struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    SessionID   uint      `gorm:"not null;index" json:"session_id"`
    StudentID   uint      `gorm:"not null" json:"student_id"`
    CheckedInAt time.Time `json:"checked_in_at"`
    IPAddress   string    `gorm:"size:45" json:"ip_address"`
}
```

### 数据库索引

```sql
-- 公告查询优化
CREATE INDEX idx_announcement_course_created ON announcements(course_id, created_at DESC);
CREATE UNIQUE INDEX idx_announcement_read_unique ON announcement_reads(announcement_id, user_id);

-- 签到查询优化
CREATE INDEX idx_attendance_session_course ON attendance_sessions(course_id, start_at DESC);
CREATE INDEX idx_attendance_record_session ON attendance_records(session_id);

-- 作业统计优化
CREATE INDEX idx_submissions_assignment_student ON submissions(assignment_id, student_id);
```

### 权限定义 (rbac.go)

```go
const (
    PermAnnouncementRead  = "announcement:read"
    PermAnnouncementWrite = "announcement:write"
    PermAttendanceRead    = "attendance:read"
    PermAttendanceWrite   = "attendance:write"   // 教师开启/结束签到
    PermAttendanceCheckin = "attendance:checkin" // 学生签到
    PermAttendanceExport  = "attendance:export"  // 导出签到记录
)

// 角色权限映射
var RolePermissions = map[string][]string{
    "student": {
        PermAnnouncementRead,
        PermAttendanceRead,
        PermAttendanceCheckin,
    },
    "teacher": {
        PermAnnouncementRead, PermAnnouncementWrite,
        PermAttendanceRead, PermAttendanceWrite, PermAttendanceExport,
    },
    "admin": {/* all */},
}
```

---

## Phase 2：后端路由与 Handler (2天)

### API 契约

#### 公告模块

| Method | Path | 权限 | 描述 |
|--------|------|------|------|
| GET | `/courses/:id/announcements/summary` | announcement:read | 公告摘要 |
| GET | `/courses/:id/announcements` | announcement:read | 公告列表 |
| POST | `/courses/:id/announcements` | announcement:write | 发布公告 |
| PUT | `/announcements/:id` | announcement:write | 编辑公告 |
| DELETE | `/announcements/:id` | announcement:write | 删除公告 |
| POST | `/announcements/:id/read` | announcement:read | 标记已读 |

**响应示例**：

```json
// GET /courses/:id/announcements/summary
{
  "unread_count": 3,
  "total_count": 12,
  "latest": {
    "id": 42,
    "title": "期末考试安排",
    "created_at": "2026-01-04T10:00:00Z"
  }
}

// GET /courses/:id/announcements
[
  {
    "id": 42,
    "title": "期末考试安排",
    "content": "...",
    "created_at": "2026-01-04T10:00:00Z",
    "is_read": false
  }
]
```

#### 签到模块

| Method | Path | 权限 | 描述 |
|--------|------|------|------|
| GET | `/courses/:id/attendance/summary` | attendance:read | 签到概览 |
| GET | `/courses/:id/attendance/sessions` | attendance:read | 签到记录列表 |
| POST | `/courses/:id/attendance/start` | attendance:write | 开启签到 |
| POST | `/attendance/:session_id/end` | attendance:write | 结束签到 |
| POST | `/attendance/:session_id/checkin` | attendance:checkin | 学生签到 |
| GET | `/attendance/:session_id/records` | attendance:read | 签到详情 |

**响应示例**：

```json
// GET /courses/:id/attendance/summary
{
  "success": true,
  "data": {
    "attendance_rate": 0.92,
    "sessions_count": 15,
    "last_session_at": "2026-01-03T08:00:00Z",
    "active_session": {
      "id": 101,
      "code": "382916",
      "ends_at": "2026-01-04T09:15:00Z"
    }
  }
}

// POST /attendance/:session_id/checkin
// Request: { "code": "382916" }
// Response:
{
  "success": true,
  "data": {
    "checked_in_at": "2026-01-04T09:02:33Z"
  }
}
// 或已签到:
{
  "success": true,
  "data": {
    "already_checked_in": true,
    "checked_in_at": "2026-01-04T09:01:15Z"
  }
}
```

#### 作业统计扩展

| Method | Path | 权限 | 描述 |
|--------|------|------|------|
| GET | `/courses/:id/assignments?with_stats=1` | assignment:read | 作业列表+统计 |
| GET | `/courses/:id/assignments?with_my_submission=1` | assignment:read | 作业列表+我的提交 |
| GET | `/assignments/:id/submissions/summary` | assignment:read | 提交统计摘要 |
| GET | `/assignments/:id/submissions?status=...` | assignment:read | 提交名单 |

**响应示例**：

```json
// GET /courses/:id/assignments?with_stats=1
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "第三章习题",
      "due_at": "2026-01-10T23:59:59Z",
      "stats": {
        "total_students": 45,
        "submitted_count": 38,
        "graded_count": 20
      }
    }
  ]
}

// GET /assignments/:id/submissions?include=student&status=missing&page=1&limit=20
{
  "items": [
    {
      "student_id": 123,
      "student_name": "张三",
      "status": "missing"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 20
}
```

### Handler 文件结构

```
internal/http/
  handlers_announcement.go   # [NEW]
  handlers_attendance.go     # [NEW]
  handlers_assignment.go     # [MODIFY] 扩展统计查询
```

---

## Phase 3：前端数据层 (1.5天)

### 目录结构

```
src/
  api/
    announcement.ts          # [NEW]
    attendance.ts            # [NEW]
    assignment.ts            # [MODIFY]
  domains/
    announcement/
      useAnnouncementStore.ts  # [NEW]
      orchestrator.ts          # [NEW]
    attendance/
      useAttendanceStore.ts    # [NEW]
      orchestrator.ts          # [NEW]
```

### API 客户端

#### [NEW] src/api/announcement.ts

```typescript
export interface AnnouncementSummary {
  unread_count: number;
  total_count: number;
  latest: { id: number; title: string; created_at: string } | null;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const announcementApi = {
  getSummary: (courseId: number) => 
    apiClient.get<AnnouncementSummary>(`/courses/${courseId}/announcements/summary`),
  
  getList: (courseId: number) =>
    apiClient.get<Announcement[]>(`/courses/${courseId}/announcements`),
  
  markRead: (announcementId: number) =>
    apiClient.post(`/announcements/${announcementId}/read`),
  
  create: (courseId: number, data: { title: string; content: string }) =>
    apiClient.post(`/courses/${courseId}/announcements`, data),
};
```

#### [NEW] src/api/attendance.ts

```typescript
export interface AttendanceSummary {
  attendance_rate: number;
  sessions_count: number;
  last_session_at: string | null;
  active_session: { id: number; code: string; ends_at: string } | null;
}

export interface CheckinResult {
  success: boolean;
  already_checked_in?: boolean;
  checked_in_at: string;
}

export const attendanceApi = {
  getSummary: (courseId: number) =>
    apiClient.get<AttendanceSummary>(`/courses/${courseId}/attendance/summary`),
  
  startSession: (courseId: number, timeoutMinutes?: number) =>
    apiClient.post(`/courses/${courseId}/attendance/start`, { timeout_minutes: timeoutMinutes }),
  
  endSession: (sessionId: number) =>
    apiClient.post(`/attendance/${sessionId}/end`),
  
  checkin: (sessionId: number, code: string) =>
    apiClient.post<CheckinResult>(`/attendance/${sessionId}/checkin`, { code }),
};
```

### Orchestrator 设计

#### [NEW] src/domains/announcement/orchestrator.ts

```typescript
export const announcementOrchestrator = {
  handleLoadSummary(courseId: number): void {
    scheduler.schedule(
      { id: `announcement-summary-${courseId}`, type: 'announcement/summary', priority: 2 },
      async () => {
        const summary = await announcementApi.getSummary(courseId);
        useAnnouncementStore.getState().setSummary(courseId, summary);
        return summary;
      },
      { onComplete: () => {}, onError: (e) => console.error(e) }
    );
  },
  
  handleMarkRead(announcementId: number): void {
    // Optimistic update
    useAnnouncementStore.getState().markAsRead(announcementId);
    
    scheduler.schedule(
      { id: `announcement-read-${announcementId}`, type: 'announcement/read', priority: 1 },
      async () => announcementApi.markRead(announcementId),
      { onError: () => useAnnouncementStore.getState().markAsUnread(announcementId) }
    );
  },
};
```

---

## Phase 4：前端 UI 与交互 (2天)

### Overview 三卡片

#### [MODIFY] src/pages/OverviewPage.tsx

```typescript
// 数据获取
useEffect(() => {
  announcementOrchestrator.handleLoadSummary(courseId);
  attendanceOrchestrator.handleLoadSummary(courseId);
  assignmentOrchestrator.handleLoadPending(courseId);
}, [courseId]);

// 渲染
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <SummaryCard 
    title="公告" 
    value={announcementSummary?.unread_count ?? 0}
    onClick={() => setDrawer('announcements')}
  />
  <SummaryCard 
    title="签到率" 
    value={attendanceSummary?.attendance_rate ?? 0}
    format="percent"
    onClick={() => setDrawer('attendance')}
  />
  <SummaryCard 
    title="待交作业" 
    value={pendingAssignments?.length ?? 0}
    onClick={() => navigate(`/courses/${courseId}/assignments?filter=pending`)}
  />
</div>
```

### 通用抽屉组件

#### [NEW] src/components/Drawer.tsx

```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg'; // 320px, 480px, 640px
}

export function Drawer({ isOpen, onClose, title, children, width = 'md' }: DrawerProps) {
  // Esc 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 滚动锁定
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          {/* 抽屉 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full bg-gray-900 z-50 ${widthClasses[width]}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose}><X /></button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 动效规范

| 元素 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 卡片入场 | fade + translateY(6px) | 300ms stagger 50ms | ease-out |
| 数值动画 | count-up | 200-300ms | ease-out |
| 签到率环 | SVG stroke-dashoffset | 600ms | ease-in-out |
| 抽屉滑入 | translateX(100%) → 0 | 240ms | spring |
| 遮罩淡入 | opacity 0 → 0.5 | 150ms | ease |
| 卡片 Hover | translateY(-2px) + shadow | 150ms | ease |

**a11y 降级**：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 5：作业页增强 (1天)

### 作业列表增强

#### [MODIFY] src/pages/AssignmentsPage.tsx

- 解析 URL 参数 `?filter=pending`
- 学生视角：显示状态徽标（未交/已交/已批改）
- 教师视角：显示 `38/45 提交 · 20 已批改`

### 提交名单抽屉

#### [MODIFY] src/pages/AssignmentDetailPage.tsx

```typescript
// 教师视角新增按钮
<Button onClick={() => setShowSubmissionsDrawer(true)}>
  查看提交情况 ({stats.submitted_count}/{stats.total_students})
</Button>

// 抽屉内容
<Drawer isOpen={showSubmissionsDrawer} title="提交情况" width="lg">
  {/* 统计概览 */}
  <div className="grid grid-cols-3 gap-4 mb-6">
    <StatCard label="已提交" value={stats.submitted_count} />
    <StatCard label="已批改" value={stats.graded_count} />
    <StatCard label="未提交" value={stats.missing_count} color="red" />
  </div>
  
  {/* 过滤器 */}
  <FilterTabs 
    value={filter} 
    onChange={setFilter}
    options={['all', 'submitted', 'graded', 'missing']}
  />
  
  {/* 名单 */}
  <SubmissionList items={filteredSubmissions} />
</Drawer>
```

---

## Phase 6：联调与验收 (1天)

### 验收清单

| 功能 | 验收标准 | 测试方法 |
|------|----------|----------|
| Overview 公告卡 | 显示真实未读数，点击打开抽屉 | 手动测试 |
| Overview 签到卡 | 显示签到率，有活跃签到时显示签到码 | 手动测试 |
| Overview 作业卡 | 显示待交数量，点击跳转带 filter | URL 检查 |
| 公告抽屉 | 列表加载，标记已读后未读数-1 | 手动测试 |
| 签到抽屉 | 学生可签到，重复签到提示已签 | 手动测试 |
| 作业提交抽屉 | 过滤正常，分页正常 | 手动测试 |
| 动效 | 流畅无卡顿，reduced-motion 降级 | 系统设置切换 |
| 权限 | 学生无法发公告/开签到 | 角色切换测试 |
| 空态 | 所有空态显示正确文案 | 清空数据测试 |

### API 断言测试 (可选)

```typescript
// tests/api/announcement.test.ts
describe('Announcement API', () => {
  it('should return unread count', async () => {
    const res = await request(app).get('/courses/1/announcements/summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('unread_count');
  });
});
```

---

## 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 统计查询慢 | 作业列表加载慢 | 使用聚合查询 + 索引 + 缓存 |
| 签到并发 | 高峰期数据库压力 | 短期锁 + 队列写入 |
| 数据为空 | 用户困惑 | 统一空态组件 |
| 权限穿透 | 学生看到教师功能 | RBAC 中间件 + 前端条件渲染 |
| 移动端适配 | 抽屉太窄/触控困难 | 响应式宽度 + 最小触控区域 44px |

---

## 时间线 (预估 9.5 天)

```
Phase 0: ████ 1天
Phase 1: ████ 1天
Phase 2: ████████ 2天
Phase 3: ██████ 1.5天
Phase 4: ████████ 2天
Phase 5: ████ 1天
Phase 6: ████ 1天
```

---

End of document.
