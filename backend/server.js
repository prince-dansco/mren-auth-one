// import express from 'express'
// import dotenv from 'dotenv';
// import cors from 'cors'
// import path from 'path'
// import cookieParser from 'cookie-parser';

// import { connectDB } from './config/db.js';
// import authRoutes from './route/routeAuth.js'

// const app = express();
// dotenv.config();

// app.use(cors({
//     origin:'http://localhost:5173', credentials: true
// }))

// const PORT = process.env.PORT || 5000 
// const __dirname = path.resolve();  
// //middleware
// app.use(express.json());
// app.use(cookieParser());



// app.use('/api/auth', authRoutes);
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '/frontend/dist')));

//     app.get('*', (req,res) =>{
//         res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
//     })
// }

// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log('server is running on port 5000');
//     })
// })


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import authRoutes from './route/routeAuth.js';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

// Connect to database and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });
