
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
  async uploadFiles(base64: string, fileName: string, fileType: string) {
    const formData = new FormData();
    formData.append('file', this.Base64ToFile(base64, fileName, fileType));
    return this.http.post(
      'https://granted.photos:8080/upload',
      formData
    );
  }

  async removeFile(fileName: string, fileExtension: string) {
    return this.http.delete(
      'https://granted.photos:8080/'+fileName+"?fileExtension="+fileExtension
    );
  }

  Base64ToFile(base64: string, fileName: string, type: string){
    const byteString = window.atob((base64).split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: type });
    return new File([blob], fileName, { type: type });
  }
}
