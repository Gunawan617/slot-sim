package main

import (
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primarykey"`
	Username string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Balance  int    `gorm:"not null"`
	Role     string `gorm:"not null"`
}

func main() {
	// Connect to database
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	// Update user role to admin
	result := db.Model(&User{}).Where("username = ?", "admin").Update("role", "admin")
	if result.Error != nil {
		log.Fatal("Failed to update role:", result.Error)
	}

	if result.RowsAffected == 0 {
		fmt.Println("❌ User 'admin' not found!")
		return
	}

	// Verify the update
	var user User
	db.Where("username = ?", "admin").First(&user)

	fmt.Println("✅ Admin user updated successfully!")
	fmt.Printf("   ID: %d\n", user.ID)
	fmt.Printf("   Username: %s\n", user.Username)
	fmt.Printf("   Role: %s\n", user.Role)
	fmt.Printf("   Balance: %d\n", user.Balance)
}
