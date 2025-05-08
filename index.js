require('dotenv').config();
const { default: makeWASocket, useSingleFileLegacyAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const sessionData = process.env.SESSION_ID;
if (!sessionData) {
    console.error("SESSION_ID not found in .env file");
    process.exit(1);
}

const sessionFile = './session.json';
fs.writeFileSync(sessionFile, sessionData);

const { state, saveState } = useSingleFileLegacyAuthState(sessionFile);

async function startBot() {
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on("creds.update", saveState);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (msg.message?.protocolMessage?.type === 2 && msg.key.remoteJid?.includes('status')) {
                await sock.readMessages([{ remoteJid: msg.key.remoteJid, id: msg.key.id }]);
                console.log(`Status auto-read: ${msg.key.remoteJid}`);
            }
        }
    });

    console.log("Bot started with session from .env and status auto-read enabled.");
}

startBot();
