package models

import (
	"time"
)

type TransactionType string
type TransactionStatus string

const (
	TypeDeposit  TransactionType = "deposit"
	TypeWithdraw TransactionType = "withdraw"

	StatusPending  TransactionStatus = "pending"
	StatusApproved TransactionStatus = "approved"
	StatusRejected TransactionStatus = "rejected"
)

type Transaction struct {
	ID          uint              `gorm:"primaryKey" json:"id"`
	UserID      uint              `json:"user_id"`
	Type        TransactionType   `json:"type"`
	Amount      float64           `json:"amount"`
	Status      TransactionStatus `json:"status"`
	BankName    string            `json:"bank_name"`
	BankAccount string            `json:"bank_account"`
	AccountName string            `json:"account_name"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

func (Transaction) TableName() string {
	return "transactions"
}
