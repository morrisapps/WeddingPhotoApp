import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
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

  constructor( private _http: HttpClient) {}

  passwordInput(event: any) {
    if (event.target.value.length >= 3) {
      this.isPasswordInputted = true;
    } else {
      this.isPasswordInputted = false;
    }
  }

  validatePassword(){
    this._http.get(
      'http://morrisapps.ddns.net:8080/admin'
    ).subscribe((result) => {

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
      if (encrypted == result) {
        this.isPasswordSuccesfull = true

        //Set localStorage to flag admin
        localStorage.setItem("admin","true")

        // Reset form
        this.isPasswordInputted = false
        this.password.nativeElement.value = ""
      } else {
        this.isPasswordSuccesfull = false
      }
    })
  }

}
