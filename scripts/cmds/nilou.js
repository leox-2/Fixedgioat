const { MongoClient } = require('mongodb');

// MongoDB URI and Database Configuration
const uri = "mongodb+srv://leox5621:D0zR1u5Z0saTZewO@cluster0.cq0tl.mongodb.net/Nilou-Chatbot?retryWrites=true&w=majority";
const dbName = "Nilou-Chatbot";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getDatabase() {
 if (!client.topology || !client.topology.isConnected()) await client.connect();
 return client.db(dbName);
}

async function sendResponse(api, threadID, messageID, message) {
 try {
 await api.sendMessage(message, threadID, messageID);
 } catch (error) {
 console.error('Failed to send message:', error);
 }
}

module.exports = {
 config: {
 name: "nilou",
 aliases: ["nilou", "n"],
 version: "1.0.0",
 author: "RL",
 countDown: 0,
 role: 0,
 description: "A chatbot for Nilou",
 category: "ai",
 guide: {
 en: "{pn} [anyMessage] OR teach [YourMessage] - [Reply1], [Reply2], ... OR n remove [YourMessage] - [SpecificReply] OR list OR all"
 }
 },

 onStart: async ({ api, event, args, usersData }) => {
 const db = await getDatabase();
 const input = args.join(" ").toLowerCase().trim();
 const uid = event.senderID;

 try {
 if (!args[0]) {
 const responses = ["Hello!", "How can I assist you?", "Try typing 'help' for commands."];
 return sendResponse(api, event.threadID, event.messageID, responses[Math.floor(Math.random() * responses.length)]);
 }

 const [command, ...rest] = args;
 const restJoined = rest.join(" ").toLowerCase().trim();

 switch (command.toLowerCase()) {
 case 'msg':
 case 'message':
 const foundMessage = await db.collection('nilou').findOne({ message: restJoined });
 if (foundMessage && foundMessage.replies && foundMessage.replies.length > 0) {
 const replies = foundMessage.replies.join(', ');
 return sendResponse(api, event.threadID, event.messageID, `Message: ${restJoined}\nReplies: ${replies}`);
 } else {
 return sendResponse(api, event.threadID, event.messageID, `No message found for ${restJoined}`);
 }

 case 'teach':
 const [msgToTeach, replies] = restJoined.split(' - ');
 if (!msgToTeach || !replies) return sendResponse(api, event.threadID, event.messageID, "Please provide a valid message and replies.");

 const replyList = replies.split(',').map(reply => reply.trim());

 await db.collection('nilou').updateOne(
 { message: msgToTeach.trim() },
 {
 $addToSet: { replies: { $each: replyList } },
 $setOnInsert: { senderID: uid }
 },
 { upsert: true }
 );
 return sendResponse(api, event.threadID, event.messageID, `✅ Replies added successfully for ${msgToTeach}`);

 case 'remove':
 const [msgToRemove, replyToRemove] = restJoined.split(' - ').map(item => item.trim());

 // Prevent removal of entire message if no specific reply is provided
 if (!replyToRemove) {
 return sendResponse(api, event.threadID, event.messageID, `⚠️ To remove, specify a reply as in "n remove <message> - <specific reply>".`);
 }

 const updateResult = await db.collection('nilou').updateOne(
 { message: msgToRemove },
 { $pull: { replies: replyToRemove } }
 );

 if (updateResult.modifiedCount > 0) {
 return sendResponse(api, event.threadID, event.messageID, `✅ Successfully removed reply "${replyToRemove}" from "${msgToRemove}".`);
 } else {
 return sendResponse(api, event.threadID, event.messageID, `⚠️ Could not find reply "${replyToRemove}" in "${msgToRemove}".`);
 }

 case 'list':
 try {
 const teacherData = await db.collection('nilou').aggregate([
 { $match: { senderID: { $exists: true } } },
 { $group: { _id: "$senderID", count: { $sum: 1 } } },
 { $sort: { count: -1 } }
 ]).toArray();

 if (restJoined === 'all') {
 const teacherList = await Promise.all(teacherData.map(async (item) => {
 try {
 const userData = await usersData.get(item._id);
 return { name: userData.name, value: item.count };
 } catch (error) {
 console.error("Failed to fetch user data:", error);
 return { name: "Unknown", value: item.count };
 }
 }));

 teacherList.sort((a, b) => b.value - a.value);
 const output = teacherList.map((teacher, index) => `${index + 1}/ ${teacher.name}: ${teacher.value}`).join('\n');
 return sendResponse(api, event.threadID, event.messageID, `👑 | List of Teachers\n${output}`);
 } else {
 const userCount = teacherData.find(item => item._id === uid);
 return sendResponse(api, event.threadID, event.messageID, userCount ? `You have taught ${userCount.count} messages.` : `You have not taught any messages yet.`);
 }
 } catch (error) {
 console.error("Error fetching list:", error);
 return sendResponse(api, event.threadID, event.messageID, "Failed to fetch the list.");
 }

 default:
 const responseMsg = await db.collection('nilou').findOne({ message: input });
 if (responseMsg && responseMsg.replies && responseMsg.replies.length > 0) {
 const randomReply = responseMsg.replies[Math.floor(Math.random() * responseMsg.replies.length)];
 return sendResponse(api, event.threadID, event.messageID, randomReply);
 } else {
 return sendResponse(api, event.threadID, event.messageID, "Kindly teach me !!!");
 }
 }
 } catch (error) {
 console.error('An error occurred:', error);
 return sendResponse(api, event.threadID, event.messageID, "An error occurred. Check console for details.");
 }
 },
};