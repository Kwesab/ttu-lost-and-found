# TTU Lost & Found - System Architecture

This document explains how all the pieces of our application fit together. Think of it as a map of how data flows through the system.

---

## 🏗 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend (Client)                   │ │
│  │  - Pages: Home, Lost, Found, Report, ItemDetail, etc. │ │
│  │  - Components: Layout, ItemCard, Forms, etc.          │ │
│  │  - State Management: TanStack Query                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕ HTTP                            │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                      Express Server (API)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes:                                               │ │
│  │  - /api/items    → items.ts                           │ │
│  │  - /api/claims   → claims.ts                          │ │
│  │  - /api/upload   → upload.ts                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
└─────────────────────────────────────────────────────────────┘
                   ↕                    ↕
    ┌──────────────────────┐   ┌──────────────────────┐
    │  PostgreSQL Database │   │   Cloudinary CDN     │
    │       (Neon)         │   │  (Image Storage)     │
    │                      │   │                      │
    │  Tables:             │   │  Features:           │
    │  - items             │   │  - Upload images     │
    │  - claims            │   │  - Optimize images   │
    └──────────────────────┘   │  - Delete images     │
                               └──────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1. Reporting a Lost/Found Item

```
┌──────────┐
│   User   │
└─────┬────┘
      │ 1. Fills out form
      ↓
┌─────────────────┐
│  Report.tsx     │ React Component
│                 │
│  State:         │
│  - formData     │
│  - images[]     │
│  - loading      │
└────────┬────────┘
         │
         │ 2. Uploads images (one by one)
         ↓
┌──────────────────────────────────────┐
│  POST /api/upload                    │
│  Body: {file: "base64..."}           │
└────────┬─────────────────────────────┘
         │
         │ 3. Cloudinary processes image
         ↓
┌─────────────────────────────────┐
│  Cloudinary                     │
│  - Stores image                 │
│  - Optimizes (WebP/AVIF)        │
│  - Generates URL                │
└────────┬────────────────────────┘
         │
         │ 4. Returns {url, publicId}
         ↓
┌──────────────────────────────────────┐
│  Report.tsx                          │
│  - Stores image URLs in state        │
│  - Shows preview                     │
└────────┬─────────────────────────────┘
         │
         │ 5. Submits complete form
         ↓
┌──────────────────────────────────────┐
│  POST /api/items                     │
│  Body: {                             │
│    type, title, description,         │
│    location, date, imageUrls[],      │
│    contactEmail,                     │
│    verificationQuestions[]           │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         │ 6. Validates and saves
         ↓
┌─────────────────────────────────┐
│  items.ts (createItem)          │
│  1. Validates required fields   │
│  2. Generates UUID              │
│  3. Runs SQL INSERT             │
└────────┬────────────────────────┘
         │
         │ 7. INSERT INTO items...
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Stores item in items table   │
│  - Returns saved item with ID   │
└────────┬────────────────────────┘
         │
         │ 8. Returns saved item
         ↓
┌──────────────────────────────────────┐
│  Report.tsx                          │
│  - Success!                          │
│  - Redirects to item detail page     │
└──────────────────────────────────────┘
```

### 2. Browsing Lost Items

```
┌──────────┐
│   User   │
└─────┬────┘
      │ Visits /lost
      ↓
┌──────────────────────────────────────┐
│  Lost.tsx                            │
│  - useQuery to fetch items           │
└────────┬─────────────────────────────┘
         │
         │ GET /api/items?type=lost
         ↓
┌─────────────────────────────────┐
│  items.ts (getItems)            │
│  1. Checks query params         │
│  2. Builds SQL query            │
└────────┬────────────────────────┘
         │
         │ SELECT * FROM items WHERE type='lost'
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Returns all lost items       │
└────────┬────────────────────────┘
         │
         │ Returns items array
         ↓
┌──────────────────────────────────────┐
│  Lost.tsx                            │
│  - Renders grid of ItemCard          │
│  - Each card shows preview           │
└──────────────────────────────────────┘
```

### 3. Submitting a Claim

```
┌──────────┐
│   User   │
└─────┬────┘
      │ Sees their lost item
      │ Clicks "Submit Claim"
      ↓
┌──────────────────────────────────────┐
│  ItemDetail.tsx                      │
│  - Shows claim form                  │
│  - Shows verification questions      │
└────────┬─────────────────────────────┘
         │
         │ 1. User fills form
         │    - Name
         │    - Email
         │    - Message
         │    - Answers to verification questions
         │    - Optional proof image
         ↓
┌──────────────────────────────────────┐
│  POST /api/claims                    │
│  Body: {                             │
│    itemId, name, email, message,     │
│    answers[], proofImageUrl          │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         │ 2. Validates and saves
         ↓
┌─────────────────────────────────┐
│  claims.ts (createClaim)        │
│  1. Validates required fields   │
│  2. Generates UUID              │
│  3. Sets status = 'pending'     │
│  4. Runs SQL INSERT             │
└────────┬────────────────────────┘
         │
         │ INSERT INTO claims...
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Stores claim with status     │
│    'pending'                    │
└────────┬────────────────────────┘
         │
         │ Returns saved claim
         ↓
┌──────────────────────────────────────┐
│  ItemDetail.tsx                      │
│  - Shows success message             │
│  - Shows "Track My Claims" button    │
│  - Redirects to /my-claims           │
└──────────────────────────────────────┘
```

### 4. Admin Approving a Claim

```
┌──────────┐
│  Admin   │
└─────┬────┘
      │ Logs into /admin
      │ Password: TTAdmin2024
      ↓
┌──────────────────────────────────────┐
│  Admin.tsx                           │
│  - Fetches all items and claims      │
└────────┬─────────────────────────────┘
         │
         │ GET /api/claims
         ↓
┌─────────────────────────────────┐
│  claims.ts (getClaims)          │
│  - Fetches all claims from DB   │
└────────┬────────────────────────┘
         │
         │ SELECT * FROM claims
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Returns all claims           │
└────────┬────────────────────────┘
         │
         │ Returns claims array
         ↓
┌──────────────────────────────────────┐
│  Admin.tsx                           │
│  - Shows Claims tab                  │
│  - For each claim shows:             │
│    • Item details                    │
│    • Claimant info                   │
│    • Verification Q&A                │
│    • Approve/Reject buttons          │
└────────┬─────────────────────────────┘
         │
         │ Admin clicks "Approve"
         ↓
┌──────────────────────────────────────┐
│  PATCH /api/claims/:id               │
│  Body: {status: "approved"}          │
└────────┬─────────────────────────────┘
         │
         │ Updates claim status
         ↓
┌─────────────────────────────────┐
│  claims.ts (updateClaimStatus)  │
│  - Validates status value       │
│  - Runs SQL UPDATE              │
└────────┬────────────────────────┘
         │
         │ UPDATE claims SET status='approved'
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Updates claim record         │
└────────┬────────────────────────┘
         │
         │ Returns updated claim
         ↓
┌──────────────────────────────────────┐
│  Admin.tsx                           │
│  - Refreshes claim list              │
│  - Shows green box with both emails  │
└──────────────────────────────────────┘
```

### 5. User Tracking Claim Status

```
┌──────────┐
│   User   │
└─────┬────┘
      │ Visits /my-claims
      ↓
┌──────────────────────────────────────┐
│  MyClaims.tsx                        │
│  - Shows email input form            │
└────────┬─────────────────────────────┘
         │
         │ User enters their email
         │ Clicks "View My Claims"
         ↓
┌──────────────────────────────────────┐
│  GET /api/claims?email=user@ex.com   │
└────────┬─────────────────────────────┘
         │
         │ Filters claims by email
         ↓
┌─────────────────────────────────┐
│  claims.ts (getClaims)          │
│  - Checks for email query param │
│  - Filters results              │
└────────┬────────────────────────┘
         │
         │ SELECT * FROM claims WHERE email=$1
         ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  - Returns user's claims        │
└────────┬────────────────────────┘
         │
         │ Returns filtered claims
         ↓
┌──────────────────────────────────────┐
│  MyClaims.tsx                        │
│  - For each claim shows:             │
│    • Status badge (pending/          │
│      approved/rejected)              │
│    • Item details                    │
│    • If approved: contact info       │
│      and "Send Email Now" button     │
└──────────────────────────────────────┘
```

---

## 🗃 Database Schema Details

### Items Table

```sql
CREATE TABLE items (
  -- Primary key (unique identifier)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Item classification
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  
  -- Item details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Images
  image_url TEXT,              -- Deprecated, kept for backwards compatibility
  image_urls TEXT[],           -- Array of Cloudinary URLs
  
  -- Contact
  contact_email TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'returned')),
  
  -- Security
  verification_questions TEXT[], -- Questions only real owner knows answers to
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
```

**Key Concepts:**

- **UUID**: Universally Unique Identifier - a random string that's virtually impossible to duplicate
- **CHECK constraint**: Ensures only valid values (e.g., type can only be 'lost' or 'found')
- **TEXT[]**: PostgreSQL array - stores multiple text values in one column
- **Index**: Makes queries faster by creating a lookup table (like an index in a book)

### Claims Table

```sql
CREATE TABLE claims (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to items table
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  -- Claimant information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Verification
  answers TEXT[],              -- Answers to verification questions
  proof_image_url TEXT,        -- Optional proof photo
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_claims_item_id ON claims(item_id);
CREATE INDEX idx_claims_email ON claims(email);
CREATE INDEX idx_claims_status ON claims(status);
```

**Key Concepts:**

- **REFERENCES**: Creates a relationship between tables (claim → item)
- **ON DELETE CASCADE**: If an item is deleted, automatically delete all its claims
- **Foreign Key**: Links a claim to its item (ensures data integrity)

### Auto-Update Trigger

```sql
-- Function that updates the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs the function before any UPDATE
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**What this does:**  
Automatically sets `updated_at` to the current time whenever a row is modified.  
No need to remember to update it manually!

---

## 🔄 API Request/Response Flow

### Example: Creating an Item

**Request:**
```http
POST /api/items HTTP/1.1
Content-Type: application/json

{
  "type": "lost",
  "title": "iPhone 13 Pro",
  "description": "Blue iPhone with cracked screen",
  "location": "Library 2nd floor",
  "date": "2025-01-15",
  "imageUrls": [
    "https://res.cloudinary.com/dsb10bj2r/image/upload/v123/phone1.jpg",
    "https://res.cloudinary.com/dsb10bj2r/image/upload/v123/phone2.jpg"
  ],
  "contactEmail": "student@ttu.edu.gh",
  "verificationQuestions": [
    "What color is the phone case?",
    "What's the lock screen wallpaper?"
  ]
}
```

**Processing Steps:**

1. **Express receives request** → `app.post("/api/items", createItem)`
2. **Middleware processes request**:
   - CORS checks origin
   - JSON parser converts body to JavaScript object
3. **Route handler executes** (`createItem` in `items.ts`):
   ```typescript
   // 1. Extract data from request body
   const { type, title, description, ... } = req.body;
   
   // 2. Validate required fields
   if (!type || !title || !description) {
     return res.status(400).json({ error: "Missing fields" });
   }
   
   // 3. Generate unique ID
   const id = crypto.randomUUID();
   
   // 4. Build SQL query
   const sql = `
     INSERT INTO items (
       id, type, title, description, location, date,
       image_urls, contact_email, verification_questions
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *
   `;
   
   // 5. Execute query
   const result = await query(sql, [
     id, type, title, description, location, date,
     imageUrls, contactEmail, verificationQuestions
   ]);
   
   // 6. Convert database row to API format
   const item = rowToItem(result.rows[0]);
   
   // 7. Send response
   res.status(201).json(item);
   ```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "lost",
  "title": "iPhone 13 Pro",
  "description": "Blue iPhone with cracked screen",
  "location": "Library 2nd floor",
  "date": "2025-01-15",
  "imageUrls": [
    "https://res.cloudinary.com/dsb10bj2r/image/upload/v123/phone1.jpg",
    "https://res.cloudinary.com/dsb10bj2r/image/upload/v123/phone2.jpg"
  ],
  "contactEmail": "student@ttu.edu.gh",
  "status": "active",
  "verificationQuestions": [
    "What color is the phone case?",
    "What's the lock screen wallpaper?"
  ],
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.tsx (Router)
│
├── Layout.tsx (Header, Footer, Navigation)
│   │
│   ├── Desktop Nav (visible on large screens)
│   └── Mobile Nav (hamburger menu on small screens)
│
├── Pages
│   │
│   ├── Index.tsx (Home)
│   │   └── Hero section + Quick links
│   │
│   ├── Lost.tsx (Browse lost items)
│   │   └── Grid of ItemCard components
│   │
│   ├── Found.tsx (Browse found items)
│   │   └── Grid of ItemCard components
│   │
│   ├── Report.tsx (Report item form)
│   │   ├── Image upload (up to 3)
│   │   ├── Item details form
│   │   └── Verification questions
│   │
│   ├── ItemDetail.tsx (Single item view)
│   │   ├── Image gallery
│   │   ├── Item information
│   │   ├── Contact owner button
│   │   └── Claim submission form
│   │
│   ├── MyClaims.tsx (Track claims)
│   │   ├── Email input
│   │   └── Claims list with status
│   │
│   └── Admin.tsx (Admin dashboard)
│       ├── Login form
│       ├── Items tab
│       └── Claims tab
│
└── Components
    │
    ├── ItemCard.tsx (Item preview card)
    └── ui/* (shadcn/ui components)
        ├── Button
        ├── Card
        ├── Form
        ├── Input
        ├── Sheet (mobile menu)
        └── ... (many more)
```

### State Management

We use **TanStack Query** (formerly React Query) for server state:

```typescript
// Example: Fetching items in Lost.tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["items", "lost"],  // Unique key for this query
  queryFn: async () => {
    const response = await fetch("/api/items?type=lost");
    return response.json();
  },
});

// TanStack Query automatically:
// - Caches the data
// - Refetches when needed
// - Handles loading/error states
// - Deduplicates requests
```

**Benefits:**
- No need to manage loading/error states manually
- Automatic background refetching
- Cache invalidation when data changes
- Optimistic updates

### Routing

We use **React Router** for navigation:

```typescript
// In App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/lost" element={<Lost />} />
    <Route path="/found" element={<Found />} />
    <Route path="/report" element={<Report />} />
    <Route path="/item/:id" element={<ItemDetail />} />
    <Route path="/my-claims" element={<MyClaims />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**How it works:**
- URL `/lost` → Renders `<Lost />` component
- URL `/item/123` → Renders `<ItemDetail />` with `id="123"`
- `<Link to="/lost">` → Navigates without page reload (SPA magic!)

---

## 🔒 Security Measures

### 1. SQL Injection Prevention

**Bad (Vulnerable):**
```typescript
const sql = `SELECT * FROM items WHERE id = '${itemId}'`;
```
If `itemId = "'; DROP TABLE items; --"`, this deletes the entire table!

**Good (Safe):**
```typescript
const sql = `SELECT * FROM items WHERE id = $1`;
await query(sql, [itemId]);
```
PostgreSQL treats `$1` as data, not code. Can't inject SQL.

### 2. Input Validation

```typescript
// Validate required fields
if (!title || !description || !location) {
  return res.status(400).json({ error: "Missing required fields" });
}

// Validate email format
if (!email.includes("@")) {
  return res.status(400).json({ error: "Invalid email" });
}

// Validate enum values
if (!["lost", "found"].includes(type)) {
  return res.status(400).json({ error: "Invalid type" });
}
```

### 3. CORS (Cross-Origin Resource Sharing)

Prevents malicious websites from making requests to our API:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",  // Only allow our frontend
  credentials: true,  // Allow cookies
}));
```

### 4. Environment Variables

Never commit sensitive data to Git:

```
# .env (in .gitignore)
DATABASE_URL=postgresql://...  # Database password
CLOUDINARY_URL=cloudinary://...  # API secrets
```

### 5. Admin Authentication

```typescript
// In Admin.tsx
const ADMIN_PASSWORD = "TTAdmin2024";

if (password !== ADMIN_PASSWORD) {
  alert("Incorrect password");
  return;
}
```

**Note:** In production, use proper authentication (JWT tokens, sessions, etc.)

---

## 🚀 Deployment Architecture

### Development Environment

```
Your Computer
├── Frontend (Vite dev server on :5173)
├── Backend (Express on :8080)
├── Database (Neon PostgreSQL - cloud)
└── Images (Cloudinary - cloud)
```

### Production Environment (Render)

```
Render Server
├── Build Process
│   ├── 1. Install dependencies (pnpm install)
│   ├── 2. Build frontend (pnpm build)
│   └── 3. Compile TypeScript (tsc)
│
└── Runtime
    ├── Node.js process runs dist/server/node-build.mjs
    ├── Serves static files from dist/spa/
    ├── API requests → Express handlers
    ├── Database queries → Neon PostgreSQL
    └── Image uploads → Cloudinary
```

### Request Flow in Production

```
User Browser
    ↓
HTTPS Request
    ↓
Render Load Balancer
    ↓
Your Node.js Server
    ↓
If URL starts with /api → Express route handler → Database
If URL is static file → Serve from dist/spa/
If URL is unknown → Serve index.html (for React Router)
```

---

## 📈 Performance Optimizations

### 1. Database Connection Pooling

Instead of:
```typescript
// BAD: Create new connection for each request
const client = new Client(DATABASE_URL);
await client.connect();
await client.query(...);
await client.end();
```

We use:
```typescript
// GOOD: Reuse connections from pool
const result = await pool.query(...);
```

**Benefit:** 10x faster queries (no connection setup time)

### 2. Database Indexes

```sql
CREATE INDEX idx_items_type ON items(type);
```

**Without index:** Database scans all rows to find `type='lost'` (slow)  
**With index:** Database uses index to jump directly to matching rows (fast)

### 3. Image Optimization (Cloudinary)

```typescript
// Automatic optimizations:
// - Convert to WebP/AVIF (smaller size)
// - Resize to max 1200x1200
// - Adjust quality based on content
// - Generate responsive sizes
```

**Benefit:** 70% smaller images = faster page loads

### 4. React Query Caching

```typescript
useQuery({
  queryKey: ["items", "lost"],
  queryFn: fetchLostItems,
  staleTime: 5 * 60 * 1000,  // Consider fresh for 5 minutes
});
```

**Benefit:** Don't refetch data unnecessarily

---

## 🧪 Testing Strategy

### Unit Tests (Functions)

```typescript
// Test a single function in isolation
test("rowToItem converts database row to Item", () => {
  const row = {
    id: "123",
    type: "lost",
    title: "Phone",
    // ...
  };
  
  const item = rowToItem(row);
  
  expect(item.id).toBe("123");
  expect(item.type).toBe("lost");
});
```

### Integration Tests (API)

```typescript
// Test API endpoints
test("POST /api/items creates item", async () => {
  const response = await request(app)
    .post("/api/items")
    .send({
      type: "lost",
      title: "Phone",
      // ...
    });
  
  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
});
```

### E2E Tests (Full Flow)

```typescript
// Test entire user journey
test("User can report lost item and submit claim", async () => {
  // 1. Navigate to /report
  // 2. Fill out form
  // 3. Upload images
  // 4. Submit
  // 5. Navigate to item detail
  // 6. Submit claim
  // 7. Check /my-claims
  // 8. Verify claim appears
});
```

---

## 🔍 Debugging Tips

### View Database Queries

All queries are logged:
```
Executed query { 
  text: 'SELECT * FROM items WHERE type = $1',
  duration: 45,
  rows: 12
}
```

### Check API Responses

Use browser DevTools Network tab:
1. Open DevTools (F12)
2. Click Network tab
3. Make request
4. Click request to see details

### Common Issues

**Database not connecting:**
- Check DATABASE_URL in .env
- Verify Neon database is active
- Check firewall/network

**Images not uploading:**
- Check CLOUDINARY_URL in .env
- Verify file size < 10MB
- Check browser console for errors

**Claims not showing:**
- Check email matches exactly
- Verify claims exist in database
- Check browser console for API errors

---

## 📚 Key Concepts Explained

### What is REST API?

**RE**presentational **S**tate **T**ransfer

Rules for how client and server communicate:
- Use HTTP methods (GET, POST, PUT, DELETE)
- URLs represent resources (nouns, not verbs)
- Stateless (each request is independent)

Examples:
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/123` - Get item #123
- `PATCH /api/items/123` - Update item #123
- `DELETE /api/items/123` - Delete item #123

### What is SPA (Single Page Application)?

Traditional website:
```
Click link → Browser requests new HTML → Server sends new page → Full reload
```

SPA:
```
Click link → React Router updates URL → Render new component → No reload
```

Benefits:
- Instant navigation (no page reload)
- Better user experience
- Feels like a native app

### What is Middleware?

Code that runs BEFORE your route handler:

```typescript
Request → Middleware 1 → Middleware 2 → Route Handler → Response
           ↓                ↓                ↓
         CORS             JSON Parser      Your code
```

Example:
```typescript
// Middleware that logs every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // Pass to next middleware
});
```

### What is UUID?

**U**niversally **U**nique **Id**entifier

Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Why use UUID instead of 1, 2, 3...?
- Can generate on client without asking server
- No conflicts when merging databases
- Harder to guess (more secure)
- Works in distributed systems

---

## 🎯 Summary

This application uses a **3-tier architecture**:

1. **Presentation Layer** (React)
   - What users see and interact with
   - Handles UI, forms, navigation

2. **Application Layer** (Express)
   - Business logic
   - Validates data
   - Coordinates between frontend and database

3. **Data Layer** (PostgreSQL + Cloudinary)
   - Stores structured data (items, claims)
   - Stores images

Data flows through this pipeline:
```
User Input → React Component → API Request → Express Route → Database Query → Database → Response
```

Everything is connected through HTTP/HTTPS requests with JSON data.

---

**Questions?** Check the README.md or create an issue on GitHub!
