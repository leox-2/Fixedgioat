const axios = require("axios");

module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.3",
    role: 0,
    author: "Leon x Mahmud",
    description: "User info: rank, level, balance, and profile picture",
    category: "general",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          uid = match[1];
        }
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    const userInfo = await api.getUserInfo(uid);
    const avatarUrl = await usersData.getAvatarUrl(uid);
    const allUsers = await usersData.getAll();

    // Rank Calculations
    const sortedRichUsers = allUsers.sort((a, b) => b.money - a.money);
    const richRank = sortedRichUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    const sortedUsers = allUsers.sort((a, b) => b.exp - a.exp);
    const overallRank = sortedUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    const userMoney = allUsers.find(user => String(user.userID) === String(uid))?.money || 0;
    const userExp = allUsers.find(user => String(user.userID) === String(uid))?.exp || 0;
    const userLevel = expToLevel(userExp);

    let genderText;
    switch (userInfo[uid].gender) {
      case 1:
        genderText = "👩 Girl";
        break;
      case 2:
        genderText = "👨 Boy";
        break;
      default:
        genderText = "⚧ Other";
    }

    let position = userInfo[uid]?.type || "Normal User";
    const formattedBalance = formatMoney(userMoney);
    const displayRichRank = richRank > 0 ? richRank : "N/A";
    const displayOverallRank = overallRank > 0 ? overallRank : "N/A";

    // 🎨 Redesigned User Information Response
    const userInformation = `
╭───〔 👤 𝙐𝙨𝙚𝙧 𝙄𝙣𝙛𝙤 〕
├📛 𝐍𝐢𝐜𝐤𝐍𝐚𝐦𝐞: ${userInfo[uid].alternateName || "None"}
├🆔 𝐔𝐈𝐃: ${uid}
├👫 𝐆𝐞𝐧𝐝𝐞𝐫: ${genderText}
├🧑‍💼 𝐂𝐥𝐚𝐬𝐬: ${position}
├🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}
├🔗 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${userInfo[uid].vanity || "None"}
╰🤖 𝐁𝐨𝐭 𝐅𝐫𝐢𝐞𝐧𝐝: ${userInfo[uid].isFriend ? "✅ Yes" : "❎ No"}

╭───〔 🎖 𝙍𝙖𝙣𝙠𝙞𝙣𝙜 〕
├📈 𝐑𝐚𝐧𝐤 𝐋𝐞𝐯𝐞𝐥: ${userLevel}
╰🏆 𝐑𝐚𝐧𝐤 𝐓𝐨𝐩: ${displayOverallRank}

╭───〔 💰 𝘽𝙖𝙡𝙖𝙣𝙘𝙚 〕
├💵 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formattedBalance}
╰🥇 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐓𝐨𝐩: ${displayRichRank}`;

    message.reply({
      body: userInformation,
      attachment: avatarUrl ? await global.utils.getStreamFromURL(avatarUrl) : undefined
    });
  }
};

// Helper function to convert experience to level
function expToLevel(exp, deltaNextLevel = 5) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
}

// Helper function to format large numbers (e.g., balance)
function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
                                      }
