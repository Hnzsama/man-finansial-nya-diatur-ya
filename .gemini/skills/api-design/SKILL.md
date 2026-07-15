# API Rules

Gunakan RESTful API.

Contoh:

GET /wallets

POST /wallets

GET /wallets/{id}

PATCH /wallets/{id}

DELETE /wallets/{id}

---

Response:

{
  "data": {},
  "meta": {},
  "message": ""
}

---

Gunakan:

- Form Request validation
- API Resources
- Policy

Jangan mengembalikan data mentah model.