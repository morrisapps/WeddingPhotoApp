import { Component, inject, ElementRef, ViewChild, Renderer2 } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import  {MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { ShootDialogComponent } from "../shoot-dialog/shoot-dialog.component";
import { PhotoService } from '../../services/photo.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { animate, keyframes, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-shoot',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  animations: [
    trigger('keyframes',[
      transition(':enter', [
        animate('3s', keyframes([
          style({transform: 'translateX(0%)'}),
          style({transform: 'translateX(500%)'}),
          style({transform: 'translate(500%, 100%)'}),
          style({transform: 'translateY(100%)'}),
          style({transform: 'translateX(0%)'})
        ])),
      ])
    ])
  ],
  template: `
  <div #rootDiv class="root-div">
    <div [hidden]="hidden">
      <mat-card style="width: 95vw; max-width: 400px; margin-top: -80px;" class="center">
        <mat-card-title class="center-content">What's your name?</mat-card-title>
        <mat-card-content>
          <p class="center-content">
              <input style="width: 70%; height: 20px;" maxlength="20" #nameInput type="text" matInput placeholder="name" id="nameInput" (input)="NameInput($event)">
          </p>
            <div class="center-content">
              <button #takePictureButton [ngStyle]="takeButtonDisabled?{'background-color': ''} : {'background-color': '#73EB50'}" disabled="{{takeButtonDisabled}}" type="button" mat-raised-button (click)="fileInput.click()" id="takePictureButton">Take a Picture!</button>
              <input hidden (change)="onFileSelected($event)" #fileInput type="file" id="cameraFileInput" accept="image/*" capture="environment">
            </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div id="pictureDiv" class="center" style="top: calc(50% - 40px); max-width: 95%" [hidden]="!hidden">
      <mat-card>
        <img id="pictureFromCamera"/>
        <button mat-fab id="save" (click)="download()" class="download-button">
          <mat-icon>get_app</mat-icon>
        </button>

      </mat-card>
    </div>
    <div class="footer" [hidden]="!hidden">
      <mat-card style="width: 100vw;">
        <mat-card-actions class="center-content">
          <button mat-raised-button style="margin-right:10px; background-color: #73EB50"  id="save" (click)="post()" class="button" disabled="{{savedInGallery}}">SAVE TO GALLERY</button>
          <button mat-raised-button style="background-color: #FE7972" (click)="onRetakePhoto()" class="button">{{retakeButtonText}}</button>
        </mat-card-actions>
      </mat-card>
    </div>

    <mat-spinner class="center" *ngIf="showSpinner"></mat-spinner>
  </div>
  `,
  styleUrl: './shoot.component.css'
})


export class ShootComponent {
  @ViewChild('nameInput', { read: ElementRef }) nameInput!:ElementRef;

  PhotoService: PhotoService = inject(PhotoService);
  photoBase64: string = "";

  hidden: boolean = false;
  showSpinner: boolean = false;

  takeButtonDisabled: boolean = true;
  file?: File;
  date = new Date();

  req = new XMLHttpRequest();
  progress = document.createElement('progress');

  // Flag to signal if current photo has been saved, and to warn the user if they try to leave or retake without saving.
  savedInGallery: boolean = false;

  retakeButtonText: string = "RETAKE PHOTO"

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  toolbarHeight = localStorage.getItem("toolbarHeight")

  constructor(
    private _snackBar: MatSnackBar,
    private _uploadService: FileuploadService,
    private _renderer: Renderer2,
    private _dialog: MatDialog,
    private imageCompress: NgxImageCompressService,
    private renderer: Renderer2
  ) {}

  // Take Photo button
  onFileSelected(event: any): void {
    let cameraFileInput = document.getElementById("cameraFileInput") as HTMLInputElement

    // Save base64 image into cookie
    // Read the Blob as DataURL using the FileReader API
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Get full res photo as base 64
      const PHOTO_BASE_64 = reader.result as string
      localStorage.setItem('base64Photo',PHOTO_BASE_64)
      localStorage.setItem('fileName',Date.now().toString() + cameraFileInput.files![0].name.split("\.")[0])
      // Sets taken photo into picture div
      this.setCookieToPicture()
    }

    var blob = cameraFileInput.files![0].slice(0, cameraFileInput.files![0].size, 'image/jpg');
    reader.readAsDataURL(blob);
  }


  setCookieToPicture() {
    let base64 = localStorage.getItem('base64Photo')
    let fileName = localStorage.getItem('fileName')

    if (base64 && fileName) {
      // Retreive base64 photo from cookies and utilize Base64ToFile to convert back to file
      this.file = this._uploadService.Base64ToFile(base64, fileName)

      let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement
      let pictureDiv = document.getElementById("pictureDiv") as HTMLInputElement

      pictureFromCamera.setAttribute("src", window.URL.createObjectURL(
        (this.file)
      ));
      pictureDiv.hidden = false
      this.hidden = true

      this.savedInGallery = false
      this.retakeButtonText = "RETAKE PHOTO"
    }

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }


  // Save picture
  async post() {
    this.showSpinner = true
    let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement

    // Get the remote image as a Blob with the fetch API
    fetch(pictureFromCamera.src)
        .then((res) => res.blob())
        .then((blob) => {
            // Read the Blob as DataURL using the FileReader API
            const reader = new FileReader();
            reader.onloadend = async () => {
              if (this.file) {
                // Get full res photo as base 64
                const PHOTO_BASE_64 = reader.result as string
                // Get thumbnail as base64
                const THUMB_BASE_64 = this.imageCompress
                                            .compressFile(PHOTO_BASE_64, 0, 50, 80, 700)
                                              .then(compressedImage => {
                                                return compressedImage
                                              });

                // Save picture using express multer (fileupload service)
                if (this.file) {
                  // Upload full res picture
                  (await this._uploadService.uploadFiles(PHOTO_BASE_64, 'full', this.file.name as string))
                  .subscribe( async (res: any) => {
                    // Upload thumbnail
                    (await this._uploadService.uploadFiles(await THUMB_BASE_64, 'thumbs' , this.file?.name as string))
                    .subscribe((res: any) => {
                      // Post to json server
                      this.PhotoService.post(this.file?.name as string, pictureFromCamera.width, pictureFromCamera.height).then(async () => {
                        // Posted picture to DB, stop spinner and show snackbar, remove from localStorage

                        // Remove photo from localStorage
                        localStorage.removeItem('base64Photo')
                        localStorage.removeItem('fileName')

                        this.showSpinner = false,
                        this._snackBar.open("Photo uploaded to gallery!", "close", {
                          duration: 4000,
                          panelClass: 'saved-snackbar'
                        });
                        this.savedInGallery = true
                        this.retakeButtonText = "NEW PHOTO!"
                      })
                    });
                  });
                }
              }
            };
            reader.readAsDataURL(blob);
        });
  }

  // User name form
  NameInput(event: any): void {
    let username = event.target.value
    // Sets user in storage
    localStorage.setItem('User', username)
    if (username) {
      // Makes take picture button not disabled
      this.takeButtonDisabled = false
    } else {
      this.takeButtonDisabled = true
    }
  }

  onRetakePhoto() {
    let cameraFileInput = document.getElementById("cameraFileInput") as HTMLInputElement

    if (this.savedInGallery) {
      cameraFileInput.click()
    } else {
      const dialogRef = this._dialog.open(ShootDialogComponent, {
        data: {title: "Woah there!", message: "Are you sure you want to retake the photo without saving to the gallery?"}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          cameraFileInput.click()
        }
      });
    }
  }

  download() {
    let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement
    const a = document.createElement('a')
    a.href = pictureFromCamera.src
    a.download = pictureFromCamera.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  ngOnInit() {
    if (localStorage.getItem('User')) {
      // Makes take picture button not disabled
      this.takeButtonDisabled = false
    }

    if (localStorage.getItem('base64Photo')){
      this.setCookieToPicture()
    }
  }

  ngAfterViewInit() {
    if (localStorage.getItem('User')) {
      // Set input text to User name cookie
      this._renderer.setProperty(this.nameInput.nativeElement, 'value', localStorage.getItem('User'));
    }
    // set root div height minus 20 px margin
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }

}
