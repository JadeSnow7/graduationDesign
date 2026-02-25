export interface Course {
  id: number
  name: string
  code: string
  semester: string
  teacher_name: string
  teacher_avatar?: string
  student_count: number
  status: 'active' | 'archived'
  progress?: number
  next_class?: string
  assignments_due?: number
  color_gradient?: string
}

export interface Assignment {
  id: number
  course_id: number
  title: string
  description?: string
  deadline: string
  max_score: number
  status: 'draft' | 'published'
  submission_count?: number
}

export interface CourseResource {
  id: number
  course_id: number
  filename: string
  file_type: string
  file_size: number
  url: string
  uploaded_at: string
  uploader_name: string
}

export interface CourseDetail extends Course {
  description?: string
  assignments: Assignment[]
  resources: CourseResource[]
}
