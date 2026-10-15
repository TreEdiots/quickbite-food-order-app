# QuickBite Food Ordering System

QuickBite is a full-stack food ordering application with a React + Vite frontend and an Express + MySQL backend. Customers can browse a menu, add items to a cart, place an order, and track the delivery status in real time.

## Features

- Browse food items by category
- Add items to the cart and adjust quantities
- Place customer orders with name, address, and phone number
- Automatically calculate order totals
- Track an order by ID and monitor its current status
- Update order status through the API
- Persist orders and order items in MySQL

## Tech Stack

- Frontend: React, Vite, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Testing: Jest (backend), Vitest (frontend)

## Project Structure

```text
food-order-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── orderController.js
│   ├── routes/
│   │   └── orderRoutes.js
│   ├── tests/
│   │   └── order.test.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── README.md
└── package-lock.json (if generated locally)
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- MySQL server installed and running
- A MySQL user with access to the local database

## Backend Setup

1. Open a terminal in the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Confirm the database configuration in `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=food_order_db
DB_PORT=3306
```

4. Start MySQL and ensure the database is available.
5. Run the backend server:

```bash
npm run dev
```

The backend will start on:

```text
https://food-order-backend-yvp4.onrender.com
```

The app creates the database and tables automatically if they do not already exist.

## Frontend Setup

1. Open a second terminal in the `frontend` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## API Endpoints

The backend exposes the following routes:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders` | Fetch all orders |
| GET | `/api/orders/:id` | Fetch one order and its items |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete an order |

### Order status values

- `1` = Order Received
- `2` = Preparing
- `3` = Out for Delivery
- `4` = Delivered

## Example Request Body

```json
{
  "customer_name": "John Doe",
  "address": "123 Main Street",
  "phone": "9876543210",
  "items": [
    {
      "item_name": "Classic Burger",
      "quantity": 2,
      "price": 149
    },
    {
      "item_name": "Crispy French Fries",
      "quantity": 1,
      "price": 99
    }
  ]
}
```

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Run frontend tests:

```bash
cd frontend
npm test
```

## Notes

- The frontend calls the backend at `https://food-order-backend-yvp4.onrender.com`.
- If MySQL is not running or the environment values are incorrect, the backend will fail to initialize.
- The app automatically creates the `food_order_db` database and the required `orders` and `order_items` tables when started.

## License

This project is for interview/demo purposes and is not configured for production deployment.
