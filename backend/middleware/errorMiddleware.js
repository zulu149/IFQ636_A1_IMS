const notFound = (req, res) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Malformed JSON in request body' });
    }

    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
};

module.exports = { notFound, errorHandler };
