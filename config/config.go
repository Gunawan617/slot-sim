package config

import (
	"slot-sim/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {

	var err error
	DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}
	DB.AutoMigrate(&models.User{}, &models.Gamelog{}, &models.MythicSession{}, &models.Transaction{})
}
