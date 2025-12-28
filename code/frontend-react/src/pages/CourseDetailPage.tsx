import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCourseDetail, type CourseDetail } from '../features/courses/courseService'

const CourseDetailPage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCourse = async () => {
      if (!courseId) {
        setError('Missing course id')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchCourseDetail(courseId)
        if (isMounted) {
          setCourse(data)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load course'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourse()
    return () => {
      isMounted = false
    }
  }, [courseId])

  if (isLoading) {
    return <div className="empty">Loading course...</div>
  }

  if (error) {
    return <div className="alert alert--error">{error}</div>
  }

  if (!course) {
    return <div className="empty">Course not found.</div>
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>{course.name}</h1>
          <p>
            {course.code} - {course.semester} - {course.teacher_name}
          </p>
        </div>
        <Link to="/courses" className="button button--quiet">
          Back to courses
        </Link>
      </div>
      <div className="card">
        <h2>Overview</h2>
        <p className="muted">{course.description}</p>
        <div className="card__split">
          <span>Status: {course.status}</span>
          <span>Students: {course.student_count}</span>
        </div>
      </div>
      <div className="grid-two">
        <div className="card">
          <h2>Syllabus</h2>
          <p className="muted">{course.syllabus || 'No syllabus provided.'}</p>
        </div>
        <div className="card">
          <h2>Assistants</h2>
          {course.assistants.length === 0 ? (
            <p className="muted">No assistants assigned.</p>
          ) : (
            <ul className="list">
              {course.assistants.map((assistant) => (
                <li key={assistant.id}>
                  {assistant.name} - {assistant.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="card">
        <h2>Schedule</h2>
        {course.schedule.length === 0 ? (
          <p className="muted">Schedule is not available.</p>
        ) : (
          <div className="list">
            {course.schedule.map((item) => (
              <div key={item.week} className="list__row">
                <span>Week {item.week}</span>
                <span>{item.topic}</span>
                <span className="muted">{item.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CourseDetailPage
