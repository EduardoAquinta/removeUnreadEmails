const authorize = require("./auth");
const {google} = require("googleapis");

async function listMessages(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    try {
        const res =  await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread', // Filter for unread messages
            maxResults: 10,
        });
    displayMessages(res);
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

authorize().then(listMessages).catch(console.error);

function displayMessages(res) {
    const messages = res.data.messages;
    let nextPageToken = res.data.nextPageToken;
    if (messages.length) {
        console.log(`There are ${messages.length} unread messages`)
        console.log("Next page token - ", nextPageToken)
        console.log('Unread Messages:');
        messages.forEach((message) => {
            console.log('- %s', message.id);
        });
    } else {
        console.log('No unread messages found.');
    }
}