package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/clients"
)

type aiHandlers struct {
	ai *clients.AIClient
}

func newAIHandlers(ai *clients.AIClient) *aiHandlers {
	return &aiHandlers{ai: ai}
}

type chatRequest struct {
	Mode     string                `json:"mode"`
	Messages []clients.ChatMessage `json:"messages" binding:"required"`
}

func (h *aiHandlers) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	resp, err := h.ai.Chat(c.Request.Context(), clients.ChatRequest{
		Mode:     req.Mode,
		Messages: req.Messages,
	})
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}
