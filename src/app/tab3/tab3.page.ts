import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Barcode, BarcodeScanner, BarcodeFormat, BarcodeValueType } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  isSupported = false;
  showActionButton = false;
  showProgressBar = false;
  googleBarcodeScannerAvailable = false;
  barcodes: Barcode[] = [/*{displayValue: 'Capacitorjs', format: BarcodeFormat.QrCode, rawValue: 'Hola Mundo', valueType: BarcodeValueType.Text}*/];

  constructor(private alertController: AlertController, private toastController: ToastController) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then((result) => {
      if (result.available) {
        this.googleBarcodeScannerAvailable = result.available;
      } else {
        this.showProgressBar = true;
        BarcodeScanner.installGoogleBarcodeScannerModule().then(() => {
          this.showProgressBar = false;
          this.googleBarcodeScannerAvailable = true;
        }).catch((e) => {
          this.showProgressBar = false;
          this.googleBarcodeScannerAvailable = false;
          this.alertFunction('Error al instalar el módulo necesario para escanear códigos')
        })
      }
    }) 
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
    } 
  }

  async copyText(value: string) {
    try {
      const dummyElement = document.createElement('textarea');
      dummyElement.value = value;
      document.body.appendChild(dummyElement);
      
      dummyElement.select();
      document.execCommand('copy');
      
      document.body.removeChild(dummyElement);
  
      await this.presentToast('middle');
    } catch (err) {
      console.error(err);
    }
  }
  
  
  async scan(): Promise<void> {
    try {
      this.showProgressBar = true;
      const granted = await this.requestPermissions();
      if (!granted) {
        this.alertFunction('Por favor, otorga permisos de cámara para usar el escáner de códigos de barras.');
        return;
      }
      const { barcodes } = await BarcodeScanner.scan();
      this.showProgressBar = false;
      this.barcodes = barcodes
    } catch (error) {
      console.log(error)
      this.alertFunction(String(error))
      this.showProgressBar = false;
    }
  }

  public async readBarcodeFromImage(): Promise<void> {
    try {
      const { files } = await FilePicker.pickImages({ multiple: false });
      const path = files[0]?.path;
      if (!path) {
        return;
      }
      this.showProgressBar = true;
      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path
      });
      if (barcodes && barcodes.length < 1) {
        this.alertFunction('Error al escanear archivo')
      }
      this.showProgressBar = false;
      this.barcodes = barcodes;
    } catch (error) {
      this.showProgressBar = false;
      this.alertFunction(String(error))
    }
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
        result = value.includes('wa.me') || value.includes('whatsapp') ? `Mandar un WhatsApp` : `Visitar sitio web`
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
        result = value.includes('wa.me') || value.includes('whatsapp') ? `logo-whatsapp` : `link`
        break;
    }
    return result;
  }

  getTitleText(type: string, value: string) {
    let result = type;
    this.showActionButton = true;
    switch (type) {
      case BarcodeValueType.Text:
        this.showActionButton = false;
        result = `Texto`;
        break;
      case BarcodeValueType.Phone:
        result = `Teléfono`;
        break;
      case BarcodeValueType.Url:
        result = value.includes('wa.me') || value.includes('whatsapp') ? `WhatsApp` : `Enlace`;
        break;
      case BarcodeValueType.Product:
        this.showActionButton = false;
        result = `Producto`;
        break;
    }
    return result;
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: '¡Texto copiado!',
      duration: 1500,
      position: position,
    });

    await toast.present();
  }
  
}
