import { Component, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import * as QRCode from 'qrcode-generator';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  textoQR: string = '';
  qrImageData: string = '';
  test: string = '';
  @ViewChild(IonModal)
  modal!: IonModal;

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  whatsapp = '';
  whatsappMessage = '';

  constructor(private alertController: AlertController) {}

  generarQR(): void {
    if (!this.textoQR.trim()) {
      // Si el input está vacío, no hace nada
      return;
    }
  
    // Crear una instancia de QRCode
    const qr = QRCode(0, 'L');
    qr.addData(this.textoQR);
    qr.make();
  
    // Crear un elemento de imagen
    const img = new Image();
  
    // Cuando la imagen se carga, ejecuta la siguiente lógica
    img.onload = () => {
      // Crear un lienzo (canvas)
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
  
      // Obtener el contexto 2D del lienzo
      const ctx: any = canvas.getContext("2d");
  
      // Dibujar la imagen en el lienzo
      ctx.drawImage(img, 0, 0);
  
      // Obtener la representación en base64 del lienzo en formato PNG
      this.qrImageData = canvas.toDataURL("image/png");
    };
  
    // Establecer la fuente de la imagen (esto activará el evento onload)
    img.src = qr.createDataURL(10, 0);
  }

  async compartirQR(): Promise<void> {
    try {
      const can = await Share.canShare()
      const imageName = 'qrimage.png'
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
      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: String(error),
        buttons: ['Entendido']
      });
  
      await alert.present();
    }
  }

  // Cerrar cualquier modal
  closeModal() {
    this.textoQR = ''
    this.modal.dismiss(null, 'cancel');
  }

  confirmWhatapp() {
    this.textoQR = ''
    this.textoQR = `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(this.whatsappMessage)}`
    this.modal.dismiss(null, 'confirm');
  }


}
