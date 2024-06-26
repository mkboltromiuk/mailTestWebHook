require('dotenv').config();
const express = require('express');
const app = express();
const { ImapFlow } = require('imapflow');
const mysql = require('mysql2/promise');

const client = new ImapFlow({
    host: 'poczta.int.pl',
    port: 993,
    secure: true,
    auth: {
        user: 'tomblynsky@int.pl',
        pass: 'TomBlynsky25!&#$',
    },
});

const main = async () => {
    try {
        // Połączenie i autoryzacja klienta IMAP
        await client.connect();

        // Wybór i zablokowanie skrzynki pocztowej. Rzuca wyjątkiem, jeśli skrzynka nie istnieje.
        let lock = await client.getMailboxLock('INBOX');

        try {
            // Pobranie treści najnowszej wiadomości
            let mailbox = await client.mailboxOpen('INBOX');
            // fetch UID for the last email in the selected mailbox
            let lastMsg = await client.fetchOne('*', { uid: false });
            console.log(lastMsg);

            // Możesz również pobrać treść konkretnych wiadomości, na przykład o określonym UID:
            // let specificMessage = await client.fetchOne('UID 12345', { source: true });
            // console.log(specificMessage.source.toString());
        } finally {
            // Upewnij się, że zamek jest zwolniony, w przeciwnym razie kolejne getMailboxLock() nigdy nie zwróci wartości.
            lock.release();
        }

        // Wylogowanie się i zakończenie połączenia
        await client.logout();
    } catch (err) {
        console.error('Wystąpił błąd:', err);
    }
};

// Wywołanie funkcji głównej
main();

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
