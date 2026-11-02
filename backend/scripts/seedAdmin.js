const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    await connectDB();
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted ${email} to admin`);
    } else {
        await User.create({ name: ADMIN_NAME || 'Administrator', email, password: ADMIN_PASSWORD, role: 'admin' });
        console.log(`Created admin ${email}`);
    }

    await mongoose.disconnect();
};

seedAdmin().catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exit(1);
});
