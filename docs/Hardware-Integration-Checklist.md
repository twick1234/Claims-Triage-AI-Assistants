# Hardware Integration Checklist

Practical migration checklist for the day the Sipeed LicheeRV Nano W boards arrive (expected 19–27 March 2026).

See `docs/Hardware-Architecture.md` for full architecture details.

---

## Phase 1 — Unboxing and Firmware

- [ ] 5 boards arrived and unboxed — verify no shipping damage
- [ ] SD cards (min 8 GB each) sourced and ready
- [ ] LicheeRV Nano Buildroot firmware image downloaded
- [ ] SD cards flashed (one per board)
  ```bash
  sudo ./flash.sh /dev/sdX lichee-nano-buildroot.img
  ```
- [ ] SD cards inserted into boards
- [ ] All 5 boards power on successfully (green LED)

---

## Phase 2 — Network Setup

- [ ] Router / hotspot admin panel open
- [ ] Static DHCP reservations assigned by board MAC address:
  - Board 1 (Grace) → 192.168.1.51
  - Board 2 (Swift) → 192.168.1.52
  - Board 3 (Kara) → 192.168.1.53
  - Board 4 (Phoenix) → 192.168.1.54
  - Board 5 (Triage) → 192.168.1.55
- [ ] All 5 boards connected to WiFi and reachable by ping:
  ```bash
  for ip in 51 52 53 54 55; do ping -c1 192.168.1.$ip && echo "OK"; done
  ```

---

## Phase 3 — Board Setup (repeat for each board)

Run for each of the 5 boards:

- [ ] SSH into board
  ```bash
  ssh root@192.168.1.51   # replace IP per board
  ```
- [ ] Run `setup-board.sh` to install PicoClaw and dependencies
  ```bash
  ./setup-board.sh grace 8001   # agent name and port
  ```
- [ ] Deploy agent-specific `config.yaml`
  ```bash
  scp configs/grace-config.yaml root@192.168.1.51:~/.picoclaw/config.yaml
  ```
- [ ] Start PicoClaw service
  ```bash
  systemctl enable picoclaw && systemctl start picoclaw
  ```
- [ ] Confirm PicoClaw is listening
  ```bash
  curl http://192.168.1.51:8001/health
  # Expected: {"status":"ok","agent":"grace"}
  ```

Repeat above for all 5 boards (Swift :52:8002, Kara :53:8003, Phoenix :54:8004, Triage :55:8005).

---

## Phase 4 — Dashboard Configuration

- [ ] Open dashboard `.env.local`
- [ ] Set `AGENT_MODE=hardware`
- [ ] Set all board URLs:
  ```bash
  GRACE_URL=http://192.168.1.51:8001
  SWIFT_URL=http://192.168.1.52:8002
  KARA_URL=http://192.168.1.53:8003
  PHOENIX_URL=http://192.168.1.54:8004
  TRIAGE_URL=http://192.168.1.55:8005
  ```
- [ ] Rebuild and restart dashboard
  ```bash
  npm run build && npm start
  ```
- [ ] Open `http://localhost:3000/hardware` — verify all 5 boards show "Online"

---

## Phase 5 — End-to-End Testing

- [ ] Send a test message via `/chat` — verify routing to correct board
- [ ] Send a distressed message → Grace (Board 1) responds
- [ ] Send an urgent claim message → Swift (Board 2) responds
- [ ] Send a policy question → Kara (Board 3) responds
- [ ] Send an angry message → Phoenix (Board 4) responds
- [ ] Fire a full typhoon scenario from `/simulator`
- [ ] Verify metrics update on `/metrics` page
- [ ] Verify hardware dashboard (`/hardware`) shows active conversation counts per board

---

## Phase 6 — Demo Readiness

- [ ] All 5 boards labelled (agent name + colored sticky dot)
- [ ] Boards arranged in order on the demo table
- [ ] USB hub or power bank connected and powering all boards
- [ ] Spare USB-C cable available per board
- [ ] Dashboard visible on laptop screen (or mirrored to projector)
- [ ] Management metrics page bookmarked
- [ ] Simulator scenarios loaded and tested
- [ ] Backup plan confirmed: `AGENT_MODE=simulation` reverts to laptop-only if any board fails

---

## Quick Health Check (run before any demo)

```bash
#!/bin/bash
AGENTS=(grace swift kara phoenix triage)
PORTS=(8001 8002 8003 8004 8005)
IPS=(51 52 53 54 55)

for i in 0 1 2 3 4; do
  URL="http://192.168.1.${IPS[$i]}:${PORTS[$i]}/health"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  if [ "$STATUS" = "200" ]; then
    echo "[OK]   Board $((i+1)) — ${AGENTS[$i]} @ ${IPS[$i]}:${PORTS[$i]}"
  else
    echo "[FAIL] Board $((i+1)) — ${AGENTS[$i]} @ ${IPS[$i]}:${PORTS[$i]} (HTTP $STATUS)"
  fi
done
```

---

## Rollback

If any board is unreachable during the demo:

1. Set `AGENT_MODE=simulation` in `.env.local`
2. Rebuild: `npm run build && npm start`
3. All agents revert to in-process simulation automatically
4. No other changes required — routing, store, UI unchanged

The simulation mode is always the fallback and is fully functional for demo purposes.
