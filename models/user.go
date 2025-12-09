package models

import "time"

type User struct {
	ID        uint      `gorm:"primarykey"`
	Username  string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"`
	Balance   int       `gorm:"not null"`
	Role      string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}
