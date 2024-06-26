require('dotenv').config();
const express = require('express');
const app = express();
const imaps = require('imap-simple');
const mysql = require('mysql2/promise');
const { simpleParser } = require('mailparser');

const imapConfig = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: process.env.IMAP_TLS === 'true',
        authTimeout: 7000,
    },
};

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function fetchEmails() {
    try {
        const connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
            bodies: [''],
            markSeen: true,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        const dbConnection = await mysql.createConnection(dbConfig);

        for (const message of messages) {
            const all = message.parts.find((part) => part.which === '');
            const rawEmail = all.body;

            // Parsowanie surowego e-maila przy użyciu simpleParser
            const parsed = await simpleParser(rawEmail);
            const from = parsed.from.text;
            const to = parsed.to.text;
            const subject = parsed.subject;
            const date = parsed.date;
            const body = parsed.text;

            await dbConnection.execute(
                'INSERT INTO emails (email_from, email_to, subject, body, received_date) VALUES (?, ?, ?, ?, ?)',
                [from, to, subject, body, date]
            );
        }

        await dbConnection.end();
        connection.end();
    } catch (error) {
        console.error('Wystąpił błąd podczas przetwarzania e-maili:', error);
    }
}

function startPolling() {
    fetchEmails(); // pierwsze uruchomienie natychmiastowe
    setInterval(fetchEmails, 30000); // ponawianie co 60 sekund (60000 ms)
}

startPolling();

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
