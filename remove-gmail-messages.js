const authorize = require("./auth");
const {google} = require("googleapis");
const readline = require("./readline");
let messageIdList;
let messageCount = 0;

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

async function removeGmailMessages(auth, pageToken) {
    const gmail = google.gmail({version: 'v1', auth});
        const response =  await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread', // Filter for unread messages
            maxResults: 500,
            pageToken: pageToken,
        });
        // displayUnreadMessageList(response);
        const messages = response.data.messages;
        const nextPageToken = response.data.nextPageToken;
        messageIdList = messages;
        console.log("Amount of displayed messages: ", messageCount);
    if(nextPageToken) {
        await removeGmailMessages(auth, nextPageToken);
    }
    displayMessageSubject(messageIdList, gmail);
}

// function displayUnreadMessageList(response) {
//     const messages = response.data.messages;
//     let nextPageToken = response.data.nextPageToken;
//     if (messages.length) {
//         console.log(`You have ${messages.length} unread messages`)
//         console.log("Next page token - ", nextPageToken)
//         console.log('Unread Messages:');
//         messages.forEach((message) => {
//             console.log('Message details - %s', message);
//         });
//     } else {
//         console.log('No unread messages found.');
//     }
// }

function displayMessageSubject(messages, gmail){
    if (messages.length) {
        console.log('First 10 unread emails:');
        let first10Messages = messages.slice(0, 10);
        first10Messages.forEach((message) => {
            gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            }, (error, response) => {
                if (error) return console.log('The API returned an error: ' + error);
                const subject = response.data.payload.headers.find(header => header.name === 'Subject').value;
                console.log("Subject: ",subject);
            });
        });

    } else {
        console.log('No unread emails found.');
    }
}

function userDeletePrompt(gmail) {
    readline.question('What is your name?', name => {
        console.log(`Hello, ${name}!`);
        readline.close();
    });
    let lowerCaseUserInput = userInput.toLowerCase();
    if(lowerCaseUserInput === "y" || lowerCaseUserInput === "yes"){
        let areYouSure = prompt("Are you sure?");
        let lowerCaseAreYouSure = areYouSure.toLowerCase();
        if(lowerCaseAreYouSure === "y" || lowerCaseAreYouSure === "yes"){
            deleteMessages(messageIdList, gmail);
        }else{
            console.log("Program exited.")
            process.exit(0)
        }

    } else{
        console.log("Program exited.")
    }

}

function deleteMessages(messageIdList, gmail){
    if (messageIdList.length) {
        console.log(`Deleting ${messageIdList.length} messages`)
        messageIdList.forEach((messageId) => {
            gmail.users.messages.delete({
                userId: 'me',
                id: messageId,
            }), (error, response) => {
                if (error) return console.log('The API returned an error: ' + error);
            }
        })
        console.log(`Deleting ${messageIdList.length} messages`);

    }
}

const runProgram = () =>{
    authorize().then(removeGmailMessages).catch(console.error);
    authorize().then(userDeletePrompt).catch(console.error);
}

runProgram();
console.log("Amount of displayed messages: ", messageCount);
