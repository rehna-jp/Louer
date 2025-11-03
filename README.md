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
 
## 🗄️ Database Schema Overview (MySQL)

Dwello uses a normalized relational database schema to efficiently manage users, property listings, bookings, and in-app messaging between landlords and tenants.

| Table | Description | Key Columns |
|--------|-------------|-------------|
| **users** | Stores user accounts for tenants & landlords | id, email, password_hash, role, phone, created_at |
| **listings** | Stores property listings | id, landlord_id, title, description, price_monthly_cents, type, status, created_at |
| **listing_images** | Stores multiple images per property | id, listing_id, url, position |
| **bookings** | Tracks property bookings by tenants | id, listing_id, tenant_id, move_in_date, status, price_monthly_cents |
| **favorites** | Tracks saved properties per user | id, user_id, listing_id, created_at |
| **message_threads** | Represents a conversation thread between landlord and tenant | id, listing_id, landlord_id, tenant_id, created_at |
| **messages** | Stores messages within a thread | id, thread_id, sender_id, content, is_read, created_at |




## 🚀 Future Improvements

🔐 Add user authentication (JWT-based login/signup)

📸 Enable property image uploads (via Cloudinary or Firebase)

💬 Real-time chat between landlord & tenant

📱 Mobile responsiveness and PWA support

🏘️ Search filters and map view integration

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