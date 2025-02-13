const axios = require("axios");

module.exports = {
  config: {
    name: "ocr",
    aliases: ['extract'],
    version: 1.0,
    author: "OtinXSandip",
    longDescription: "extract text",
    category: "ai",
    guide: {
      en: "{pn} reply to image"
    }
  },
  onStart: async function (params) {
    const { message, usersData, event, api, args } = params;
    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;

    const ment = [{ id: id, tag: name }];
    if (event.messageReply && event.messageReply.attachments) {
      const link = event.messageReply.attachments[0].url;
      const encod = encodeURIComponent(link);
api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const response = await axios.get(`https://nemobot.otinxshiva10.repl.co/read?url=${encod}`);

api.setMessageReaction("✅", event.messageID, () => {}, true);
      const extractedText = response.data.result;
      const replyBody = `Here is your extracted text 🥺 ${name}:\n\n${extractedText}`;
      message.reply({
        body: replyBody,
        mentions: ment
      });
    }
  }
};