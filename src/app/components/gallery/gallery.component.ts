import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoCardComponent } from '../photo/photo-card.component';
import { PhotoInformation } from '../../interfaces/photo-information';
import { PhotoService } from '../../services/photo.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    PhotoCardComponent,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by Author" #filter>

        <button mat-raised-button (click)="filterResults(filter.value)">Search</button>
      </form>
    </section>
    <mat-spinner style="margin:0 auto;margin-top:33dvh;"  *ngIf="show"></mat-spinner>
    <section class="results">
    <app-photo-card *ngFor="let photo of filteredPhotoList" [photoInformation]="photo"></app-photo-card>
    </section>
  `,
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  filteredPhotoList: PhotoInformation[] = [];
  photoList: PhotoInformation[] = [];
  PhotoService: PhotoService = inject(PhotoService);
  show: boolean = true;

  constructor() {
    this.PhotoService.getAllPhotos().then((photoList: PhotoInformation[]) => {
      this.photoList = photoList;
      this.filteredPhotoList = photoList;
      this.show = false
    });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredPhotoList = this.photoList;
      return;
    }

    this.filteredPhotoList = this.photoList.filter(
      PhotoInformation => PhotoInformation?.city.toLowerCase().includes(text.toLowerCase())
    );
  }
}
