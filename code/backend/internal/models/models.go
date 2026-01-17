package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username     string `gorm:"uniqueIndex;size:64;not null" json:"username"`
	PasswordHash string `gorm:"size:255;not null" json:"-"`
	Role         string `gorm:"size:32;not null;index" json:"role"`
	Name         string `gorm:"size:64" json:"name"`
	WecomUserID  string `gorm:"size:64;index" json:"wecom_user_id,omitempty"`
}

type Course struct {
	gorm.Model
	Name      string `gorm:"size:128;not null" json:"name"`
	Code      string `gorm:"size:64;index" json:"code,omitempty"`
	Semester  string `gorm:"size:64;index" json:"semester,omitempty"`
	TeacherID uint   `gorm:"index" json:"teacher_id"`
}

// CourseEnrollment represents a student's enrollment in a course
type CourseEnrollment struct {
	gorm.Model
	CourseID   uint      `gorm:"not null;uniqueIndex:idx_course_user" json:"course_id"`
	UserID     uint      `gorm:"not null;uniqueIndex:idx_course_user" json:"user_id"`
	Role       string    `gorm:"size:32;default:'student'" json:"role"` // student, assistant
	EnrolledAt time.Time `json:"enrolled_at"`
}

// Assignment represents a course assignment created by a teacher
type Assignment struct {
	gorm.Model
	CourseID    uint       `gorm:"not null;index" json:"course_id"`
	ChapterID   *uint      `gorm:"index" json:"chapter_id,omitempty"` // nullable, relates to chapter
	TeacherID   uint       `gorm:"not null;index" json:"teacher_id"`
	Title       string     `gorm:"size:256;not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	Deadline    *time.Time `json:"deadline,omitempty"`
	AllowFile   bool       `gorm:"default:true" json:"allow_file"`
	MaxFileSize int64      `gorm:"default:10485760" json:"max_file_size"` // 10MB default
}

// Submission represents a student's submission for an assignment
type Submission struct {
	gorm.Model
	AssignmentID uint   `gorm:"not null;index;uniqueIndex:idx_assignment_student" json:"assignment_id"`
	StudentID    uint   `gorm:"not null;index;uniqueIndex:idx_assignment_student" json:"student_id"`
	Content      string `gorm:"type:text" json:"content"`
	FileURL      string `gorm:"size:512" json:"file_url,omitempty"`
	Grade        *int   `json:"grade,omitempty"` // nil = not graded
	Feedback     string `gorm:"type:text" json:"feedback,omitempty"`
	GradedBy     *uint  `json:"graded_by,omitempty"`
}

// Resource represents a course resource (video, paper, link)
type Resource struct {
	gorm.Model
	CourseID    uint   `gorm:"not null;index" json:"course_id"`
	ChapterID   *uint  `gorm:"index" json:"chapter_id,omitempty"` // nullable, relates to chapter
	CreatedByID uint   `gorm:"not null;index" json:"created_by_id"`
	Title       string `gorm:"size:256;not null" json:"title"`
	Type        string `gorm:"size:32;not null" json:"type"` // video, paper, link
	URL         string `gorm:"size:1024;not null" json:"url"`
	Description string `gorm:"type:text" json:"description,omitempty"`
}

// Chapter represents a chapter within a course
type Chapter struct {
	gorm.Model
	CourseID        uint   `gorm:"not null;index" json:"course_id"`
	Title           string `gorm:"size:256;not null" json:"title"`
	OrderNum        int    `gorm:"index" json:"order_num"`                      // sort by (order_num, id)
	Summary         string `gorm:"type:text" json:"summary,omitempty"`          // chapter summary
	KnowledgePoints string `gorm:"type:text" json:"knowledge_points,omitempty"` // JSON array: ["知识点1", "知识点2"]
}

// ChapterProgress tracks student's study time in a chapter
type ChapterProgress struct {
	gorm.Model
	ChapterID            uint       `gorm:"not null;uniqueIndex:idx_chapter_student" json:"chapter_id"`
	StudentID            uint       `gorm:"not null;uniqueIndex:idx_chapter_student" json:"student_id"`
	StudyDurationSeconds int        `gorm:"default:0" json:"study_duration_seconds"`
	LastActiveAt         *time.Time `json:"last_active_at,omitempty"`
}

// Quiz represents an online quiz/test for a course
type Quiz struct {
	gorm.Model
	CourseID           uint       `gorm:"not null;index" json:"course_id"`
	ChapterID          *uint      `gorm:"index" json:"chapter_id,omitempty"` // nullable, relates to chapter
	CreatedByID        uint       `gorm:"not null;index" json:"created_by_id"`
	Title              string     `gorm:"size:256;not null" json:"title"`
	Description        string     `gorm:"type:text" json:"description"`
	TimeLimit          int        `gorm:"default:0" json:"time_limit"`               // minutes, 0=unlimited
	StartTime          *time.Time `json:"start_time,omitempty"`                      // nil=immediately available
	EndTime            *time.Time `json:"end_time,omitempty"`                        // nil=no deadline
	MaxAttempts        int        `gorm:"default:1" json:"max_attempts"`             // max retry count (1-3)
	ShowAnswerAfterEnd bool       `gorm:"default:true" json:"show_answer_after_end"` // show answers after EndTime
	IsPublished        bool       `gorm:"default:false" json:"is_published"`         // published = questions locked
	TotalPoints        int        `gorm:"default:0" json:"total_points"`             // sum of question points
}

// Question represents a quiz question
type Question struct {
	gorm.Model
	QuizID    uint   `gorm:"not null;index" json:"quiz_id"`
	Type      string `gorm:"size:32;not null" json:"type"`                   // single_choice, multiple_choice, true_false, fill_blank
	Content   string `gorm:"type:text;not null" json:"content"`              // question text
	Options   string `gorm:"type:text" json:"options,omitempty"`             // JSON array: ["Option A", "Option B", ...]
	Answer    string `gorm:"size:512;not null" json:"-"`                     // correct answer, hidden from students
	MatchRule string `gorm:"size:32;default:'exact_trim'" json:"match_rule"` // exact, exact_trim, contains, regex (for fill_blank)
	Points    int    `gorm:"default:1" json:"points"`                        // points for this question
	OrderNum  int    `gorm:"default:0" json:"order_num"`                     // display order
}

// QuizAttempt represents a student's attempt at a quiz
type QuizAttempt struct {
	gorm.Model
	QuizID         uint       `gorm:"not null;index" json:"quiz_id"`
	StudentID      uint       `gorm:"not null;index" json:"student_id"`
	AttemptNumber  int        `gorm:"not null;default:1" json:"attempt_number"`
	StartedAt      time.Time  `json:"started_at"`
	Deadline       time.Time  `json:"deadline"` // server-calculated deadline
	SubmittedAt    *time.Time `json:"submitted_at,omitempty"`
	AnswerSnapshot string     `gorm:"type:text" json:"-"`                 // questions snapshot at submission
	Answers        string     `gorm:"type:text" json:"answers,omitempty"` // JSON: {"1": "A", "2": ["A","C"], ...}
	Score          *int       `json:"score,omitempty"`                    // nil = not graded
	MaxScore       int        `json:"max_score"`                          // total points at submission time
}

// Announcement represents a course announcement
type Announcement struct {
	gorm.Model
	CourseID    uint   `gorm:"not null;index:idx_announcement_course_created" json:"course_id"`
	Title       string `gorm:"size:200;not null" json:"title"`
	Content     string `gorm:"type:text;not null" json:"content"`
	CreatedByID uint   `gorm:"not null" json:"created_by_id"`
}

// AnnouncementRead tracks which users have read which announcements
type AnnouncementRead struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	AnnouncementID uint      `gorm:"not null;uniqueIndex:idx_announcement_user" json:"announcement_id"`
	UserID         uint      `gorm:"not null;uniqueIndex:idx_announcement_user" json:"user_id"`
	ReadAt         time.Time `json:"read_at"`
}

// AttendanceSession represents a check-in session created by a teacher
type AttendanceSession struct {
	gorm.Model
	CourseID       uint      `gorm:"not null;index:idx_attendance_session_course" json:"course_id"`
	StartedByID    uint      `gorm:"not null" json:"started_by_id"`
	StartAt        time.Time `json:"start_at"`
	EndAt          time.Time `json:"end_at"`
	TimeoutMinutes int       `gorm:"default:15" json:"timeout_minutes"`
	Code           string    `gorm:"size:6;not null" json:"code"`
	IsActive       bool      `gorm:"default:true;index" json:"is_active"`
}

// AttendanceRecord represents a student's check-in for a session
type AttendanceRecord struct {
	gorm.Model
	SessionID   uint      `gorm:"not null;index:idx_attendance_record_session" json:"session_id"`
	StudentID   uint      `gorm:"not null;uniqueIndex:idx_session_student" json:"student_id"`
	CheckedInAt time.Time `json:"checked_in_at"`
	IPAddress   string    `gorm:"size:45" json:"ip_address"`
}

// StudentLearningProfile tracks a student's learning analytics and weak points
type StudentLearningProfile struct {
	gorm.Model
	StudentID         uint       `gorm:"not null;uniqueIndex:idx_student_course" json:"student_id"`
	CourseID          uint       `gorm:"not null;uniqueIndex:idx_student_course" json:"course_id"`
	WeakPoints        string     `gorm:"type:text" json:"weak_points"`      // JSON: {"高斯定律": 3, "边界条件": 1}
	CompletedTopics   string     `gorm:"type:text" json:"completed_topics"` // JSON array of completed topic names
	TotalSessions     int        `gorm:"default:0" json:"total_sessions"`
	TotalStudyMinutes int        `gorm:"default:0" json:"total_study_minutes"`
	LastSessionAt     *time.Time `json:"last_session_at,omitempty"`
	RecommendedTopics string     `gorm:"type:text" json:"recommended_topics,omitempty"` // AI-generated recommendations
}
