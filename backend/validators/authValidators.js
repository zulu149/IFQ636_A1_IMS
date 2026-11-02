const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 200;
const MIN_PASSWORD_LENGTH = 8;

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

const normaliseEmail = (body) => {
    if (typeof body.email === 'string') body.email = body.email.trim().toLowerCase();
};

const respond = (res, next, errors) => {
    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
};

const checkName = (name, errors) => {
    if (isBlank(name)) errors.name = 'Name is required';
    else if (name.trim().length > MAX_NAME_LENGTH) errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
};

const checkEmail = (email, errors) => {
    if (isBlank(email)) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
};

const validateRegister = (req, res, next) => {
    normaliseEmail(req.body);
    const { name, email, password } = req.body;
    const errors = {};

    checkName(name, errors);
    checkEmail(email, errors);
    if (typeof password !== 'string' || password === '') errors.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;

    respond(res, next, errors);
};

const validateLogin = (req, res, next) => {
    normaliseEmail(req.body);
    const { email, password } = req.body;
    const errors = {};

    if (isBlank(email)) errors.email = 'Email is required';
    if (typeof password !== 'string' || password === '') errors.password = 'Password is required';

    respond(res, next, errors);
};

const validateProfile = (req, res, next) => {
    normaliseEmail(req.body);
    const { name, email, university, address } = req.body;
    const errors = {};

    if (name !== undefined) checkName(name, errors);
    if (email !== undefined) checkEmail(email, errors);
    if (typeof university === 'string' && university.length > MAX_TEXT_LENGTH) errors.university = `University must be ${MAX_TEXT_LENGTH} characters or fewer`;
    if (typeof address === 'string' && address.length > MAX_TEXT_LENGTH) errors.address = `Address must be ${MAX_TEXT_LENGTH} characters or fewer`;

    respond(res, next, errors);
};

module.exports = { validateRegister, validateLogin, validateProfile };
