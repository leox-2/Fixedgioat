const axios = require('axios');

module.exports = {
 config: {
 name: "bby",
 version: "1.0",
 author: "RL",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Chat continuously with Nilou (⁠+⁠_⁠+⁠)"
 },
 description: {
 en: "Send a message to initiate chat with Nilou Chat bot and continue the conversation by replying."
 },
 category: "Fun",
 guide: {
 en: "Usage: <your message> or reply directly to the bot to continue the conversation."
 }
 },

 onStart: async function ({ api, args, message }) {
 await handleMessage(api, args, message); // Call handleMessage to start the conversation
 },

 onReply: async function ({ api, event, args, message }) {
 await handleMessage(api, args, message); // Handle the conversation continuation
 }
};

// The core function that handles both start and reply messages
async function handleMessage(api, args, message) {
 const userMessage = args.join(" ").trim(); // User's message content

 if (!userMessage) {
 return message.reply("Please type a message to chat with Nilou Chat bot.");
 }

 try {
 const apiUrl = `https://nilou-chatbot-api-byrl.onrender.com/api/reply/${encodeURIComponent(userMessage)}`;
 
 // Make API call to get a reply from Dora AI
 const response = await axios.get(apiUrl);

 if (response.data.reply) {
 message.reply(response.data.reply, (err, sentMessage) => {
 // Set up onReply to continue the conversation if the user replies to this message
 if (!err) {
 global.GoatBot.onReply.set(sentMessage.messageID, {
 commandName: module.exports.config.name,
 uid: message.senderID // Track the user for the reply loop
 });
 }
 });
 } else {
 message.reply("I didn’t get a valid reply from the API.");
 }
 } catch (error) {
 console.error("API Error:", error.response ? error.response.data : error.message);
 message.reply("Sorry, I encountered an error while processing your message.");
 }
 }