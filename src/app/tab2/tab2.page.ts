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
  showEmpty = true;
  

  constructor(private alertController: AlertController) {}

  ionViewDidEnter() {
    this.getData();
  }

  async getData() {
    const { value } = await Preferences.get({ key: 'record' });
    if (value && JSON.parse(value).length > 0) {
      this.data = JSON.parse(value).sort((a: any, b: any) => b.id - a.id);
      this.showEmpty = false;
    } else {
      this.showEmpty = true;
    }
  }

  async deleteItem(item: any) {
    this.data = this.data.filter((element: any) => element.id !== item.id);
    await Preferences.set({
      key: 'record',
      value: JSON.stringify(this.data)
    });
    this.getData()
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
