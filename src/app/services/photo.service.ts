import { Injectable } from '@angular/core';
import { PhotoInformation } from '../interfaces/photo-information';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  url = 'http://morrisapps.ddns.net:3000/photos';

  async getAllPhotos(): Promise<PhotoInformation[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getPhotoById(id: string): Promise<PhotoInformation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return await data.json() ?? {};
  }


  async post(fileName: string, width: number, height: number) {
    await fetch(this.url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": fileName,
        "author": localStorage.getItem('User'),
        "width": width,
        "height": height,
        "likes": 0
      })
    })
  }

  async remove(fileName: string){
    await fetch(this.url + "/" + fileName, {
      method: 'DELETE',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": fileName
      })
    })
  }

  async patchLikes(fileName: string, liked: boolean) {
    // Get current likes from JSON server
    let currentLikes = (await this.getPhotoById(fileName))?.likes

    if (typeof(currentLikes) !== "number") {
      currentLikes = 0
    }

    // If liked then add a like. If not, remove a like.
    if (liked) {
      currentLikes += 1
    } else {
      currentLikes -= 1
    }

    await fetch(this.url + "/" + fileName, {
      method: 'PATCH',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": fileName,
        "likes": currentLikes
      })
    })
  }

}

