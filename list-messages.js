const authorize = require("./auth");
const {google} = require("googleapis");


let messageIdList = [];

async function listMessages(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    try {
        const res =  await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread', // Filter for unread messages
            maxResults: 2,
        });
        displayMessageList(res);
        const messages = res.data.messages;
        displayMessageSubject(messages, gmail);
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

function displayMessageList(res) {
    const messages = res.data.messages;
    let nextPageToken = res.data.nextPageToken;
    if (messages.length) {
        console.log(`There are ${messages.length} unread messages`)
        console.log("Next page token - ", nextPageToken)
        console.log('Unread Messages:');
        messages.forEach((message) => {
            console.log('- %s', message);
        });
    } else {
        console.log('No unread messages found.');
    }
}

function displayMessageSubject(messages, gmail){
    if (messages.length) {
        console.log('Unread Emails:');
        messages.forEach((message) => {
            gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const subject = res.data.payload.headers.find(header => header.name === 'Subject').value;
                console.log(subject);
            });
        });
    } else {
        console.log('No unread emails found.');
    }
}

authorize().then(listMessages).catch(console.error);

