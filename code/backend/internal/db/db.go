package db

import (
	"time"

	"github.com/huaodong/emfield-teaching-platform/backend/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Open(dsn string) (*gorm.DB, error) {
	gormDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetMaxIdleConns(10)

	return gormDB, nil
}

func AutoMigrate(gormDB *gorm.DB) error {
	return gormDB.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Assignment{},
		&models.Submission{},
		&models.Resource{},
		&models.Quiz{},
		&models.Question{},
		&models.QuizAttempt{},
	)
}
