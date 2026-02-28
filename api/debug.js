export default (req, res) => {
    res.json({
        message: 'Debug info',
        env: process.env.VERCEL,
        date: new Date(),
        node: process.version
    });
};
