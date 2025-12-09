package controllers

import (
	"math/rand"
	"net/http"
	"slot-sim/config"
	"slot-sim/models"
	"time"

	"github.com/gin-gonic/gin"
)

type PlayInput struct {
	Bet int `json:"bet" binding:"required,min=10,max=1000"`
}

// Symbols
const (
	SymWild = "WILD"
	Sym7    = "777"
	SymGemR = "GEM_RED"
	SymGemG = "GEM_GREEN"
	SymGemB = "GEM_BLUE"
	SymA    = "A"
	SymK    = "K"
	SymQ    = "Q"
	SymJ    = "J"
)

// Paytable (Base Multipliers)
var paytable = map[string]int{
	SymWild: 100, // 3x Wild
	Sym7:    50,
	SymGemR: 30,
	SymGemG: 20,
	SymGemB: 15,
	SymA:    10,
	SymK:    8,
	SymQ:    5,
	SymJ:    2,
}

// Special Reel Items
const (
	Mult1x    = "1x"
	Mult2x    = "2x"
	Mult3x    = "3x"
	Mult5x    = "5x"
	Mult10x   = "10x"
	Mult15x   = "15x"
	FeatWheel = "WHEEL" // Triggers Fortune Spin
)

var specialReel = []string{Mult1x, Mult1x, Mult2x, Mult2x, Mult3x, Mult3x, Mult5x, Mult5x, Mult10x, Mult15x, FeatWheel}

// Wheel Prizes (Multipliers of Bet)
var wheelPrizes = []int{10, 20, 50, 100, 200, 500, 1000}

func GenerateGrid() [3][3]string {
	symbols := []string{SymWild, Sym7, SymGemR, SymGemG, SymGemB, SymA, SymK, SymQ, SymJ}
	var grid [3][3]string
	for r := 0; r < 3; r++ {
		for c := 0; c < 3; c++ {
			grid[r][c] = symbols[rand.Intn(len(symbols))]
		}
	}
	return grid
}

func GetSpecialReel() string {
	return specialReel[rand.Intn(len(specialReel))]
}

func CalculateWin(grid [3][3]string, bet int) (int, []string) {
	totalWin := 0
	var winningLines []string

	// 5 Paylines: Top, Middle, Bottom, Diagonal 1, Diagonal 2
	lines := [][3][2]int{
		{{0, 0}, {0, 1}, {0, 2}}, // Row 0
		{{1, 0}, {1, 1}, {1, 2}}, // Row 1
		{{2, 0}, {2, 1}, {2, 2}}, // Row 2
		{{0, 0}, {1, 1}, {2, 2}}, // Diag TL-BR
		{{2, 0}, {1, 1}, {0, 2}}, // Diag BL-TR
	}

	for _, line := range lines {
		s1 := grid[line[0][0]][line[0][1]]
		s2 := grid[line[1][0]][line[1][1]]
		s3 := grid[line[2][0]][line[2][1]]

		// Check Match (considering Wild)
		matchSymbol := ""
		if s1 == SymWild {
			if s2 == SymWild {
				matchSymbol = s3 // WW? -> match 3rd
			} else {
				matchSymbol = s2 // W? -> match 2nd
			}
		} else {
			matchSymbol = s1
		}

		// If mostly Wild scenarios
		if s1 == SymWild && s2 == SymWild && s3 == SymWild {
			matchSymbol = SymWild
		}

		isWin := false
		if (s1 == matchSymbol || s1 == SymWild) &&
			(s2 == matchSymbol || s2 == SymWild) &&
			(s3 == matchSymbol || s3 == SymWild) {
			isWin = true
		}

		if isWin {
			baseWin := paytable[matchSymbol] * (bet / 10) // Simplified bet unit
			totalWin += baseWin

			// Log checking for debug (optional)
			// fmt.Printf("Line %d win: %s (%d)\n", i, matchSymbol, baseWin)
		}
	}

	return totalWin, winningLines
}

func PlaySlot(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	db := config.DB

	var input PlayInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bet amount required (10-1000)"})
		return
	}

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Balance < input.Bet {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient balance"})
		return
	}

	rand.Seed(time.Now().UnixNano())

	// 1. Generate Game State
	grid := GenerateGrid()
	special := GetSpecialReel()

	// 2. Calculate Base Wins
	baseWin, _ := CalculateWin(grid, input.Bet)

	// 3. Apply Special Reel Feature
	finalWin := 0
	bonusWin := 0
	multiplier := 1
	isFortuneSpin := false

	if special == FeatWheel {
		isFortuneSpin = true
		// Wheel Logic
		// Wheel acts as a multiplier or raw prize. Let's say it gives a multiplier of the TOTAL BET.
		wheelMult := wheelPrizes[rand.Intn(len(wheelPrizes))]
		bonusWin = input.Bet * wheelMult
		// Fortune spin also pays lines? Usually yes.
		finalWin = baseWin + bonusWin
	} else {
		// It's a multiplier (e.g. "5x")
		// Parse multiplier
		switch special {
		case Mult1x:
			multiplier = 1
		case Mult2x:
			multiplier = 2
		case Mult3x:
			multiplier = 3
		case Mult5x:
			multiplier = 5
		case Mult10x:
			multiplier = 10
		case Mult15x:
			multiplier = 15
		}

		finalWin = baseWin * multiplier
	}

	// 4. Update Balance
	balanceChange := finalWin - input.Bet
	user.Balance += balanceChange
	db.Save(&user)

	// 5. Log
	log := models.Gamelog{
		UserID:        userID,
		Action:        "slot_3x3",
		Outcome:       "spin", // Simplified for now
		BalanceChange: balanceChange,
	}
	db.Create(&log)

	c.JSON(http.StatusOK, gin.H{
		"check_win":       finalWin > 0, // boolean for frontend
		"grid":            grid,
		"special_symbol":  special,
		"base_win":        baseWin,
		"final_win":       finalWin,
		"bonus_win":       bonusWin,
		"multiplier":      multiplier,
		"is_fortune_spin": isFortuneSpin,
		"balance_change":  balanceChange,
		"current_balance": user.Balance,
	})
}
