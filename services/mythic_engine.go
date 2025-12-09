package services

import (
	"math/rand"
	"slot-sim/utils"
	"time"
)

// Symbol definitions
const (
	ZEUS    = "ZEUS"    // Wild
	CROWN   = "CROWN"   // Premium
	TRIDENT = "TRIDENT" // Premium
	EAGLE   = "EAGLE"   // Premium
	VASE    = "VASE"    // Premium
	FIRE    = "FIRE"    // Medium
	GEM     = "GEM"     // Medium
	SWORD   = "SWORD"   // Medium
	ACE     = "A"       // Low
	KING    = "K"       // Low
	QUEEN   = "Q"       // Low
	JACK    = "J"       // Low
	SCATTER = "SCATTER" // Special
)

// Symbol weights for random generation
var symbolWeights = map[string]int{
	ZEUS:    2,
	CROWN:   3,
	TRIDENT: 4,
	EAGLE:   5,
	VASE:    6,
	FIRE:    8,
	GEM:     10,
	SWORD:   12,
	ACE:     14,
	KING:    14,
	QUEEN:   14,
	JACK:    14,
	SCATTER: 2,
}

// Paytable: symbol -> cluster size -> multiplier
var paytable = map[string]map[int]float64{
	ZEUS:    {6: 500, 5: 200, 4: 100, 3: 50},
	CROWN:   {6: 200, 5: 100, 4: 50, 3: 25},
	TRIDENT: {6: 150, 5: 75, 4: 40, 3: 20},
	EAGLE:   {6: 100, 5: 50, 4: 30, 3: 15},
	VASE:    {6: 80, 5: 40, 4: 25, 3: 12},
	FIRE:    {6: 60, 5: 30, 4: 20, 3: 10},
	GEM:     {6: 50, 5: 25, 4: 15, 3: 8},
	SWORD:   {6: 40, 5: 20, 4: 12, 3: 6},
	ACE:     {6: 30, 5: 15, 4: 10, 3: 5},
	KING:    {6: 25, 5: 12, 4: 8, 3: 4},
	QUEEN:   {6: 20, 5: 10, 4: 6, 3: 3},
	JACK:    {6: 15, 5: 8, 4: 5, 3: 2},
}

// Lightning multiplier values and weights
var multiplierValues = []float64{2, 3, 5, 10, 25, 50, 100, 500}
var multiplierWeights = []int{40, 25, 15, 10, 5, 3, 2, 1} // Total: 101

type MythicEngine struct {
	rng *rand.Rand
}

func NewMythicEngine() *MythicEngine {
	return &MythicEngine{
		rng: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// GenerateGrid creates a 6x5 grid with weighted random symbols
func (e *MythicEngine) GenerateGrid() [][]string {
	grid := make([][]string, 5) // 5 rows
	for i := range grid {
		grid[i] = make([]string, 6) // 6 columns
		for j := range grid[i] {
			grid[i][j] = e.getRandomSymbol()
		}
	}
	return grid
}

// getRandomSymbol returns a weighted random symbol
func (e *MythicEngine) getRandomSymbol() string {
	totalWeight := 0
	for _, weight := range symbolWeights {
		totalWeight += weight
	}

	randomValue := e.rng.Intn(totalWeight)
	currentWeight := 0

	for symbol, weight := range symbolWeights {
		currentWeight += weight
		if randomValue < currentWeight {
			return symbol
		}
	}

	return JACK // Fallback
}

// FillEmptyPositions fills EMPTY cells with new random symbols
func (e *MythicEngine) FillEmptyPositions(grid [][]string) [][]string {
	newGrid := make([][]string, len(grid))
	for i := range grid {
		newGrid[i] = make([]string, len(grid[i]))
		for j := range grid[i] {
			if grid[i][j] == "EMPTY" {
				newGrid[i][j] = e.getRandomSymbol()
			} else {
				newGrid[i][j] = grid[i][j]
			}
		}
	}
	return newGrid
}

// CalculateClusterWin calculates win for a single cluster
func (e *MythicEngine) CalculateClusterWin(cluster utils.Cluster, bet float64) float64 {
	payouts, exists := paytable[cluster.Symbol]
	if !exists {
		return 0
	}

	// Get payout for cluster size (check from largest to smallest)
	sizes := []int{6, 5, 4, 3}
	for _, size := range sizes {
		if cluster.Size >= size {
			if multiplier, ok := payouts[size]; ok {
				return bet * multiplier
			}
		}
	}

	return 0
}

// CalculateTotalWin calculates total win from all clusters
func (e *MythicEngine) CalculateTotalWin(clusters []utils.Cluster, bet float64) float64 {
	totalWin := 0.0
	for _, cluster := range clusters {
		totalWin += e.CalculateClusterWin(cluster, bet)
	}
	return totalWin
}

// SpawnMultipliers randomly spawns lightning multipliers
func (e *MythicEngine) SpawnMultipliers(chance float64, count int) []float64 {
	if e.rng.Float64() > chance {
		return []float64{}
	}

	multipliers := make([]float64, count)
	for i := 0; i < count; i++ {
		multipliers[i] = e.getRandomMultiplier()
	}

	return multipliers
}

// getRandomMultiplier returns a weighted random multiplier
func (e *MythicEngine) getRandomMultiplier() float64 {
	totalWeight := 0
	for _, weight := range multiplierWeights {
		totalWeight += weight
	}

	randomValue := e.rng.Intn(totalWeight)
	currentWeight := 0

	for i, weight := range multiplierWeights {
		currentWeight += weight
		if randomValue < currentWeight {
			return multiplierValues[i]
		}
	}

	return 2.0 // Fallback
}

// CountScatters counts scatter symbols in grid
func (e *MythicEngine) CountScatters(grid [][]string) int {
	count := 0
	for _, row := range grid {
		for _, symbol := range row {
			if symbol == SCATTER {
				count++
			}
		}
	}
	return count
}

// ProcessTumble handles one complete tumble cycle
type TumbleResult struct {
	Grid       [][]string      `json:"grid"`
	Clusters   []utils.Cluster `json:"clusters"`
	Win        float64         `json:"win"`
	HasWins    bool            `json:"has_wins"`
	Multiplier float64         `json:"multiplier"`
}

func (e *MythicEngine) ProcessTumble(grid [][]string, bet float64, isFreeSpin bool) TumbleResult {
	// Detect clusters
	clusters := utils.DetectClusters(grid)

	if len(clusters) == 0 {
		return TumbleResult{
			Grid:       grid,
			Clusters:   []utils.Cluster{},
			Win:        0,
			HasWins:    false,
			Multiplier: 1,
		}
	}

	// Calculate win
	win := e.CalculateTotalWin(clusters, bet)

	// Spawn multipliers (25% base game, 40% free spins)
	chance := 0.25
	count := e.rng.Intn(3) + 1 // 1-3 multipliers
	if isFreeSpin {
		chance = 0.40
		count = e.rng.Intn(4) + 2 // 2-5 multipliers
	}

	multipliers := e.SpawnMultipliers(chance, count)
	totalMultiplier := 1.0
	for _, mult := range multipliers {
		totalMultiplier += mult
	}

	// Remove winning symbols
	newGrid := utils.RemoveClusterSymbols(grid, clusters)

	// Apply gravity
	newGrid = utils.ApplyGravity(newGrid)

	// Fill empty positions
	newGrid = e.FillEmptyPositions(newGrid)

	return TumbleResult{
		Grid:       newGrid,
		Clusters:   clusters,
		Win:        win,
		HasWins:    true,
		Multiplier: totalMultiplier,
	}
}
