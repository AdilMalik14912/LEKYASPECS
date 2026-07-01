# Lekya Specs — Premium Eyewear E-Commerce Store

A full-stack premium eyewear e-commerce platform with AI-powered face shape detection, admin CMS, and a beautiful Next.js storefront.

## ✨ Features

- 🕶️ **Premium Storefront** — Next.js + Tailwind CSS, dark/gold aesthetic
- 🤖 **AI Face Shape Detector** — Upload a photo, drag pins, get frame recommendations
- 🛒 **Full Cart & Checkout** — Razorpay payment integration
- 📦 **Product Management** — Admin panel for CRUD, categories, stock
- 📊 **Analytics Dashboard** — Sales trends, top products, low-stock alerts
- 🎨 **CMS Customizer** — Edit hero title, subtitle, images from admin panel
- ☁️ **Cloudinary Image Hosting** — Real image upload for products
- 🗄️ **Turso (SQLite Cloud)** — Serverless, globally distributed database
- 🔐 **JWT Authentication** — Secure login with bcrypt password hashing
- 💡 **5 Discovery Features** — Style Quiz, Frame Comparison, Lens Guide, Lookbook, Face Shape AI

## 🗂️ Project Structure

```
Specs/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Database (Turso), schema, seed
│   │   ├── controllers/  # Auth, Products, Orders, Admin
│   │   ├── middleware/   # JWT auth middleware
│   │   └── utils/        # JWT helper, Cloudinary helper
│   └── .env.example  # Environment variables template
├── frontend/         # Next.js storefront
│   └── src/pages/    # All pages (shop, face-shape, admin, etc.)
└── run-dev.ps1       # Windows dev runner script
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Turso](https://turso.tech) account (free tier available)
- A [Cloudinary](https://cloudinary.com) account (free tier available)

### 1. Clone the repo
```bash
git clone https://github.com/AdilMalik14912/LEKYASPECS.git
cd LEKYASPECS
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Fill in your TURSO_URL, TURSO_TOKEN, CLOUDINARY_*, JWT_SECRET
npm install
node src/app.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App
| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Main storefront |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:5000/api` | Backend API |

### Default Admin Login
```
Email:    admin@specs.com
Password: admin123
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js |
| Database | Turso (LibSQL / SQLite Cloud) |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| Images | Cloudinary |
| Face AI | Client-side geometry analysis |

## 📄 License

MIT — Built with ❤️ by Adil Malik
