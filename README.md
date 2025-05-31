# Bitespeed Identity Reconciliation API

This project implements the **Bitespeed Identity Reconciliation API challenge**.

It is designed to **identify and consolidate user identities** based on `email` and `phoneNumber`, handling multiple records and linking related contacts.

---

## Features

* ✅ Identify contacts using email or phone number
* ✅ Link secondary contacts to primary contact
* ✅ Avoid duplicate data and enforce link precedence
* ✅ MongoDB + Mongoose backend
* ✅ Express.js REST API

---

## Project Structure

```
.
├── src/                     # Source code directory
│   ├── config/
│   │   └── db.ts            # MongoDB connection setup
│   ├── controllers/
│   │   └── identityController.ts  # Core logic for handling identity reconciliation
│   ├── middleware/
│   │   ├── contactValidation.ts   # Request validation logic
│   │   └── errorHandler.ts        # Centralized error handling middleware
│   ├── models/
│   │   └── contactModel.ts        # Mongoose schema and model for Contact
│   ├── routes/
│   │   └── identityRoutes.ts      # Route definitions for `/identify`
│   ├── utils/
│   │   └── logger.ts              # Logger configuration (e.g., Winston or console-based)
|   ├── index.ts               # Entry file (can re-export others)
├── .env                     # Environment variables
├── .gitignore               # Files/folders ignored by Git
├── combined.log             # Combined log output
├── error.log                # Error-specific log output
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Locked versions of dependencies
├── README.md                # Project documentation (generated/maintained manually)
├── tsconfig.json            # TypeScript configuration

```

---

## Setup Instructions

### 1️⃣ Prerequisites

* Node.js (v16+)
* MongoDB (local or Atlas cluster)

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure MongoDB

In your `.env` file (or hardcoded in `server.ts`), set:

```
MONGODB_URI = <your-mongo-uri>
PORT = 3000
```

Make sure MongoDB is running.

---

### 4️⃣ Start the Server

```bash
npm run dev
```

The server will run on:

```
http://localhost:3000
```

---

## MongoDB Notes

Ensure the `contacts` collection **does NOT** have any invalid or legacy indexes like `id_1`.

To check indexes:

```bash
mongo
use bitespeed
db.contacts.getIndexes()
```

To drop a problematic index:

```bash
db.contacts.dropIndex("id_1")
```

---

## API Endpoint

### **POST /identify**

Identify or create a contact.

**Request body:**

```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
```

✅ You can provide either **email**, **phoneNumber**, or **both**.

---

### **Response Structure**

```json
{
  "contact": {
    "primaryContactId": "ObjectId",
    "emails": ["john@example.com", "other@example.com"],
    "phoneNumbers": ["1234567890", "9876543210"],
    "secondaryContactIds": ["ObjectId1", "ObjectId2"]
  }
}
```

* **primaryContactId** → main identity
* **emails** → all associated emails (no duplicates)
* **phoneNumbers** → all associated numbers (no duplicates)
* **secondaryContactIds** → IDs of all linked secondary contacts

---

## Testing 
Test the API endpoint on curl or Postman at: https://identityreconciliation-2.onrender.com
```json
curl -X POST https://identityreconciliation-2.onrender.com/identify \
-H "Content-Type: application/json" \
-d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```

---

## Logic Summary

1. **Check if email or phoneNumber exists** in any contact.
2. If no match → create a **new primary contact**.
3. If matches exist:

   * Link new info as **secondary** if needed.
   * Ensure **only one primary contact** (oldest).
   * Consolidate all related records.

---

## Error Handling

* 400 → If both `email` and `phoneNumber` are missing.
* 500 → For internal server errors.

---

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Types:** TypeScript

---

## Contributing

Pull requests are welcome!
Please open an issue first to discuss what you want to change.

---

## Contact
For questions or feedback, please contact:

**Email:** 99269dhruvpatel@gmail.com

**GitHub Issues:** https://github.com/dhruvpatel99269/IdentityReconciliation/issues

---
