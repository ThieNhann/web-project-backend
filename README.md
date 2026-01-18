# Introduction

This repository contains the backend for the web development final project.

# Collaborators

- Nguyen Thien Nhan (Dev) - 23120064
- Vo Thien Nhan (Dev) - 23120066
- Tan Loc (Dev) - 23120057
- Nhat Khang (Dev) - 23120050

# How to setup

1. Open up the terminal and type in

```
git clone https://github.com/ThieNhann/web-project-backend
```

2. Run

```
npm install
```

3. Change the .env file to point to the backend

```
PORT=3000 # (or whatever bro)
DATABASE_URL=database_url
JWT_SECRET=your_jwt_secret
VITE_MAIL=gmail_mail
VITE_MAILTOKEN=gmail_api_token
# 2FA expiration time in milliseconds (5 minutes)
# 5 minutes * 60 seconds * 1000 milliseconds
TWO_FA_EXPIRES_IN=300000 # (or whatever bro)
```

4. Start up the server

```
npm run dev
```

# Version

## v0.2.0 (2025-01-16)
- Auth controller: Signup, Signin, Signout, requestNewAccessToken, verifyAccessToken, getUserInfo.
- Profile: show Achievements, Rankings, Edit profile.
- Search controller.
- Admin controller: statistic and game-management (not done user-management yet).
- Game controller (not done yet).

## v0.1.0 (2025-01-16)
- Setup Supabase database with initial schema.
- Auth controller with some basic routes.
- JWT authentication.
- Game controller (not done yet).

## v0.0.0 (2026-01-14)

- First Commit.
