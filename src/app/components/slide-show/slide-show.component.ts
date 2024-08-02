// @ts-nocheck

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject }  from '@angular/core';
import { DBService } from '../../services/db.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from "../dialog/dialog.component";
import { LightgalleryModule } from 'lightgallery/angular';
import { LightGallery } from 'lightgallery/lightgallery';
import { MatButtonModule } from '@angular/material/button';
import lgAutoPlay from 'lightgallery/plugins/autoplay';
import lgFullScreen from 'lightgallery/plugins/fullscreen';
import lgZoom from 'lightgallery/plugins/zoom';

@Component({
  selector: 'app-slide-show',
  standalone: true,
  imports: [
    CommonModule,
    LightgalleryModule,
    MatButtonModule
  ],
  templateUrl: './slide-show.component.html',
  styleUrl: './slide-show.component.css'
})
export class SlideShowComponent {

  @ViewChild('lightGalleryElement', { read: ElementRef }) lightGalleryElement!:ElementRef;

  DBService: DBService = inject(DBService);

  private lightGallery!: LightGallery;

  lgAutoPlay = lgAutoPlay;
  lgFullScreen = lgFullScreen;
  lgZoom = lgZoom;


  constructor(
    private _dialog: MatDialog
  ) {

  }


  items = [
    {
      id: '1',
      size: '1400-933',
      src:
        'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80',
      subHtml: `<div style="transition: transform 5.4s ease-in-out, opacity 5.4s ease-in;">
            <h4>Photo by <a href="https://unsplash.com/@dann">Dan</a></h4>
            <p>Published on November 13, 2018</p>
        </div>`
    }
  ];

  onInit = (detail: { instance: LightGallery; }): void => {
    this.lightGallery = detail.instance;
  };

  removeImage() {
    this.items = this.items.splice(0, 1);
    // this.needRefresh = true;
    this.lightGallery.updateSlides(this.items,0)
  }

  getNewSlides(): Promise<any> {
    // Get all new photos as slide items
    this.items = []

    return this.DBService.getSlidePhotos().then((galleryList: GalleryInformation[]) => {
      galleryList.forEach(item => {
        if (item.id !== undefined || item.id !== null) {
          this.items = [
            ...this.items,
            {
              id: item.id,
              src:
                'https://granted.photos/photos/full/'+item.id+'.jpg',
              subHtml: `
                <div [hidden]="!showFileInput" style="
                  position:relative;
                  top: -40px;
                  left:0;
                  right:0;
                  bottom:5px;
                  padding-bottom: 10px;
                  margin-left: -20dvw;
                  margin-right: -20dvw;
                  width: 100%
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.8);
                  filter: progid:DXImageTransform.Microsoft.gradient
                        (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                ">
                  <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                    Photo by: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                  </h4>
                </div>`
            }
          ];
        }
      });
    }).then(() => {
      this.lightGallery.updateSlides(this.items,0)
      // Very strange bug where slides would point to random index.
      // Running updateSlides a second time fixes this.
      this.lightGallery.updateSlides(this.items,0)
    });
  }

  resetSlides() {
    this.DBService.resetSlideCount().then(() => {
      this._dialog.open(DialogComponent, {
        data: {
          title: "Reset complete",
          message: "All slides counts have been reset",
          button1: "Groovy!",
          button1Color: "#fd7543",
          button1TextColor: "White"
        }
      })
    })
  }

  openSlides() {
    this.getNewSlides().then(() => {
      this.lightGallery.openGallery()
    })
  }

  ngAfterViewInit(){
    //Once slides reach end, request new slides
    this.lightGalleryElement.nativeElement.addEventListener('lgAutoplay', (event) => {
      console.log(event.detail.index)
      console.log(this.lightGallery.galleryItems.length - 1)
      console.log(this.lightGallery)
      if (event.detail.index == this.lightGallery.galleryItems.length - 1) {
        // Set delay on getting new slides so that the last photo has time to be seen
        setTimeout(() => this.getNewSlides(), 9000)
      }
    })
  }
}
