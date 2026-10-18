import JSZip from 'jszip';
import { BotConfig } from '../types';

export function generateBotCode(config: BotConfig): string {
  const host = config.serverHost.trim() || 'YOUR_SERVER.aternos.me';
  const port = Number(config.serverPort) || 25565;
  const username = config.botUsername.trim() || 'HellBot_AAGOP';
  const reconnectSecs = config.reconnectIntervalSeconds || 15;
  const maxHours = config.maxSessionHours || 10;
  const distance = config.attackDistance || 3.5;

  return `/**
 * =========================================================================
 *  HELLBOT - 24/7 ATERNOS MINECRAFT SERVER BOT ENGINE
 *  Created by @hell_king_ansh on Instagram
 *  Configured for: ${host}:${port}
 * =========================================================================
 */

const mineflayer = require('mineflayer');

// CUSTOMER SMP SERVER CONFIGURATION
const SERVER_HOST = '${host}';
const SERVER_PORT = ${port};
const BOT_USERNAME = '${username}';
const RECONNECT_DELAY_MS = ${reconnectSecs * 1000};
const MAX_SESSION_HOURS = ${maxHours};

let reconnectTimer = null;
let stopped = false;

${
  config.enableCrashProtection
    ? `// Process crash control (Prevents Wispbyte/Termux/Node.js from crashing)
process.on('uncaughtException', (err) => {
  console.log('[HellBot Guard] Uncaught Exception caught:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('[HellBot Guard] Unhandled Rejection caught:', reason);
});
`
    : ''
}
function startBot() {
  if (stopped) return;

  console.log('[HellBot] Connecting to ' + SERVER_HOST + ':' + SERVER_PORT + ' as ' + BOT_USERNAME + '...');

  let bot;
  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_USERNAME,
      // Check timeout interval for high ping / Aternos queue stability
      checkTimeoutInterval: 60 * 1000${config.minecraftVersion && config.minecraftVersion !== 'auto' ? `,\n      version: '${config.minecraftVersion}'` : ''}
    });
  } catch (e) {
    console.log('[HellBot Error] Bot creation error:', e.message);
    scheduleReconnect();
    return;
  }

  const hostileMobs = [
    'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider',
    'drowned', 'husk', 'stray', 'witch', 'phantom',
    'enderman', 'zombified_piglin', 'piglin', 'blaze',
    'wither_skeleton', 'slime'
  ];

  let attackInterval = null;
  let targetMob = null;

  bot.once('spawn', () => {
    console.log('[HellBot] >>> BOT CONNECTED & SPAWNED SUCCESSFULLY <<<');
    console.log('[HellBot] Server: ' + SERVER_HOST + ':' + SERVER_PORT);
    console.log('[HellBot] Anti-AFK Routine: ACTIVE');
    
    // Default Forward Walk Start
    bot.setControlState('forward', true);

    ${
      config.enableAntiAfk
        ? `// Random Head Move, Crouch & Sprint Actions (Anti-AFK System)
    startRandomActions(bot);`
        : `// Anti-AFK disabled by user configuration`
    }

    // Auto-quit limit to refresh session after ${maxHours} hours
    setTimeout(() => {
      if (bot && bot.entity) {
        console.log('[HellBot] ${maxHours} hour session limit reached. Cycling session...');
        stopped = true;
        bot.quit('Session cycle limit reached');
        setTimeout(() => {
          stopped = false;
          startBot();
        }, 5000);
      }
    }, MAX_SESSION_HOURS * 60 * 60 * 1000);

    ${
      config.enableCombat
        ? `// Hostile Mob Attack Loop (Every 1 second safety check)
    attackInterval = setInterval(() => {
      if (!bot || !bot.entity) return;

      try {
        targetMob = bot.nearestEntity((entity) => {
          return (
            entity.type === 'mob' &&
            hostileMobs.includes(entity.name) &&
            entity.health > 0 &&
            bot.entity.position.distanceTo(entity.position) <= ${distance}
          );
        });

        if (targetMob) {
          bot.lookAt(targetMob.position.offset(0, targetMob.height || 1, 0), true);
          bot.attack(targetMob);
          console.log('[HellBot Combat] Defending against mob: ' + targetMob.name);
        }
      } catch (err) {
        console.log('[HellBot Combat Error] Attack loop error:', err.message);
      }
    }, 1000);`
        : `// Mob attack loop disabled by user configuration`
    }
  });

  ${
    config.enableWaterJump
      ? `bot.on('physicsTick', () => {
    if (!bot || !bot.entity) return;
    try {
      // Auto Jump in Water to prevent drowning
      bot.setControlState('jump', bot.isInWater);
    } catch (e) {}
  });`
      : ''
  }

  function startRandomActions(botInstance) {
    function nextAction() {
      var delay = Math.floor(Math.random() * 1000) + 7000;

      setTimeout(() => {
        if (!botInstance || !botInstance.entity) return;

        // Agar mob fight chal rahi hai toh action delay karein
        if (targetMob) {
          nextAction();
          return;
        }

        const chance = Math.random();

        if (chance < 0.35) {
          // Action 1: Crouch / Sneak
          botInstance.setControlState('sprint', false);
          botInstance.setControlState('sneak', true);
          randomLook(botInstance);

          setTimeout(() => {
            if (!botInstance || !botInstance.entity) return;
            botInstance.setControlState('sneak', false);
            botInstance.setControlState('forward', true);
            nextAction();
          }, 1500);

        } else if (chance < 0.70) {
          // Action 2: Sprint / Run fast
          botInstance.setControlState('sneak', false);
          botInstance.setControlState('forward', true);
          botInstance.setControlState('sprint', true);
          randomLook(botInstance);

          setTimeout(() => {
            if (!botInstance || !botInstance.entity) return;
            botInstance.setControlState('sprint', false); 
            nextAction();
          }, 2500);

        } else {
          // Action 3: Normal Walk + Head turn
          botInstance.setControlState('sprint', false);
          botInstance.setControlState('sneak', false);
          botInstance.setControlState('forward', true);
          randomLook(botInstance);

          setTimeout(() => {
            if (!botInstance || !botInstance.entity) return;
            randomLook(botInstance);
            nextAction();
          }, 1200);
        }
      }, delay);
    }

    nextAction();
  }

  function randomLook(botInstance) {
    if (!botInstance || !botInstance.entity) return;
    var yaw = (Math.random() - 0.5) * Math.PI * 2;
    var pitch = (Math.random() - 0.5) * (Math.PI / 4);

    try {
      botInstance.look(yaw, pitch, false);
    } catch (e) {}
  }

  bot.on('error', (err) => {
    console.log('[HellBot Error] BOT ERROR: ' + (err.code || err.message));
  });

  bot.on('kicked', (reason) => {
    console.log('[HellBot Kicked] BOT KICKED: ' + reason);
  });

  bot.on('end', (reason) => {
    console.log('[HellBot Disconnected] BOT DISCONNECTED: ' + reason);
    if (attackInterval) clearInterval(attackInterval);
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (stopped) return;

  if (!reconnectTimer) {
    console.log('[HellBot Reconnect] Reconnecting in ' + (RECONNECT_DELAY_MS / 1000) + ' seconds...');
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      startBot();
    }, RECONNECT_DELAY_MS);
  }
}

// Start the HellBot
startBot();
`;
}

export function generatePackageJson(botUsername: string): string {
  return JSON.stringify(
    {
      name: `hellbot-${botUsername.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'client'}`,
      version: '2.5.0',
      description: '24/7 Aternos Minecraft Bot Engine created by @hell_king_ansh',
      main: 'bot.js',
      scripts: {
        start: 'node bot.js',
        pm2: 'pm2 start ecosystem.config.js',
      },
      dependencies: {
        mineflayer: '^4.21.0',
      },
      keywords: ['minecraft', 'aternos', 'mineflayer', 'bot', 'anti-afk', 'hellbot'],
      author: 'hell_king_ansh (Instagram)',
      license: 'MIT',
    },
    null,
    2
  );
}

export function generateStartBat(): string {
  return `@echo off
title HellBot - 24/7 Aternos Server Bot by @hell_king_ansh
color 0C
echo ===============================================================
echo          HELLBOT - 24/7 ATERNOS MINECRAFT SERVER BOT
echo          Official Instagram: @hell_king_ansh
echo ===============================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b
)

if not exist node_modules (
    echo [HellBot] First time setup: Installing mineflayer...
    call npm install
)

:loop
echo [HellBot] Starting bot process...
node bot.js
echo.
echo [HellBot Alert] Bot stopped or crashed! Auto-restarting in 10 seconds...
timeout /t 10 /nobreak >nul
goto loop
`;
}

export function generateStartSh(): string {
  return `#!/bin/bash
# HellBot 24/7 Launcher for Linux / macOS / Termux on Android
# Created by @hell_king_ansh on Instagram

echo "==============================================================="
echo "         HELLBOT - 24/7 ATERNOS MINECRAFT SERVER BOT"
echo "         Official Instagram: @hell_king_ansh"
echo "==============================================================="

if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js could not be found."
    echo "On Android (Termux): run 'pkg update && pkg install nodejs'"
    echo "On Ubuntu/Debian: run 'sudo apt install nodejs npm'"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[HellBot] Installing mineflayer..."
    npm install
fi

while true; do
    echo "[HellBot] Starting bot process..."
    node bot.js
    echo "[HellBot] Bot exited. Restarting in 10 seconds... (Press Ctrl+C to abort)"
    sleep 10
done
`;
}

export function generateEcosystemConfig(botUsername: string): string {
  return `module.exports = {
  apps: [
    {
      name: 'hellbot-${botUsername.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'aternos'}',
      script: 'bot.js',
      watch: false,
      max_memory_restart: '300M',
      restart_delay: 15000,
      autorestart: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
`;
}

export function generateReadme(config: BotConfig): string {
  return `# ⚡ HellBot - 24/7 Aternos Server Bot

**Created by**: [@hell_king_ansh](https://instagram.com/hell_king_ansh) (Instagram)  
**Configured Host**: \`${config.serverHost}:${config.serverPort}\`  
**Bot Username**: \`${config.botUsername}\`  

---

## 🚀 How to Run HellBot (Choose your platform):

### 1. Windows PC (Easiest)
1. Download and extract this zip file.
2. Install **Node.js** from [https://nodejs.org](https://nodejs.org) (LTS version) if you don't already have it.
3. Double-click **\`start.bat\`**.
4. That's it! The bot will automatically install Mineflayer and connect to your Aternos server.

---

### 2. Android Phone via Termux (100% Free 24/7 Hosting)
1. Install **Termux** from F-Droid or GitHub.
2. Run these commands:
\`\`\`bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
\`\`\`
3. Extract this folder into your phone's storage or transfer it to Termux.
4. Navigate to the folder and run:
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`
5. Keep Termux running in the background with "Acquire Wakelock" notification!

---

### 3. Wispbyte / Pterodactyl / VPS (24/7 Cloud Hosting)
1. Upload all files into your server file manager.
2. In the console or startup tab, set command to: \`node bot.js\`
3. Or using PM2:
\`\`\`bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
\`\`\`

---

## ⚠️ Important Aternos Server Settings:
- **Cracked Mode**: Make sure "Cracked" is turned **ON** in your Aternos server Options page (since HellBot runs as an offline player).
- **Dynamic IP**: If your server restarts, check the Aternos "Connect" button for the current dynamic port.
- **Whitelist**: If your server has a whitelist enabled, type \`/whitelist add ${config.botUsername}\` in the Aternos console.

---

## 👑 Support & VIP Inquiries
Need help setting up or custom modifications?  
DM **@hell_king_ansh** on Instagram!
`;
}

export async function createBotZip(config: BotConfig): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `HellBot_${config.botUsername.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const root = zip.folder(folderName) || zip;

  root.file('bot.js', generateBotCode(config));
  root.file('package.json', generatePackageJson(config.botUsername));
  root.file('start.bat', generateStartBat());
  root.file('start.sh', generateStartSh());
  root.file('ecosystem.config.js', generateEcosystemConfig(config.botUsername));
  root.file('README.md', generateReadme(config));

  return await zip.generateAsync({ type: 'blob' });
}
