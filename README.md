# TinyApp 

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

---

## Features

- Register and login with secure password hashing (bcrypt)
- Cookie-based session authentication
- Create, view, update, and delete your own short URLs
- Track total and unique visits per short URL
- View analytics: timestamps of visitors
- RESTful routes and full error handling
- Clean, mobile-friendly UI using Bootstrap

---

## Tech Stack

- Node.js
- Express
- EJS (Embedded JavaScript templates)
- bcryptjs
- cookie-session
- method-override
- Mocha + Chai for testing

---

## Project Structure
tinyapp/
├── express_server.js        # Main server file
├── helpers.js               # Utility functions
├── views/                   # EJS templates (UI)
├── public/                  # Static assets (CSS, images)
├── test/                    # Mocha/Chai tests
├── package.json             # Dependencies and scripts
└── README.md                # This file

---

## 🚀 Getting Started

### 1. Clone this repo
```zsh
git clone https://github.com/your-username/tinyapp
cd tinyapp

### 2. Install dependencies
npm install

### 3. Start the server
node express_server.js

### 4. Go to
http://localhost:8080

Running Tests
Test helper functions using:

Security Features
	•	Passwords are hashed using bcryptjs
	•	Sessions stored via encrypted cookies
	•	Users can only view/edit/delete their own URLs
	•	Visitors tracked anonymously via session ID






