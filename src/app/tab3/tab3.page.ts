import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Barcode, BarcodeScanner, BarcodeFormat, BarcodeValueType } from '@capacitor-mlkit/barcode-scanning';
import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';

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
  barcodes: Barcode[] = [
    /*{
      displayValue: 'Capacitorjs', 
      format: BarcodeFormat.QrCode, 
      rawValue: 'Última Hora es un periódico matutino de Paraguay, cuya sede de edición se encuentra en la ciudad de Asunción. Su fundación tuvo lugar el 8 de octubre de 1973, en pleno período stronista, bajo la dirección de Isaac Kostianovsky. En sus primeros años, se caracterizó por su formato vespertino.', 
      valueType: BarcodeValueType.Text
    },
    {
      displayValue: 'Capacitorjs',
      format: BarcodeFormat.QrCode,
      rawValue: 'https://www.ultimahora.com/',
      valueType: BarcodeValueType.Url
    },
    {
      displayValue: 'Capacitorjs',
      format: BarcodeFormat.QrCode,
      rawValue: 'WIFI:T:WPA;S:Rojas y Asociados;P:RojasyRojas;H:true;',
      valueType: BarcodeValueType.Wifi
    }*/
  ];

  wifiData: any = [
    /*
    {
      icon: 'globe-outline',
      value: 'Rojas y Asociados',
      showCopy: true
    },
    {
      icon: 'finger-print-outline',
      value: 'RojasyRojas',
      showCopy: true
    },
    {
      icon: 'eye-off-outline',
      value: 'Oculto',
      showCopy: false
    }*/
  ];

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
        }).catch(() => {
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

    if (type === BarcodeValueType.Wifi) {
      NativeSettings.openAndroid({
        option: AndroidSettings.Wifi
      })
    }
  }

  async wifiFunction(value: string){
    this.wifiData = [];
    value = value.replace('WIFI:','');
    value = value.replace('wifi:','');
    const wifi = value.split(';');
    for (const element of wifi) {
      const type = element && element.length > 0 ? element.split(':') : []
      if (type && type.length > 0 && type[0].toLowerCase() === 's') {
        const obj = {
          icon: 'wifi-outline',
          value: type[1],
          showCopy: true
        };
        if (!this.wifiData.includes(obj)) this.wifiData.push(obj);
      }
      if (type && type.length > 0 && type[0].toLowerCase() === 'p') {
        const obj = {
          icon: 'ellipsis-horizontal-sharp',
          value: type[1],
          showCopy: true
        };
        if (!this.wifiData.includes(obj)) this.wifiData.push(obj);
      }
      if (type && type.length > 0 && type[0].toLowerCase() === 't') {
        const obj = {
          icon: 'bag-outline',
          value: type[1],
          showCopy: false
        };
        if (!this.wifiData.includes(obj)) this.wifiData.push(obj);
      }
      if (type && type.length > 0 && type[0].toLowerCase() === 'h') {
        const isHidden = type[1]
        const obj = {
          icon: isHidden === 'false' ? 'eye-outline' : 'eye-off-outline',
          value:isHidden === 'false' ? 'Visible' : 'Oculto',
          showCopy: false
        };
        if (!this.wifiData.includes(obj)) this.wifiData.push(obj);
      }
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
  
      await this.presentToast('bottom');
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
      if (barcodes[0].valueType === BarcodeValueType.Wifi) {
        this.wifiFunction(barcodes[0].rawValue);
      } else {
        this.wifiData = [];
      }
    } catch (error) {
      console.log(error);
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
      if (barcodes[0].valueType === BarcodeValueType.Wifi) {
        this.wifiFunction(barcodes[0].rawValue);
      } else {
        this.wifiData = [];
      }
    } catch (error) {
      console.log(error);
      this.showProgressBar = false;
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
        result = `Hacer Llamada`;
        break;
      case BarcodeValueType.Wifi:
        result = `Configurar WiFi`;
        break;
      case BarcodeValueType.Url:
        result = `Visitar sitio web`
        if (value.includes('wa.me') || value.includes('whatsapp')) {
          result = `Mandar un WhatsApp`;
        }
        if (value.includes('youtube')) {
          result = `Ir a Youtube`;
        }
        if (value.includes('facebook')) {
          result = `Ir a Facebook`;
        }
        if (value.includes('instagram')) {
          result = `Ir a Instagram`;
        }
        if (value.includes('linkedin')) {
          result = `Ir a LinkedIn`;
        }
        if (value.includes('twitter') || value.includes('x.com')) {
          result = `Ir a Twitter`;
        }
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
        result = `call-outline`;
        break;
      case BarcodeValueType.Wifi:
        result = `wifi-outline`;
        break;
      case BarcodeValueType.Url:
        result = `link`;
        if (value.includes('wa.me') || value.includes('whatsapp')) {
          result = `logo-whatsapp`;
        }
        if (value.includes('youtube')) {
          result = `logo-youtube`;
        }
        if (value.includes('facebook')) {
          result = `logo-facebook`;
        }
        if (value.includes('instagram')) {
          result = `logo-instagram`;
        }
        if (value.includes('linkedin')) {
          result = `logo-linkedin`;
        }
        if (value.includes('twitter') || value.includes('x.com')) {
          result = `logo-twitter`;
        }
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
      case BarcodeValueType.Wifi:
        result = `Wifi`;
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
