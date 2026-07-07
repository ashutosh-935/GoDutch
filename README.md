# GoDutch

A simple bill-splitting app built with the MERN stack. Split expenses with friends without creating accounts!

## Features

- 🚀 No account needed - just create a group and share the link
- 📱 Responsive design for mobile and desktop
- 💰 Add members, track expenses, and calculate balances
- 🎨 Clean, modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- CORS

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd GoDutch
```

2. Set up the backend:
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. Set up the frontend:
```bash
cd ../client
npm install
cp .env.example .env
# Edit .env if needed
```

### Running the App

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the backend server:
```bash
cd server
npm start
```

3. Start the frontend dev server:
```bash
cd client
npm run dev
```

4. Open your browser and go to `http://localhost:5173`

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/godutch
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repo
4. Set environment variables
5. Deploy!

### MongoDB Atlas
1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Update MONGODB_URI in your backend .env

## API Endpoints

### Groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:groupId` - Get group details

### Members
- `GET /api/groups/:groupId/members` - Get all members
- `POST /api/groups/:groupId/members` - Add a member
- `DELETE /api/groups/:groupId/members/:memberId` - Delete a member

### Expenses
- `GET /api/groups/:groupId/expenses` - Get all expenses
- `POST /api/groups/:groupId/expenses` - Add an expense
- `DELETE /api/groups/expenses/:expenseId` - Delete an expense

## Project Structure

```
GoDutch/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── ExpenseCard.jsx
│   │   │   └── BalanceCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Group.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── ...
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Group.js
    │   ├── Member.js
    │   └── Expense.js
    ├── routes/
    │   ├── groupRoutes.js
    │   ├── memberRoutes.js
    │   └── expenseRoutes.js
    ├── controllers/
    │   ├── groupController.js
    │   ├── memberController.js
    │   └── expenseController.js
    ├── index.js
    └── ...
```

## License

MIT
