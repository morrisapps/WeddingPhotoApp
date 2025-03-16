
// fileupload.service.ts
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileuploadService {

  // Injecting http client via constructor
  constructor(private http: HttpClient) {}

  // Function to send a files by chunks to express multer server
  // Calls post from express server to json server
  async uploadFile(file: File, fileName: string, fileExtension: string, type: string): Promise<Observable<any>> {

    return new Observable( observer => {

      try {
        const formData: FormData = new FormData();
        formData.append('file', file);

        const chunkSize = 1024 * 1024 * 5; // 5MB chunks
        const totalChunks = Math.ceil(file.size / chunkSize);
        let startByte = 0;

        (async () => {
          for (let i = 1; i <= totalChunks; i++) {
            const endByte = Math.min(startByte + chunkSize, file.size);
            const chunk = file.slice(startByte, endByte);
            await this.uploadChunk(chunk, fileName, fileExtension)
            .catch((error) => {
              throw new Error(error)
            })
            startByte = endByte;

            observer.next(i / totalChunks)
          }
        })()
        .then(async () => {
          await this.post(fileName, fileExtension, type, localStorage.getItem('User') as string).then(() => {
            observer.complete()
          })
          .catch((error) => {
            throw new Error(error)
          })
        })
        .catch((error) => {
          observer.error(error)
        })
      } catch (error) {
        observer.error(error)
      }
    })
  }


  async uploadChunk(blob: any, fileName: string, fileExtension: string) {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('fileName', fileName);
    formData.append('fileExtension', fileExtension);

    await fetch('https://granted.photos:8080/uploadstream', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
          return Promise.reject(response);
      }
      return response;
    })
    .then(data => {
        // console.log("Success");
        // console.log(data);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
  }

  async post(fileName: string, fileExtension: string, type: string, author: string){
    const formData = new FormData();
    formData.append('fileName', fileName);
    formData.append('fileExtension', fileExtension);
    formData.append('fileType', type)
    formData.append('author', author)
    await fetch('https://granted.photos:8080/post', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
          return Promise.reject(response);
      }
      return response;
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
      console.log("Fetch error");
      console.log(error);
    });
  }

  async removeFile(fileName: string, fileExtension: string, fileType: string) {
    return this.http.delete(
      'https://granted.photos:8080/'+fileName+"?fileExtension="+fileExtension+"&fileType="+fileType
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
