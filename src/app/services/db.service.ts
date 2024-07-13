import { Injectable } from '@angular/core';
import { AdminInformation } from '../interfaces/admin-information';
import { GalleryInformation } from '../interfaces/gallery-information';
import { GalleryComment } from '../interfaces/gallery-comment';
import { DialogComponent } from '../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DBService {

  url = 'https://morrisapps.ddns.net:3000';

  constructor(
    private _dialog: MatDialog,
  ) {}

  async getAllPhotos(): Promise<GalleryInformation[]> {
    const data = await fetch(this.url+'/photos');
    return await data.json() ?? [];
  }

  async getPhotoById(id: string): Promise<GalleryInformation | undefined> {
    const data = await fetch(`${this.url+'/photos'}/${id}`);
    return await data.json() ?? {};
  }

  async getAdmin(): Promise<Object | undefined> {
    const data = await fetch(this.url+'/admin');
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
    await fetch(this.url + '/photos/' + commentID, {
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
    await fetch(this.url + '/photos/' + photoID, {
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

    await fetch(this.url+'/photos', {
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

  async postAdmin(adminInfo: AdminInformation) {
    await fetch(this.url+'/admin', {
      method: 'PATCH',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "stopDB": adminInfo.stopDB,
        "showKahoot": adminInfo.showKahoot,
        "showStream": adminInfo.showStream,
      })
    })
  }

  async remove(fileName: string){
    await fetch(this.url + '/photos/' + fileName, {
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

    await fetch(this.url + '/photos' + fileName, {
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

  async checkIfStopDB(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      await this.getAdmin().then((adminInfo: AdminInformation | any) => {
        if (adminInfo.stopDB) {
          // Display dialog warning user
          this._dialog.open(DialogComponent, {
            data: {
              title: "Feature Disabled",
              message: "An administrator has disabled this feature.<br>Please try again later.",
              button1: "Okay",
              button1Color: "#EBEBEB",
              button1TextColor: "Black",
              input: false
            }
          }).afterClosed().subscribe(async result => {
            return resolve(adminInfo.stopDB)
          });
        } else {
          return resolve(adminInfo.stopDB)
        }
      })
    })
  }
}

