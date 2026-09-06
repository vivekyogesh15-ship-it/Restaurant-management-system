# Anant Resto Frontend

This is the React frontend for the BCA-level Restaurant Management System demo.

## Features

- Register and login
- Add and delete menu items
- View and update table status
- Create orders with multiple food items
- Mark orders as Pending or Completed
- Generate a receipt with 5% GST and print it.

## Run the frontend

Open a terminal in this folder and run:

```powershell
npm install
npm run dev
```

Then open `http://localhost:5173` in a browser.

The backend must also be running in a separate terminal. Its API is expected at `http://localhost:5000`.

## Build check

```powershell
npm run build
npm run lint
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
