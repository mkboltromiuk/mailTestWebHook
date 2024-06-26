const express = require('express');
const app = express();

const _ = require('lodash');
const simpleParser = require('mailparser').simpleParser;

const imaps = require('imap-simple');

// Konfiguracja połączenia
const config = {
    imap: {
        user: 'tomblynsky@int.pl',
        password: 'TomBlynsky25!&#$',
        host: 'poczta.int.pl',
        port: 993,
        tls: true,
        authTimeout: 30000, // opcjonalnie: ustawienie limitu czasu autoryzacji
    },
};
// Funkcja do pobierania treści ostatniej wiadomości
async function fetchLastMessage() {
    // Utwórz połączenie IMAP
    const connection = await imaps.connect(config);

    try {
        // Otwórz skrzynkę "INBOX"
        await connection.openBox('INBOX');

        // Znajdź wszystkie wiadomości w skrzynce
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['TEXT'] };
        const messages = await connection.search(searchCriteria, fetchOptions);

        // Pobierz treść ostatniej wiadomości
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const parts = lastMessage.parts.filter(
                (part) => part.which === 'TEXT'
            );
            const text = parts[0].body;
            console.log('Treść ostatniej wiadomości:');
            console.log(text);
        } else {
            console.log('Brak nieprzeczytanych wiadomości w skrzynce.');
        }
    } catch (err) {
        console.error('Błąd podczas pobierania wiadomości:', err);
    } finally {
        // Zamknij połączenie
        if (connection) await connection.end();
    }
}

// Rozpocznij monitorowanie zdarzenia onmail
const startMonitoring = async () => {
    try {
        // Połącz się z serwerem IMAP
        const connection = await imaps.connect(config);

        console.log('Rozpoczęcie monitorowania...');

        // Ustaw funkcję do nasłuchiwania zdarzenia onmail
        connection.on('mail', (numNewMail) => {
            console.log(`Otrzymano ${numNewMail} nową wiadomość.`);
            fetchLastMessage(); // Pobierz i wyświetl treść ostatniej wiadomości
        });

        // Rozpocznij nasłuchiwanie zdarzeń
        await connection.openBox('INBOX');
        console.log('Rozpoczęto nasłuchiwanie na skrzynce "INBOX".');
    } catch (err) {
        console.error('Błąd połączenia IMAP:', err);
    }
};

// Rozpocznij monitorowanie
startMonitoring();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
