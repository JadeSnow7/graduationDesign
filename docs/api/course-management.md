# 课程管理接口

## 概述

课程管理接口提供课程的创建、查询、更新和删除功能，以及课程成员管理、作业管理等相关功能。

## 权限要求

- `course:read` - 查看课程信息
- `course:write` - 创建和修改课程

## 接口列表

### 1. 获取课程列表

获取当前用户可访问的课程列表。

**接口地址**: `GET /api/v1/courses`

**权限要求**: `course:read`

**请求参数**:
- `page` (query, optional): 页码，默认为 1
- `limit` (query, optional): 每页数量，默认为 20
- `search` (query, optional): 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "1",
        "name": "电磁场理论",
        "code": "EMF101",
        "semester": "2025-2026-1",
        "description": "电磁场基础理论课程",
        "teacher_id": "2",
        "teacher_name": "张教授",
        "student_count": 45,
        "status": "active",
        "created_at": "2025-09-01T00:00:00Z",
        "updated_at": "2025-12-20T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 2. 获取课程详情

获取指定课程的详细信息。

**接口地址**: `GET /api/v1/courses/{course_id}`

**权限要求**: `course:read`

**路径参数**:
- `course_id`: 课程 ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "电磁场理论",
    "code": "EMF101",
    "semester": "2025-2026-1",
    "description": "电磁场基础理论课程，包含静电场、静磁场、电磁波等内容",
    "teacher_id": "2",
    "teacher_name": "张教授",
    "assistants": [
      {
        "id": "3",
        "name": "李助教",
        "email": "li@example.com"
      }
    ],
    "student_count": 45,
    "status": "active",
    "syllabus": "课程大纲内容...",
    "schedule": [
      {
        "week": 1,
        "topic": "矢量分析",
        "content": "矢量运算、梯度、散度、旋度"
      }
    ],
    "created_at": "2025-09-01T00:00:00Z",
    "updated_at": "2025-12-20T10:00:00Z"
  }
}
```

### 3. 创建课程

创建新的课程。

**接口地址**: `POST /api/v1/courses`

**权限要求**: `course:write`

**请求参数**:
```json
{
  "name": "电磁场理论",
  "code": "EMF101",
  "semester": "2025-2026-1",
  "description": "电磁场基础理论课程",
  "syllabus": "课程大纲内容...",
  "max_students": 50
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "电磁场理论",
    "code": "EMF101",
    "semester": "2025-2026-1",
    "description": "电磁场基础理论课程",
    "teacher_id": "2",
    "status": "active",
    "invite_code": "ABC123",
    "created_at": "2025-12-23T10:00:00Z"
  },
  "message": "课程创建成功"
}
```

### 4. 更新课程

更新课程信息。

**接口地址**: `PUT /api/v1/courses/{course_id}`

**权限要求**: `course:write`

**路径参数**:
- `course_id`: 课程 ID

**请求参数**:
```json
{
  "name": "电磁场理论（更新）",
  "description": "更新后的课程描述",
  "syllabus": "更新后的课程大纲",
  "status": "active"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "电磁场理论（更新）",
    "description": "更新后的课程描述",
    "updated_at": "2025-12-23T10:30:00Z"
  },
  "message": "课程更新成功"
}
```

### 5. 删除课程

删除指定课程（软删除）。

**接口地址**: `DELETE /api/v1/courses/{course_id}`

**权限要求**: `course:write`

**路径参数**:
- `course_id`: 课程 ID

**响应示例**:
```json
{
  "success": true,
  "message": "课程删除成功"
}
```

## 课程成员管理

### 6. 获取课程成员

获取课程的所有成员列表。

**接口地址**: `GET /api/v1/courses/{course_id}/members`

**权限要求**: `course:read`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "teacher": {
      "id": "2",
      "name": "张教授",
      "email": "zhang@example.com",
      "role": "teacher"
    },
    "assistants": [
      {
        "id": "3",
        "name": "李助教",
        "email": "li@example.com",
        "role": "assistant"
      }
    ],
    "students": [
      {
        "id": "4",
        "name": "王同学",
        "email": "wang@example.com",
        "student_id": "2021001",
        "role": "student",
        "joined_at": "2025-09-01T00:00:00Z"
      }
    ],
    "total_count": 47
  }
}
```

### 7. 添加课程成员

向课程添加新成员。

**接口地址**: `POST /api/v1/courses/{course_id}/members`

**权限要求**: `course:write`

**请求参数**:
```json
{
  "user_ids": ["4", "5", "6"],
  "role": "student"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "added_count": 3,
    "failed_users": []
  },
  "message": "成员添加成功"
}
```

### 8. 移除课程成员

从课程中移除成员。

**接口地址**: `DELETE /api/v1/courses/{course_id}/members/{user_id}`

**权限要求**: `course:write`

**响应示例**:
```json
{
  "success": true,
  "message": "成员移除成功"
}
```

### 9. 通过邀请码加入课程

学生通过邀请码加入课程。

**接口地址**: `POST /api/v1/courses/join`

**权限要求**: 无（学生自主加入）

**请求参数**:
```json
{
  "invite_code": "ABC123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "course_id": "1",
    "course_name": "电磁场理论",
    "joined_at": "2025-12-23T10:00:00Z"
  },
  "message": "成功加入课程"
}
```

## 作业管理

### 10. 获取课程作业列表

获取课程的所有作业。

**接口地址**: `GET /api/v1/courses/{course_id}/assignments`

**权限要求**: `course:read`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "1",
        "title": "第一章习题",
        "description": "完成第一章课后习题1-10题",
        "due_date": "2025-12-30T23:59:59Z",
        "max_score": 100,
        "status": "published",
        "submission_count": 35,
        "created_at": "2025-12-20T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 11. 创建作业

创建新的作业。

**接口地址**: `POST /api/v1/courses/{course_id}/assignments`

**权限要求**: `course:write`

**请求参数**:
```json
{
  "title": "第一章习题",
  "description": "完成第一章课后习题1-10题",
  "due_date": "2025-12-30T23:59:59Z",
  "max_score": 100,
  "instructions": "详细的作业说明...",
  "attachments": ["file1.pdf", "file2.docx"]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "第一章习题",
    "status": "draft",
    "created_at": "2025-12-23T10:00:00Z"
  },
  "message": "作业创建成功"
}
```

## 资源管理

### 12. 获取课程资源

获取课程的所有学习资源。

**接口地址**: `GET /api/v1/courses/{course_id}/resources`

**权限要求**: `course:read`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "1",
        "name": "第一章课件.pdf",
        "type": "document",
        "size": 2048576,
        "category": "lecture",
        "chapter": 1,
        "uploaded_by": "张教授",
        "uploaded_at": "2025-12-20T10:00:00Z",
        "download_url": "/api/v1/resources/1/download"
      }
    ],
    "categories": [
      {"key": "lecture", "name": "课件"},
      {"key": "exercise", "name": "习题"},
      {"key": "reference", "name": "参考资料"}
    ]
  }
}
```

### 13. 上传课程资源

上传新的学习资源。

**接口地址**: `POST /api/v1/courses/{course_id}/resources`

**权限要求**: `course:write`

**请求参数**: (multipart/form-data)
- `file`: 文件
- `name`: 资源名称
- `category`: 资源分类
- `chapter`: 章节号（可选）
- `description`: 描述（可选）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "第一章课件.pdf",
    "type": "document",
    "size": 2048576,
    "uploaded_at": "2025-12-23T10:00:00Z"
  },
  "message": "资源上传成功"
}
```

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| COURSE_NOT_FOUND | 课程不存在 | 检查课程 ID 是否正确 |
| COURSE_CODE_EXISTS | 课程代码已存在 | 使用不同的课程代码 |
| MEMBER_ALREADY_EXISTS | 成员已存在 | 检查用户是否已加入课程 |
| INVITE_CODE_INVALID | 邀请码无效 | 检查邀请码是否正确或已过期 |
| ASSIGNMENT_OVERDUE | 作业已过期 | 作业提交时间已过 |
| RESOURCE_TOO_LARGE | 文件过大 | 文件大小超出限制 |

### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "课程不存在",
    "details": "课程 ID '999' 不存在或已被删除"
  }
}
```