const magic_battery = require('magic-battery');
const ipc = require('electron').ipcRenderer

ipc.on('start-monitoring', function (interval) {
    magic_battery.getBatteryPercentageInfo(interval).subscribe(
        info => {
            ipcRenderer.send('monitoring-read', info)
        }
      );
  window.close()
})

ipc.send('dom-is-ready');


