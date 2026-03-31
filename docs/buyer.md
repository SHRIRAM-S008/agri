
🔍 1. Browse Products — “Marketplace Engine”

🎯 Function:

Show all available crops/products to buyers

⸻

🔧 How it works internally:

Backend:
	•	API:

GET /products

	•	Query DB:

SELECT * FROM products 
WHERE status = 'available';

	•	Optional filters:

AND crop = 'tomato'
AND price <= 30
AND location = 'Tamil Nadu'


⸻

Frontend:
	•	Calls API
	•	Displays list as cards

Each card shows:
	•	Crop name
	•	Price
	•	Quantity
	•	Location

⸻

Extra logic:
	•	Pagination (load 10–20 items at a time)
	•	Search (by crop name)

⸻

👉 Flow:

Open page → API call → Fetch products → Apply filters → Display list


⸻

📄 2. Product Details — “Decision Page”

🎯 Function:

Show full info of a selected product

⸻

Backend:

API:

GET /products/:id

Returns:

{
  "crop": "Tomato",
  "quantity": 1000,
  "price": 20,
  "farmer": "F123",
  "quality": "Grade A"
}


⸻

Frontend shows:
	•	Full product info
	•	Farmer details
	•	Quality grade
	•	Availability

⸻

Extra feature:
	•	Load traceability data:

GET /trace/:productId


⸻

Actions:
	•	Make Offer
	•	Buy Now

⸻

👉 Flow:

Click product → Fetch details → Display → User decides action


⸻

💸 3. Make Offer — “Negotiation Logic”

🎯 Function:

Let buyer propose a price

⸻

Backend:

API:

POST /offers

Payload:

{
  "buyerId": "B101",
  "productId": "P500",
  "offerPrice": 22,
  "quantity": 500
}


⸻

What happens:
	1.	Offer saved in DB
	2.	Status = pending
	3.	Notification sent to farmer

⸻

DB Table:

{
  "offerId": "O900",
  "status": "pending"
}


⸻

Important logic:
	•	Check:
	•	Quantity ≤ available
	•	Product still active

⸻

👉 Flow:

Enter price → Submit → Save → Notify farmer


⸻

📦 4. Orders — “Execution System”

🎯 Function:

Track confirmed deals

⸻

When order is created:

👉 ONLY after farmer accepts offer

⸻

Backend:

API:

POST /orders

Order structure:

{
  "orderId": "ORD001",
  "buyerId": "B101",
  "productId": "P500",
  "status": "confirmed"
}


⸻

Status lifecycle:

confirmed → packed → in_transit → delivered


⸻

Frontend shows:
	•	Order list
	•	Status
	•	Delivery info

⸻

API:

GET /orders?buyerId=B101


⸻

👉 Flow:

Offer accepted → Order created → Status updates → Buyer tracks


⸻

🔄 Full Functional Flow (Connected)

Browse Products
      ↓
Select Product
      ↓
View Details
      ↓
Make Offer
      ↓
Farmer Accepts
      ↓
Order Created
      ↓
Track Order


⸻

🧠 Core System Logic (Important)
	•	Browse = Read data
	•	Details = Deep read
	•	Offer = Create negotiation
	•	Orders = Track execution

⸻

⚡ Real Developer Tips
	•	Use REST APIs cleanly
	•	Keep status fields consistent (pending, accepted, etc.)
	•	Always validate:
	•	Quantity
	•	Availability
