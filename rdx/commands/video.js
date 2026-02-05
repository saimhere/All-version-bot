const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const yts = require('yt-search');

module.exports.config = {
    name: "video",
    version: "5.0.0",
    permission: 0,
    prefix: true,
    premium: false,
    category: "media",
    credits: "SAIM BOLTI PUBLIC",
    description: "Download video from YouTube",
    commandCategory: "media",
    usages: ".video [video name]",
    cooldowns: 5
};

const API_BASE = "https://yt-tt.onrender.com";

async function downloadVideo(videoUrl) {
    try {
        const response = await axios.get(`${API_BASE}/api/youtube/video`, {
            params: { url: videoUrl },
            timeout: 120000,
            responseType: 'arraybuffer'
        });
        
        if (response.data) {
            return { success: true, data: response.data };
        }
        return null;
    } catch (err) {
        console.log("Video download failed:", err.message);
        return null;
    }
}

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(" ");
    
    if (!query) {
        return api.sendMessage("❌ Please provide a video name", event.threadID, event.messageID);
    }

    const frames = [
        "🩵▰▱▱▱▱▱▱▱▱▱ 10%",
        "💙▰▰▱▱▱▱▱▱▱▱ 25%",
        "💜▰▰▰▰▱▱▱▱▱▱ 45%",
        "💖▰▰▰▰▰▰▱▱▱▱ 70%",
        "💗▰▰▰▰▰▰▰▰▰▰ 100% 😍"
    ];

    const searchMsg = await api.sendMessage(`🔍 Searching: ${query}\n\n${frames[0]}`, event.threadID);

    try {
        const searchResults = await yts(query);
        const videos = searchResults.videos;
        
        if (!videos || videos.length === 0) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage("❌ No results found", event.threadID, event.messageID);
        }

        const firstResult = videos[0];
        const videoUrl = firstResult.url;
        const title = firstResult.title;
        const author = firstResult.author.name;

        await api.editMessage(`🎬 Found: ${title}\n\n${frames[1]}`, searchMsg.messageID, event.threadID);
        await api.editMessage(`🎬 Downloading...\n\n${frames[2]}`, searchMsg.messageID, event.threadID);

        const downloadResult = await downloadVideo(videoUrl);
        
        if (!downloadResult || !downloadResult.success) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage("❌ Download server is busy. Please try again later.", event.threadID, event.messageID);
        }

        await api.editMessage(`🎬 Processing...\n\n${frames[3]}`, searchMsg.messageID, event.threadID);

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        const videoPath = path.join(cacheDir, `${Date.now()}_video.mp4`);
        fs.writeFileSync(videoPath, Buffer.from(downloadResult.data));

        await api.editMessage(`🎬 Complete!\n\n${frames[4]}`, searchMsg.messageID, event.threadID);

        await api.sendMessage(
            {
                body: `🎬 ${title}\n📺 ${author}`,
                attachment: fs.createReadStream(videoPath)
            },
            event.threadID
        );

        setTimeout(() => {
            try {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                api.unsendMessage(searchMsg.messageID);
            } catch (err) {
                console.log("Cleanup error:", err);
            }
        }, 15000);

    } catch (error) {
        console.error("Video command error:", error.message);
        try { api.unsendMessage(searchMsg.messageID); } catch(e) {}
        return api.sendMessage("❌ An error occurred. Please try again.", event.threadID, event.messageID);
    }
};
