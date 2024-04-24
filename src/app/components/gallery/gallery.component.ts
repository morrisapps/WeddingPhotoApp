import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
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
  <div #rootDiv class="root-div">
    <section>
      <input (input)="filterResults(filter.value)" type="text" placeholder="Search by photographer" #filter>
    </section>
    <mat-spinner style="margin:0 auto;margin-top:33vh;"  *ngIf="show"></mat-spinner>
    <section class="results">
    <app-photo-card *ngFor="let photo of filteredPhotoList" [photoInformation]="photo"></app-photo-card>
    </section>
  </div>

  `,
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  filteredPhotoList: PhotoInformation[] = [];
  photoList: PhotoInformation[] = [];
  PhotoService: PhotoService = inject(PhotoService);
  show: boolean = true;

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  constructor(private renderer: Renderer2) {
    this.PhotoService.getAllPhotos().then((photoList: PhotoInformation[]) => {
      this.photoList = photoList;
      this.photoList.reverse()
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
      PhotoInformation => PhotoInformation?.author.toLowerCase().includes(text.toLowerCase())
    );
  }

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }
}
