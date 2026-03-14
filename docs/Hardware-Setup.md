# Hardware Setup — Claims Triage AI Agents

> This document is written for Claude Code to follow.
> It covers both the current laptop setup and the target Sipeed board setup.

---

## Current State (March 2026)

All agents are running on the **laptop via PicoClaw**, proving the pattern before hardware arrives.

### Live Telegram Bots

| Agent | Bot | Laptop Port | Status |
|-------|-----|-------------|--------|
| Triage 🎯 | @ChuTriage_bot | 18791 | ✅ Live |
| Grace 💙 | @ChuGrace_bot | 18790 | ✅ Live |
| Swift ⚡ | @ChuSwift_bot | 18792 | ✅ Live |
| Kara 📚 | @ChuKaraKara_bot | 18793 | ✅ Live |
| Phoenix 🔥 | @ChuPhoenix_bot | 18794 | ⏳ BotFather throttled |

### How to Start All Bots

```bash
~/start-chubots.sh
```

This starts all PicoClaw instances. Logs go to `/tmp/chubots/`.

To stop all:
```bash
pkill -f 'picoclaw gateway'
```

### Config Locations

| Agent | PicoClaw Home | Config |
|-------|--------------|--------|
| Grace | `~/.picoclaw/` | `~/.picoclaw/config.json` |
| Triage | `~/.picoclaw-triage/` | `~/.picoclaw-triage/config.json` |
| Swift | `~/.picoclaw-swift/` | `~/.picoclaw-swift/config.json` |
| Kara | `~/.picoclaw-kara/` | `~/.picoclaw-kara/config.json` |
| Phoenix | `~/.picoclaw-phoenix/` | `~/.picoclaw-phoenix/config.json` |

### Auth

All instances use Claude.ai OAuth (no API credits needed). Auth is in `~/.picoclaw/auth.json` — copied to each agent directory.

If the OAuth token expires, re-authenticate:
```bash
~/bin/picoclaw auth login --provider anthropic --setup-token
# Paste output of: claude setup-token
# Then copy auth.json to all agent directories:
cp ~/.picoclaw/auth.json ~/.picoclaw-triage/auth.json
cp ~/.picoclaw/auth.json ~/.picoclaw-swift/auth.json
cp ~/.picoclaw/auth.json ~/.picoclaw-kara/auth.json
cp ~/.picoclaw/auth.json ~/.picoclaw-phoenix/auth.json
```

### Context Handoff Flow

1. Customer messages **@ChuTriage_bot**
2. Triage reads situation, picks specialist, replies with the bot handle + a `[Context: ...]` line
3. Customer taps the specialist bot, pastes the context line as first message
4. Specialist reads context silently, opens with a personalised response — no repetition

---

## API Keys

| Key | File | Notes |
|-----|------|-------|
| Anthropic (picoClaw_key) | `C:\Users\markl\Downloads\picoclaw-project\picoClaw.txt` | ⚠️ No credits — using OAuth instead |
| @ChuGrace_bot token | `C:\Users\markl\Downloads\picoclaw-project\chuGrace_bot.txt` | In `~/.picoclaw/config.json` |
| All ChuBots tokens | `C:\Users\markl\Downloads\picoclaw-project\ChuBots.txt` | In respective config.json files |

---

## Target Hardware — Sipeed LicheeRV Nano W

### What You Have

| Item | Detail |
|------|--------|
| Board | Sipeed LicheeRV Nano W |
| CPU | SOPHGO SG2002, RISC-V C906 @ 1 GHz |
| RAM | 256 MB DDR3 |
| Network | WiFi 6 + BT 5.2 |
| Power | USB-C, 1–2W |
| OS | Buildroot Linux (SD card — already flashed) |
| SD card | Flashed with `2026-01-14-16-03-d4003f.img` |
| PicoClaw | v0.2.2 — `picoclaw_riscv64.deb` |

### Phased Rollout

| Phase | Board | Agent | IP | Port | Bot |
|-------|-------|-------|----|------|-----|
| Phase 1 | Board 1 | Grace 💙 | 192.168.1.51 | 8001 | @ChuGrace_bot |
| Phase 2 | Board 2 | Swift ⚡ | 192.168.1.52 | 8002 | @ChuSwift_bot |
| Phase 3 | Board 3 | Kara 📚 | 192.168.1.53 | 8003 | @ChuKaraKara_bot |
| Phase 4 | Board 4 | Phoenix 🔥 | 192.168.1.54 | 8004 | @ChuPhoenix_bot |
| Phase 5 | Board 5 | Triage 🎯 | 192.168.1.55 | 8005 | @ChuTriage_bot |

### What Moving to Hardware Means

Moving an agent from laptop to board = identical steps, different machine. The Telegram bot token and Claude OAuth are unchanged. Only the host changes.

On the laptop: `PICOCLAW_HOME=~/.picoclaw-grace ~/bin/picoclaw gateway`
On the board: `picoclaw gateway` (installed system-wide via dpkg)

---

## Board Setup — Step by Step (When Board Arrives)

### Step 1 — Physical setup

1. Insert SD card into underside slot
2. Connect USB-C power
3. Wait 60 seconds for boot

### Step 2 — Find IP

Check router DHCP leases for `licheervnano`. Tell Claude Code the IP — setup continues from there.
Recommended: set static DHCP reservation at `192.168.1.51`.

### Step 3 — SSH in

```bash
ssh root@192.168.1.51
# Password: root (or blank)
```

### Step 4 — WiFi (if needed)

```bash
ping -c 3 8.8.8.8
# If not connected:
wpa_passphrase "YourSSID" "YourPassword" >> /etc/wpa_supplicant.conf
wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant.conf
udhcpc -i wlan0
```

### Step 5 — Install PicoClaw (RISC-V 64-bit)

```bash
wget https://github.com/sipeed/picoclaw/releases/download/v0.2.2/picoclaw_riscv64.deb
dpkg -i picoclaw_riscv64.deb
picoclaw version
```

### Step 6 — Copy config from laptop

The config from `~/.picoclaw/` (Grace) goes to the board. Easiest via scp:

```bash
# From laptop:
scp ~/.picoclaw/config.json root@192.168.1.51:~/.picoclaw/config.json
scp ~/.picoclaw/auth.json root@192.168.1.51:~/.picoclaw/auth.json
scp -r ~/.picoclaw/workspace root@192.168.1.51:~/.picoclaw/workspace
```

### Step 7 — systemd service

```bash
cat > /etc/systemd/system/picoclaw-grace.service << 'EOF'
[Unit]
Description=PicoClaw Grace Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/root/.picoclaw
ExecStart=/usr/bin/picoclaw gateway
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
systemctl status picoclaw-grace
```

### Step 8 — Health cron

```bash
(crontab -l 2>/dev/null; echo "*/5 * * * * systemctl is-active --quiet picoclaw-grace || systemctl restart picoclaw-grace") | crontab -
```

### Step 9 — Wire into dashboard

On the laptop, update `.env.local`:

```bash
AGENT_MODE=hardware
GRACE_URL=http://192.168.1.51:8001
```

Restart `npm run dev` — Grace shows as "Live board" on the dashboard.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't SSH | Check IP in router DHCP, try `ssh root@licheervnano.local` |
| No WiFi | Run `ip link` — interface may be `wlan0` or `wlan1` |
| picoclaw not found after install | Try `which picoclaw` or `/usr/local/bin/picoclaw` |
| Service fails to start | `journalctl -u picoclaw-grace -n 50` |
| OAuth expired | Re-run `picoclaw auth login --setup-token` and copy `auth.json` |
| Telegram not responding | Confirm bot token with @BotFather — `/mybots` |
| Board unreachable | Confirm both on same WiFi / hotspot |
