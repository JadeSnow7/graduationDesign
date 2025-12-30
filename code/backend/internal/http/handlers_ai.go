package http

import (
	"io"
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
	Stream   bool                  `json:"stream"`
}

func (h *aiHandlers) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Streaming mode
	if req.Stream {
		h.streamChat(c, req)
		return
	}

	// Non-streaming mode
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

func (h *aiHandlers) streamChat(c *gin.Context, req chatRequest) {
	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // Disable Nginx buffering

	body, err := h.ai.StreamChat(c.Request.Context(), clients.ChatRequest{
		Mode:     req.Mode,
		Messages: req.Messages,
		Stream:   true,
	})
	if err != nil {
		// Write error as SSE event
		c.Writer.WriteString("data: {\"error\":\"" + err.Error() + "\"}\n\n")
		c.Writer.Flush()
		return
	}
	defer body.Close()

	// Stream response body directly to client
	buf := make([]byte, 4096)
	for {
		n, readErr := body.Read(buf)
		if n > 0 {
			c.Writer.Write(buf[:n])
			c.Writer.Flush()
		}
		if readErr != nil {
			if readErr != io.EOF {
				c.Writer.WriteString("data: {\"error\":\"stream read error\"}\n\n")
				c.Writer.Flush()
			}
			break
		}
	}
}
