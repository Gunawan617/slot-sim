package models

import "gorm.io/gorm"

type Gamelog struct {
	gorm.Model
	UserID        uint   `json:"user_id"`
	Action        string `json:"action"`
	Outcome       string `json:"outcome"`        // win or lose
	BalanceChange int    `json:"balance_change"` // Amount won or lost
}
