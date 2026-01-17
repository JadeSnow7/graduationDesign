package http

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/auth"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/authz"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/middleware"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/models"
	"gorm.io/gorm"
)

type authHandlers struct {
	db        *gorm.DB
	jwtSecret string
}

func newAuthHandlers(db *gorm.DB, jwtSecret string) *authHandlers {
	return &authHandlers{db: db, jwtSecret: jwtSecret}
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
}

func (h *authHandlers) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var u models.User
	if err := h.db.Where("username = ?", req.Username).First(&u).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}
	if !auth.VerifyPassword(u.PasswordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	ttl := 24 * time.Hour
	token, err := auth.SignToken(h.jwtSecret, u.ID, u.Username, u.Role, ttl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token sign failed"})
		return
	}

	c.JSON(http.StatusOK, loginResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   int64(ttl.Seconds()),
	})
}

// MeResponse is the response for /auth/me endpoint
type MeResponse struct {
	ID          uint     `json:"id"`
	Username    string   `json:"username"`
	Name        string   `json:"name"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

func (h *authHandlers) Me(c *gin.Context) {
	u, ok := middleware.GetUser(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Fetch fresh user data from database
	var dbUser models.User
	if err := h.db.First(&dbUser, u.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Get permissions from RBAC
	permissions := authz.GetPermissions(dbUser.Role)

	c.JSON(http.StatusOK, MeResponse{
		ID:          dbUser.ID,
		Username:    dbUser.Username,
		Name:        dbUser.Name,
		Role:        dbUser.Role,
		Permissions: permissions,
	})
}
