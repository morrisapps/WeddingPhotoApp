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
import { CookieService } from 'ngx-cookie-service';
import { PhotoService } from '../../services/photo.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { HttpEvent, HttpEventType } from "@angular/common/http";

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
  template: `
  <div class="root-div">
    <div [hidden]="hidden">
      <mat-card style="width: 95dvw; max-width: 400px;" class="center">
        <mat-card-title class="center-content">What's your name?</mat-card-title>
        <mat-card-content>
          <p class="center-content">
              <input style="width: 70%; height: 20px;" #nameInput type="text" matInput placeholder="name" id="nameInput" (input)="NameInput($event)">
          </p>
            <div class="center-content">
              <button #takePictureButton disabled="{{takeButtonDisabled}}" type="button" mat-raised-button (click)="fileInput.click()" id="takePictureButton">Take a Picture!</button>
              <input hidden (change)="onFileSelected($event)" #fileInput type="file" id="cameraFileInput" accept="image/*" capture="environment">
            </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div id="pictureDiv" class="center" [hidden]="!hidden">
      <mat-card style="width: 95dvw;margin-bottom:90px;margin-top:90px;">

        <img id="pictureFromCamera"/>
        <button mat-fab id="save" (click)="download()" class="download-button">
          <mat-icon>get_app</mat-icon>
        </button>

      </mat-card>
    </div>
    <div class="footer" [hidden]="!hidden">
      <mat-card style="width: 100dvw;">
        <mat-card-actions class="center-content">
          <button mat-raised-button style="margin-right:10px;" id="save" (click)="post()" class="button" disabled="{{savedInGallery}}">SAVE TO GALLERY</button>
          <button mat-raised-button (click)="onRetakePhoto()" class="button">{{retakeButtonText}}</button>
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

  constructor(
    private _snackBar: MatSnackBar,
    private _uploadService: FileuploadService,
    private _cookieService: CookieService,
    private _renderer: Renderer2,
    private _dialog: MatDialog,
    private imageCompress: NgxImageCompressService
  ) {}

  // Storing files in a File array
  isMultiple = false;

  // Take Photo button
  selectedFile: any = null;
  onFileSelected(event: any): void {
    let cameraFileInput = document.getElementById("cameraFileInput") as HTMLInputElement

    let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement
    let pictureDiv = document.getElementById("pictureDiv") as HTMLInputElement
    pictureFromCamera.setAttribute("src", window.URL.createObjectURL(
      (cameraFileInput.files![0])
    ));
    // Save file into variable
    // File has to be converted to blob and then into a new File in order to change the name
    var blob = cameraFileInput.files![0].slice(0, cameraFileInput.files![0].size, 'image/jpg');
    this.file = new File([blob], Date.now().toString() + cameraFileInput.files![0].name.split("\.")[0], {type: 'image/jpg'})
    pictureDiv.hidden = false
    this.hidden = true

    this.savedInGallery = false
    this.retakeButtonText = "RETAKE PHOTO"

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
                      this.PhotoService.post(this.file?.name as string, 0 ,0).then(async () => {
                        // Posted picture to DB, stop spinner and show snackbar
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
    // Sets user as cookie
    this._cookieService.set('User', username);
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
    if (this._cookieService.get('User')) {
      // Makes take picture button not disabled
      this.takeButtonDisabled = false
    }
  }

  ngAfterViewInit() {
    if (this._cookieService.get('User')) {
      // Set input text to User name cookie
      this._renderer.setProperty(this.nameInput.nativeElement, 'value', this._cookieService.get('User'));
    }
  }

  ngOnChanges() {
    console.log("changed")
  }
}
