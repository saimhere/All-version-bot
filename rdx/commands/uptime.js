const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const startTime = new Date(); // Moved outside onStart

module.exports = {
  config: {
    name: "uptime",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "SAIM BOLTI PUBLIC",
    description: "test",
    commandCategory: "box",
    usages: "test",
    dependencies: {
      "axios": ""
    },
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;

      const seconds = uptimeInSeconds;
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const loadAverage = os.loadavg();
      const cpuUsage =
        os
          .cpus()
          .map((cpu) => cpu.times.user)
          .reduce((acc, curr) => acc + curr) / os.cpus().length;

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
await api.sendMessage({
  body: "⚡ | Checking system status, please wait...",
}, event.threadID);

const ping = Date.now() - timeStart;

let pingStatus = "❌ | Bad System";
if (ping < 1000) {
  pingStatus = "✅ | Smooth System";
}

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

      const imgPath = path.join(__dirname, "cache", "uptime.png");
      const imgUrl = "https://i.ibb.co/TqwtBwF2/2c307b069cfd.gif"; // Updated with ibb link

      try {
        const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
        await fs.outputFile(imgPath, Buffer.from(response.data));

        api.sendMessage(
          {
            body: systemInfo,
            attachment: fs.createReadStream(imgPath),
          },
          event.threadID,
          () => {
             if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        );
      } catch (e) {
        api.sendMessage(systemInfo, event.threadID);
      }
} catch (error) {
  console.error("Error retrieving system information:", error);
  api.sendMessage(
    "Unable to retrieve system information.",
    event.threadID,
    event.messageID,
  );
}
},
};
