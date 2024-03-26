import { Injectable } from '@angular/core';
import { HousingLocation } from '../housinglocation';

@Injectable({
  providedIn: 'root'
})
export class HousingService {

  url = 'http://morrisapps.ddns.net:3000/photos';




  async getAllHousingLocations(): Promise<HousingLocation[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return await data.json() ?? {};
  }


  async post(photoBase64: string, fileName: string) {
    await fetch(this.url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": 22,
        "name": fileName,
        "fileName": fileName,
        "city": "Juneau3",
        "state": "AK2",
        "photo": "https://angular.io/assets/images/tutorials/faa/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg",
        "photoBase64" : photoBase64,
        "availableUnits": 1,
        "wifi": false,
        "laundry": false
      })
    })
  }

  submitApplication(firstName: string, lastName: string, email: string) {
    console.log(`Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`);
  }

  constructor() { }
}

