package http

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/authz"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/clients"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/config"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/middleware"
	"gorm.io/gorm"
)

func NewRouter(cfg config.Config, gormDB *gorm.DB, aiClient *clients.AIClient, simClient *clients.SimClient) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(newCORS(cfg.CorsOrigins))

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	hAuth := newAuthHandlers(gormDB, cfg.JWTSecret)
	hCourse := newCourseHandlers(gormDB)
	hAI := newAIHandlers(aiClient)
	hSim := newSimHandlers(simClient)

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", hAuth.Login)
		api.GET("/auth/me", middleware.AuthRequired(cfg.JWTSecret), hAuth.Me)

		api.GET(
			"/courses",
			middleware.AuthRequired(cfg.JWTSecret),
			middleware.RequirePermission(authz.PermCourseRead),
			hCourse.List,
		)
		api.POST(
			"/courses",
			middleware.AuthRequired(cfg.JWTSecret),
			middleware.RequirePermission(authz.PermCourseWrite),
			hCourse.Create,
		)

		api.POST(
			"/ai/chat",
			middleware.AuthRequired(cfg.JWTSecret),
			middleware.RequirePermission(authz.PermAIUse),
			hAI.Chat,
		)

		api.POST(
			"/sim/laplace2d",
			middleware.AuthRequired(cfg.JWTSecret),
			middleware.RequirePermission(authz.PermSimUse),
			hSim.Laplace2D,
		)
	}

	return r
}

func newCORS(origins []string) gin.HandlerFunc {
	for _, o := range origins {
		if strings.TrimSpace(o) == "*" {
			return cors.New(cors.Config{
				AllowAllOrigins: true,
				AllowMethods:    []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
				AllowHeaders:    []string{"Authorization", "Content-Type"},
				MaxAge:          12 * time.Hour,
			})
		}
	}
	return cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
