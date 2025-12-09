# Project Structure

This document outlines the organization of the Slot Sim backend.

## Directory Layout

- **config/**
  - `config.go`: Database connection and configuration settings.

- **controllers/**
  - `auth.go`: Handles Authentication (Login, Register).
  - `game.go`: Handles Game logic (Play Slot).
  - `user.go`: Handles User profile and history.

- **middleware/**
  - `auth.go`: JWT Authentication middleware. Protected routes require a valid Bearer token.

- **models/**
  - `user.go`: `User` struct definition (GORM model).
  - `game_log.go`: `Gamelog` struct definition (GORM model).

- **routes/**
  - `routes.go`: Gin router setup and endpoint definitions.

- **utils/**
  - `jwt.go`: JWT token generation and validation logic.

## Key Flows

### Authentication
1. User registers via `/register`.
2. User logs in via `/login` and receives a JWT token.
3. Client must send `Authorization: Bearer <token>` for protected routes.

### Game Loop
1. User calls `/user/play-slot`.
2. Server validates token, checks balance, runs slot logic, updates balance, and logs the result.
3. Server returns win/loss outcome and new balance.
