import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  data: any = [];

  constructor(private alertController: AlertController) {}

  ionViewDidEnter() {
    this.getData();
  }

  async getData() {
    const { value } = await Preferences.get({ key: 'record' });
    this.data = value ? JSON.parse(value).reverse() : [{
      icon: 'information-circle',
      data: 'Historial vacío'
    }];
  }

  async alertFunction(message: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: message,
      buttons: ['Entendido']
    });
    await alert.present();
  }
}
