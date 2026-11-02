
const User = require('../models/User');

const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('name email').sort({ name: 1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCustomers };
