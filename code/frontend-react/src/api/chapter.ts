import { apiClient } from '@/lib/api-client';

// ============ Types ============

export interface Chapter {
    ID: number;
    course_id: number;
    title: string;
    order_num: number;
    summary?: string;
    knowledge_points?: string; // JSON string
    CreatedAt: string;
    UpdatedAt: string;
}

export interface AssignmentStats {
    total: number;
    submitted: number;
    graded: number;
    avg_score: number;
    accuracy_rate: number;
}

export interface QuizStats {
    total: number;
    attempted: number;
    avg_score: number;
}

export interface Resource {
    ID: number;
    course_id: number;
    chapter_id?: number;
    created_by_id: number;
    title: string;
    type: string;
    url: string;
    description?: string;
}

export interface ChapterStudentStats {
    chapter_id: number;
    study_duration_seconds: number;
    study_duration_formatted: string;
    assignment_stats: AssignmentStats;
    quiz_stats: QuizStats;
    resources: Resource[];
    knowledge_points: string[];
}

export interface StudentProgress {
    student_id: number;
    student_name: string;
    study_duration_seconds: number;
    assignment_avg_score: number;
}

export interface ChapterClassStats {
    chapter_id: number;
    total_students: number;
    avg_study_duration_seconds: number;
    assignment_stats: AssignmentStats;
    quiz_stats: QuizStats;
    student_progress: StudentProgress[];
}

export interface CreateChapterRequest {
    course_id: number;
    title: string;
    order_num?: number;
    summary?: string;
    knowledge_points?: string[];
}

export interface UpdateChapterRequest {
    title?: string;
    order_num?: number;
    summary?: string;
    knowledge_points?: string[];
}

// ============ API Functions ============

export const chapterApi = {
    listByCourse: async (courseId: number): Promise<Chapter[]> => {
        const res = await apiClient.get(`/courses/${courseId}/chapters`);
        return res.data;
    },

    get: async (id: number): Promise<Chapter> => {
        const res = await apiClient.get(`/chapters/${id}`);
        return res.data;
    },

    create: async (data: CreateChapterRequest): Promise<Chapter> => {
        const payload = {
            ...data,
            knowledge_points: data.knowledge_points
                ? JSON.stringify(data.knowledge_points)
                : undefined,
        };
        const res = await apiClient.post('/chapters', payload);
        return res.data;
    },

    update: async (id: number, data: UpdateChapterRequest): Promise<Chapter> => {
        const payload = {
            ...data,
            knowledge_points: data.knowledge_points
                ? JSON.stringify(data.knowledge_points)
                : undefined,
        };
        const res = await apiClient.put(`/chapters/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/chapters/${id}`);
    },

    heartbeat: async (id: number): Promise<{ message: string; duration: number }> => {
        const res = await apiClient.post(`/chapters/${id}/heartbeat`);
        return res.data;
    },

    getMyStats: async (id: number): Promise<ChapterStudentStats> => {
        const res = await apiClient.get(`/chapters/${id}/my-stats`);
        return res.data;
    },

    getClassStats: async (id: number): Promise<ChapterClassStats> => {
        const res = await apiClient.get(`/chapters/${id}/class-stats`);
        return res.data;
    },
};
