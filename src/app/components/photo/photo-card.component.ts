import { Component, ElementRef, ViewChild, Input, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoInformation } from '../../interfaces/photo-information';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
  <div #photoDiv class="photo-div">
    <section>
      <mat-card #matCard >
        <div id="photoContainer" #photoContainer class="photo-container">
          <div [hidden]="!imgLoaded">
            <img [hidden]="!imgLoaded" #photo class="listing-photo" id="photo" src="http://morrisapps.ddns.net/photos/thumbs/{{photoInformation.fileName}}.jpg"
              [name]="[photoInformation.fileName]" (load)="onLoad()">
            <button mat-fab id="save" (click)="download()" class="download-button">
              <mat-icon>get_app</mat-icon>
            </button>
          </div>
        </div>

        <mat-card-actions>
          <mat-card-subtitle style="margin-left:10px;">Photographed by</mat-card-subtitle>
          <mat-card-subtitle #author style="margin-left:4px;" [innerText]="[photoInformation.author]"></mat-card-subtitle>
        </mat-card-actions>
      </mat-card>
    </section>
    <mat-spinner *ngIf="!imgLoaded" class="center-spinner"></mat-spinner>
  </div>


`,
  styleUrl: './photo-card.component.css'
})
export class PhotoCardComponent {
  @Input() photoInformation!: PhotoInformation;
  imgLoaded: boolean;

  @ViewChild('matCard', { read: ElementRef }) matCard!:ElementRef;
  @ViewChild('photoContainer', { read: ElementRef }) photoContainer!:ElementRef;
  @ViewChild('photoDiv', { read: ElementRef }) photoDiv!:ElementRef;

  constructor(private renderer: Renderer2) {
    this.imgLoaded = false
  }

  onLoad() {
    this.photoContainer.nativeElement?.style.setProperty('min-height',  '0px')
    this.imgLoaded = true
  }

  download() {
    const a = document.createElement('a')
    a.href = "http://morrisapps.ddns.net/photos/full/"+this.photoInformation.fileName+".jpg"
    a.download = this.photoInformation.fileName+"-full.jpg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }


  ngAfterViewInit(){
    // set Material Card size while loading photo
    if (this.photoInformation.height != 0 && this.photoInformation.height != null && this.photoInformation.width != 0 && this.photoInformation.width != null) {
      // Set height using photoInformation
      this.photoContainer.nativeElement?.style.setProperty('min-height',  this.photoInformation.height * (this.matCard.nativeElement.clientWidth / this.photoInformation.width)+'px')
    } else {
      // Default size if no photoInformation
      this.photoContainer.nativeElement?.style.setProperty('height', '400px')
    }
  }
}
