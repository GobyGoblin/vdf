let startServer, app;
let isInitialized = false;

export default async (req, res) => {
    try {
        if (!app) {
            const serverModule = await import('../server/server.js');
            startServer = serverModule.startServer;
            app = serverModule.default;
        }

        if (!isInitialized) {
            await startServer();
            isInitialized = true;
        }

        return app(req, res);
    } catch (err) {
        console.error('Initialization/Import error:', err);
        return res.status(500).json({
            error: 'Module loading or initialization failed',
            message: err.message,
            stack: err.stack
        });
    }
};
