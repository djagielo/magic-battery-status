"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var win, serve, tray1, tray2;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
function createWindow() {
    console.log('createWindow');
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        show: false
    });
    var winMonitor = new electron_1.BrowserWindow({
        width: 400,
        height: 400,
        show: false
    });
    electron_1.app.dock.hide();
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'src/monitor.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    electron_1.ipcMain.on('dom-is-ready', function () {
        console.log('dom is ready');
        win.webContents.send('start-monitoring', 10000);
    });
    electron_1.ipcMain.on('monitoring-read', function (event, result) {
        console.log(result);
        var title = '';
        result.forEach(function (el) {
            if (el.deviceName === 'MagicMouse2') {
                title += 'M:' + el.batteryPercent + '%';
            }
            else if (el.deviceName === 'MagicKeyboard') {
                title += 'K:' + el.batteryPercent + '%';
            }
        });
        tray1.setTitle(title);
    });
    win.webContents.openDevTools();
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}
function onReady() {
    createWindow();
    tray1 = new electron_1.Tray('keyboard.png');
    tray1.setTitle('Loading');
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', onReady);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
