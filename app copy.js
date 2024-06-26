require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2');

const mailjet = require('node-mailjet').apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
        {
            From: {
                Email: 'tomblynsky@int.pl',
                Name: 'Tomek',
            },
            To: [
                {
                    Email: 'mikiwowtp@gmail.com',
                    Name: 'marcin',
                },
            ],
            Subject: 'Witaj',
            TextPart: 'helloooo',
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

app.get('/', (req, res) => {
    connection.query('SELECT * FROM uzytkownicy', (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

async function fetchEmails() {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox('INBOX');

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        markSeen: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const dbConnection = await mysql.createConnection(dbConfig);

    for (const message of messages) {
        const all = message.parts.find((part) => part.which === 'TEXT');
        const headers = message.parts.find(
            (part) => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
        ).body;

        const from = headers.from[0];
        const to = headers.to[0];
        const subject = headers.subject[0];
        const date = headers.date[0];
        const body = all.body;

        await dbConnection.execute(
            'INSERT INTO emails (email_from, email_to, subject, body, received_date) VALUES (?, ?, ?, ?, ?)',
            [from, to, subject, body, date]
        );
    }

    await dbConnection.end();
    connection.end();
}

fetchEmails().catch(console.error);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
