package models

import (
	"time"

	"gorm.io/gorm"
)

type MythicSession struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	UserID           uint      `json:"user_id"`
	BetAmount        float64   `json:"bet_amount"`
	Grid             string    `json:"grid" gorm:"type:text"` // JSON array 6x5
	TumblesCount     int       `json:"tumbles_count"`
	Multipliers      string    `json:"multipliers" gorm:"type:text"` // JSON array
	TotalWin         float64   `json:"total_win"`
	BaseWin          float64   `json:"base_win"`
	MultiplierWin    float64   `json:"multiplier_win"`
	FreeSpinsActive  bool      `json:"free_spins_active"`
	FreeSpinsRemain  int       `json:"free_spins_remain"`
	GlobalMultiplier float64   `json:"global_multiplier"`
	CreatedAt        time.Time `json:"created_at"`
}

func (MythicSession) TableName() string {
	return "mythic_sessions"
}

func MigrateMythicSession(db *gorm.DB) error {
	return db.AutoMigrate(&MythicSession{})
}
