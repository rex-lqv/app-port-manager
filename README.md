# Port Manager

> A clean macOS app to see what's running on your ports and kill processes instantly.

No more typing `lsof -i :3000` in terminal. Just open, see, kill.

![Port Manager Demo](assets/demo.gif)

---

## Download

**[⬇ Download latest release](https://github.com/rex-lqv/port-manager/releases/latest)**

- `Port.Manager-arm64.dmg` — Apple Silicon (M1/M2/M3/M4)
- `Port.Manager-x64.dmg` — Intel Mac

---

## Install

1. Download the `.dmg` for your Mac
2. Open DMG → drag **Port Manager** to Applications
3. **First launch:** Right-click the app → **Open** → click **Open**
   *(macOS blocks unsigned apps on first run — this is a one-time step)*

Or remove the quarantine flag via Terminal:
```bash
xattr -cr /Applications/Port\ Manager.app
```

---

## Features

### Port Overview
- Lists every active listening port on your machine — sorted by port number
- Shows **process name**, **PID**, **protocol** (TCP/UDP), and **user** for each entry
- Live **port count** badge in the header so you always know how many are open

### Kill Any Process
- Hit the **Kill** button next to any port — a confirm dialog shows exactly what will be terminated (`"node" PID 12345 on :3000`)
- Instant feedback via **toast notification** — success or error, then the list auto-refreshes

### Search & Filter
- Real-time search bar filters by **port number**, **process name**, **PID**, or **username** simultaneously
- Results update as you type — no need to hit Enter

### Quick Jump Sidebar
- One-click shortcuts for the ports you hit most: **3000**, **5173**, **8080**, **8000**, **5432**, **6379**, **27017**, **4200**
- Clicking a shortcut instantly filters to that port

### Auto Refresh
- Toggle **Auto Refresh** to poll every 2 seconds automatically
- Newly opened ports are **highlighted** so you can spot them at a glance
- Or use the manual **Refresh** button when you need a one-off scan

### Status Bar
- A pulsing dot shows when the app is **scanning** vs **idle**
- Always displays the total count of listening ports

### 100% Local & Private
- Zero network requests — everything runs through `lsof` on your own machine
- No telemetry, no analytics, no account required

---

## Why?

Every developer runs `lsof -i :3000` multiple times a day.
No macOS app does this well.
This one does. It's free. Open source. Always will be.

---

## Free & Open Source

Port Manager is **MIT licensed** and free forever.

If it saves you time, consider buying me a coffee:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/rexlqv)

---

## Build from source

```bash
git clone https://github.com/rex-lqv/port-manager
cd port-manager
npm install
npm run dev       # run in dev mode
npm run build     # build DMG
```

Requires: Node.js 18+, macOS

---

## License

MIT © [rex-lqv](https://github.com/rex-lqv)
