import { app, BrowserWindow, screen, Tray, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, serve, tray1, tray2;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {
  console.log('createWindow')
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    show: false
  });

  let winMonitor = new BrowserWindow({ 
    width: 400, 
    height: 400, 
    show: false 
  });

  app.dock.hide();

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'src/monitor.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

   ipcMain.on('dom-is-ready', function() {
    console.log('dom is ready')
    win.webContents.send('start-monitoring', 10000);
  });

  ipcMain.on('monitoring-read', function(event, result){
    console.log(result);
    let title = '';
    result.forEach(el => {
      if(el.deviceName === 'MagicMouse2') {
        title += 'M:' + el.batteryPercent + '%';
      } else if (el.deviceName === 'MagicKeyboard') {
        title += 'K:' + el.batteryPercent + '%';
      }
    });
    tray1.setTitle(title);
  })

  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

function onReady() {
  createWindow();
  tray1 = new Tray('keyboard.png');
  tray1.setTitle('Loading');
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', onReady);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
