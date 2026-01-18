const { app, BrowserWindow } = require('electron');
require('dotenv').config()
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Opcional por ahora
      nodeIntegration: true,
    },
  });

  // Si estás en desarrollo, carga la URL de Vite
  // Si estás en producción, cargará el archivo index.html de la carpeta dist
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, './dist/index.html')}`;

  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});