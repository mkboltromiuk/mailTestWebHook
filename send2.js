//// mailjet \\\\

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

app.get('/home', (req, res) => {
    res.send('Hello from your local server!');
});

// Endpoint do obsługi webhooka z Mailjet
app.post('/webhook/test', (req, res) => {
    // Przyjmujemy zdarzenie od Mailjet
    console.log('Otrzymano zdarzenie od Mailjet:');
    console.log(req.body); // Zawiera dane o zdarzeniu, np. otwarcie emaila

    // Możesz dodać tutaj kod do przetwarzania zdarzenia, np. zapis do bazy danych, wysyłka powiadomienia, generowanie raportu, itp.

    res.status(200).send('OK');
});

//// poprawić aby wysłany mail nie zapisywał się w spamie, potem zrobic, aby zapisywał w bazie danych określone parametry.

const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
        {
            From: {
                Email: 'tomblynsky@int.pl',
                Name: 'tomek',
            },
            To: [
                {
                    Email: 'mkbot2105@gmail.com',
                    Name: 'wszyscy',
                },
            ],
            Subject: 'Witaj',
            TextPart: 'witaj',
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
