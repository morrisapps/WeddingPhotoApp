import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryCardComponent } from '../gallery-card/gallery-card.component';
import { GalleryInformation } from '../../interfaces/gallery-information';
import { DBService } from '../../services/db.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollDirective } from "ngx-infinite-scroll";


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
    MatIconModule,
    FormsModule,
    InfiniteScrollDirective
  ],
  template: `
  <div #rootDiv class="root-div">
    <mat-form-field style="width: 100%; margin-top: 5px">
      <span matTextPrefix>
        <mat-icon class="icon-size" style="margin-left: 5px;">search</mat-icon>
      </span>
      <mat-label style="margin-left:15px">Search by photographer</mat-label>
      <input style="margin-left:20px" matInput (input)="filterResults()" type="text" [(ngModel)]="filterPhotographer" #filter>
    </mat-form-field>
    <mat-spinner style="margin:0 auto; margin-top:33vh;"  *ngIf="show"></mat-spinner>
    <section class="results" infiniteScroll [infiniteScrollDistance]="2" [infiniteScrollThrottle]="50" (scrolled)="onScroll()">
      <app-gallery-card *ngFor="let photo of filteredGalleryList" [galleryInformation]="photo"></app-gallery-card>
    </section>
  </div>

  `,
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  filteredGalleryList: GalleryInformation[] = [];
  galleryList: GalleryInformation[] = [];
  DBService: DBService = inject(DBService);
  show: boolean = true;

  toolbarHeight = localStorage.getItem("toolbarHeight")

  filterPhotographer: string ="";

  scrollIndex = 10

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  constructor(private renderer: Renderer2) {
    this.DBService.getAllPhotos().then((galleryList: GalleryInformation[]) => {
      this.galleryList = galleryList;
      this.galleryList.reverse()
      this.filteredGalleryList = galleryList.slice(0, this.scrollIndex);
      this.show = false
    });

  }

  filterResults() {
    if (!this.filterPhotographer) {
      this.filteredGalleryList = this.galleryList.slice(0, this.scrollIndex);
      return;
    }

    this.filteredGalleryList = this.galleryList.filter(
      GalleryInformation => GalleryInformation?.author.toLowerCase().includes(this.filterPhotographer.toLowerCase())
    );
    this.filteredGalleryList = this.filteredGalleryList.slice(0, this.scrollIndex);
  }

  onScroll() {
    this.scrollIndex += 10
    this.filterResults()
  }

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100dvh - '+this.toolbarHeight+'px - 20px)');
  }
}
