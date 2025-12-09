package handlers

import (
	"encoding/json"
	"net/http"
	"slot-sim/models"
	"slot-sim/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MythicHandler struct {
	db     *gorm.DB
	engine *services.MythicEngine
}

func NewMythicHandler(db *gorm.DB) *MythicHandler {
	return &MythicHandler{
		db:     db,
		engine: services.NewMythicEngine(),
	}
}

type MythicSpinRequest struct {
	Bet float64 `json:"bet" binding:"required,gt=0"`
}

type MythicSpinResponse struct {
	Grid             [][]string              `json:"grid"`
	Tumbles          []services.TumbleResult `json:"tumbles"`
	TotalWin         float64                 `json:"total_win"`
	BaseWin          float64                 `json:"base_win"`
	TotalMultiplier  float64                 `json:"total_multiplier"`
	CurrentBalance   float64                 `json:"current_balance"`
	ScatterCount     int                     `json:"scatter_count"`
	FreeSpinsAwarded int                     `json:"free_spins_awarded"`
	Message          string                  `json:"message"`
}

// Spin handles a regular Mythic Lightning spin
func (h *MythicHandler) Spin(c *gin.Context) {
	var req MythicSpinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bet amount"})
		return
	}

	// Get user from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get user from database
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check balance
	if float64(user.Balance) < req.Bet {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient balance"})
		return
	}

	// Deduct bet
	user.Balance -= int(req.Bet)
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
		return
	}

	// Generate initial grid
	grid := h.engine.GenerateGrid()

	// Process tumbles until no more wins
	var tumbles []services.TumbleResult
	totalWin := 0.0
	totalMultiplier := 1.0

	maxTumbles := 20 // Safety limit
	for i := 0; i < maxTumbles; i++ {
		tumbleResult := h.engine.ProcessTumble(grid, req.Bet, false)

		if !tumbleResult.HasWins {
			break
		}

		tumbles = append(tumbles, tumbleResult)
		totalWin += tumbleResult.Win
		totalMultiplier += (tumbleResult.Multiplier - 1) // Accumulate bonus multipliers
		grid = tumbleResult.Grid
	}

	// Apply total multiplier to total win
	finalWin := totalWin * totalMultiplier

	// Check for scatters (free spins trigger)
	scatterCount := h.engine.CountScatters(grid)
	freeSpinsAwarded := 0
	scatterWin := 0.0

	if scatterCount >= 4 {
		switch scatterCount {
		case 4:
			freeSpinsAwarded = 10
			scatterWin = req.Bet * 2
		case 5:
			freeSpinsAwarded = 15
			scatterWin = req.Bet * 5
		default: // 6+
			freeSpinsAwarded = 20
			scatterWin = req.Bet * 10
		}
		finalWin += scatterWin
	}

	// Update balance with win
	user.Balance += int(finalWin)
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
		return
	}

	// Save session to database
	gridJSON, _ := json.Marshal(grid)
	tumblesJSON, _ := json.Marshal(tumbles)

	session := models.MythicSession{
		UserID:           user.ID,
		BetAmount:        req.Bet,
		Grid:             string(gridJSON),
		TumblesCount:     len(tumbles),
		Multipliers:      string(tumblesJSON),
		TotalWin:         finalWin,
		BaseWin:          totalWin,
		MultiplierWin:    finalWin - totalWin,
		FreeSpinsActive:  freeSpinsAwarded > 0,
		FreeSpinsRemain:  freeSpinsAwarded,
		GlobalMultiplier: totalMultiplier,
	}

	if err := h.db.Create(&session).Error; err != nil {
		// Log error but don't fail the request
		println("Failed to save session:", err.Error())
	}

	// Create response message
	message := ""
	if finalWin > 0 {
		if freeSpinsAwarded > 0 {
			message = "FREE SPINS TRIGGERED!"
		} else if finalWin >= req.Bet*100 {
			message = "MEGA WIN!"
		} else if finalWin >= req.Bet*50 {
			message = "BIG WIN!"
		} else {
			message = "WIN!"
		}
	} else {
		message = "Try again!"
	}

	c.JSON(http.StatusOK, MythicSpinResponse{
		Grid:             grid,
		Tumbles:          tumbles,
		TotalWin:         finalWin,
		BaseWin:          totalWin,
		TotalMultiplier:  totalMultiplier,
		CurrentBalance:   float64(user.Balance),
		ScatterCount:     scatterCount,
		FreeSpinsAwarded: freeSpinsAwarded,
		Message:          message,
	})
}

// GetHistory returns user's Mythic Lightning game history
func (h *MythicHandler) GetHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var sessions []models.MythicSession
	if err := h.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(20).
		Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"history": sessions})
}
