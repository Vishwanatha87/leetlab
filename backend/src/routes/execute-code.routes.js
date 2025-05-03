import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { executeCode } from '../controller/executeCode.controller.js';


const executeCodeRoute = express.Router();


executeCodeRoute.post('/', authMiddleware, executeCode )


export default executeCodeRoute;