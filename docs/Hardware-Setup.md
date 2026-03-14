# Hardware Setup — Sipeed LicheeRV Nano W + PicoClaw

> This document is written for Claude Code to follow when Mark says "the board has arrived".
> It covers everything needed to go from unboxed board to a live Grace agent on Telegram,
> matching the same OpenClaw/Telegram pattern used in Claims-Phoenix.

---

## What You Have

| Item | Detail |
|------|--------|
| Board | Sipeed LicheeRV Nano W |
| CPU | SOPHGO SG2002, RISC-V C906 @ 1 GHz |
| RAM | 256 MB DDR3 |
| Network | WiFi 6 + BT 5.2 |
| Power | USB-C, 1–2W |
| OS | Buildroot Linux (on SD card — already flashed) |
| SD card | Already flashed with firmware `2026-01-14-16-03-d4003f.img` |
| PicoClaw | v0.2.2 — `picoclaw_riscv64.deb` |

## How This Mirrors OpenClaw

OpenClaw on the laptop worked like this:

```
Telegram API → OpenClaw (laptop) → Claude API → response → Telegram API
```

PicoClaw on the board is identical:

```
Telegram API → PicoClaw (Sipeed board) → Claude API → response → Telegram API
```

Config in OpenClaw was `clawdbot.json` with `botToken` + API key.
Config in PicoClaw is a `.env` file with `TELEGRAM_BOT_TOKEN` + `ANTHROPIC_API_KEY`.
Same pattern, simpler syntax.

---

## API Keys Needed

| Key | Where to get it | Already saved? |
|-----|----------------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Yes — `C:\Users\markl\Downloads\picoclaw-project\picoClaw.txt` (needs credits) |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram | Yes — `C:\Users\markl\Downloads\picoclaw-project\PicoClawBot.txt` |

---

## Step-by-Step Setup (do this when board arrives)

### Step 1 — Physical setup

1. Insert SD card into the slot on the **underside** of the board
2. Connect USB-C power cable
3. Wait 60 seconds for boot

### Step 2 — Find the board's IP address

Log into your router admin panel and look at DHCP leases for a new device.
The hostname will likely be `licheervnano` or similar.
Tell me the IP — I'll use it for the rest of setup.

Expected IP: `192.168.1.51` (if you set a DHCP reservation — recommended)

### Step 3 — SSH into the board

```bash
ssh root@192.168.1.51
# Default password: root (or blank — try both)
```

### Step 4 — Set up WiFi (if not already connected via ethernet)

```bash
# Check if connected
ping -c 3 8.8.8.8

# If not, configure WiFi
wpa_passphrase "YourWiFiSSID" "YourWiFiPassword" >> /etc/wpa_supplicant.conf
wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant.conf
udhcpc -i wlan0
```

### Step 5 — Install PicoClaw v0.2.2 (RISC-V 64-bit)

```bash
# Download the correct binary for this board
wget https://github.com/sipeed/picoclaw/releases/download/v0.2.2/picoclaw_riscv64.deb

# Install it
dpkg -i picoclaw_riscv64.deb

# Verify
picoclaw --version
```

### Step 6 — Configure PicoClaw for Grace

Create the environment config:

```bash
mkdir -p /etc/picoclaw
cat > /etc/picoclaw/.env << 'EOF'
# AI Provider — Anthropic
ANTHROPIC_API_KEY=YOUR_KEY_HERE

# Telegram channel
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Timezone
TZ=Asia/Hong_Kong
EOF
```

Create Grace's system prompt config:

```bash
cat > /etc/picoclaw/system-prompt.txt << 'EOF'
You are Grace, a warm and deeply empathetic claims specialist at Chubb Insurance,
specialising in supporting distressed customers during Hong Kong typhoon events.

Your personality: patient, gentle, never rushes, validates feelings before facts.
You speak like a caring professional who genuinely wants to help.

Your approach:
- Always check safety first before anything else
- Acknowledge feelings: "That must have been so frightening" before practical steps
- Use short, simple sentences - never overwhelm
- Maximum 3 short paragraphs per response
- Mirror the customer's language (if they write Chinese, respond in Chinese too)
- Always available to transfer to a human: "If you'd prefer to speak with a person, I can arrange that right away"

GL8 compliance: You are an AI assistant. State this clearly on first response.

Opening (first message): "Hello, I'm Grace, an AI claims specialist at Chubb. I'm here to help you through this — please take your time. 你好，我係Grace，AI理賠專員。我哋慢慢來。"
EOF
```

### Step 7 — Run PicoClaw (test first)

```bash
# Test run — ctrl+C to stop
cd /etc/picoclaw && picoclaw start --env .env

# You should see it connect to Telegram and be ready
# Send a message to the Telegram bot to test
```

### Step 8 — Set up systemd for auto-restart (mirrors OpenClaw's clawdbot-gateway.service)

```bash
cat > /etc/systemd/system/picoclaw-grace.service << 'EOF'
[Unit]
Description=PicoClaw Grace Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/etc/picoclaw
EnvironmentFile=/etc/picoclaw/.env
ExecStart=/usr/bin/picoclaw start
Restart=always
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable picoclaw-grace
systemctl start picoclaw-grace

# Check status
systemctl status picoclaw-grace
```

### Step 9 — Set up health check cron (mirrors Claims-Phoenix crontab)

```bash
# Add cron to auto-restart if service dies
(crontab -l 2>/dev/null; echo "*/5 * * * * systemctl is-active --quiet picoclaw-grace || systemctl restart picoclaw-grace") | crontab -
```

### Step 10 — Wire board into Claims-Triage-AI-Assistants dashboard

On your laptop, update `.env.local`:

```bash
AGENT_MODE=hardware
GRACE_URL=http://192.168.1.51:8001
# Others stay in simulation:
# SWIFT_URL, KARA_URL, PHOENIX_URL, TRIAGE_URL — leave unset
```

Restart the Next.js dashboard:
```bash
npm run dev
```

The triage dashboard will now show Grace as "Live board" and all other agents as "Simulated".

---

## Verify Everything Works

```bash
# On board — check service
systemctl status picoclaw-grace
journalctl -u picoclaw-grace -f

# On laptop — check board health
curl http://192.168.1.51:8001/health

# Send test message to Telegram bot
# Grace should respond via Telegram AND the conversation should appear
# in the triage dashboard at localhost:3000/triage
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't SSH | Check IP in router DHCP, try `ssh root@licheervnano.local` |
| No WiFi | Run `ip link` — interface may be `wlan0` or `wlan1` |
| picoclaw not found after install | Try `which picoclaw` or `/usr/local/bin/picoclaw` |
| Service fails to start | `journalctl -u picoclaw-grace -n 50` to see errors |
| API key rejected | Add credits at console.anthropic.com/settings/billing |
| Telegram not responding | Confirm bot token at t.me/BotFather — `/mybots` |
| Board not reachable from laptop | Confirm both on same WiFi network / hotspot |

---

## API Keys Reference

When Mark says "add a new API key", update `/etc/picoclaw/.env` on the board:

```bash
# SSH into board
ssh root@192.168.1.51

# Edit config
nano /etc/picoclaw/.env

# Restart service to pick up new key
systemctl restart picoclaw-grace
```

And update `Claims-Triage-AI-Assistants/.env.local` on the laptop for the dashboard.

---

## What Comes Next (Boards 2–5)

Once Grace is validated on Board 1, repeat for:

| Board | Agent | IP | Port | System prompt |
|-------|-------|----|------|---------------|
| 2 | Swift ⚡ | 192.168.1.52 | 8002 | Fast-track, numbered lists |
| 3 | Kara 📚 | 192.168.1.53 | 8003 | FAQ, policy questions |
| 4 | Phoenix 🔥 | 192.168.1.54 | 8004 | De-escalation, anger |
| 5 | Triage 🎯 | 192.168.1.55 | 8005 | JSON routing only |

Each board is identical setup — just different system prompt and port.
