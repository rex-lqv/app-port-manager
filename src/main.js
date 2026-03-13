const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { getAllPorts, getPortInfo, killProcess } = require('./lsof');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 640,
    minWidth: 700,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Simple tray icon (16x16 white square placeholder)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Port Manager');
  tray.on('click', () => {
    if (mainWindow.isVisible()) mainWindow.hide();
    else { mainWindow.show(); mainWindow.focus(); }
  });
  const menu = Menu.buildFromTemplate([
    { label: 'Open Port Manager', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  // createTray(); // uncomment for menubar mode
  app.on('activate', () => mainWindow.show());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-all-ports', async () => {
  return getAllPorts();
});

ipcMain.handle('get-port-info', async (_, port) => {
  return getPortInfo(port);
});

ipcMain.handle('kill-process', async (_, pid) => {
  try {
    await killProcess(pid);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('open-external', async (_, url) => {
  shell.openExternal(url);
});
