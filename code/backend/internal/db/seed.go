package db

import (
	"errors"

	"github.com/huaodong/emfield-teaching-platform/backend/internal/auth"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/models"
	"gorm.io/gorm"
)

func SeedDemoUsers(gormDB *gorm.DB) (bool, error) {
	var count int64
	if err := gormDB.Model(&models.User{}).Count(&count).Error; err != nil {
		return false, err
	}
	if count > 0 {
		return false, nil
	}

	type seedUser struct {
		Username string
		Password string
		Role     string
		Name     string
	}
	users := []seedUser{
		{Username: "admin", Password: "admin123", Role: "admin", Name: "管理员"},
		{Username: "teacher", Password: "teacher123", Role: "teacher", Name: "教师"},
		{Username: "student", Password: "student123", Role: "student", Name: "学生"},
	}

	for _, u := range users {
		passwordHash, err := auth.HashPassword(u.Password)
		if err != nil {
			return false, err
		}
		if err := gormDB.Create(&models.User{
			Username:     u.Username,
			PasswordHash: passwordHash,
			Role:         u.Role,
			Name:         u.Name,
		}).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				continue
			}
			return false, err
		}
	}

	return true, nil
}
