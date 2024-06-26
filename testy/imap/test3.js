const express = require('express');
const app = express();

const _ = require('lodash');

const imaps = require('imap-simple');

const { simpleParser } = require('mailparser');

// Konfiguracja połączenia
const config = {
    imap: {
        user: 'tomblynsky@int.pl',
        password: 'TomBlynsky25!&#$',
        host: 'poczta.int.pl',
        port: 993,
        tls: true,
        // opcjonalnie: ustawienie limitu czasu autoryzacji
    },
};
// Funkcja do pobierania i wyświetlania ostatniej wiadomości
async function fetchLastMessage() {
    const connection = await imaps.connect(config);

    try {
        // Otwórz skrzynkę "INBOX"
        await connection.openBox('INBOX');

        // Znajdź wszystkie nieprzeczytane wiadomości w skrzynce
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: [''] };
        const messages = await connection.search(searchCriteria, fetchOptions);

        // Pobierz i parsuj treść ostatniej wiadomości
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const all = lastMessage.parts.find((part) => part.which === '');

            const parsed = await simpleParser(all.body);
            console.log('Treść ostatniej wiadomości:');
            console.log(parsed.text); // Wyświetl treść wiadomości
        } else {
            console.log('Brak nieprzeczytanych wiadomości w skrzynce.');
        }
    } catch (err) {
        console.error('Błąd podczas pobierania wiadomości:', err);
    } finally {
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
        connection.on('mail', async (numNewMail) => {
            console.log(`Otrzymano ${numNewMail} nową wiadomość.`);
            await fetchLastMessage(); // Pobierz i wyświetl treść ostatniej wiadomości
        });

        // Rozpocznij nasłuchiwanie zdarzeń
        await connection.openBox('INBOX');
        console.log('Rozpoczęto nasłuchiwanie na skrzynce "INBOX".');

        // Ustaw interwał odświeżania co 30 sekund
        setInterval(async () => {
            await fetchLastMessage();
        }, 30000); // Interwał w milisekundach (30 sekund = 30000 milisekund)
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
