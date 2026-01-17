// Attendance API types and helpers

import { apiClient } from '@/lib/api-client';

export interface AttendanceSummary {
    attendance_rate: number;
    sessions_count: number;
    last_session_at: string | null;
    active_session: {
        id: number;
        code: string;
        ends_at: string;
    } | null;
}

export interface AttendanceSession {
    id: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    attendee_count: number;
}

export interface AttendanceRecord {
    student_id: number;
    student_name: string;
    checked_in_at: string;
    ip_address: string;
}

export interface StartSessionRequest {
    timeout_minutes?: number;
}

export interface StartSessionResponse {
    id: number;
    code: string;
    ends_at: string;
}

export interface CheckinRequest {
    code: string;
}

export interface CheckinResponse {
    success: boolean;
    already_checked_in?: boolean;
    checked_in_at: string;
}

export const attendanceApi = {
    /**
     * Get attendance summary for a course
     */
    getSummary: (courseId: number) =>
        apiClient.get<AttendanceSummary>(`/courses/${courseId}/attendance/summary`)
            .then(res => res.data),

    /**
     * Get all attendance sessions for a course
     */
    getSessions: (courseId: number) =>
        apiClient.get<AttendanceSession[]>(`/courses/${courseId}/attendance/sessions`)
            .then(res => res.data),

    /**
     * Start a new attendance session (teacher only)
     */
    startSession: (courseId: number, data?: StartSessionRequest) =>
        apiClient.post<StartSessionResponse>(`/courses/${courseId}/attendance/start`, data || {})
            .then(res => res.data),

    /**
     * End an attendance session (teacher only)
     */
    endSession: (sessionId: number) =>
        apiClient.post(`/attendance/${sessionId}/end`)
            .then(res => res.data),

    /**
     * Check in to a session (student)
     */
    checkin: (sessionId: number, code: string) =>
        apiClient.post<CheckinResponse>(`/attendance/${sessionId}/checkin`, { code })
            .then(res => res.data),

    /**
     * Get check-in records for a session
     */
    getRecords: (sessionId: number) =>
        apiClient.get<AttendanceRecord[]>(`/attendance/${sessionId}/records`)
            .then(res => res.data),
};
