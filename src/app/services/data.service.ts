import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _base64Photo = new BehaviorSubject("");
  private _fileNamePhoto = new BehaviorSubject("");
  private _userName = new BehaviorSubject("");


  public getBase64Photo(): Observable<string> {
    return this._base64Photo.asObservable();
  }
  public setBase64Photo(base64: string): void {
    this._base64Photo.next(base64);
  }

  public getFileNamePhoto(): Observable<any> {
    return this._fileNamePhoto.asObservable();
  }
  public setFileNamePhoto(FileName: any): void {
    this._fileNamePhoto.next(FileName);
  }

  public getUserName(): Observable<any> {
    return this._userName.asObservable();
  }
  public setUserName(User: any): void {
    this._userName.next(User);
  }

}
