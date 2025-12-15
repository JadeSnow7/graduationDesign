package models

import "gorm.io/gorm"

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
