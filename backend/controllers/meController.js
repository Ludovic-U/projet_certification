module.exports.me =(req, res) => {
    try {
        console.log('meController 200 OK');
        const user = req.user; // Assuming user is set in the request by authentication middleware
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in me API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}