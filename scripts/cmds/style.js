const axios = require("axios");

const baseApiUrl = async () => {
  return "https://mahmud-style.onrender.com";
};

module.exports.config = {
  name: "style",
  aliases: ["font"],
  version: "1.7",
  role: 0,
  countDowns: 5,
  author: "MahMUD",
  category: "general",
  guide: { en: "[number] [text]" }
};

module.exports.onStart = async function ({ message, args }) {
  const baseUrl = await baseApiUrl();

  if (args[0] === "list") {
    try {
      const response = await axios.get(`${baseUrl}/font/list`);
      if (!response.data) return message.reply("No font styles found or the response format is incorrect.");

      let fontList = response.data.replace("Available Font Styles:", "").trim();
      const fontStyles = `Available Font Styles:\n${fontList}`;
      
      return message.reply(fontStyles);
    } catch (error) {
      console.error("Error fetching font list:", error);
      return message.reply("Sorry, an error occurred while fetching the font styles.");
    }
  }

  const number = parseInt(args[0]);
  const text = args.slice(1).join(" ");

  if (!text || isNaN(number)) {
    return message.reply("Invalid command. Usage: style <number> <text>");
  }

  try {
    const response = await axios.post(`${baseUrl}/font`, { number, text });

    if (!response.data || !response.data.data) {
      return message.reply("Error: Invalid response from the API.");
    }

    const fontData = response.data.data;
    const fontStyle = fontData[number];

    if (!fontStyle) {
      return message.reply(`Font style ${number} does not exist. Please choose a valid font number.`);
    }

    let convertedText = text.split("").map(char => fontStyle[char] || char).join("");

    if (!convertedText) {
      return message.reply("Error: Could not convert the text with the specified style.");
    }

    return message.reply(convertedText);
  } catch (error) {
    console.error("Error sending data to the API:", error);

    if (error.response) {
      console.error("API Error Response:", error.response.data);
      return message.reply(`API Error: ${error.response.data.message || "An unknown error occurred."}`);
    } else {
      return message.reply("Sorry, an error occurred while processing your request.");
    }
  }
};
