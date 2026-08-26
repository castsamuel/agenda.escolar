import express from 'express';
import session from 'express-session';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import './database/index.js';
const app=express(); const root=dirname(fileURLToPath(import.meta.url));
app.use(express.json()); app.use(session({secret:process.env.SESSION_SECRET||'troque-esta-chave-em-producao',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',maxAge:1000*60*60*24*14}}));
app.use('/api/auth',authRoutes); app.use('/api',dataRoutes); app.use(express.static(join(root,'../frontend')));
app.get('*',(req,res)=>res.sendFile(join(root,'../frontend/index.html')));
app.listen(process.env.PORT||3000,()=>console.log('Agenda Escolar em http://localhost:3000'));

