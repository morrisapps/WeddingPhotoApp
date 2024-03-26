import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../../housinglocation';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-housing-location',
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
        <img #photo class="listing-photo" id="photo" [src]="[housingLocation.photoBase64]" [name]="[housingLocation.fileName]">
        <button mat-fab id="save" (click)="download()" class="download-button">
          <mat-icon>get_app</mat-icon>
        </button>
      </div>

      <mat-card-actions>
        <mat-card-subtitle style="margin-left:10px;">Photographed by</mat-card-subtitle>
        <mat-card-subtitle style="margin-left:4px;">Test</mat-card-subtitle>
      </mat-card-actions>
    </mat-card>
  </section>
`,
  styleUrl: './housing-location.component.css'
})
export class HousingLocationComponent {
  @Input() housingLocation!: HousingLocation;
  @ViewChild('photo', { read: ElementRef }) photoRef!:ElementRef;

  download() {
    let photo = this.photoRef.nativeElement
    const a = document.createElement('a')
    a.href = photo.src
    a.download = photo.src.split('/').pop() as string
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
