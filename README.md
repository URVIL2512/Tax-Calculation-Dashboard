# Tax Calculation Dashboard (MERN Stack)

## 1. Project Overview
A modern MERN stack web application for calculating Indian income tax liability under both the Old and New Tax Regimes. Featuring a responsive React frontend, Node.js/Express backend with MongoDB, real-time tax computations, side-by-side tax regime comparisons, and downloadable tax reports.

## 2. Features
- **Dual Tax Regime Support (Old & New)**
- **Interactive Multi-step Form Wizard**
- **Real-time Input Validation & Tax Calculations**
- **User Authentication & Data Persistence**
- **Visual Reports with Recharts**
- **PDF Tax Report Generation with jsPDF**
- **Responsive UI with Material-UI, Tailwind, Emotion, and Styled Components**

## 3. Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React , TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| API | REST API endpoints for tax calculation and user management |
| Build Tools | Vite (frontend), Node.js (backend) |

## 4. Prerequisites
- Node.js v14 or higher
- npm or yarn
- MongoDB (local or Atlas cloud)
- Git (optional, for cloning)

## 5. Getting Started / Quick Setup

### Clone the Repository
```bash
git clone https://github.com/URVIL2512/Tax-Calculation-Dashboard.git
cd Tax-Calculation-Dashboard
```

### Setup Backend
```bash
cd backend
npm install
# Create a .env file with MongoDB URI and JWT secret
npm start
```
Backend runs on http://localhost:5000.

### Setup Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000 and connects to backend API.

## 6. Usage Instructions
1. Open http://localhost:3000 in your browser
2. Choose tax regime (Old/New)
3. Enter salary and deductions in the multi-step form
4. View side-by-side tax liability comparison
5. Download PDF tax reports
6. Log in/sign up to save or retrieve past data

## 7. Project Structure
```
Tax-Calculation-Dashboard/
├── backend/               # Node.js/Express API
│   ├── middleware/        # Authentication middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── .env              # Environment variables
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context
│   │   └── index.tsx     # Main entry point
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies
│   └── vite.config.ts    # Vite configuration
├── README.md
└── .gitignore
```

## 8. Key Components
- **Home**: Landing page with feature overview
- **TaxCalculator**: Multi-step tax calculation form
- **Dashboard**: Analytics and insights dashboard
- **TaxHistory**: Calculation history and reports
- **Authentication**: User login/signup system

## 9. Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

## 🎥 Demo Video
[▶ Watch the Demo on Google Drive](https://drive.google.com/file/d/1JMUNe2MYtP-a8kGHn_vTv6N-R76F9ddL/view?usp=sharing)

