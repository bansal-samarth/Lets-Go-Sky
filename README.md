# Let's Go Sky - Flight Booking Website

<div align="center">

![image](https://github.com/user-attachments/assets/90112f78-b1f4-4123-8355-212ce5f2c381)

*Seamlessly search, book, and manage your flights with Let's Go Sky.*

<div align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  </a>
  <a href="https://jwt.io/">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  </a>
  <a href="https://www.apache.org/licenses/LICENSE-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge&logo=apache&logoColor=white" alt="Apache 2.0 License"/>
  </a>
</div>

</div>

## 🚀 Live Demo

**📱 Frontend:** [https://lets-go-sky.vercel.app/](https://lets-go-sky.vercel.app/)

**⚙️ Backend API:** [https://lets-go-sky.onrender.com/api](https://lets-go-sky.onrender.com/api)

---

## 📋 Overview

Let's Go Sky is a full-stack flight-booking platform built with Next.js on the front end and Node.js/Express on the back end. It offers:

* **Intuitive flight search** (origin, destination, date)
* **Dynamic pricing engine** that adapts based on user interactions
* **Seamless booking flow** with PDF e-ticket generation
* **Built-in user wallet** for quick, hassle-free payments
* **Secure JWT authentication** and robust booking management

Our goal: deliver a sleek, responsive UX backed by scalable, maintainable architecture.

---

## ✨ Key Features



### Intelligent Flight Search

* Airport auto-suggest from external APIs (e.g., AirLabs)

* **City & Airport autosuggestion using Amadeus API**: Type any part of a city or airport name/code to see live suggestions, complete with IATA codes and types (City or Airport).

* Filter by date, time, price, stops



### Dynamic Pricing Engine

* Price increase of 10% after 3 views in 5 minutes

* Automatic price reset after 10 minutes


### Seamless Booking & E-Tickets

* Book for one or multiple passengers

* Instant PDF ticket generation via **pdfkit**


### Integrated Wallet

* Default starting balance (e.g., ₹50,000)

* Deducted automatically at booking time


### Secure Authentication

* JWT-based registration and login

* Password hashing with **bcryptjs**


### Booking Management

* View upcoming, past, and cancelled bookings

* Cancel flights and refund to wallet


### Responsive UI & Animations

* Next.js App Router + Tailwind CSS
  
* Framer Motion for smooth transitions

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│                                 │      │                                 │
│        Next.js Frontend         │      │       Node.js Backend           │
│                                 │      │                                 │
├─────────────────────────────────┤      ├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │      │ ┌─────────────┐ ┌─────────────┐ │
│ │   UI Layer  │ │ State Mgmt  │ │      │ │ API Routes  │ │ PDF Service │ │
│ └─────────────┘ └─────────────┘ │◄────►│ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ │      │ ┌─────────────┐ ┌─────────────┐ │
│ │Search Forms │ │Booking Flow │ │      │ │Dynamic Price│ │Data Service │ │
│ └─────────────┘ └─────────────┘ │      │ └─────────────┘ └─────────────┘ │
│                                 │      │                                 │
└─────────────────────────────────┘      └──────────────┬──────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────────┐
                                         │                                 │
                                         │        MongoDB Database         │
                                         │                                 │
                                         └──────────────┬──────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────────┐
                                         │                                 │
                                         │     AirLabs External API        │
                                         │                                 │
                                         └─────────────────────────────────┘
```

---

## 🔄 Core Workflows

### 1. Flight Search & Pricing

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Enter origin, destination, date  
    F->>B: POST /api/flights/search  
    B->>B: Apply dynamic pricing logic  
    B->>D: Query matching flights  
    D-->>B: Return flight data  
    B-->>F: Return flights with updated prices  
    F->>U: Display results
```

### 2. Booking & Ticket Generation

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Select flight, enter passenger details  
    F->>B: POST /api/bookings  
    B->>D: Validate seats & wallet  
    alt Sufficient
      B->>D: Create booking record  
      B->>D: Update wallet & seats  
      B-->>F: Return confirmation + PNR  
      F->>U: Show PNR, download option  
      U->>F: Click "Download Ticket"  
      F->>B: GET /api/bookings/:id/ticket  
      B->>B: Generate PDF (pdfkit)  
      B-->>F: Stream PDF  
      F->>U: Prompt download  
    else Insufficient
      B-->>F: Return error
      F->>U: Show error
    end
```

---

## 🚀 Local Development

### Prerequisites

* Node.js v18+ & npm v8+
* MongoDB (local or Atlas)
* Git

### Backend Setup

1. Clone & enter `server/`
2. Install dependencies

   ```bash
   npm install
   ```
3. Create `.env`:

   ```env
   PORT=5000
   MONGODB_URI=<your_mongo_uri>
   JWT_SECRET=<your_jwt_secret>
   NODE_ENV=development
   ```
4. (Optional) Seed data: `npm run data:import`
5. Start server: `npm run dev`

### Frontend Setup

1. Enter `client/`
2. Install deps: `npm install`
3. Create `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   AMADEUS_CLIENT_ID=<your_amadeus_api_key>
   AMADEUS_CLIENT_SECRET=<your_amadeus_secret_key>
   ```
4. Start dev server: `npm run dev`
5. Visit `http://localhost:3000`

> **Note:** After adding autosuggestion, ensure your Amadeus API credentials are set as above.

---

## 📝 API Endpoints

| Method | Path                   | Description                 | Auth Required    |
| ------ | ---------------------- | --------------------------- | ---------------- |
| POST   | `/users/register`      | Register new user           | No               |
| POST   | `/users/login`         | Authenticate & retrieve JWT | No               |
| GET    | `/users/profile`       | Get user profile            | Yes              |
| GET    | `/users/wallet`        | Get wallet balance          | Yes              |
| POST   | `/flights/search`      | Search available flights    | No (opt. userId) |
| GET    | `/flights/:id`         | Get flight details          | No (opt. userId) |
| POST   | `/bookings`            | Create a new booking        | Yes              |
| GET    | `/bookings`            | List user's bookings        | Yes              |
| GET    | `/bookings/:id`        | Get booking details         | Yes              |
| PUT    | `/bookings/:id/cancel` | Cancel a booking            | Yes              |
| GET    | `/bookings/:id/ticket` | Download e-ticket PDF       | Yes              |

---

## 🖼️ Screenshots


<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f9eefdae-bb63-404b-bded-2e71f6d4fc8c" alt="Welcome Page" width="450"/><br>
      Welcome Page
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/258d21c3-ffe9-4ea6-b2cf-510631ca6309" alt="Login Page" width="450"/><br>
      Login Page
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/7df17749-95a3-442c-9443-a1fe0cf831d6" alt="Home Page" width="450"/><br>
      Home Page
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/37ad3c0a-d1bf-4c67-89b2-64de60021774" alt="Search Page" width="450"/><br>
      Search Page
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/030d9e56-ce24-49c4-b4df-fb32eb65f8b2" alt="Booking Modal" width="450"/><br>
      Booking Modal
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/186a9326-fa24-40c3-96dc-411809d3e408" alt="Confirm Page" width="450"/><br>
      Confirm Page
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/8dcebb72-97b6-47d8-97d6-258444d96e83" alt="e-Ticket PDF" width="450"/><br>
      e-Ticket PDF
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/3e27ce45-a575-4744-9e2b-a870d576b7c9" alt="My Bookings Page" width="450"/><br>
      My Bookings Page
    </td>
  </tr>
</table>


---

## 🚀 Future Enhancements

* User profile editing & avatars
* Advanced flight filters (airline, stops, duration)
* Interactive seat selection
* Wallet top-up via payment gateway
* Admin dashboard & analytics
* Email notifications & reminders
* "Forgot Password" flow
* Real-time flight status integration
* Internationalization (i18n)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m "Add feature"`
4. Push branch: `git push origin feature/YourFeature`
5. Open a pull request

We welcome issues and pull requests! Please follow the existing code style and include tests where appropriate.

---

## 📄 License

This project is licensed under the **Apache License 2.0**.
See the full text in [LICENSE](LICENSE).

---

<p align="center">
  Built with ❤️ by Samarth Bansal  
  <br/>
  <a href="[https://github.com/bansal-samarth]">GitHub</a> • <a href="[https://www.linkedin.com/in/samarth--bansal/]">LinkedIn</a>
</p>
