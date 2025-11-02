### DWELLO 

🏠 Dwello

Dwello is a full-stack accommodation platform designed to help students and individuals easily find, list, and manage rental properties.
Landlords can post their available listings, while tenants can browse, filter, and book apartments, rooms, or hostels — all in one place.

## 🚀 Features
👩‍💼 For Tenants

Browse and search listings by location, type, and price

View detailed property info (images, landlord details, and description)

Save favorite listings for later

Book available accommodations easily

🏠 For Landlords

Add, update, or delete property listings

Manage bookings and view tenant requests

Upload property images

Track listing status (active, occupied, inactive)

## 🛠️ Tech Stack
Layer	Technology
Frontend	React + Vite + Tailwind CSS
Backend	Node.js + Express.js
Database	MySQL
ORM / Query	mysql2 (Promise-based)
Server Communication	REST API with Axios
Styling	Tailwind CSS


## ⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/rehna-jp/Louer.git
cd dwello

2️⃣ Install dependencies
Backend
cd server
npm install

Frontend
cd ../frontend
npm install

3️⃣ Configure the database

Ensure MySQL is running on your system

Create a new database:

CREATE DATABASE dwello;


Optionally, edit your .env file in server/:

MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=dwello
PORT=5000

4️⃣ Run the backend
cd server
npm run dev

5️⃣ Run the frontend
cd ../client
npm run dev


Then open your app at
👉 http://localhost:5173
 (frontend)
👉 http://localhost:5000
 (backend API)

🧱 Database Schema Overview
Users Table
Column	Type	Description
id	BIGINT	Primary key
email	VARCHAR	Unique user email
password_hash	VARCHAR	Hashed password
role	ENUM('tenant', 'landlord', 'admin')	User role
created_at	DATETIME	Timestamp
Listings Table
Column	Type	Description
id	BIGINT	Primary key
landlord_id	FK (Users)	Owner of listing
title	VARCHAR	Property title
description	TEXT	Property description
price_monthly_cents	INT	Monthly rent
type	ENUM('room','apartment','hostel','studio')	Type of property
status	ENUM('active','occupied','inactive','draft')	Current status
created_at	DATETIME	Timestamp
🔐 Environment Variables

The backend requires a .env file:

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=dwello
PORT=5000

## 🎯 Project Status
🚧 Under Active Development


## 🤝 Contributing

Contributions are welcome!
To contribute:

Fork the repo

Create a new branch (feature/new-feature)

Commit your changes

Push and open a Pull Request 🚀

## 📄 License

This project is licensed under the MIT License — feel free to use and modify it.

## 💡 Author

Precious Jeremy
Frontend Developer & Blockchain Enthusiast
🌐 Portfolio
 • 🐦 [Twitter](https://x.com/chiinaza0x5?t=27gShuOqxPzci50-G9Qnuw&s=09)
 • 💼 [LinkedIn](https://www.linkedin.com/in/precious-jeremy-o-b195292ab?)