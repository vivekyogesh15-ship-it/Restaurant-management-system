# Anant Resto Restaurant Management System

A simple BCA-level restaurant management system demo with five modules:

1. Authentication
2. Menu Management
3. Table Management
4. Order Management
5. Billing and Receipt

## Requirements

- Node.js
- MongoDB running locally
- MongoDB Compass (optional, for viewing saved data)

## First-time setup

Create the backend environment file by copying `backend/.env.example` to `backend/.env`.
The default connection uses:

```text
mongodb://127.0.0.1:27017/restaurant_management
```

Install dependencies once in both folders:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

## Run the application

Keep two terminals open.

Backend terminal:

```powershell
cd backend
npm run dev
```

Frontend terminal:

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173` in a browser.

## Demo workflow

1. Register a test account and log in.
2. Add menu items from Menu.
3. Open Orders, select an available table and food items, then place an order.
4. Change the order status to Completed.
5. Open Billing, select the completed order, and view or print the receipt.
6. Finish the bill to make the table available again.

## Check the database

In MongoDB Compass, connect to `mongodb://127.0.0.1:27017` and refresh the database list.
The `restaurant_management` database should contain `users`, `menuitems`, `tables`, and `orders` collections after the related actions are performed.

## Verification commands

Frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Backend syntax checks:

```powershell
cd backend
node --check server.js
node --check routes/orderRoutes.js
```
