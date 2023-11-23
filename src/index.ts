import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import currenciesRoutes from './routes/currenciesRoutes';
import charactersRoutes from './routes/charactersRoutes';

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api', currenciesRoutes);
app.use('/api', charactersRoutes);

const PORT = process.env.EXTERNAL_PORT || 8080;
app.listen(PORT, ()=>{
 console.log(`server is running on port ${PORT}`)
});