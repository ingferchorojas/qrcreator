import { Component } from '@angular/core';
//import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    this.initializeApp();
  }

  initializeApp = async () => {
    // await SplashScreen.show({
    //   showDuration: 250,
    //   autoHide: true,
    // });
  }
}
