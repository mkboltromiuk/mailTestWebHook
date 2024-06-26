const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
    host: 'poczta.int.pl',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: 'tomblynsky@int.pl',
        pass: 'TomBlynsky25!&#$',
    },
});

let emailStatus = {};

app.post('/send-email', (req, res) => {
    const { to, subject, text } = req.body;
    const emailId = uuidv4();
    let mailOptions = {
        from: 'tomblynsky@int.pl', // adres nadawcy
        to: 'mikiwowtp@gmail.com', // adres odbiorcy
        subject: 'Testowy e-mail', // temat wiadomości
        text: 'To jest treść testowej wiadomości wysłanej przy użyciu Nodemailer.', // treść wiadomości
        html: `${text}<img src="/1x1.png"${emailId}" width="1" height="1" />`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        emailStatus[emailId] = { to: to, opened: false };
        res.status(200).send('Email sent: ' + info.response);
    });
});

app.get('/track/:id', (req, res) => {
    const emailId = req.params.id;
    if (emailStatus[emailId]) {
        emailStatus[emailId].opened = true;
    }

    const imgPath = path.join(__dirname, '1x1.png');
    fs.readFile(imgPath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading image');
        } else {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(data);
        }
    });
});

app.get('/status/:id', (req, res) => {
    const emailId = req.params.id;
    if (emailStatus[emailId]) {
        res.status(200).send(emailStatus[emailId]);
    } else {
        res.status(404).send('Email not found');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
