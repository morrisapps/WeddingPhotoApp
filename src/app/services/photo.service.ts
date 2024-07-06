import { Injectable } from '@angular/core';
import { GalleryInformation } from '../interfaces/gallery-information';
import { GalleryComment } from '../interfaces/gallery-comment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  url = 'https://morrisapps.ddns.net:3000/photos';

  async getAllPhotos(): Promise<GalleryInformation[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getPhotoById(id: string): Promise<GalleryInformation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return await data.json() ?? {};
  }

  async postNewSubDirectory(fileName: string, width: number, height: number) {
    await fetch("https://morrisapps.ddns.net:3000/subdirectory", {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": "CR2024",
        "data": [

        ]
      })
    })
  }

  async post2(fileName: string, width: number, height: number) {
    await fetch("https://morrisapps.ddns.net:3000/subdirectory", {
      method: 'PATCH',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "CR20242": [

        ]
      })
    })
  }

  async deleteComment(commentID: string){
    await fetch(this.url + "/" + commentID, {
      method: 'DELETE',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": commentID
      })
    })
  }

  async patchComments(photoID: string, comments: GalleryComment[]) {
    await fetch(this.url+"/"+photoID, {
      method: 'PATCH',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "comments": comments
      })
    })
  }

  async post(fileName: string, width: number, height: number) {
    let date = new Date()
    let dformat = [date.getMonth()+1,
      date.getDate(),
      date.getFullYear()].join('/') + ' ' +
     [date.getHours(),
      date.getMinutes(),
      date.getSeconds()].join(':') + '-' +
      date.getMilliseconds();

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
        "likes": 0,
        "date": dformat
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

