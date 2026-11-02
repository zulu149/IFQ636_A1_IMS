const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

const respond = (res, next, errors) => {
    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
};

module.exports = { isBlank, respond };
