//// mailjet \\\\

require('dotenv').config();

const mailjet = require('node-mailjet').apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
        {
            From: {
                Email: 'example@int.pl',
                Name: 'Administracja bloku',
            },
            To: [
                {
                    Email: 'example@gmail.com',
                    Name: 'marcin',
                },
            ],
            Subject: 'Witaj',
            TextPart: 'helloooo',
            HTMLPart:
                '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><br />May the delivery force be with you!',
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

const imapConfig = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT, 10),
        tls: process.env.IMAP_TLS === 'true',
        connTimeout: 10000, // zwiększenie timeout do 10 sekund
        authTimeout: 10000, // zwiększenie timeout dla autoryzacji do 10 sekund
        tlsOptions: { rejectUnauthorized: false },
    },
};

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
