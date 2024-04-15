import { Component, ElementRef, ViewChild, Input } from '@angular/core';
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
  <div class="photo-div">
    <section>
      <mat-card>
        <div style="min-height: {{photoInformation.ratio}}px;" class="photo-container">

          <img #photo class="listing-photo" id="photo" src="http://morrisapps.ddns.net/photos/thumbs/{{photoInformation.fileName}}.jpg"
            [name]="[photoInformation.fileName]" (load)="onLoad()">
          <button mat-fab id="save" (click)="download()" class="download-button">
            <mat-icon>get_app</mat-icon>
          </button>
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

  constructor() {
    this.imgLoaded = false
  }

  onLoad() {
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
}
