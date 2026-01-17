import { apiClient } from '@/lib/api-client';

export interface Assignment {
    ID: number;
    course_id: number;
    teacher_id: number;
    title: string;
    description: string;
    deadline: string | null;
    allow_file: boolean;
    max_file_size: number;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Submission {
    ID: number;
    assignment_id: number;
    student_id: number;
    content: string;
    file_url: string | null;
    grade: number | null;
    feedback: string | null;
    graded_by: number | null;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface AssignmentStats {
    total_assignments: number;
    pending_count: number;
    submitted_count: number;
    average_grade: number;
}

export interface CreateAssignmentRequest {
    course_id: number;
    title: string;
    description?: string;
    deadline?: string;
    allow_file?: boolean;
}

export interface SubmitRequest {
    content: string;
    file_url?: string;
}

export interface GradeRequest {
    grade: number;
    feedback?: string;
}

export const assignmentApi = {
    // List assignments for a course
    listByCourse: async (courseId: number): Promise<Assignment[]> => {
        const response = await apiClient.get<Assignment[]>(`/courses/${courseId}/assignments`);
        return response.data;
    },

    // Get course assignment stats
    getStats: async (courseId: number): Promise<AssignmentStats> => {
        const response = await apiClient.get<AssignmentStats>(`/courses/${courseId}/assignments/stats`);
        return response.data;
    },

    // Get single assignment
    get: async (id: number): Promise<Assignment> => {
        const response = await apiClient.get<Assignment>(`/assignments/${id}`);
        return response.data;
    },

    // Create assignment (teacher only)
    create: async (data: CreateAssignmentRequest): Promise<Assignment> => {
        const response = await apiClient.post<Assignment>(`/courses/${data.course_id}/assignments`, data);
        return response.data;
    },

    // Submit assignment (student only)
    submit: async (assignmentId: number, data: SubmitRequest): Promise<Submission> => {
        const response = await apiClient.post<Submission>(`/assignments/${assignmentId}/submit`, data);
        return response.data;
    },

    // List submissions for an assignment (teacher only)
    listSubmissions: async (assignmentId: number): Promise<Submission[]> => {
        const response = await apiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    // Get my submission for an assignment (student)
    getMySubmission: async (assignmentId: number): Promise<Submission | null> => {
        const response = await apiClient.get<Submission | null>(`/assignments/${assignmentId}/my-submission`);
        return response.data;
    },

    // Grade submission (teacher only)
    grade: async (submissionId: number, data: GradeRequest): Promise<Submission> => {
        const response = await apiClient.post<Submission>(`/submissions/${submissionId}/grade`, data);
        return response.data;
    },

    // AI grade suggestion (teacher only)
    aiGrade: async (submissionId: number): Promise<{ suggestion: string; recommended_grade: number | null }> => {
        const response = await apiClient.post<{ suggestion: string; recommended_grade: number | null }>(
            `/submissions/${submissionId}/ai-grade`
        );
        return response.data;
    },
};
