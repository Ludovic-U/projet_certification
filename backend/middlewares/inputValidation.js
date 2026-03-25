const DANGEROUS_PATTERNS = [
    'ignore previous',
    'disregard instructions',
    'system prompt',
    'you are now',
    'new instructions',
    'forget everything',
    'override previous',
    '//ignore',
    '#ignore'
];

module.exports.sanitizeAIInput = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }
    const maxLength = 5000;
    let sanitized = input.slice(0,maxLength);

    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters

    const lowerInput = sanitized.toLowerCase();
    for (const pattern of DANGEROUS_PATTERNS) {
        if (lowerInput.includes(pattern)) {
            console.warn(`Potential prompt injection detected: ${pattern}`);
        sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '[FILTERED]');
        }
    }
    return sanitized;

}

module.exports.validateInput = (input, options = {}) => {
    const {
        maxLength = 1000,
        allowSpecialChars = true
    } = options;

    if (!input || typeof input !== 'string') {
        return { valid: false, error: 'Input is requiered'}
    }

    if (input.length > maxLength) {
        return { valid: false, error: `Input exceeds maximum length of ${maxLength}` };
    }

    if (!allowSpecialChars) {
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g;
        if (specialCharPattern.test(input)) {
            return { valid: false, error: 'Special characters are not allowed'};
        }
    }
    return { valid: true, sanitized: input.trim() };
 };
