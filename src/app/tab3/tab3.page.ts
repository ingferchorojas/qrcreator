import { Component, OnInit, NgZone } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Barcode, BarcodeFormat, BarcodeScanner, BarcodeValueType,  } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  isSupported = false;
  barcodes: Barcode[] = [/*{displayValue: 'Capacitorjs', format: BarcodeFormat.QrCode, rawValue: 'smsto:0971422641', valueType: BarcodeValueType.Sms}*/];

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  async actionButton(type: BarcodeValueType, value: string) {
    const browserTypes = [
      BarcodeValueType.Sms,
      BarcodeValueType.Phone,
      BarcodeValueType.Email,
      BarcodeValueType.Url
    ];
  
    if (browserTypes.includes(type)) {
      // Abrir con el navegador el value
      window.open(value, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
      }
    }
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertFunction('Por favor, otorga permisos de cámara para usar el escáner de códigos de barras.');
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
  }

  public async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: false });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path
    });
    this.barcodes = barcodes;
  }


  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async alertFunction(message: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: message,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  getButtonText(type: string, value: string) {
    let result = 'Copiar Texto';
    switch (type) {
      case BarcodeValueType.Sms:
        result = `Mandar SMS`;
        break;
      case BarcodeValueType.Email:
        result = `Mandar Email`;
        break;
      case BarcodeValueType.Phone:
        result = `Hacer Llamada`
        break;
      case BarcodeValueType.Url:
        result = value.includes('wa.me') ? `Mandar un Whatsapp` : `Visitar sitio web`
        break;
    }
    return result;
  }

  getButtonIcon(type: string, value: string) {
    let result = 'copy';
    switch (type) {
      case BarcodeValueType.Sms:
        result = `chatbubbles-outline`;
        break;
      case BarcodeValueType.Email:
        result = `mail-outline`;
        break;
      case BarcodeValueType.Phone:
        result = `call-outline`
        break;
      case BarcodeValueType.Url:
        result = value.includes('wa.me') ? `logo-whatsapp` : `link`
        break;
    }
    return result;
  }

  getTitleText(text: string) {
    let result = text;
    switch (text) {
      case BarcodeValueType.Text:
        result = `Texto`;
        break;
      case BarcodeValueType.Phone:
        result = `Teléfono`;
        break;
      case BarcodeValueType.Url:
        result = `Enlace`;
        break;
    }
    return result;
  }
  
}
