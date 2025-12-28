import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses, type CourseSummary } from '../features/courses/courseService'

const CourseListPage = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadCourses = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchCourses({ search: query })
        if (isMounted) {
          setCourses(data.courses)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load courses'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourses()
    return () => {
      isMounted = false
    }
  }, [query])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setQuery(search.trim())
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Courses</h1>
          <p>Manage course content, students, and learning resources.</p>
        </div>
        <form className="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by name or code"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="button button--quiet">
            Search
          </button>
        </form>
      </div>
      {isLoading ? <div className="empty">Loading courses...</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}
      {!isLoading && !error && courses.length === 0 ? (
        <div className="empty">No courses found.</div>
      ) : null}
      <div className="list-grid">
        {courses.map((course) => (
          <article className="card" key={course.id}>
            <div className="card__meta">{course.semester}</div>
            <h2>{course.name}</h2>
            <p className="muted">{course.description}</p>
            <div className="card__split">
              <span>{course.code}</span>
              <span>{course.teacher_name}</span>
            </div>
            <div className="card__split">
              <span>{course.student_count} students</span>
              <Link className="link" to={`/courses/${course.id}`}>
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CourseListPage
