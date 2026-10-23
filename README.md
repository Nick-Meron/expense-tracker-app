# Expense Tracker App

Mobile app for tracking personal income and expenses. Built with React Native (Expo) and connected to a Laravel REST API.

Backend repository: [expense-tracker-api](https://github.com/Nick-Meron/expense-tracker-api)

## Features

- Register, log in and log out
- Stays logged in after the app is closed (token kept in secure device storage)
- Monthly dashboard with balance, total income and total spent
- Spending split shown as one stacked bar, with a percentage breakdown by category
- Transactions grouped by day (Today, Yesterday, then the date)
- Add income and expense transactions with category, amount, note and date
- Create new categories directly from the add form
- Browse previous and next months
- Hold a transaction to delete it, pull down to refresh
- Configurable currency symbol

## Design

- One typeface, Bricolage Grotesque, with hierarchy through size and weight
- Deep green panel for the balance, a pale background for everything else, and one saffron accent for the main action
- Category colors stay the same across the bar, the legend, the list and the form
- Plain-language messages: errors say what went wrong and what to do

## Tech stack

- React Native with Expo (SDK 57)
- JavaScript
- expo-secure-store for storing the login token
- expo-font with Google Fonts (Bricolage Grotesque)
- Laravel 12 REST API with MySQL as the backend

## Project structure

```
App.js                                 Fonts, login state and screen switching
src/config.js                          API address and currency symbol
src/theme.js                           Colors, fonts and category colors
src/format.js                          Amount formatting
src/api.js                             Helper for calling the API
src/screens/LoginScreen.js             Login and register
src/screens/HomeScreen.js              Balance, spending split and transaction list
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

3. Open `src/config.js` and set your IP address and, if you want, a currency symbol:

```js
   export const API_URL = 'http://YOUR-IP-ADDRESS:8000/api';
   export const CURRENCY = 'Rs';
```

   Leave `CURRENCY` as an empty string to show plain numbers.

4. Start the backend with `php artisan serve --host=0.0.0.0 --port=8000`.

5. Start the app:

```
   npx expo start
```

6. Sign in to Expo Go with your Expo account. Make sure your phone and computer are on the same Wi-Fi, then scan the QR code (Camera app on iPhone or iPad, Expo Go on Android).

If the app says it cannot reach the server, check the IP address in `src/config.js` (it changes when you switch networks) and check that the backend is running.

## Notes

- Built as a portfolio project to practise mobile development, API integration, token authentication and interface design.
- Tested on a physical iPad using Expo Go.