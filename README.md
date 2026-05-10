# ExpertBook — Real-Time Expert Session Booking System

A full-stack real-time expert session booking platform built with React, Node.js, Express, MongoDB, and Socket.io. Book sessions with top experts, get real-time slot updates, and manage everything from a powerful admin panel.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server and REST API |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | Real-time slot updates |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Passport.js | Google OAuth 2.0 |
| express-validator | Request validation |
| dotenv | Environment variables |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| React Router DOM | Client-side routing |
| Axios | HTTP requests |
| Socket.io Client | Real-time connection |
| React Hook Form | Form handling |
| Zod | Form validation |
| React Hot Toast | Notifications |

---

## System Architecture

```mermaid
graph TB
    subgraph CLIENT["CLIENT LAYER"]
        UB["🖥️ User Browser\nReact + Zustand"]
        AB["🛡️ Admin Browser\nAdmin Panel"]
        GO["🔐 Google OAuth\npassport-google-oauth20"]
    end

    subgraph BACKEND["BACKEND LAYER — Node.js + Express (Port 5000)"]
        ER["Express Router /api/v1/*"]

        subgraph MW["Middleware"]
            AM["protect()\nJWT verify"]
            AD["adminOnly()\nrole === admin"]
            EH["errorHandler()\nglobal errors"]
        end

        subgraph CTRL["Controllers"]
            AC["AuthController\nregister · login · googleAuth · getMe"]
            EC["ExpertController\ngetExperts · getExpertById · create · delete"]
            BC["BookingController\ncreateBooking atomic · getMyBookings · updateStatus"]
        end

        SIO["⚡ Socket.io Server\nslotHandler.js"]
    end

    subgraph DB["DATA LAYER — MongoDB Atlas Replica Set"]
        subgraph MODELS["Models"]
            UM[("User\nname · email · password\ngoogleId · role · avatar")]
            EM[("Expert\nname · category · experience\nrating · availableSlots")]
            BM[("Booking\nexpertId · userId · date\ntimeSlot · status")]
        end

        subgraph IDX["Indexes"]
            TI["Text Index\nname + bio full-text search"]
            CI["Category Index\nfast category filter"]
            BI["Compound Unique Index\nexpertId + date + timeSlot"]
            EI["Email Index\nmy bookings lookup"]
        end
    end

    subgraph RT["REALTIME LAYER — Socket.io Events"]
        SE["slotBooked\nbroadcast to all clients"]
        ST["bookingStatusUpdated\nbroadcast to user"]
        RM["joinExpert room\nleaveExpert room"]
    end

    UB -->|"REST API calls"| ER
    UB -->|"WebSocket"| SIO
    AB -->|"REST API calls"| ER
    GO -->|"OAuth2 callback"| ER

    ER --> AM
    ER --> AD
    AM --> AC
    AM --> EC
    AM --> BC
    AD --> BC
    AC --> EH
    EC --> EH
    BC --> EH

    AC --> UM
    EC --> EM
    BC --> BM
    BC --> EM

    EM --> TI
    EM --> CI
    BM --> BI
    BM --> EI

    BC -->|"emit slotBooked"| SIO
    BC -->|"emit statusUpdated"| SIO
    SIO --> SE
    SIO --> ST
    SIO --> RM
    SE -->|"instant slot disable"| UB
    ST -->|"status update"| UB
    RM --> UB
```

---

## WebSocket Real-Time Flow

```mermaid
sequenceDiagram
    participant UA as User A Browser
    participant UB as User B Browser
    participant SRV as Socket.io Server
    participant BC as BookingController
    participant DB as MongoDB

    UA->>SRV: connect()
    UB->>SRV: connect()

    UA->>SRV: emit("joinExpert", expertId)
    UB->>SRV: emit("joinExpert", expertId)

    Note over UA,UB: Both users viewing same expert detail page

    UA->>BC: POST /api/v1/bookings
    BC->>DB: findOneAndUpdate atomic\n{isBooked: false} → {isBooked: true}
    DB-->>BC: slot locked successfully ✅
    BC->>SRV: io.emit("slotBooked",\n{expertId, date, timeSlot})

    SRV-->>UA: slotBooked event received
    SRV-->>UB: slotBooked event received

    Note over UA: Slot confirmed (green → blue)
    Note over UB: Slot instantly disabled (gray)\nNo page refresh needed

    UB->>BC: POST /api/v1/bookings (same slot)
    BC->>DB: findOneAndUpdate\nisBooked already true → returns null
    DB-->>BC: null ❌
    BC-->>UB: 409 Slot already booked

    Note over UA,UB: Admin updates booking status

    BC->>SRV: io.emit("bookingStatusUpdated",\n{bookingId, status, userId})
    SRV-->>UA: bookingStatusUpdated event
    Note over UA: My Bookings page updates\ninstantly without refresh
```

---

## Race Condition Prevention Flow

```mermaid
flowchart TD
    A["Two users request\nsame slot simultaneously"] --> B["MongoDB atomic\nfindOneAndUpdate"]

    B --> C{"Guard condition:\nisBooked === false\nin query?"}

    C -->|"User A wins\ncondition matches"| D["Set isBooked: true\natomically at DB level"]
    C -->|"User B loses\nreturns null"| E["Null result\nslot already taken"]

    D --> F["Create Booking\ndocument in DB"]
    F --> G["Commit MongoDB\nTransaction"]
    G --> H["Emit slotBooked\nvia Socket.io"]
    H --> I["✅ 201 Booking Confirmed"]

    E --> J["Abort MongoDB\nTransaction"]
    J --> K["❌ 409 Slot Already Booked"]

    style I fill:#16a34a,color:#fff
    style K fill:#dc2626,color:#fff
    style D fill:#2563eb,color:#fff
    style E fill:#ea580c,color:#fff
    style B fill:#7c3aed,color:#fff
```

---

## Admin Dashboard Request Flow

```mermaid
flowchart LR
    subgraph ADMIN["Admin Browser"]
        AL["Admin Login"]
        AD["/admin\nDashboard"]
        AE["/admin/experts\nManage Experts"]
        AA["/admin/experts/add\nAdd Expert"]
        AB["/admin/bookings\nManage Bookings"]
    end

    subgraph GUARD["Route Guards"]
        AR["AdminRoute.jsx\nrole === admin check"]
        JW["protect()\nJWT verify"]
        RO["adminOnly()\nmiddleware"]
    end

    subgraph API["Admin API Endpoints"]
        G1["GET /experts\npagination + search + filter"]
        P1["POST /experts\ncreate expert + slots"]
        D1["DELETE /experts/:id\nremove expert"]
        G2["GET /bookings/all\nall bookings paginated"]
        P2["PATCH /bookings/:id/status\npending → confirmed → completed"]
    end

    subgraph DB["MongoDB Collections"]
        EX[("experts")]
        BK[("bookings")]
    end

    AL -->|"JWT token issued\nrole: admin"| AR
    AR -->|"role check passes"| AD
    AD --> AE
    AD --> AB
    AE --> AA

    AE -->|"fetch list"| G1
    AA -->|"create"| P1
    AE -->|"delete"| D1
    AB -->|"fetch all"| G2
    AB -->|"update status"| P2

    G1 --> JW
    P1 --> JW
    D1 --> JW
    G2 --> JW
    P2 --> JW

    JW --> RO
    RO --> EX
    RO --> BK

    P2 -->|"emit bookingStatusUpdated"| BK
```

---

## Database Schema

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        string googleId
        string avatar
        string authProvider
        boolean isVerified
        date createdAt
        date updatedAt
    }

    EXPERT {
        ObjectId _id PK
        string name
        string category
        number experience
        number rating
        string bio
        string avatar
        array availableSlots
        date createdAt
        date updatedAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId expertId FK
        ObjectId userId FK
        string name
        string email
        string phone
        string date
        string timeSlot
        string notes
        string status
        date createdAt
        date updatedAt
    }

    USER ||--o{ BOOKING : "makes"
    EXPERT ||--o{ BOOKING : "receives"
```

---

## API Endpoints

### Auth Routes `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login with email + password |
| `GET` | `/auth/me` | Protected | Get current logged in user |
| `GET` | `/auth/google` | Public | Redirect to Google OAuth consent |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback → JWT issued |

### Expert Routes `/api/v1/experts`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/experts` | Public | Get all experts (paginated + filtered) |
| `GET` | `/experts/:id` | Public | Get single expert with slots grouped by date |
| `POST` | `/experts` | Admin only | Create new expert with available slots |
| `DELETE` | `/experts/:id` | Admin only | Delete expert permanently |

### Booking Routes `/api/v1/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/bookings` | Protected | Create booking — atomic race condition safe |
| `GET` | `/bookings?email=` | Protected | Get my bookings by email |
| `GET` | `/bookings/all` | Admin only | Get all bookings paginated + filtered |
| `PATCH` | `/bookings/:id/status` | Admin only | Update booking status |

---

## Query Parameters

### `GET /api/v1/experts`
```
?page=1           page number (default: 1)
?limit=10         results per page (default: 10)
?search=john      full text search on name and bio
?category=Design  filter by category
```

### `GET /api/v1/bookings/all`
```
?page=1           page number (default: 1)
?limit=10         results per page (default: 10)
?status=pending   filter by status — pending / confirmed / completed
```

---

## Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `connect` | Client → Server | — | Client connects to socket server |
| `joinExpert` | Client → Server | `expertId` | Join expert room to receive slot updates |
| `leaveExpert` | Client → Server | `expertId` | Leave expert room on page unmount |
| `slotBooked` | Server → Client | `{expertId, date, timeSlot}` | Slot was booked — disable it instantly |
| `bookingStatusUpdated` | Server → Client | `{bookingId, status, userId}` | Admin updated booking status |
| `disconnect` | Client → Server | — | Client disconnects |

---

## Project Structure

```
expertbook/
├── backend/
│   ├── config/
│   │   └── db.js                    MongoDB connectDB function
│   ├── controllers/
│   │   ├── authController.js        register, login, googleAuth, getMe
│   │   ├── expertController.js      getExperts, getExpertById, create, delete
│   │   └── bookingController.js     createBooking atomic, getMyBookings, updateStatus
│   ├── middleware/
│   │   ├── authMiddleware.js        protect + adminOnly
│   │   └── errorHandler.js          global error handler
│   ├── models/
│   │   ├── schema.js                createSchema factory with default options
│   │   ├── User.js                  user schema + google auth + indexes
│   │   ├── Expert.js                expert schema + slots + text indexes
│   │   └── Booking.js               booking schema + compound unique index
│   ├── routes/
│   │   ├── authRoutes.js            auth + google passport routes
│   │   ├── expertRoutes.js          expert CRUD routes
│   │   └── bookingRoutes.js         booking routes
│   ├── socket/
│   │   └── slotHandler.js           socket.io room management
│   ├── .env
│   ├── .gitignore
│   └── server.js                    entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ExpertCard.jsx
        │   ├── Loader.jsx
        │   ├── ProtectedRoute.jsx
        │   └── AdminSidebar.jsx
        ├── hooks/
        │   └── useSocket.js          socket event hook for real-time slots
        ├── pages/
        │   ├── HomePage.jsx          expert listing + search + filter + pagination
        │   ├── ExpertDetailPage.jsx  expert detail + real-time slots
        │   ├── BookingPage.jsx       booking form with validation
        │   ├── MyBookingsPage.jsx    my bookings + real-time status
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── AuthSuccessPage.jsx   google oauth token handler
        │   └── admin/
        │       ├── AdminDashboard.jsx  stats overview + recent bookings
        │       ├── AdminExperts.jsx    manage + delete experts
        │       ├── AdminAddExpert.jsx  add expert + slot picker
        │       └── AdminBookings.jsx   all bookings + status update
        ├── services/
        │   ├── api.js                axios instance with interceptors
        │   └── socket.js             socket.io singleton instance
        ├── store/
        │   ├── authStore.js          auth zustand store with persist
        │   └── bookingStore.js       booking zustand store
        └── App.jsx                   all routes
```

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## Getting Started

### Prerequisites
```
Node.js v20.19.0 or higher
MongoDB Atlas account
Google Cloud Console project with OAuth credentials
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend Packages
```bash
npm install express mongoose dotenv cors socket.io express-validator jsonwebtoken bcryptjs passport passport-google-oauth20
npm install -D nodemon
```

### Frontend Packages
```bash
npm install axios socket.io-client zustand react-router-dom react-hot-toast react-hook-form @hookform/resolvers zod
npm install -D tailwindcss postcss autoprefixer
```

---

## Frontend Routes

```
PUBLIC
  /                       Expert listing — search + filter + pagination
  /experts/:id            Expert detail — real-time slots
  /login                  Login page
  /register               Register page
  /auth/success           Google OAuth redirect handler

PROTECTED (logged in users)
  /booking/:id            Booking form
  /my-bookings            My bookings with real-time status updates

ADMIN ONLY (role === admin)
  /admin                  Dashboard with stats overview
  /admin/experts          Manage + delete experts
  /admin/experts/add      Add new expert with slot picker
  /admin/bookings         All bookings + update status
```

---

## Key Design Decisions

### Atomic Slot Locking
Single `findOneAndUpdate` with `isBooked: false` as guard condition inside a MongoDB transaction. If the document is not found (returns null), the slot is already taken — no separate read needed, no window for a race condition.

### secondaryPreferred Read Routing
All search and listing queries use `.read("secondaryPreferred")` to hit MongoDB secondary replica nodes. Writes and booking operations always hit the primary. This keeps the primary free for consistency-critical operations.

### Socket.io Room System
Each expert has its own socket room (`joinExpert` / `leaveExpert`). When a slot is booked, the server broadcasts only to users in that expert's room — not to all connected clients.

### Compound Unique Index on Bookings
`{ expertId, date, timeSlot }` compound unique index at the database level acts as a second line of defense after the atomic update. Even if two bookings somehow made it through, MongoDB would reject the duplicate.

### Google Auth with partialFilterExpression
The `googleId` field uses `partialFilterExpression: { googleId: { $type: "string" } }` instead of `sparse: true`. This is the modern MongoDB approach — the unique index only applies when `googleId` is actually a string, so multiple local users with `googleId: null` never conflict.

---

## License

MIT