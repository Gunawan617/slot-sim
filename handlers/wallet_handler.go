package handlers

import (
	"net/http"
	"slot-sim/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WalletHandler struct {
	db *gorm.DB
}

func NewWalletHandler(db *gorm.DB) *WalletHandler {
	return &WalletHandler{db: db}
}

type TopUpRequest struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	BankName    string  `json:"bank_name" binding:"required"`
	BankAccount string  `json:"bank_account" binding:"required"`
	AccountName string  `json:"account_name" binding:"required"`
}

func (h *WalletHandler) RequestTopUp(c *gin.Context) {
	var req TopUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	transaction := models.Transaction{
		UserID:      userID.(uint),
		Type:        models.TypeDeposit,
		Amount:      req.Amount,
		Status:      models.StatusPending,
		BankName:    req.BankName,
		BankAccount: req.BankAccount,
		AccountName: req.AccountName,
	}

	if err := h.db.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Top up request submitted", "transaction": transaction})
}

type WithdrawRequest struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	BankName    string  `json:"bank_name" binding:"required"`
	BankAccount string  `json:"bank_account" binding:"required"`
	AccountName string  `json:"account_name" binding:"required"`
}

func (h *WalletHandler) RequestWithdraw(c *gin.Context) {
	var req WithdrawRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check balance using Transaction to lock row? No, simple check for now.
	// Strictly we should use a transaction but let's keep it simple.
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if float64(user.Balance) < req.Amount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient balance"})
		return
	}

	// Start DB transaction
	tx := h.db.Begin()

	// Deduct balance immediately
	user.Balance -= int(req.Amount)
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
		return
	}

	transaction := models.Transaction{
		UserID:      userID.(uint),
		Type:        models.TypeWithdraw,
		Amount:      req.Amount,
		Status:      models.StatusPending,
		BankName:    req.BankName,
		BankAccount: req.BankAccount,
		AccountName: req.AccountName,
	}

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Withdraw request submitted", "transaction": transaction, "new_balance": user.Balance})
}

func (h *WalletHandler) GetHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var transactions []models.Transaction
	if err := h.db.Where("user_id = ?", userID).Order("created_at desc").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}
