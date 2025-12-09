package routes

import (
	"slot-sim/config"
	"slot-sim/controllers"
	"slot-sim/handlers"
	"slot-sim/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	// Fortune Gems routes (existing)
	userRoutes := r.Group("/user")
	userRoutes.Use(middleware.AuthMiddleware())
	{
		userRoutes.GET("/me", controllers.GetProfile)
		userRoutes.GET("/history", controllers.GetHistory)
		userRoutes.POST("/play-slot", controllers.PlaySlot)
	}

	// Mythic Lightning routes (new)
	mythicHandler := handlers.NewMythicHandler(config.DB)
	mythicRoutes := r.Group("/api/mythic")
	mythicRoutes.Use(middleware.AuthMiddleware())
	{
		mythicRoutes.POST("/spin", mythicHandler.Spin)
		mythicRoutes.GET("/history", mythicHandler.GetHistory)
	}

	// Wallet routes
	walletHandler := handlers.NewWalletHandler(config.DB)
	walletRoutes := r.Group("/api/wallet")
	walletRoutes.Use(middleware.AuthMiddleware())
	{
		walletRoutes.POST("/topup", walletHandler.RequestTopUp)
		walletRoutes.POST("/withdraw", walletHandler.RequestWithdraw)
		walletRoutes.GET("/history", walletHandler.GetHistory)
	}

	// Admin routes
	adminController := controllers.NewAdminController(config.DB)
	adminRoutes := r.Group("/api/admin")
	adminRoutes.Use(middleware.AuthMiddleware())
	adminRoutes.Use(middleware.AdminMiddleware())
	{
		adminRoutes.GET("/transactions", adminController.GetAllTransactions)
		adminRoutes.POST("/transactions/:id/process", adminController.ProcessTransaction)
		adminRoutes.GET("/dashboard", adminController.GetDashboardStats)
	}
}
