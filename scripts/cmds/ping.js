module.exports = {
	config: {
		name: "ping",
		aliases: ["Ms", "pong"],
		version: "1.1",
		author: "RL",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Check bot's response time"
		},
		description: {
			en: "Replies with the bot's response time to check its latency."
		},
		category: "Utilities",
		guide: {
			en: "Type d ping or d Ms or d pong to check response time"
		}
	},

	onStart: async function ({ message, api }) {
		try {
			const startTime = Date.now();
			const sentMessage = await message.reply("🏓 Pong!");
			const latency = Date.now() - startTime;

			// Edit the initial "Pong" message with the calculated latency
			api.editMessage(`⏱ Response Time: ${latency} ms`, sentMessage.messageID);
		} catch (error) {
			message.reply("❌ Error calculating response time.");
			console.error(error);
		}
	}
};