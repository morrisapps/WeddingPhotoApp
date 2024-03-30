
// fileupload.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Injectable({
    providedIn: 'root',
})
export class FileuploadService {

  // Injecting http client via constructor
  constructor(private http: HttpClient, private imageCompress: NgxImageCompressService,) {}



  // Function to send a post request along
  // with files to server
  async uploadFiles(photoBase64: string, thumbBase64: string, fileName: string) {
    let fileBase64
    let newFile
    //compress file to thumbnail

    const formData = new FormData();

    // thumbBase64 = this.imageCompress
    // .compressFile(URL.createObjectURL(file), 0, 50, 80)
    //   .then(compressedImage => {
    //     // let base64 = compressedImage.slice(22, compressedImage.length)
    //     // console.log(base64)
    //     // let test = new Blob([base64] , {type:'image/jpg'})
    //     // console.log(test)
    //     // newFile = new File([test], "test.jpg", {type: 'image/jpg'})
    //     // console.log(test)
    //     // console.log(newFile)
    //     // formData.append('file', newFile);


    //    // var byteString = atob(compressedImage.split(',')[1]);

    //     // // separate out the mime component
    //     // var mimeString = compressedImage.split(',')[0].split(':')[1].split(';')[0];

    //     // // write the bytes of the string to an ArrayBuffer
    //     // var ab = new ArrayBuffer(byteString.length);
    //     // var ia = new Uint8Array(ab);
    //     // for (var i = 0; i < byteString.length; i++) {
    //     //     ia[i] = byteString.charCodeAt(i);
    //     // }

    //     // //Old Code
    //     // //write the ArrayBuffer to a blob, and you're done
    //     // //var bb = new BlobBuilder();
    //     // //bb.append(ab);
    //     // //return bb.getBlob(mimeString);

    //     // //New Code
    //     // let blob = new Blob([ab], {type: mimeString});
    //     // const imageFile2 = new File([blob], "thumbtest.jpg", { type: 'image/jpg' });
    //     // formData.append('file', imageFile2);
    //     return compressedImage
    //   });




    formData.append('file', this.Base64ToFile (photoBase64, fileName+"-full.jpg"));
      formData.append('file', this.Base64ToFile (thumbBase64, fileName+"-thumb.jpg"));

      // var blob = file.slice(0, file.size, 'image/jpg');
      // this.file = new File([blob], Date.now() + ".jpg", {type: 'image/jpg'})






    // Formdata to store files to send it
    // as a multipart/form-data post request

    //formData.append('file', file);
    //formData.append('file', fileThumb);
    // Post method is returned for subscribing in the component
    return this.http.post(
    'http://morrisapps.ddns.net:8080/upload', formData);
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
