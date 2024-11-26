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
import { ContestsInformation } from '../../interfaces/contests-information';
import { GalleryInformation } from '../../interfaces/gallery-information';

@Component({
  selector: 'app-slide-show-contests',
  standalone: true,
  imports: [
    CommonModule,
    LightgalleryModule,
    MatButtonModule],
  templateUrl: './slide-show-contests.component.html',
  styleUrl: './slide-show-contests.component.css'
})
export class SlideShowContestsComponent {
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


  getContestSlides(): Promise<any> {
    this.items = []
    return this.DBService.getContestWinners().then((contestsInformation: ContestsInformation) => {
      contestsInformation.bestGroomBride.forEach(item => {
        if (item.id !== undefined || item.id !== null) {
          this.items = [
            ...this.items,
            {
              id: item.id,
              size: "",
              src:
                'https://granted.photos/photos/full/'+item.id+item.fileType,
              subHtml: `
                  <div style="
                  position:fixed;
                  top: 0;
                  left: 0;
                  padding-right: 20px;
                  padding-left: 20px;
                  width: 100%;
                  background-color: rgba(0, 0, 0, 0.3);
                ">
                  <h4 style="font-size: 5dvw; font-family: ShakyHandSomeComic;">
                    BEST GROOM & BRIDE PHOTO
                  </h4>
                </div>
                <div style="
                  position:relative;
                  top: 20px;
                  left:0;
                  right:0;
                  padding-bottom: 10px;
                  margin-left: -20dvw;
                  margin-right: -20dvw;
                  width: 100%
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.4);
                  filter: progid:DXImageTransform.Microsoft.gradient
                        (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                ">
                  <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                    Winner: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                  </h4>
                </div>`
            }
          ];
        }
      })
      contestsInformation.bestPhotoBooth.forEach(item => {
        if (item.id !== undefined || item.id !== null) {
          this.items = [
            ...this.items,
            {
              id: item.id,
              size: "",
              src:
                'https://granted.photos/photos/full/'+item.id+item.fileType,
              subHtml: `
                  <div style="
                  position:fixed;
                  top: 0;
                  left: 0;
                  padding-right: 20px;
                  padding-left: 20px;
                  width: 100%;
                  background-color: rgba(0, 0, 0, 0.3);
                ">
                  <h4 style="font-size: 5dvw; font-family: ShakyHandSomeComic;">
                    BEST PHOTO BOOTH
                  </h4>
                </div>
                <div style="
                  position:relative;
                  top: 20px;
                  left:0;
                  right:0;
                  padding-bottom: 10px;
                  margin-left: -20dvw;
                  margin-right: -20dvw;
                  width: 100%
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.4);
                  filter: progid:DXImageTransform.Microsoft.gradient
                        (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                ">
                  <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                    Winner: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                  </h4>
                </div>`
            }
          ];
        }
      })
      contestsInformation.goofiestPhoto.forEach(item => {
        if (item.id !== undefined || item.id !== null) {
          this.items = [
            ...this.items,
            {
              id: item.id,
              size: "",
              src:
                'https://granted.photos/photos/full/'+item.id+item.fileType,
              subHtml: `
                  <div style="
                  position:fixed;
                  top: 0;
                  left: 0;
                  padding-right: 20px;
                  padding-left: 20px;
                  width: 100%;
                  background-color: rgba(0, 0, 0, 0.3);
                ">
                  <h4 style="font-size: 5dvw; font-family: ShakyHandSomeComic;">
                    GOOFIEST PHOTO
                  </h4>
                </div>
                <div style="
                  position:relative;
                  top: 20px;
                  left:0;
                  right:0;
                  padding-bottom: 10px;
                  margin-left: -20dvw;
                  margin-right: -20dvw;
                  width: 100%
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.4);
                  filter: progid:DXImageTransform.Microsoft.gradient
                        (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                ">
                  <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                    Winner: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                  </h4>
                </div>`
            }
          ];
        }
      })
      contestsInformation.grooviestPhoto.forEach(item => {
        if (item.id !== undefined || item.id !== null) {
          this.items = [
            ...this.items,
            {
              id: item.id,
              size: "",
              src:
                'https://granted.photos/photos/full/'+item.id+item.fileType,
              subHtml: `
                  <div style="
                  position:fixed;
                  top: 0;
                  left: 0;
                  padding-right: 20px;
                  padding-left: 20px;
                  width: 100%;
                  background-color: rgba(0, 0, 0, 0.3);
                ">
                  <h4 style="font-size: 5dvw; font-family: ShakyHandSomeComic;">
                    GROOVIEST PHOTO
                  </h4>
                </div>
                <div style="
                  position:relative;
                  top: 20px;
                  left:0;
                  right:0;
                  padding-bottom: 10px;
                  margin-left: -20dvw;
                  margin-right: -20dvw;
                  width: 100%
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.4);
                  filter: progid:DXImageTransform.Microsoft.gradient
                        (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                ">
                  <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                    Winner: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                  </h4>
                </div>`
            }
          ];
        }
      })
      return this.DBService.getMostLikes().then((galleryInformation: GalleryInformation[]) => {
        galleryInformation.forEach(item => {
          if (item.id !== undefined || item.id !== null) {
            this.items = [
              ...this.items,
              {
                id: item.id,
                size: "",
                src:
                  'https://granted.photos/photos/full/'+item.id+item.fileType,
                subHtml: `
                    <div style="
                    position:fixed;
                    top: 0;
                    left: 0;
                    padding-right: 20px;
                    padding-left: 20px;
                    width: 100%;
                    background-color: rgba(0, 0, 0, 0.3);
                  ">
                    <h4 style="font-size: 5dvw; font-family: ShakyHandSomeComic;">
                      MOST LIKED PHOTO
                    </h4>
                  </div>
                  <div style="
                    position:relative;
                    top: 20px;
                    left:0;
                    right:0;
                    padding-bottom: 10px;
                    margin-left: -20dvw;
                    margin-right: -20dvw;
                    width: 100%
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.4);
                    filter: progid:DXImageTransform.Microsoft.gradient
                          (startcolorstr=#7F000000,endcolorstr=#7F000000) 9;
                  ">
                    <h4 style="font-size: 7dvw; font-family: ShakyHandSomeComic;">
                      Winner: <span style="font-size: 8dvw; font-family: Roboto, 'Helvetica Neue';">`+ item.author +`</span>
                    </h4>
                  </div>`
              }
            ];
          }
        })
      }).then(() => {
        this.lightGallery.updateSlides(this.items,0)
        // Very strange bug where slides would point to random index.
        // Running updateSlides a second time fixes this.
        this.lightGallery.updateSlides(this.items,0)
      });
    })
  }

  openContestSlides() {
    //this.lightGalleryElement.nativeElement.settings = "{ plugins: [lgAutoPlay, lgFullScreen], autoplay: true, autoplayControls: true, allowMediaOverlap: true, progressBar: false, counter: false, hideBarsDelay: 500, preload: 10, backdropDuration: 400, slideEndAnimation: false, controls: true, dynamic: true, dynamicEl: this.items, appendSubHtmlTo: '.lg-item', }"
    this.getContestSlides().then(() => {
      this.lightGallery.openGallery()
    })

  }

  ngAfterViewInit(){

  }
}
