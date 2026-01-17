import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { courseApi, type Course } from '@/api/course';

interface CourseContextValue {
    courseId: number | undefined;
    course: Course | null;
    isLoading: boolean;
    error: string | null;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
    const params = useParams<{ courseId: string }>();
    console.log('CourseProvider params:', params); // DEBUG
    const { courseId: courseIdParam } = params;

    // Safety check for parsing
    let courseId: number | undefined = undefined;
    if (courseIdParam && !isNaN(parseInt(courseIdParam, 10))) {
        courseId = parseInt(courseIdParam, 10);
    }

    console.log('CourseProvider parsed courseId:', courseId); // DEBUG

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) {
            console.log('CourseProvider: No courseId, skipping fetch');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        courseApi
            .get(courseId.toString())
            .then((data) => {
                setCourse(data ?? null);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('CourseProvider: Error fetching course', err);
                setError(err.message);
                setIsLoading(false);
            });
    }, [courseId]);

    return (
        <CourseContext.Provider value={{ courseId, course, isLoading, error }}>
            {children}
        </CourseContext.Provider>
    );
}

export function useCourse(): CourseContextValue {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within CourseProvider');
    }
    return context;
}
