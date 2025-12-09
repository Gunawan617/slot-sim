package main

import (
	"slot-sim/config"
	"slot-sim/middleware"
	"slot-sim/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	config.ConnectDB()
	routes.SetupRoutes(r)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to Slot Sim API",
			"status":  "serving",
		})
	})

	r.Run(":8080")
}
