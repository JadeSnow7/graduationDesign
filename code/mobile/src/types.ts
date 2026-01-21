export type User = {
    id?: string;
    username?: string;
    role?: string;
};

export type AuthSession = {
    token: string;
    tokenType: string;
    expiresIn?: number;
    user: User;
};

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
};

export type Course = {
    ID: number;
    id?: number; // alias for compatibility
    name: string;
    description: string;
    teacher_id: number;
    teacher_name?: string;
    student_count?: number;
    CreatedAt: string;
    UpdatedAt: string;
};

export type Chapter = {
    ID: number;
    id?: number;
    course_id: number;
    title: string;
    description: string;
    content: string;
    order_num: number;
    study_time_seconds?: number;
    CreatedAt: string;
    UpdatedAt: string;
};

export type Assignment = {
    ID: number;
    id?: number;
    course_id: number;
    title: string;
    description: string;
    due_date: string;
    max_score: number;
    status?: 'pending' | 'submitted' | 'graded';
    submission?: AssignmentSubmission;
    CreatedAt: string;
};

export type AssignmentSubmission = {
    id: number;
    assignment_id: number;
    student_id: number;
    content: string;
    file_url?: string;
    score?: number;
    feedback?: string;
    submitted_at: string;
    graded_at?: string;
};

export type Quiz = {
    ID: number;
    id?: number;
    course_id: number;
    title: string;
    description?: string;
    time_limit_minutes?: number;
    status?: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    max_score?: number;
    CreatedAt: string;
};

export type QuizQuestion = {
    id: number;
    quiz_id: number;
    question_type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'text';
    content: string;
    options?: string[];
    score: number;
    order_num: number;
};

export type Resource = {
    ID: number;
    id?: number;
    course_id: number;
    name: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size: number;
    CreatedAt: string;
};

export type UserStats = {
    total_study_time_seconds: number;
    completed_chapters: number;
    total_chapters: number;
    submitted_assignments: number;
    total_assignments: number;
    completed_quizzes: number;
    total_quizzes: number;
    average_quiz_score?: number;
};

export type Activity = {
    id: number;
    type: 'chapter_complete' | 'assignment_submit' | 'quiz_complete' | 'study_time';
    title: string;
    description?: string;
    created_at: string;
    score?: number;
};
