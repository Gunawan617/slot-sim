package controllers

import (
	"net/http"
	"slot-sim/config"
	"slot-sim/models"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userId := c.MustGet("userID").(uint)
	var user models.User
	if err := config.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username": user.Username,
		"balance":  user.Balance,
		"role":     user.Role,
	})
}

func GetHistory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var logs []models.Gamelog
	config.DB.Where("user_id = ?", userID).Find(&logs)
	c.JSON(http.StatusOK, logs)
}
