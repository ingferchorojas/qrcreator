import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import * as QRCode from 'qrcode-generator';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  @ViewChild(IonModal) modal!: IonModal;

  // QR
  textoQR: string = '';
  qrImageData: string = '';

  // Whatsapp
  whatsappModal = false;
  whatsapp = '';
  whatsappMessage = '';

  // SMS
  smsModal = false;
  sms = '';
  smsMessage = '';

  // URL
  urlModal = false;
  url = '';

  // Phone
  phoneModal = false;
  phone = '';

  // WIFI
  wifiModal = false;
  wifiSSID = '';
  wifiSecurity = '';
  wifiPassword = '';
  wifiHidden = false;

  // Email
  emailModal = false;
  email = '';
  subjectEmail = '';
  bodyEmail = '';

  // Social Media
  socialMediaModal = false;
  socialMediaUrl = '';
  socialMediaIcon = '';
  socialMediaUsername = '';

  // Record
  record_icon = '';

  constructor(private alertController: AlertController, private route: ActivatedRoute, private toastController: ToastController) {
    this.route.params.subscribe(params => {
      if (params['data']) {
        this.textoQR = params['data'];
        this.record_icon = params['icon'];
        this.qrImageData = '';
      }
    });
  }

  async generarQR() {
    if (!this.textoQR.trim()) {
      // Si el input está vacío, no hace nada
      return;
    }
  
    // Crear una instancia de QRCode
    const qr = QRCode(0, 'H');
    qr.addData(this.textoQR);
    qr.make();
  
    // Crear un elemento de imagen
    const img = new Image();
  
    // Cuando la imagen se carga, ejecuta la siguiente lógica
    img.onload = () => {
      // Crear un lienzo (canvas)
      const canvas = document.createElement("canvas");
      canvas.width = img.width + 20;
      canvas.height = img.height + 20;
  
      // Obtener el contexto 2D del lienzo
      const ctx: any = canvas.getContext("2d");
      
      // Dibujar la imagen en el lienzo
      const x = (canvas.width - img.width) / 2;
      const y = (canvas.height - img.height) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y);
  
      // Obtener la representación en base64 del lienzo en formato PNG
      this.qrImageData = canvas.toDataURL("image/png");
    };
  
    // Establecer la fuente de la imagen (esto activará el evento onload)
    img.src = qr.createDataURL(10, 0);
    await this.saveData(this.record_icon, this.textoQR)
  }

  async compartirQR(): Promise<void> {
    try {
      const currentTimeInMilliseconds = new Date().getTime();
      const imageName = `qr-${currentTimeInMilliseconds}.png`;
      const directory = Directory.Cache
      await Filesystem.writeFile({
        path: imageName,
        data: this.qrImageData,
        directory
      });
      const filePath = await Filesystem.getUri({path: imageName, directory})
      await Share.share({
        url: filePath.uri,
      });
    } catch (error) {
      console.log(error)
    }
  }

  async guardarQR(): Promise<void> {
    try {
      const currentTimeInMilliseconds = new Date().getTime();
      const imageName = `qr-${currentTimeInMilliseconds}.png`;
      const permissions = await Filesystem.checkPermissions();
      if (!permissions.publicStorage) {
        await Filesystem.requestPermissions()
      }
      try {
        await Filesystem.mkdir({path: 'qrdata', directory: Directory.Documents})
      } catch (error) {
        console.log(error)
      }
      const directory: any = Directory.Documents;
      await Filesystem.writeFile({
        path: `qrdata/${imageName}`,
        data: this.qrImageData,
        directory
      });
  
      await Filesystem.getUri({ path: imageName, directory });
      this.presentToast('bottom', 'Archivo guardado')
    } catch (error) {
      console.error('Error al guardar el archivo QR:', error);
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  openModal () {
    this.modal.present();
    this.whatsappModal = false;
    this.smsModal = false;
    this.urlModal = false;
    this.phoneModal = false;
    this.wifiModal = false;
    this.emailModal = false;
    this.socialMediaModal = false;
    this.socialMediaUsername = '';
    this.qrImageData = '';
  }

  setModal(modal: string) {
    this.openModal();
    switch (modal) {
      case 'whatsapp':
        this.whatsappModal = true;
        this.whatsapp
        break;
      case 'sms':
        this.smsModal = true;
        break;
      case 'url':
        this.urlModal = true;
        break;
      case 'phone':
        this.phoneModal = true;
        break;
      case 'wifi':
        this.wifiModal = true;
        break;
      case 'email':
        this.emailModal = true;
        break;
      case 'instagram':
        this.socialMediaModal = true;
        this.socialMediaUrl = 'https://www.instagram.com/';
        this.socialMediaIcon = 'logo-instagram';
        break;
      case 'facebook':
        this.socialMediaModal = true;
        this.socialMediaUrl = 'https://www.facebook.com/';
        this.socialMediaIcon = 'logo-facebook';
        break;
      case 'linkedin':
        this.socialMediaModal = true;
        this.socialMediaUrl = 'https://www.linkedin.com/in/';
        this.socialMediaIcon = 'logo-linkedin';
        break;
      case 'twitter':
        this.socialMediaModal = true;
        this.socialMediaUrl = 'https://twitter.com/';
        this.socialMediaIcon = 'logo-twitter';
        break;
      case 'youtube':
        this.socialMediaModal = true;
        this.socialMediaUrl = 'https://www.youtube.com/';
        this.socialMediaIcon = 'logo-youtube';
        break;
    }
  }

  // Cerrar cualquier modal
  closeModal() {
    this.modal.dismiss(null, 'cancel')
    this.textoQR = ''
  }

  async confirmWhatsapp() {
    if (this.whatsapp.length < 1) {
      const message = 'El número es requerido';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `https://wa.me/${this.whatsapp}`
    if (this.whatsappMessage.length > 0) this.textoQR += `?text=${encodeURIComponent(this.whatsappMessage)}`
    this.record_icon = 'logo-whatsapp';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmSMS() {
    if (this.sms.length < 1) {
      const message = 'El número es requerido';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `smsto:${this.sms}`;
    this.textoQR += `:${this.smsMessage}`;
    this.record_icon = 'chatbubbles-outline';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmURL() {
    if (this.url.length < 1) {
      const message = 'La URL es requerida';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `${this.url}`;
    this.record_icon = 'link';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmPhone() {
    if (this.phone.length < 1) {
      const message = 'El número es requerido';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `tel:${this.phone}`;
    this.record_icon = 'call-outline';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmWifi() {
    // Alertas
    if (this.wifiSecurity.length < 1) {
      const message = 'El tipo de seguridad es requerido';
      await this.alertFunction(message);
      return;
    }
    if (this.wifiSSID.length < 1) {
      const message = 'El nombre de red es requerido';
      await this.alertFunction(message);
      return;
    }

    if (this.wifiPassword.length < 1 && this.wifiSecurity !== 'NOPASS') {
      const message = 'La contraseña es requerida';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `WIFI:T:${this.wifiSecurity};S:${this.wifiSSID};P:${this.wifiPassword};H:${this.wifiHidden};`;
    this.record_icon = 'wifi';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmEmail() {
    // Alertas
    if (this.email.length < 1) {
      const message = 'El email es requerido';
      await this.alertFunction(message);
      return;
    }
    this.textoQR = `mailto:${this.email}`;
    if (this.subjectEmail.length > 0) this.textoQR += `?subject=${encodeURIComponent(this.subjectEmail)}`;
    if (this.bodyEmail.length > 0) this.textoQR += `&body=${encodeURIComponent(this.bodyEmail)}`; 
    this.record_icon = 'mail-outline';
    this.modal.dismiss(null, 'confirm');
  }

  async confirmSocialMedia() {
    this.socialMediaUrl += this.socialMediaUsername;
    this.textoQR = this.socialMediaUrl;
    this.record_icon = this.socialMediaIcon;
    this.modal.dismiss(null, 'confirm');
  }

  async alertFunction (message: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: message,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  async saveData (icon: string, data: string) {
    const { value } = await Preferences.get({ key: 'record' });
    if (!value || JSON.parse(value).length < 1) {
      const toSave = [{id: 1, icon, data}]
      await Preferences.set({
        key: 'record',
        value: JSON.stringify(toSave)
      });
    } else {
      const toSave = JSON.parse(value)
      // Solo guardamos si no hay uno idéntico
      const find = toSave.find((element: any) => element.data === data)
      if (!find) {
        toSave.push({id: toSave[toSave.length - 1].id + 1, icon, data})
        await Preferences.set({
          key: 'record',
          value: JSON.stringify(toSave)
        });
      }
    } 
  }

}
