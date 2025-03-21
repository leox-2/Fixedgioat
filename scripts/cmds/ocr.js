const axios = require("axios");
 
module.exports = {
 config: {
  name: "ocr",
  version: "1.1",
  author: "Mah MUD彡",
  countDown: 10,
  role: 2,
  category: "image",
  guide: {
    vi: "{pn} trả lời một hình ảnh",
    en: "{pn} reply to an image"
  }
 },
 
 onStart: async function({ event, api }) {
  try {
    const axios = require('axios');
    const imageLink = event.messageReply.attachments[0].url || args.join(" ");
    if(!imageLink) return api.sendMessage('Please reply to image.', event.threadID, event.messageID);
    const res = await axios.get(`https://samirxpikachuio.onrender.com/telegraph?url=${encodeURIComponent(imageLink)}&senderId=${event.senderID}`); 
    
    const response = await axios.get(`https://samirxpikachuio.onrender.com/extract/text?url=${res.data.result.link}`);
    api.sendMessage(`${response.data.text}`, event.threadID);
  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while performing OCR.", event.threadID);
  }
 }
};
