
// fileupload.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileuploadService {

  // Injecting http client via constructor
  constructor(private http: HttpClient) {}



  // Function to send a post request along
  // with files to server
  async uploadFiles(base64: string, subFolder: string, fileName: string) {
    const formData = new FormData();

    formData.append('subfolder',subFolder)
    formData.append('file', this.Base64ToFile(base64, fileName+".jpg"));
    return this.http.post(
      'http://morrisapps.ddns.net:8080/upload', formData);

      // var blob = file.slice(0, file.size, 'image/jpg');
      // this.file = new File([blob], Date.now() + ".jpg", {type: 'image/jpg'})


  }

  Base64ToFile(base64: string, fileName: string){
    const byteString = window.atob((base64).split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpg' });
    return new File([blob], fileName, { type: 'image/jpg' });
  }
}
