import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoInformation } from '../../interfaces/photo-information';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
  <section>
    <mat-card>
      <div class="photo-container">
        <img #photo class="listing-photo" id="photo" src="http://morrisapps.ddns.net/photos/{{photoInformation.fileName}}-thumb.jpg" [name]="[photoInformation.fileName]">
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
`,
  styleUrl: './photo-card.component.css'
})
export class PhotoCardComponent {
  @Input() photoInformation!: PhotoInformation;
  @ViewChild('photo', { read: ElementRef }) photoRef!:ElementRef;

  download() {
    let photo = this.photoRef.nativeElement
    const a = document.createElement('a')
    a.href = "http://morrisapps.ddns.net/photos/"+this.photoInformation.fileName+"-full.jpg"
    a.download = this.photoInformation.fileName+"-full.jpg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
