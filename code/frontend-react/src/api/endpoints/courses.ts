import client from '../client'
import type { Course, CourseDetail, Assignment, CourseResource } from '../../types/course'

export const coursesApi = {
  list: () =>
    client.get<Course[]>('/courses').then((r) => r.data),

  get: (id: number) =>
    client.get<CourseDetail>(`/courses/${id}`).then((r) => r.data),

  getAssignments: (id: number) =>
    client.get<Assignment[]>(`/courses/${id}/assignments`).then((r) => r.data),

  getResources: (id: number) =>
    client.get<CourseResource[]>(`/courses/${id}/resources`).then((r) => r.data),

  uploadResource: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client
      .post<CourseResource>(`/courses/${id}/resources`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
