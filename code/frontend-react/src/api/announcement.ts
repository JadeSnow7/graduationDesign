// Announcement API types and helpers

import { apiClient } from '@/lib/api-client';

export interface AnnouncementSummary {
    unread_count: number;
    total_count: number;
    latest: {
        id: number;
        title: string;
        created_at: string;
    } | null;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface CreateAnnouncementRequest {
    title: string;
    content: string;
}

export interface UpdateAnnouncementRequest {
    title?: string;
    content?: string;
}

export const announcementApi = {
    /**
     * Get announcement summary for a course
     */
    getSummary: (courseId: number) =>
        apiClient.get<AnnouncementSummary>(`/courses/${courseId}/announcements/summary`)
            .then(res => res.data),

    /**
     * Get all announcements for a course
     */
    getList: (courseId: number) =>
        apiClient.get<Announcement[]>(`/courses/${courseId}/announcements`)
            .then(res => res.data),

    /**
     * Create a new announcement
     */
    create: (courseId: number, data: CreateAnnouncementRequest) =>
        apiClient.post<Announcement>(`/courses/${courseId}/announcements`, data)
            .then(res => res.data),

    /**
     * Update an announcement
     */
    update: (announcementId: number, data: UpdateAnnouncementRequest) =>
        apiClient.put<Announcement>(`/announcements/${announcementId}`, data)
            .then(res => res.data),

    /**
     * Delete an announcement
     */
    delete: (announcementId: number) =>
        apiClient.delete(`/announcements/${announcementId}`)
            .then(res => res.data),

    /**
     * Mark an announcement as read
     */
    markRead: (announcementId: number) =>
        apiClient.post(`/announcements/${announcementId}/read`)
            .then(res => res.data),
};
