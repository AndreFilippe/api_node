const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer')
const authConfing = require('../../config/auth.json')

const User = require('../models/user');
const { send } = require('process');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({
                error: 'User already exists'
            });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ user });
    } catch (err) {
        return res.status(400).send({
            error: 'Registration failed',
            debug: err
        });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).send({
            error: 'User not found'
        });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({
            error: 'User invalid'
        });
    }

    const token = jwt.sign(
        {
            id: user.id
        },
        authConfing.secret,
        {
            expiresIn: authConfing.tokenExpire
        }
    );

    user.password = undefined;
    res.send({ user, token });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const passwordResetToken = crypto.randomBytes(20).toString('hex');
        const passwordResetExpires = new Date();
        passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: passwordResetToken,
                passwordResetExpires: passwordResetExpires
            }
        });

        mailer.sendMail({
            to: email,
            from: 'no@teste.com',
            template: '/auth/forgot_password',
            context: { passwordResetToken }
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email', debug: err });

            return res.send({ message: `Token sending it to the email ${email}` });
        });
    } catch (err) {
        res.status(400).send({
            error: 'Erro on forgot passwprd, try again',
            debug: err
        });
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .select('+ passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid' });

        if (new Date() > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired' });

        user.password = password;
        user.passwordResetExpires = new Date();

        await user.save();

        res.send({ message: 'Password successfully reset' });

    } catch (err) {
        res.status(400).send({
            error: 'Cannot reset passwprd, try again',
            debug: err
        });
    }
});

module.exports = (app) => app.use('/auth', router);