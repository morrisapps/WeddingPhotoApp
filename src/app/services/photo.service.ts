import { Injectable } from '@angular/core';
import { PhotoInformation } from '../interfaces/photo-information';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  url = 'http://morrisapps.ddns.net:3000/photos';

  async getAllPhotos(): Promise<PhotoInformation[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getPhotoById(id: number): Promise<PhotoInformation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return await data.json() ?? {};
  }


  async post(fileName: string, width: number, height: number) {
    let ratio = height * (400 / width)
    await fetch(this.url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": fileName,
        "fileName": fileName,
        "author": localStorage.getItem('User'),
        "width": width,
        "height": height,
        "ratio": ratio
      })
    })
  }

  submitApplication(firstName: string, lastName: string, email: string) {
    console.log(`Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`);
  }

  constructor(private cookieService: CookieService) { }
}

