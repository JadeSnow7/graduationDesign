import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Card,
  List,
  Progress,
  Badge,
  Avatar,
  Typography,
  Tag,
  Spin,
  Empty,
} from 'antd'
import { ClockCircleOutlined, BookOutlined } from '@ant-design/icons'
import { coursesApi } from '../../api/endpoints/courses'
import type { Course } from '../../types/course'
import { useMobile } from '../../hooks/useMobile'

const { Title, Text } = Typography

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-green-500 to-green-700',
  'from-orange-500 to-orange-700',
]

// Mock fallback data for demo when backend is unavailable
const MOCK_COURSES: Course[] = [
  {
    id: 1,
    name: '电磁场与电磁波',
    code: 'EE301',
    semester: '2025-Spring',
    teacher_name: '张明远',
    student_count: 42,
    status: 'active',
    progress: 68,
    next_class: '周三 14:30-16:10',
    assignments_due: 3,
  },
  {
    id: 2,
    name: '微波技术',
    code: 'EE402',
    semester: '2025-Spring',
    teacher_name: '李华',
    student_count: 38,
    status: 'active',
    progress: 45,
    next_class: '周四 10:00-11:40',
    assignments_due: 2,
  },
  {
    id: 3,
    name: '量子力学导论',
    code: 'PH301',
    semester: '2025-Spring',
    teacher_name: '王芳',
    student_count: 55,
    status: 'active',
    progress: 82,
    next_class: '周五 14:30-16:10',
    assignments_due: 1,
  },
]

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isMobile = useMobile()

  useEffect(() => {
    coursesApi
      .list()
      .then(setCourses)
      .catch(() => setCourses(MOCK_COURSES))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-16">
        <Spin size="large" />
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <List
          dataSource={courses}
          locale={{ emptyText: <Empty description="暂无课程" /> }}
          renderItem={(course, idx) => (
            <List.Item
              key={course.id}
              style={{ padding: 0, marginBottom: 12, border: 'none' }}
            >
              <Card
                hoverable
                className="w-full overflow-hidden"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div
                  className={`h-20 bg-gradient-to-br ${GRADIENT_COLORS[idx % GRADIENT_COLORS.length]} px-4 flex items-end pb-3`}
                >
                  <Title level={5} style={{ color: 'white', margin: 0 }}>
                    {course.name}
                  </Title>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      style={{
                        background: `hsl(${(idx * 60) % 360}, 70%, 55%)`,
                      }}
                    >
                      {course.teacher_name[0]}
                    </Avatar>
                    <div>
                      <Text strong style={{ color: 'var(--text-light)' }}>
                        {course.teacher_name} 副教授
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        下次课程: {course.next_class ?? '待定'}
                      </Text>
                    </div>
                  </div>

                  <Progress
                    percent={course.progress ?? 0}
                    strokeColor="var(--primary-500)"
                    size="small"
                    format={(p) => `${p}%`}
                  />

                  {(course.assignments_due ?? 0) > 0 && (
                    <Badge
                      count={course.assignments_due}
                      style={{ backgroundColor: 'var(--semantic-warning)' }}
                    >
                      <Tag
                        icon={<BookOutlined />}
                        color="orange"
                        style={{ cursor: 'pointer' }}
                      >
                        待办作业
                      </Tag>
                    </Badge>
                  )}
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
    )
  }

  // Desktop
  return (
    <div className="p-8" style={{ backgroundColor: 'var(--surface-950)', minHeight: '100%' }}>
      <div className="max-w-[1600px] mx-auto">
        <Title
          level={2}
          style={{ color: 'var(--text-dark)', marginBottom: 32 }}
        >
          我的课程
        </Title>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <Card
              key={course.id}
              hoverable
              className="overflow-hidden cursor-pointer"
              styles={{ body: { padding: 0 } }}
              style={{
                backgroundColor: 'var(--surface-800)',
                border: '1px solid var(--surface-700)',
              }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div
                className={`h-28 bg-gradient-to-br ${GRADIENT_COLORS[idx % GRADIENT_COLORS.length]} px-6 flex items-end pb-4`}
              >
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {course.name}
                </Title>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={44}
                    style={{
                      background: `hsl(${(idx * 60) % 360}, 70%, 55%)`,
                      flexShrink: 0,
                    }}
                  >
                    {course.teacher_name[0]}
                  </Avatar>
                  <div>
                    <Text strong style={{ color: 'var(--text-dark)' }}>
                      {course.teacher_name} 副教授
                    </Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{ fontSize: 13 }}
                    >
                      <ClockCircleOutlined className="mr-1" />
                      {course.next_class ?? '待定'}
                    </Text>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      课程进度
                    </Text>
                    <Text style={{ color: 'var(--primary-300)', fontSize: 13 }}>
                      {course.progress ?? 0}%
                    </Text>
                  </div>
                  <Progress
                    percent={course.progress ?? 0}
                    strokeColor={{
                      from: 'var(--primary-700)',
                      to: 'var(--primary-500)',
                    }}
                    showInfo={false}
                    size="small"
                  />
                </div>

                {(course.assignments_due ?? 0) > 0 && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-700)' }}
                  >
                    <BookOutlined
                      style={{ color: 'var(--semantic-warning)' }}
                    />
                    <Text style={{ color: 'var(--text-dark)' }}>
                      {course.assignments_due} 个待办作业
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
