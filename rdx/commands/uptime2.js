const os = require("os");

const startTime = new Date();

module.exports = {
  config: {
    name: 'uptime2',
    aliases: ['systeminfo', 'sysinfo'],
    description: 'Check system uptime and info',
    credits: 'SAIM BOLTI PUBLIC',
    usage: 'uptime2',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, send }) {
    const { threadID, messageID } = event;
    
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;

      const seconds = uptimeInSeconds;
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const cpuUsage = os.cpus().map((cpu) => cpu.times.user).reduce((acc, curr) => acc + curr) / os.cpus().length;

      const totalMemoryGB = os.totalmem() / 1024 ** 3;
      const freeMemoryGB = os.freemem() / 1024 ** 3;
      const usedMemoryGB = totalMemoryGB - freeMemoryGB;

      const currentDate = new Date();
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const date = currentDate.toLocaleDateString("en-US", options);
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });

      const timeStart = Date.now();
      await api.sendMessage({ body: "⚡ | Checking system status..." }, threadID);

      const ping = Date.now() - timeStart;
      let pingStatus = ping < 1000 ? "✅ | Smooth System" : "❌ | Bad System";

      const systemInfo = `
┏━━━━━༺༻━━━━━┓
         𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎
┗━━━━━༺༻━━━━━┛

╭──────[ ✦ ]──────╮
➤ ⏳ 𝗨𝗣𝗧𝗜𝗠𝗘: ${uptimeFormatted}
➤ 🖥️ 𝗢𝗦: ${os.type()} ${os.arch()}
➤ ⚙️ 𝗡𝗢𝗗𝗘 𝗩𝗘𝗥: ${process.version}
➤ 🧠 𝗖𝗣𝗨: ${os.cpus()[0].model}
➤ 💾 𝗦𝗧𝗢𝗥𝗔𝗚𝗘: ${usedMemoryGB.toFixed(2)} GB / ${totalMemoryGB.toFixed(2)} GB
➤ 📈 𝗖𝗣𝗨 𝗨𝗦𝗔𝗚𝗘: ${cpuUsage.toFixed(1)}%
➤ 🧹 𝗥𝗔𝗠 𝗨𝗦𝗔𝗚𝗘: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
╰──────[ ✦ ]──────╯

┏━━━━━༺༻━━━━━┓
         𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒
┗━━━━━༺༻━━━━━┛

➤ 📅 𝗗𝗔𝗧𝗘: ${date}
➤ ⏰ 𝗧𝗜𝗠𝗘: ${time}
➤ ⚡ 𝗣𝗜𝗡𝗚: ${ping} ms
➤ ⭐ 𝗦𝗧𝗔𝗧𝗨𝗦: ${pingStatus}
`;

      return send.reply(systemInfo);
    } catch (error) {
      console.error("Error retrieving system information:", error);
      return send.reply("Unable to retrieve system information.");
    }
  }
};
