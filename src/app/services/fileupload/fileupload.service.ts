
// fileupload.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileuploadService {

    // Injecting http client via constructor
    constructor(private http: HttpClient) { }

    // Function to send a post request along
    // with files to server
    uploadFile(file: File) {

      // Formdata to store files to send it
      // as a multipart/form-data post request
      const formData = new FormData();
      formData.append('file', file);
      // Post method is returned for subscribing in the component
      return this.http.post(
      'http://morrisapps.ddns.net:8080/upload', formData);
    }
}
