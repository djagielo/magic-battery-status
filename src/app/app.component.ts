import { Component, OnInit } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import * as magic_battery from 'magic-battery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(public electronService: ElectronService,
    private translate: TranslateService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit() {
    const ipc = this.electronService.ipcRenderer;
    ipc.on('start-monitoring', function (event, interval) {
      console.log('start monitoring interval: ')
      console.table(interval)
      magic_battery.getBatteryPercentageInfo(interval).subscribe(
          info => {
            console.log('monitoring-read');
              ipc.send('monitoring-read', info)
          }
        );
  })
  
  ipc.send('dom-is-ready');
  
  }
}
