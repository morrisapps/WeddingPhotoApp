import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryCardComponent } from '../gallery-card/gallery-card.component';
import { GalleryInformation } from '../../interfaces/gallery-information';
import { PhotoService } from '../../services/photo.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    GalleryCardComponent,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
  <div #rootDiv class="root-div">
    <mat-form-field style="width: 100%">
      <span matTextPrefix>
        <mat-icon class="icon-size" style="margin-left: 5px;">search</mat-icon>
      </span>
      <mat-label style="margin-left:15px">Search by photographer</mat-label>
      <input style="margin-left:20px" matInput (input)="filterResults(filter.value)" type="text" #filter>
    </mat-form-field>
    <mat-spinner style="margin:0 auto; margin-top:33vh;"  *ngIf="show"></mat-spinner>
    <section class="results">
      <app-gallery-card *ngFor="let photo of filteredGalleryList" [galleryInformation]="photo"></app-gallery-card>
    </section>
  </div>

  `,
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  filteredGalleryList: GalleryInformation[] = [];
  galleryList: GalleryInformation[] = [];
  PhotoService: PhotoService = inject(PhotoService);
  show: boolean = true;

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  constructor(private renderer: Renderer2) {
    this.PhotoService.getAllPhotos().then((galleryList: GalleryInformation[]) => {
      this.galleryList = galleryList;
      this.galleryList.reverse()
      this.filteredGalleryList = galleryList;
      this.show = false
    });

  }

  filterResults(text: string) {
    if (!text) {
      this.filteredGalleryList = this.galleryList;
      return;
    }

    this.filteredGalleryList = this.galleryList.filter(
      GalleryInformation => GalleryInformation?.author.toLowerCase().includes(text.toLowerCase())
    );
  }

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }
}
