package controllers

import (
	"net/http"
	"slot-sim/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminController struct {
	db *gorm.DB
}

func NewAdminController(db *gorm.DB) *AdminController {
	return &AdminController{db: db}
}

// GetAllTransactions - Admin melihat semua transaksi
func (ac *AdminController) GetAllTransactions(c *gin.Context) {
	status := c.Query("status")
	
	var transactions []models.Transaction
	query := ac.db.Order("created_at desc")
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

type ApproveTransactionRequest struct {
	Action string `json:"action" binding:"required,oneof=approve reject"`
}

// ProcessTransaction - Admin approve atau reject transaksi
func (ac *AdminController) ProcessTransaction(c *gin.Context) {
	transactionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	var req ApproveTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var transaction models.Transaction
	if err := ac.db.First(&transaction, transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	if transaction.Status != models.StatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Transaction already processed"})
		return
	}

	tx := ac.db.Begin()

	if req.Action == "approve" {
		transaction.Status = models.StatusApproved
		
		// Jika deposit, tambahkan balance
		if transaction.Type == models.TypeDeposit {
			var user models.User
			if err := tx.First(&user, transaction.UserID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}
			
			user.Balance += int(transaction.Amount)
			if err := tx.Save(&user).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
				return
			}
		}
		// Withdraw sudah dikurangi saat request, jadi tidak perlu action
		
	} else if req.Action == "reject" {
		transaction.Status = models.StatusRejected
		
		// Jika withdraw di-reject, kembalikan balance
		if transaction.Type == models.TypeWithdraw {
			var user models.User
			if err := tx.First(&user, transaction.UserID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}
			
			user.Balance += int(transaction.Amount)
			if err := tx.Save(&user).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refund balance"})
				return
			}
		}
	}

	if err := tx.Save(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message":     "Transaction processed successfully",
		"transaction": transaction,
	})
}

// GetDashboardStats - Admin dashboard statistics
func (ac *AdminController) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalUsers       int64   `json:"total_users"`
		PendingDeposits  int64   `json:"pending_deposits"`
		PendingWithdraws int64   `json:"pending_withdraws"`
		TotalDeposits    float64 `json:"total_deposits"`
		TotalWithdraws   float64 `json:"total_withdraws"`
	}

	ac.db.Model(&models.User{}).Count(&stats.TotalUsers)
	ac.db.Model(&models.Transaction{}).Where("type = ? AND status = ?", models.TypeDeposit, models.StatusPending).Count(&stats.PendingDeposits)
	ac.db.Model(&models.Transaction{}).Where("type = ? AND status = ?", models.TypeWithdraw, models.StatusPending).Count(&stats.PendingWithdraws)
	
	ac.db.Model(&models.Transaction{}).Where("type = ? AND status = ?", models.TypeDeposit, models.StatusApproved).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalDeposits)
	ac.db.Model(&models.Transaction{}).Where("type = ? AND status = ?", models.TypeWithdraw, models.StatusApproved).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalWithdraws)

	c.JSON(http.StatusOK, stats)
}
