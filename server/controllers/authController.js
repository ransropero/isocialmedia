const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await user.validatePassword(password))) {
            if (!user.hasAccess) {
                return res.status(403).json({
                    message: 'Access Denied. Your account is pending approval.'
                });
            }

            res.json({
                id: user.id,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'hasAccess', 'isAdmin', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { hasAccess } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot modify your own access' });
        }

        user.hasAccess = hasAccess;
        await user.save();

        res.json({ message: `User access ${hasAccess ? 'granted' : 'revoked'}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

