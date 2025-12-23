package clients

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Mode     string        `json:"mode"`
	Messages []ChatMessage `json:"messages"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
	Model string `json:"model,omitempty"`
}

type AIClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewAIClient(baseURL string) *AIClient {
	return &AIClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *AIClient) Chat(ctx context.Context, req ChatRequest) (ChatResponse, error) {
	if c.baseURL == "" {
		return ChatResponse{}, errors.New("AI base url is empty")
	}

	body, err := json.Marshal(req)
	if err != nil {
		return ChatResponse{}, err
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/v1/chat", c.baseURL), bytes.NewReader(body))
	if err != nil {
		return ChatResponse{}, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return ChatResponse{}, err
	}
	defer resp.Body.Close()

	b, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return ChatResponse{}, err
	}
	if resp.StatusCode >= 300 {
		return ChatResponse{}, fmt.Errorf("ai service error: status=%d body=%s", resp.StatusCode, string(b))
	}

	var out ChatResponse
	if err := json.Unmarshal(b, &out); err != nil {
		return ChatResponse{}, err
	}
	return out, nil
}
