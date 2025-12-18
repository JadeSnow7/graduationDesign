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

	// WeChat Work client (optional)
	wecomClient := clients.NewWecomClient(clients.WecomConfig{
		CorpID:  cfg.WecomCorpID,
		AgentID: cfg.WecomAgentID,
		Secret:  cfg.WecomSecret,
	})
	hWecom := newWecomHandlers(wecomClient, gormDB, cfg.JWTSecret)

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", hAuth.Login)
		api.GET("/auth/me", middleware.AuthRequired(cfg.JWTSecret), hAuth.Me)

		// WeChat Work OAuth routes (no auth required)
		api.POST("/auth/wecom", hWecom.Login)
		api.POST("/auth/wecom/jsconfig", hWecom.GetJSConfig)
		api.GET("/auth/wecom/oauth-url", hWecom.GetOAuthURL)

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

		// Simulation endpoints (require sim:use permission)
		simMW := []gin.HandlerFunc{
			middleware.AuthRequired(cfg.JWTSecret),
			middleware.RequirePermission(authz.PermSimUse),
		}

		// Legacy Laplace2D endpoint
		api.POST("/sim/laplace2d", append(simMW, hSim.Laplace2D)...)

		// Electrostatics endpoints
		api.POST("/sim/point_charges", append(simMW, hSim.SimProxy("/v1/sim/point_charges"))...)
		api.POST("/sim/gauss_flux", append(simMW, hSim.SimProxy("/v1/sim/gauss_flux"))...)

		// Magnetostatics endpoints
		api.POST("/sim/wire_field", append(simMW, hSim.SimProxy("/v1/sim/wire_field"))...)
		api.POST("/sim/solenoid", append(simMW, hSim.SimProxy("/v1/sim/solenoid"))...)
		api.POST("/sim/ampere_loop", append(simMW, hSim.SimProxy("/v1/sim/ampere_loop"))...)

		// Wave endpoints
		api.POST("/sim/wave_1d", append(simMW, hSim.SimProxy("/v1/sim/wave_1d"))...)
		api.POST("/sim/fresnel", append(simMW, hSim.SimProxy("/v1/sim/fresnel"))...)

		// Numerical computation endpoints
		api.POST("/calc/integrate", append(simMW, hSim.CalcProxy("/v1/calc/integrate"))...)
		api.POST("/calc/differentiate", append(simMW, hSim.CalcProxy("/v1/calc/differentiate"))...)
		api.POST("/calc/evaluate", append(simMW, hSim.CalcProxy("/v1/calc/evaluate"))...)
		api.POST("/calc/vector_op", append(simMW, hSim.CalcProxy("/v1/calc/vector_op"))...)
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
