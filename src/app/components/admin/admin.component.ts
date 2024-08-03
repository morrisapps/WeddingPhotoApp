import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';
import { DBService } from '../../services/db.service';
import * as CryptoJS from 'crypto-js';
import { AdminInformation } from '../../interfaces/admin-information';
import { GalleryInformation } from '../../interfaces/gallery-information';
import { GalleryCardComponent } from '../gallery-card/gallery-card.component';
import { SlideShowComponent } from '../slide-show/slide-show.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    GalleryCardComponent,
    SlideShowComponent
],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  @ViewChild('password', { read: ElementRef }) password!:ElementRef;

  // Cipher Key
  key = "34333637616161353933336362633235323364616530346661623866653661643136613134643665346665303736383665623063376562626361623161303862"

  isPasswordAttempted = false;
  isPasswordSuccesfull = false;
  isPasswordInputted = false;
  isAdmin = false;

  DBService: DBService = inject(DBService);

  adminDelete = false;
  stopDB = false;
  showStream = false;
  showKahoot = false;
  kahootPin = "";

  adminInfo: AdminInformation | undefined;

  mostLikes: GalleryInformation[] | undefined;
  showMostLikes = false;

  constructor( private _http: HttpClient) {
    this.getAdminInfo()

  }

  passwordInput(event: any) {
    if (event.target.value.length >= 3) {
      this.isPasswordInputted = true;
    } else {
      this.isPasswordInputted = false;
    }
  }

  validatePassword(){
    this.DBService.getAdmin().then((adminInfo: AdminInformation | any) => {
      // Encrypts the given password utilizing cipher key
      let encrypted = CryptoJS.AES.encrypt(
        this.password.nativeElement.value, CryptoJS.enc.Utf8.parse(this.key), {
          keySize: 16,
          iv: CryptoJS.enc.Utf8.parse(this.key),
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }
      ).toString();

      this.isPasswordAttempted = true
      // Check if encrypted password equals stored encrypted pass from get request
      if (encrypted == adminInfo.saltedPassword) {
        this.isPasswordSuccesfull = true

        //Set localStorage to flag admin
        localStorage.setItem("admin","true")
        this.isAdmin = true
        // Reset form
        this.isPasswordInputted = false
        this.password.nativeElement.value = ""
      } else {
        this.isPasswordSuccesfull = false
      }

    });
  }

  setAdminSettings() {

    localStorage.setItem("adminDelete", this.adminDelete as unknown as string)

    let adminInfo: AdminInformation = {
      saltedPassword: '',
      stopDB: this.stopDB as unknown as boolean,
      showKahoot: this.showKahoot as unknown as boolean,
      kahootPin: this.kahootPin as unknown as string,
      showStream: this.showStream as unknown as boolean
    }
    this.DBService.postAdmin(adminInfo)
  }

  getAdminInfo() {
    this.DBService.getAdmin().then((adminInfo: AdminInformation | any) => {
      if (localStorage.getItem("adminDelete") == "true") {
        this.adminDelete = true
      }
      this.stopDB = adminInfo.stopDB
      this.showKahoot = adminInfo.showKahoot
      this.showStream = adminInfo.showStream
      this.kahootPin = adminInfo.kahootPin
    })
  }

  async getMostLikes() {
    // Set mostLikes photos
    await this.DBService.getMostLikes().then((result) => {
      this.mostLikes = result as unknown as GalleryInformation[]
      this.showMostLikes = true
    })
  }

  async ngOnInit(){
    if (localStorage.getItem("admin") == "true") {
      this.isAdmin = true
    }
  }

}
