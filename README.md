# Expense Tracker App

Mobile app for tracking personal income and expenses. Built with React Native (Expo) and connected to a Laravel REST API.

Backend repository: [expense-tracker-api](https://github.com/Nick-Meron/expense-tracker-api)

## Features

- Register, log in and log out
- Stays logged in after the app is closed (token kept in secure device storage)
- Add income and expense transactions with category, amount, note and date
- Create new categories directly from the add form
- Monthly dashboard with total income, total expenses and balance
- Spending by category shown as bars
- Browse previous and next months
- Long-press a transaction to delete it
- Pull down to refresh

## Tech stack

- React Native with Expo (SDK 57)
- JavaScript
- expo-secure-store for storing the login token
- Laravel 12 REST API with MySQL as the backend

## Project structure

```
App.js                                 Login state and screen switching
src/config.js                          API address
src/api.js                             Helper for calling the API
src/screens/LoginScreen.js             Login and register
src/screens/HomeScreen.js              Summary, bars and transaction list
src/screens/AddTransactionScreen.js    Add transaction form
```

## Getting started

Requirements: Node.js, the [backend API](https://github.com/Nick-Meron/expense-tracker-api) running on your computer, and the free Expo Go app on your phone or tablet. You also need a free Expo account to sign in to Expo Go.

1. Clone the repository and install the dependencies:

```
   git clone https://github.com/Nick-Meron/expense-tracker-app.git
   cd expense-tracker-app
   npm install
```

2. Find your computer's local IP address (on Windows, run `ipconfig` and look for the IPv4 address under Wi-Fi).

3. Open `src/config.js` and put your IP address in:

```js
   export const API_URL = 'http://YOUR-IP-ADDRESS:8000/api';
```

4. Start the backend with `php artisan serve --host=0.0.0.0 --port=8000`.

5. Start the app:

```
   npx expo start
```

6. Sign in to Expo Go with your Expo account. Make sure your phone and computer are on the same Wi-Fi, then scan the QR code (Camera app on iPhone or iPad, Expo Go on Android).

If the app says it cannot reach the server, check the IP address in `src/config.js` (it can change when you switch networks) and check that the backend is running.

## Notes

- Built as a portfolio project to practise mobile development, API integration and token authentication.
- Tested on a physical iPad using Expo Go.