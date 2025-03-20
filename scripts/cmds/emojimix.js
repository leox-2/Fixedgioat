const axios = require('axios');

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "1.6",
    author: "ntkhang (updated)",
    countDown: 5,
    role: 0,
    description: "Mix 2 emoji together",
    guide: "   {pn} <emoji1> <emoji2>\n   Example:  {pn} 🤣 🥰",
    category: "fun"
  },

  langs: {
    en: {
      error: "Sorry, emoji %1 and %2 can't mix",
      success: "Emoji %1 and %2 mixed successfully!"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2)
      return message.SyntaxError();

    // Convert emojis to their unicode codepoints
    const getCodePoint = (emoji) => {
      if (emoji.length === 1) {
        return emoji.codePointAt(0).toString(16);
      }
      
      // Handle composite emojis (like flags, skin tones)
      let codePoints = [];
      for (let i = 0; i < emoji.length; i++) {
        const code = emoji.codePointAt(i);
        codePoints.push(code.toString(16));
        // Skip the low surrogate if this is a surrogate pair
        if (code > 0xFFFF) {
          i++;
        }
      }
      return codePoints.join('-');
    };

    try {
      // Primary API - Google's emoji kitchen
      const code1 = getCodePoint(emoji1);
      const code2 = getCodePoint(emoji2);
      
      // Google's emoji kitchen endpoint
      const googleUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${code1}_${code2}`;

      let response = await axios.get(googleUrl);
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        // Use the first result from Google's API
        const imageUrl = response.data.results[0].media_formats.png_transparent.url;
        
        return message.reply({
          body: getLang("success", emoji1, emoji2),
          attachment: await global.utils.getStreamFromURL(imageUrl)
        });
      } 
      
      // Fallback API - Emoji mixer
      const fallbackUrl = `https://emojik.vercel.app/api/mix?e1=${encodeURIComponent(emoji1)}&e2=${encodeURIComponent(emoji2)}`;
      
      response = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
      
      if (response.status === 200) {
        const attachment = Buffer.from(response.data);
        
        return message.reply({
          body: getLang("success", emoji1, emoji2),
          attachment
        });
      }
      
      // If both APIs fail, throw error to be caught below
      throw new Error("No valid emoji combination found");
    } catch (error) {
      console.error("Emoji mix error:", error.message);
      return message.reply(getLang("error", emoji1, emoji2));
    }
  }
}
