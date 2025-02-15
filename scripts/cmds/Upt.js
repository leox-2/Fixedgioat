module.exports = {
  config: {
    name: "upt",
    aliases: ["uptime", "botstatus"],
    version: "1.1",
    role: 0,
    author: "Leon x Mahmud",
    description: "Check the bot's uptime, total users, and total threads",
    category: "general",
    countDown: 5
  },

  onStart: async function ({ message, usersData, threadsData }) {
    const uptime = process.uptime(); // Get uptime in seconds
    const formattedUptime = formatUptime(uptime);

    const totalUsers = await usersData.getAll(); // Get all users
    const totalThreads = await threadsData.getAll(); // Get all threads

    const uptimeMessage = `
╭───〔 ⏳ 𝐔𝐩𝐭𝐢𝐦𝐞 〕
├🟢 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞 ✅
├⏰ 𝐔𝐩𝐭𝐢𝐦𝐞: ${formattedUptime}
├👥 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${totalUsers.length}
╰💬 𝐓𝐨𝐭𝐚𝐥 𝐓𝐡𝐫𝐞𝐚𝐝𝐬: ${totalThreads.length}`;

    message.reply(uptimeMessage);
  }
};

// Function to format uptime into readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
