import { startServer } from '../server/server.js';
import app from '../server/server.js';

let isInitialized = false;

export default async (req, res) => {
    if (!isInitialized) {
        try {
            await startServer();
            isInitialized = true;
        } catch (err) {
            console.error('Initialization error:', err);
            // Return the error message to help debug if it's still failing
            return res.status(500).json({
                error: 'Initialization failed',
                message: err.message,
                stack: err.stack
            });
        }
    }
    return app(req, res);
};
