//// mailjet \\\\

/// Wymagana pełna konfiguracja na mailjet, bez tego wiadomosc moze wpadac do spamu \\\

require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
app.use(bodyParser.json());

const mailjet = require('node-mailjet').apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.get('/home', (req, res) => {
    res.send('Hello from your local server!');
});

// Endpoint do obsługi webhooka z Mailjet // dodanie adresu url od ngrok + endpoint, w mailjet kategoria webhooks  = ngrok adres url /webhook/test
app.post('/webhook/test', (req, res) => {
    const { email, event } = req.body;
    console.log('Otrzymano zdarzenie od Mailjet:');
    console.log(req.body);

    // Zapytanie SQL do wstawiania danych
    const query = 'INSERT INTO events (email, event) VALUES (?, ?)';
    pool.query(query, [email, event], (err, results) => {
        if (err) {
            console.error('Błąd podczas wstawiania danych:', err);
            return res.status(500).send('Błąd serwera');
        }
        res.status(201).send('Dane zostały zapisane');
    });
});

/// kod do wysłania maila

const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
        {
            From: {
                Email: process.env.IMAP_USER,
                Name: 'test',
            },
            To: [
                {
                    Email: 'example@gmail.com',
                    Name: 'example',
                },
            ],
            Subject: 'Youtube link ',
            TextPart: 'only test',
            HTMLPart:
                '<a href="https://www.youtube.com/watch?v=CYNpdmgwNTM&list=LL&index=96&t=620s">Click!</a>',
        },
    ],
});
request
    .then((result) => {
        console.log(result.body);
    })
    .catch((err) => {
        console.log(err.statusCode);
    });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
