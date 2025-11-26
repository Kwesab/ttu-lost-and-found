# TTU Lost & Found

A web application for the Takoradi Technical University community to report and find lost items.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

---

## 🎯 Overview

**TTU Lost & Found** helps students and staff at Takoradi Technical University:
- **Report lost items** they're looking for
- **Report found items** they've discovered
- **Submit claims** for items they believe are theirs
- **Track claim status** to see if their claim was approved
- **Contact item owners** directly or through verified claims

### The Problem We Solve
When someone loses an item on campus, they have no central place to check if someone found it. When someone finds an item, they don't know how to reach the owner. This app bridges that gap.

---

## 🛠 Tech Stack

### Frontend (What Users See)
- **React 18** - JavaScript library for building the user interface
- **TypeScript** - Adds type safety to JavaScript (catches errors early)
- **Vite** - Super fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework for styling
- **Radix UI / shadcn/ui** - Pre-built, accessible UI components
- **React Router** - Handles navigation between pages
- **TanStack Query** - Manages data fetching and caching

### Backend (Server Side)
- **Node.js 22** - JavaScript runtime for the server
- **Express 5** - Web framework for building the API
- **PostgreSQL** - Relational database for storing data
- **Neon** - Serverless PostgreSQL hosting
- **pg** - PostgreSQL client for Node.js

### Image Storage
- **Cloudinary** - Cloud service for storing and optimizing images

### Development Tools
- **pnpm** - Fast package manager (like npm but better)
- **Vitest** - Testing framework
- **Git & GitHub** - Version control

### Deployment
- **Render** - Cloud platform for hosting the application

---

## ✨ Features

### 1. Report Lost Items
- Upload up to 3 photos of the item
- Describe what you lost (title, description, location, date)
- Set verification questions only the real owner would know
- Provide contact email

### 2. Report Found Items
- Upload photos of what you found
- Describe the item and where you found it
- Set verification questions to verify ownership
- Provide contact email

### 3. Browse Items
- View all lost items posted by others
- View all found items posted by others
- See item details, photos, location, and date

### 4. Submit Claims
- If you see your lost item, submit a claim
- Answer verification questions to prove it's yours
- Upload proof photo (optional)
- Provide your contact information

### 5. Track Claims (My Claims Page)
- Enter your email to see all your submitted claims
- Check status: Pending ⏳, Approved ✅, or Rejected ❌
- If approved, see contact info to reach the item owner
- Direct "Send Email" button for approved claims

### 6. Direct Contact
- Email button on each item detail page
- Bypass claim system if you prefer direct communication

### 7. Admin Panel
- Protected with password (TTAdmin2024)
- View all items and claims
- Approve or reject claims
- See verification Q&A before deciding
- Both emails shown when claim is approved

### 8. Mobile Responsive
- Hamburger menu on mobile devices
- Optimized layout for phones and tablets
- Touch-friendly interface

---

## 🔄 How It Works

### Scenario 1: Someone Lost Their Phone

1. **Lost Item is Posted**
   - Sarah loses her iPhone in the library
   - She goes to the website and clicks "Report Lost Item"
   - She uploads a photo, describes it, and sets verification questions:
     - "What color is the phone case?"
     - "What's the lock screen wallpaper?"
   - Item is now visible in the "Lost Items" page

2. **Someone Finds It**
   - John finds the iPhone and sees the post
   - He has two options:
     - **Option A**: Click "Contact Owner" to email Sarah directly
     - **Option B**: Submit a claim with verification answers

3. **If John Submits a Claim**
   - John answers the verification questions
   - Uploads a photo of the phone as proof
   - Claim status: "Pending"
   - Admin reviews the claim

4. **Admin Reviews**
   - Admin logs into the admin panel
   - Sees John's claim with his answers
   - Compares answers with Sarah's questions
   - Approves the claim if answers are correct

5. **John Gets Notified**
   - John checks "My Claims" page with his email
   - Sees claim status changed to "Approved ✅"
   - Both emails are shown (Sarah's and John's)
   - John clicks "Send Email Now" to contact Sarah
   - They arrange to meet and return the phone!

### Scenario 2: Someone Found a Wallet

1. **Found Item is Posted**
   - Mike finds a wallet in the cafeteria
   - He posts it as "Found Item" with photos
   - Sets questions only the owner would know:
     - "What ID cards are inside?"
     - "How much cash approximately?"

2. **Owner Sees the Post**
   - Lisa recognizes her wallet
   - She submits a claim and answers the questions correctly
   - Uploads her photo ID as proof

3. **Admin Approves**
   - Admin verifies the answers match
   - Approves the claim

4. **They Connect**
   - Lisa sees the approval on "My Claims"
   - She emails Mike using the provided contact
   - They meet up and Lisa gets her wallet back!

---

## 📁 Project Structure

```
finalproject/
├── client/                    # Frontend code (what users see)
│   ├── components/           # Reusable UI pieces
│   │   ├── ItemCard.tsx     # Card showing item preview
│   │   ├── Layout.tsx       # Header, footer, navigation
│   │   └── ui/              # Pre-built UI components (buttons, forms, etc.)
│   ├── pages/               # Different pages of the website
│   │   ├── Index.tsx        # Home page
│   │   ├── Lost.tsx         # Lost items page
│   │   ├── Found.tsx        # Found items page
│   │   ├── Report.tsx       # Form to report items
│   │   ├── ItemDetail.tsx   # Single item details
│   │   ├── MyClaims.tsx     # Track your claims
│   │   └── Admin.tsx        # Admin dashboard
│   ├── lib/                 # Utility functions
│   │   └── cloudinary.ts    # Image upload helpers
│   └── App.tsx              # Main app component
│
├── server/                   # Backend code (server)
│   ├── index.ts             # Main server setup
│   ├── db.ts                # Database connection
│   ├── schema.sql           # Database table structure
│   ├── migrate.ts           # Creates database tables
│   ├── seed.ts              # Adds sample data
│   └── routes/              # API endpoints
│       ├── items.ts         # Item CRUD operations
│       ├── claims.ts        # Claim CRUD operations
│       └── upload.ts        # Image upload/delete
│
├── shared/                   # Code shared by client and server
│   └── api.ts               # TypeScript types/interfaces
│
├── public/                   # Static files
├── .env                     # Environment variables (secrets)
├── package.json             # Project dependencies
└── README.md                # This file!
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js 22+** installed on your computer
- **pnpm** package manager (`npm install -g pnpm`)
- **PostgreSQL database** (we use Neon - free cloud database)
- **Cloudinary account** (free tier for image storage)
- **Git** for version control

### Step 1: Clone the Repository
```bash
git clone https://github.com/Kwesab/ttu-lost-and-found.git
cd ttu-lost-and-found
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the root directory:

```env
# Database Connection (PostgreSQL on Neon)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Cloudinary (Image Storage)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Step 4: Create Database Tables
```bash
pnpm db:migrate
```

This runs the migration script that creates the necessary tables in your database.

### Step 5: Add Sample Data (Optional)
```bash
pnpm db:seed
```

This adds a few example lost/found items so you can test the app.

### Step 6: Start Development Server
```bash
pnpm dev
```

The app will open at `http://localhost:8080`

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `CLOUDINARY_URL` | Cloudinary credentials | `cloudinary://key:secret@cloud_name` |

### How to Get These:

**Database (Neon):**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

**Cloudinary:**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. Go to Dashboard
4. Copy the "API Environment variable"

---

## 🗄 Database Schema

### Items Table
Stores all lost and found items.

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,                    -- Unique identifier
  type TEXT NOT NULL,                     -- 'lost' or 'found'
  title TEXT NOT NULL,                    -- Item name
  description TEXT NOT NULL,              -- Detailed description
  location TEXT NOT NULL,                 -- Where lost/found
  date DATE NOT NULL,                     -- When lost/found
  image_url TEXT,                         -- Primary image (deprecated)
  image_urls TEXT[],                      -- Array of image URLs
  contact_email TEXT NOT NULL,            -- Owner's email
  status TEXT DEFAULT 'active',           -- 'active', 'claimed', 'returned'
  verification_questions TEXT[],          -- Security questions
  created_at TIMESTAMP DEFAULT NOW(),     -- When posted
  updated_at TIMESTAMP DEFAULT NOW()      -- Last updated
);
```

### Claims Table
Stores all claims submitted by users.

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,                    -- Unique identifier
  item_id UUID REFERENCES items(id),      -- Which item is claimed
  name TEXT NOT NULL,                     -- Claimant's name
  email TEXT NOT NULL,                    -- Claimant's email
  message TEXT NOT NULL,                  -- Claim message
  answers TEXT[],                         -- Verification answers
  proof_image_url TEXT,                   -- Proof photo
  status TEXT DEFAULT 'pending',          -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),     -- When submitted
  updated_at TIMESTAMP DEFAULT NOW()      -- Last updated
);
```

---

## 🔌 API Endpoints

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (lost and found) |
| GET | `/api/items/:id` | Get single item by ID |
| POST | `/api/items` | Create new item |
| PATCH | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Claims

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/claims` | Get all claims |
| GET | `/api/claims?email=xxx` | Get claims by email |
| POST | `/api/claims` | Submit new claim |
| PATCH | `/api/claims/:id` | Update claim (approve/reject) |
| DELETE | `/api/claims/:id` | Delete claim |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image to Cloudinary |
| DELETE | `/api/upload` | Delete image from Cloudinary |

---

## 🚢 Deployment

### Deploy to Render

1. **Push code to GitHub** (already done)
   ```bash
   git push origin master
   ```

2. **Create Render account** at [render.com](https://render.com)

3. **Create new Web Service**
   - Connect your GitHub repository
   - Name: `ttu-lost-and-found`
   - Environment: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

4. **Add Environment Variables** in Render dashboard:
   - `DATABASE_URL` - Your Neon PostgreSQL URL
   - `CLOUDINARY_URL` - Your Cloudinary credentials

5. **Deploy!** Render will build and deploy automatically

6. **Run Migration** in Render shell:
   ```bash
   pnpm db:migrate
   ```

7. **Optional: Add Sample Data**
   ```bash
   pnpm db:seed
   ```

Your app is now live! 🎉

---

## 📖 Understanding the Workflow

### Data Flow Diagram

```
User Browser
     ↓
  React App (Client)
     ↓
  API Requests (fetch)
     ↓
  Express Server
     ↓
  PostgreSQL Database
```

### Example: Submitting a Lost Item

1. **User fills form** on `/report` page
2. **User uploads images** → Sent to Cloudinary → Returns image URLs
3. **User submits form** → React sends POST request to `/api/items`
4. **Express server** receives request
5. **Server validates data** (checks required fields)
6. **Server saves to database** using SQL INSERT
7. **Database returns** saved item with ID
8. **Server sends response** back to React
9. **React updates UI** and redirects to item detail page

### Example: Admin Approving Claim

1. **Admin logs in** with password
2. **React fetches claims** from `/api/claims`
3. **Admin clicks "Approve"** button
4. **React sends PATCH** to `/api/claims/:id` with `status: 'approved'`
5. **Server updates database** using SQL UPDATE
6. **Database confirms** update
7. **React refreshes** claim list
8. **User checks "My Claims"** and sees approval!

---

## 🧪 Testing

Run all tests:
```bash
pnpm test
```

Run specific test file:
```bash
pnpm test server/routes/upload.spec.ts
```

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (port 8080) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm db:migrate` | Create database tables |
| `pnpm db:seed` | Add sample data |
| `pnpm db:reset` | Drop all tables and recreate |

---

## 🤝 Contributing

Want to improve this project? Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Make your changes
4. Add comments explaining your code
5. Test thoroughly
6. Commit: `git commit -m "Add some feature"`
7. Push: `git push origin my-new-feature`
8. Submit a pull request

---

## 📄 License

This project is for educational purposes at Takoradi Technical University.

---

## 👥 Credits

**Developed by:** Kwesab  
**University:** Takoradi Technical University  
**Year:** 2025

---

## 🐛 Common Issues & Solutions

### Issue: Database connection timeout
**Solution:** Check your `DATABASE_URL` is correct and Neon database is active.

### Issue: Images not uploading
**Solution:** Verify `CLOUDINARY_URL` is set correctly in `.env`.

### Issue: "Port already in use"
**Solution:** Another app is using port 8080. Kill that process or change the port in `vite.config.ts`.

### Issue: Can't login to admin
**Solution:** Password is `TTAdmin2024` (case-sensitive).

---

## 📞 Support

Having issues? Create an issue on GitHub or contact the development team.

---

**Made with ❤️ for the TTU Community**
