const axios = require('axios');

// Dane do uwierzytelnienia
const API_KEY = 'your_mailjet_api_key';
const API_SECRET = 'your_mailjet_api_secret';
const API_URL = 'https://api.mailjet.com/v3.1/send';

// Utwórz obiekt e-maila
const emailData = {
    Messages: [
        {
            From: {
                Email: 'sender@example.com',
                Name: 'Your Name',
            },
            To: [
                {
                    Email: 'recipient@example.com',
                    Name: 'Recipient Name',
                },
            ],
            Subject: 'Subject of the email',
            TextPart: 'Text content of the email',
        },
    ],
};

// Ustawienia nagłówków do autoryzacji
const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString(
        'base64'
    )}`,
};

// Wyślij żądanie POST do Mailjet API
axios
    .post(API_URL, emailData, { headers })
    .then((response) => {
        console.log('E-mail sent:', response.data);
        // Przykład: pobierz ID wysłanej wiadomości dla dalszych działań
        const messageId = response.data.Messages[0].MessageID;
        console.log('Message ID:', messageId);

        // Przykład zbierania statystyk z Mailjet API (opcjonalnie)
        // Możesz użyć Mailjet API do pobrania statystyk wysyłki, otwarć, kliknięć itp.
        return axios.get(
            `https://api.mailjet.com/v3/REST/statistics/message/${messageId}`,
            { headers }
        );
    })
    .then((statsResponse) => {
        console.log('Statystyki Mailjet:', statsResponse.data);
    })
    .catch((error) => {
        console.error(
            'Błąd podczas wysyłania e-maila lub pobierania statystyk:',
            error.response.data
        );
    });
