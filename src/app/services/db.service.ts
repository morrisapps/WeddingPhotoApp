import { Injectable } from '@angular/core';
import { AdminInformation } from '../interfaces/admin-information';
import { GalleryInformation } from '../interfaces/gallery-information';
import { ContestsInformation } from '../interfaces/contests-information';
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

  async getSlidePhotos(): Promise<GalleryInformation[] | void> {
    const data = await fetch(this.url+'/photos');
    // Get sorted photos by how many times they been shown. Retrieves the lowest 20.
    const sortedPhotos = await data.json().then(async (result) => {

      // Filter out any prev count photos, and reduce their count
      let prevFilterPhotos: any = []
      for (let i = 0; i < result.length; i++) {
        // If showncount or prev count is undefined, set to 0
        if (result[i].showncount == undefined) {
          result[i].showncount = 0
        }
        if (result[i].prevcount == undefined) {
          result[i].prevcount = 0
        }


        if (result[i].prevcount > 0) {
          // Don't add to array, reduce prev count
          result[i].prevcount --
        } else {
          prevFilterPhotos.push(result[i])
        }
        this.patchSlideCounts(result[i].id, result[i].showncount, result[i].prevcount)
      }

      // If filtered too many photos to not fill all slides randomly
      if (result.length >= 20) {
        while (prevFilterPhotos.length < 20) {
          prevFilterPhotos.push(result[result.length * Math.random() | 0])
        }
      } else {
        // Use all available photos
        prevFilterPhotos = result
      }

      const sortedPhotos = await prevFilterPhotos.toSorted((a: GalleryInformation, b: GalleryInformation) => a.showncount > b.showncount)

      return sortedPhotos.slice(0, 20)
    })

    return await this.shuffleArray(sortedPhotos).then((shuffleSortedPhotos) => {
      shuffleSortedPhotos = shuffleSortedPhotos
      for (let i = 0; i < shuffleSortedPhotos.length; i++) {
        // shown count is increased so that it appears less often in the slide show
        shuffleSortedPhotos[i].showncount ++
        // prev count is set to 2 so that it won't re appear within two cycles of the slide show
        shuffleSortedPhotos[i].prevcount = 2
        this.patchSlideCounts(shuffleSortedPhotos[i].id, shuffleSortedPhotos[i].showncount, shuffleSortedPhotos[i].prevcount)
      }
      return shuffleSortedPhotos
    })

  }

  async shuffleArray(array: any): Promise<any[]>{
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return await array;
  }

  async resetSlideCount(): Promise<any> {
    const data = await fetch(this.url+'/photos');
    return await data.json().then(async (result) => {
      for (let i = 0; i < result.length; i++) {
        result[i].showncount = 0
        result[i].prevcount = 0
        await this.patchSlideCounts(result[i].id, result[i].showncount, result[i].prevcount)
      }
    })
  }

  async patchSlideCounts(id: string, showncount: number, prevcount: number) {
    await fetch(this.url + '/photos/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "showncount": showncount,
        "prevcount": prevcount
      })
    })
  }

  async getAdmin(): Promise<Object | undefined> {
    const data = await fetch(this.url+'/admin');
    return await data.json() ?? {};
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

  async patchContests(contest: string, winners: GalleryInformation[]) {
    await fetch(this.url + '/contests/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [contest]: winners
      })
    })
  }

  async getContestWinners(): Promise<ContestsInformation> {
    const data = await fetch(this.url+'/contests/');
    return await data.json() ?? [];
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

  async getMostLikes(): Promise<GalleryInformation[]> {
    const data = await fetch(this.url+'/photos');
    return await data.json().then((result) => {
      let mostLikes: any = [];
      for (let i = 0; i < result.length; i++) {
        if (mostLikes.length == 0) {
          if (result[i].likes !== undefined) {
            mostLikes = [result[i]]
          }
        } else {
          if (result[i].likes > mostLikes[0].likes) {
            mostLikes = [result[i]]
          } else if (result[i].likes == mostLikes[0].likes) {
            mostLikes.push(result[i])
          }
        }
      }
      return mostLikes
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
        "date": dformat,
        "showncount": 0,
        "prevcount": 0
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
        "kahootPin": adminInfo.kahootPin
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

    await fetch(this.url + '/photos/' + fileName, {
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

  async patchAny(fileName: string, property : string, value: string | number | boolean) {
    await fetch(this.url + '/photos/' + fileName, {
      method: 'PATCH',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": fileName,
        [property]: value
      })
    })
  }

  async checkIfStopDB(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      await this.getAdmin().then((adminInfo: AdminInformation | any) => {
        if (adminInfo.stopDB) {
          // Display dialog warning
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

