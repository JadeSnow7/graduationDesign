package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/huaodong/emfield-teaching-platform/backend/internal/clients"
)

type simHandlers struct {
	sim *clients.SimClient
}

func newSimHandlers(sim *clients.SimClient) *simHandlers {
	return &simHandlers{sim: sim}
}

func (h *simHandlers) Laplace2D(c *gin.Context) {
	var req clients.Laplace2DRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if req.NX <= 0 {
		req.NX = 60
	}
	if req.NY <= 0 {
		req.NY = 40
	}
	if req.MaxIter <= 0 {
		req.MaxIter = 2000
	}
	if req.Tolerance <= 0 {
		req.Tolerance = 1e-5
	}

	resp, err := h.sim.Laplace2D(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}
