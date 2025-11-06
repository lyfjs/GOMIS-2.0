const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    show: false,
    icon: path.join(__dirname, 'src', 'assets', 'logo.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    }
  });

  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => win.show());

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    win.loadURL(devUrl).catch(() => win.loadURL('http://localhost:3000'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
