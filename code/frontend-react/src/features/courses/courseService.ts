import api from '../../shared/api/client'
import type { ApiResponse } from '../../shared/api/types'

export interface CourseSummary {
  id: string
  name: string
  code: string
  semester: string
  description: string
  teacher_id: string
  teacher_name: string
  student_count: number
  status: string
  created_at: string
  updated_at: string
}

export interface CourseListResponse {
  courses: CourseSummary[]
  total: number
  page: number
  limit: number
}

export interface CourseAssistant {
  id: string
  name: string
  email: string
}

export interface CourseScheduleItem {
  week: number
  topic: string
  content: string
}

export interface CourseDetail {
  id: string
  name: string
  code: string
  semester: string
  description: string
  teacher_id: string
  teacher_name: string
  assistants: CourseAssistant[]
  student_count: number
  status: string
  syllabus: string
  schedule: CourseScheduleItem[]
  created_at: string
  updated_at: string
}

export const fetchCourses = async (params?: {
  page?: number
  limit?: number
  search?: string
}) => {
  const { data } = await api.get<ApiResponse<CourseListResponse>>('/api/v1/courses', {
    params,
  })

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Unable to load courses')
  }

  return data.data
}

export const fetchCourseDetail = async (courseId: string) => {
  const { data } = await api.get<ApiResponse<CourseDetail>>(
    `/api/v1/courses/${courseId}`,
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Unable to load course')
  }

  return data.data
}
