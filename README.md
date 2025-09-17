# Twitter(X) Clone Application

This is a Twitter(X) style social media application built with Vue.js and Node.js.

## Features

- User registration and login (username/password)
- Metamask wallet login option
- Post publishing and display
- Image upload functionality
- ETH wallet balance display
- Paginated browsing
- Profile pages
- Responsive design

## Technology Stack

### Frontend
- Vue.js 3
- Vue Router
- Vuex
- Axios
- Web3.js (for Metamask integration)

### Backend
- Node.js
- Express.js
- MySQL
- JWT authentication
- bcrypt password encryption

## Project Structure

```
groupProject/
├── frontend/                # Frontend Vue.js application
│   ├── public/              # Static resources
│   └── src/                 # Source code
│       ├── assets/          # Styles and images
│       ├── components/      # Vue components
│       ├── router/          # Router configuration
│       ├── store/           # Vuex state management
│       ├── utils/           # Utility functions
│       ├── views/           # Page components
│       ├── App.vue          # Main application component
│       └── main.js          # Entry file
├── backend/                 # Backend Node.js service
│   ├── config/              # Configuration files
│   ├── controllers/         # Controllers
│   ├── middleware/          # Middleware
│   ├── models/              # Data models
│   ├── routes/              # Routes
│   ├── utils/               # Utility functions
│   └── server.js            # Server entry
└── database/                # Database related files
    ├── schema.sql           # Database schema
    └── db.init.js           # Database initialization script
```

## Installation and Setup

### Prerequisites

- Node.js 14+
- MySQL 5.7+
- Web browser (Chrome or Firefox recommended)
- Metamask browser extension (optional, for Web3 login)

### Backend Setup

1. Create MySQL database:

```sql
CREATE DATABASE twitter_clone;
```

2. Configure environment variables:

Create a `.env` file in the `backend` directory with the following content:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=twitter_clone
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=86400
```

3. Initialize the database:

```bash
cd database
node db.init.js
```

4. Install dependencies and run the backend service:

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:3000`.

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run development server:

```bash
npm run serve
```

The frontend application will run on `http://localhost:8080`.

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/metamask/message` - Get Metamask signature message
- POST `/api/auth/metamask/verify` - Verify Metamask signature

### Posts

- GET `/api/posts` - Get all posts (with pagination)
- GET `/api/posts/:id` - Get single post
- POST `/api/posts` - Create new post (requires authentication)
  - Supports multipart/form-data for image upload
- DELETE `/api/posts/:id` - Delete post (requires authentication)

### Wallet

- GET `/api/wallet/balance/:address` - Get ETH wallet balance

### Users

- GET `/api/users/:id` - Get user information
- GET `/api/users/me` - Get current user information (requires authentication)
- GET `/api/users/:id/posts` - Get user posts

## License

MIT
