# Lost & Found Database Schema (3NF - Third Normal Form)

## Overview

This document defines the database schema for the TTU Lost & Found application, normalized according to Third Normal Form (3NF) principles. The schema is designed to be implemented with PostgreSQL via Neon.

## Normalization Principles Applied

### Third Normal Form (3NF) Requirements:
1. **First Normal Form (1NF)**: All attributes contain atomic (indivisible) values
2. **Second Normal Form (2NF)**: All non-key attributes are fully dependent on the primary key
3. **Third Normal Form (3NF)**: No non-key attribute is dependent on another non-key attribute

## Database Tables

### 1. Users Table
Stores information about users (both reporters and claimants)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  university_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_university_id (university_id)
);
```

**Attributes:**
- `id`: Unique identifier (UUID)
- `email`: User's email address (required, unique)
- `name`: User's full name (required)
- `phone`: Optional phone number
- `university_id`: Optional student/staff ID
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last update

**3NF Justification:**
- Contains only atomic values
- Fully dependent on primary key (id)
- No transitive dependencies

---

### 2. Items Table
Stores information about lost or found items

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('lost', 'found')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  item_date DATE NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'returned', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_item_type (item_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

**Attributes:**
- `id`: Unique identifier (UUID)
- `reporter_id`: Foreign key to users table (required)
- `item_type`: Type of item ('lost' or 'found')
- `title`: Item name/title (required)
- `description`: Detailed description (required)
- `location`: Where item was lost/found (required)
- `item_date`: Date of loss/discovery (required)
- `image_url`: URL to item image
- `status`: Current status of item
- `created_at`: When item was reported
- `updated_at`: Last update timestamp

**3NF Justification:**
- All attributes are atomic
- All non-key attributes are fully dependent on primary key
- No transitive dependencies (reporter_id is necessary to identify who reported the item)

---

### 3. Verification Questions Table
Stores verification questions for each item (1 to many relationship)

```sql
CREATE TABLE verification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(item_id, question_order),
  INDEX idx_item_id (item_id)
);
```

**Attributes:**
- `id`: Unique identifier (UUID)
- `item_id`: Foreign key to items table (required)
- `question_text`: The verification question (required)
- `question_order`: Order of question (1, 2, 3, etc.)
- `created_at`: When question was created

**3NF Justification:**
- Separated into own table to avoid repeating groups
- Each question is uniquely identified
- All attributes depend on the primary key
- Follows 1NF by storing one question per row

---

### 4. Claims Table
Stores claims made on items

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  claimant_id UUID NOT NULL,
  message TEXT NOT NULL,
  proof_image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_item_id (item_id),
  INDEX idx_claimant_id (claimant_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

**Attributes:**
- `id`: Unique identifier (UUID)
- `item_id`: Foreign key to items table (required)
- `claimant_id`: Foreign key to users table (required)
- `message`: Claimant's message explaining their claim
- `proof_image_url`: Optional image as proof
- `status`: Status of the claim
- `created_at`: When claim was made
- `updated_at`: Last update timestamp

**3NF Justification:**
- Separated claim data from items for proper relationship management
- All attributes fully depend on the primary key
- Each claim is uniquely identified
- No redundant information

---

### 5. Claim Answers Table
Stores answers to verification questions for each claim

```sql
CREATE TABLE claim_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES verification_questions(id) ON DELETE CASCADE,
  UNIQUE(claim_id, question_id),
  INDEX idx_claim_id (claim_id),
  INDEX idx_question_id (question_id)
);
```

**Attributes:**
- `id`: Unique identifier (UUID)
- `claim_id`: Foreign key to claims table (required)
- `question_id`: Foreign key to verification_questions table (required)
- `answer_text`: The answer provided (required)
- `is_correct`: Whether answer is correct (evaluated by admin)
- `created_at`: When answer was submitted

**3NF Justification:**
- Separated into own table to avoid repeating groups
- Each answer is uniquely identified by claim and question
- All attributes depend on the primary key
- Links claims to their verification answers properly

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ phone       │
│ university_id│
│ created_at  │
│ updated_at  │
└──────┬──────┘
       ���
       │ 1:N (reporter_id)
       │ 1:N (claimant_id)
       │
    ┌──┴──────────────────┐
    │                     │
    ▼                     ▼
┌─────────────┐      ┌──────────────┐
│    Items    │      │    Claims    │
├─────────────┤      ├──────────────┤
│ id (PK)     │◄─────│ item_id (FK) │
│ reporter_id │      │ claimant_id  │
│ item_type   │      │ message      │
│ title       │      │ proof_image  │
│ description │      │ status       │
│ location    │      │ created_at   │
│ item_date   │      │ updated_at   │
│ image_url   │      └──────┬───────┘
│ status      │             │
│ created_at  │             │ 1:N
│ updated_at  │             │
└──────┬──────┘             │
       │                    │
       │ 1:N                │
       │                    │
       ▼                    ▼
┌──────────────────────┐  ┌────────────────┐
│Verification Questions│  │  Claim Answers │
├──────────────────────┤  ├────────────────┤
│ id (PK)              │  │ id (PK)        │
│ item_id (FK)         │  │ claim_id (FK)  │
│ question_text        │  │ question_id(FK)│
│ question_order       │  │ answer_text    │
│ created_at           │  │ is_correct     │
└──────────────────────┘  │ created_at     │
                          └────────────────┘
```

---

## Key Design Decisions

### 1. UUID Primary Keys
- Used UUID instead of auto-increment integers for better distributed system scalability
- Allows generation on the client side if needed

### 2. Separation of Concerns
- **Users**: Centralized user management
- **Items**: Separated lost/found items with proper categorization
- **Verification Questions**: Separated to support variable number of questions per item
- **Claims**: Track all claims independently
- **Claim Answers**: Link answers to specific claims and questions

### 3. Status Fields
- Used ENUM-like CHECK constraints for data integrity
- Items: `active`, `claimed`, `returned`, `closed`
- Claims: `pending`, `approved`, `rejected`, `withdrawn`

### 4. Foreign Keys with ON DELETE CASCADE
- Ensures referential integrity
- Cascading deletes when users or items are removed
- Prevents orphaned records

### 5. Indexes
- Created on frequently queried columns (FK, status, dates)
- Improves query performance for filtering and sorting

---

## SQL Migration Scripts

### Create All Tables

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  university_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_university_id ON users(university_id);

-- Items Table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('lost', 'found')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  item_date DATE NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'returned', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_items_reporter_id ON items(reporter_id);
CREATE INDEX idx_items_item_type ON items(item_type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Verification Questions Table
CREATE TABLE verification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(item_id, question_order)
);

CREATE INDEX idx_verification_questions_item_id ON verification_questions(item_id);

-- Claims Table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  claimant_id UUID NOT NULL,
  message TEXT NOT NULL,
  proof_image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_claims_item_id ON claims(item_id);
CREATE INDEX idx_claims_claimant_id ON claims(claimant_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at);

-- Claim Answers Table
CREATE TABLE claim_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES verification_questions(id) ON DELETE CASCADE,
  UNIQUE(claim_id, question_id)
);

CREATE INDEX idx_claim_answers_claim_id ON claim_answers(claim_id);
CREATE INDEX idx_claim_answers_question_id ON claim_answers(question_id);
```

---

## Query Examples

### Find all lost items by a specific user
```sql
SELECT * FROM items
WHERE reporter_id = $1 AND item_type = 'lost'
ORDER BY created_at DESC;
```

### Get item with all verification questions
```sql
SELECT i.*, vq.id as question_id, vq.question_text, vq.question_order
FROM items i
LEFT JOIN verification_questions vq ON i.id = vq.item_id
WHERE i.id = $1
ORDER BY vq.question_order;
```

### Get all claims for an item with answers
```sql
SELECT 
  c.id,
  c.claimant_id,
  u.name,
  u.email,
  c.message,
  c.status,
  ca.question_id,
  vq.question_text,
  ca.answer_text,
  ca.is_correct
FROM claims c
JOIN users u ON c.claimant_id = u.id
LEFT JOIN claim_answers ca ON c.id = ca.claim_id
LEFT JOIN verification_questions vq ON ca.question_id = vq.id
WHERE c.item_id = $1
ORDER BY c.created_at DESC, vq.question_order;
```

### Find items by location (search)
```sql
SELECT * FROM items
WHERE location ILIKE $1 OR title ILIKE $1 OR description ILIKE $1
AND status = 'active'
ORDER BY created_at DESC;
```

---

## Migration to Neon PostgreSQL

To use this schema with Neon:

1. Connect to your Neon database
2. Run the SQL migration scripts above
3. Update the application's database connection string to your Neon URL
4. Create TypeScript interfaces matching these tables
5. Implement query functions for each operation

## Performance Considerations

- Indexes on foreign keys improve JOIN performance
- Indexes on frequently filtered columns (status, type) improve search
- Indexes on date columns help with sorting and time-range queries
- Consider partitioning the `items` table by `item_type` for very large datasets
- Archive old closed items to a separate table after a period

---

## 3NF Compliance Summary

| Table | 1NF | 2NF | 3NF | Notes |
|-------|-----|-----|-----|-------|
| users | �� | ✓ | ✓ | All atomic values, fully dependent on PK |
| items | ✓ | ✓ | ✓ | Foreign key necessary to identify reporter |
| verification_questions | ✓ | ✓ | ✓ | Separated from items to eliminate repeating groups |
| claims | ✓ | ✓ | ✓ | Foreign keys identify related entities |
| claim_answers | ✓ | ✓ | ✓ | Separated to link answers to specific questions |

All tables comply with Third Normal Form, ensuring data integrity and minimizing redundancy.
