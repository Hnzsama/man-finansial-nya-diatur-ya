# Finance App — API Reference

> Referensi API lengkap untuk integrasi Expo mobile app. Semua request mengembalikan response dalam format JSON.

---

## Base URL

```
https://your-domain.com/api
```

---

## Authentication

### 1. Login
Mengotentikasi user dan mengembalikan token.

- **URL**: `POST /login`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password",
    "device_name": "Expo Client (iOS)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "token": "1|qWd8kPjXy...",
    "user": {
      "id": 1,
      "name": "Akuma",
      "email": "user@example.com"
    }
  }
  ```

---

### 2. Get User Profile
Mendapatkan info user yang sedang login menggunakan Bearer token.

- **URL**: `GET /user`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Success Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Akuma",
    "email": "user@example.com"
  }
  ```

---

### 3. Logout
Mencabut token yang sedang digunakan.

- **URL**: `POST /logout`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Token revoked successfully."
  }
  ```

---

## Dashboard Summary

### Get Dashboard Data
Mengambil semua metrik dashboard dalam 1 request.

- **URL**: `GET /dashboard`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Success Response (200 OK)**:
  ```json
  {
    "total_balance": 15000000.00,
    "income_this_month": 5000000.00,
    "expense_this_month": 2500000.00,
    "net_this_month": 2500000.00,
    "wallets": [],
    "recent_transactions": [],
    "budget_status": [
      {
        "category": {},
        "spent": 120000.00,
        "budget": 500000.00,
        "percentage": 24.0
      }
    ]
  }
  ```

---

## Resource: Wallets

### 1. List Wallets
- **URL**: `GET /wallets`
- **Success Response (200 OK)**: Array of Wallet objects.

### 2. Create Wallet
- **URL**: `POST /wallets`
- **Request Body**:
  ```json
  {
    "name": "Bank Jago",
    "type": "bank",
    "opening_balance": 10000000,
    "icon": "bank",
    "color": "#6366F1",
    "notes": "Rekening utama"
  }
  ```
- **Success Response (201 Created)**: Created Wallet object.

### 3. Update Wallet
- **URL**: `PUT /wallets/{id}`
- **Request Body**: Same as above (except `opening_balance` which is read-only).

### 4. Delete Wallet
- **URL**: `DELETE /wallets/{id}`

---

## Resource: Transactions

### 1. List Transactions
- **URL**: `GET /transactions`
- **Query Parameters**:
  - `start_date` (YYYY-MM-DD)
  - `end_date` (YYYY-MM-DD)
  - `wallet_id` (integer)
  - `type` (`income` | `expense`)
  - `category_id` (integer)
  - `search` (string)
  - `page` (integer)
- **Success Response (200 OK)**: Paginated response.
  ```json
  {
    "data": [
      {
        "id": 1,
        "wallet_id": 2,
        "category_id": 3,
        "type": "expense",
        "amount": "15000.00",
        "date": "2026-07-16",
        "notes": "Beli kopi",
        "wallet": {},
        "category": {}
      }
    ],
    "links": { "first": "...", "last": "...", "prev": null, "next": null },
    "meta": { "current_page": 1, "last_page": 1, "per_page": 50, "total": 1 }
  }
  ```

### 2. Create Transaction
- **URL**: `POST /transactions`
- **Request Body**:
  ```json
  {
    "wallet_id": 1,
    "category_id": 2,
    "type": "expense",
    "amount": 25000,
    "date": "2026-07-16",
    "notes": "Makan siang"
  }
  ```
- **Success Response (201 Created)**: Created Transaction object.

### 3. Update Transaction
- **URL**: `PUT /transactions/{id}`

### 4. Delete Transaction
- **URL**: `DELETE /transactions/{id}`

---

## Resource: Categories

- **Endpoints**: `GET /categories`, `POST /categories`, `GET /categories/{id}`, `PUT /categories/{id}`, `DELETE /categories/{id}`
- **Post Body**:
  ```json
  {
    "name": "Food & Beverage",
    "type": "expense",
    "icon": "utensils",
    "color": "#EF4444",
    "parent_id": null,
    "budget_amount": 1500000,
    "budget_period": "monthly"
  }
  ```

---

## Resource: Goals

- **Endpoints**: `GET /goals`, `POST /goals`, `GET /goals/{id}`, `PUT /goals/{id}`, `DELETE /goals/{id}`
- **Post Body**:
  ```json
  {
    "name": "New Laptop",
    "target_amount": 15000000,
    "current_amount": 2000000,
    "deadline": "2026-12-31",
    "notes": "MacBook Pro M4",
    "icon": "laptop",
    "color": "#3B82F6"
  }
  ```

---

## Resource: Debts

- **Endpoints**: `GET /debts`, `POST /debts`, `GET /debts/{id}`, `PUT /debts/{id}`, `DELETE /debts/{id}`
- **Post Body**:
  ```json
  {
    "name": "John Doe",
    "type": "receivable",
    "amount": 500000,
    "due_date": "2026-08-01",
    "notes": "Pinjam uang bensin"
  }
  ```

---

## Resource: Assets

- **Endpoints**: `GET /assets`, `POST /assets`, `GET /assets/{id}`, `PUT /assets/{id}`, `DELETE /assets/{id}`
- **Post Body**:
  ```json
  {
    "name": "Logam Mulia 10g",
    "type": "gold",
    "value": 14000000,
    "notes": "Simpan di safe deposit box"
  }
  ```

---

## Resource: Subscriptions

- **Endpoints**: `GET /subscriptions`, `POST /subscriptions`, `GET /subscriptions/{id}`, `PUT /subscriptions/{id}`, `DELETE /subscriptions/{id}`
- **Post Body**:
  ```json
  {
    "name": "Netflix Premium",
    "amount": 186000,
    "cycle": "monthly",
    "next_billing_date": "2026-08-01",
    "notes": "Auto-debit CC",
    "wallet_id": 1,
    "category_id": 4
  }
  ```
