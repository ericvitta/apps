const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


const router = express.Router();

function generatetoken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 84600,
    });
}
router.get('/', async (_req, res) => {
    try {
        const users = await User.find().populate(['user']);
        return res.send({ users });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar usuarios.' });
    }
});

router.get('/:id', async (_req, res) => {
    try {
        const users = await User.findById(_req.params.id);
        return res.send({ users });

    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Erro ao carregar usuario.' });
    }
});

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuário já existe' });

        const user = await User.create(req.body);

        //user.password = undefined;
        //user.id = undefined;
        //user.profission = undefined;

        return res.send(
            'Usuário cadastrado com sucesso!!!'
        );

    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.find({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuário não encontrado' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha inválida' });

    const token = jwt.sign({ id: user.CPF }, authConfig.secret, {
        expiresIn: 84600,
    });

    res.send({
        _id,
        email,
        name,
        createdAt,
        token: generatetoken({ id: user.id }),
    });


});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        //await User.findOneAndUpdate(user.id, {
        //       '$set': {
        //            passwordResetToken: token,
        //            passwordResetExpires: now,
        //       }
        //    });

        console.log(token, now);

        mailer.sendMail({
            to: email,
            from: 'eric.vitta@gmail.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Não foi possivel enviar o email de recuperação de senha' });

            return res.send();
        })

    } catch (err) {
        console.log(err)
        res.status(400).send({ error: 'Erro na recuperação da senha, tente novamente' });
    }
})

router.put('/:userId', async (req, res) => {
    try {
        const id = req.params.userId;
        const user = user.findByIdAndUpdate({ _id: id },
             { $set: { name: req.body.newname,
               email: req.body.newemail,
               email: req.body.newemail,
               password: req.body.newpassword } }.exec());
        // await user.save();

        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Erro ao alterar dados de usuário.' });
    }
});

        
    
module.exports = app => app.use('/auth', router);