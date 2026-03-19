const fs = require('fs');
const path = require('path');

module.exports.saveFeedback = async (req, res) => {
    const { url, message, projectName } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const feedbackEntry = `[${new Date().toISOString()}] Project: ${projectName || 'Unknown'}\nURL: ${url}\nMessage: ${message.trim()}\n\n`;

    const logFilePath = path.join(__dirname, '..', 'logs', 'feedback.log');

    // Ensure the logs directory exists
    const logsDir = path.dirname(logFilePath);
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFile(logFilePath, feedbackEntry, (err) => {
        if (err) {
            console.error('Error writing feedback to file:', err);
            return res.status(500).json({ error: 'Failed to save feedback' });
        }
        res.json({ message: 'Feedback saved successfully' });
    });
};