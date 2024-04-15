import { Component, inject, ElementRef, ViewChild, Renderer2 } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import  {MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { PhotoService } from '../../services/photo.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  @ViewChild('nameInput', { read: ElementRef }) nameInput!:ElementRef;

  PhotoService: PhotoService = inject(PhotoService);
  photoBase64: string = "";

  hidden: boolean = false;
  showSpinner: boolean = false;

  uploadDisabled: boolean = true;
  uploadButtonDisabled: boolean = true;


  files?: File[];
  date = new Date();

  uploaded = 0
  progress = 0
  lastProgressUpdateTime = 0

  Promises = []

  // Flag to signal if current photo has been saved, and to warn the user if they try to leave or retake without saving.
  savedInGallery: boolean = false;

  retakeButtonText: string = "RETAKE PHOTO"

  constructor(
    private _snackBar: MatSnackBar,
    private _uploadService: FileuploadService,
    private _cookieService: CookieService,
    private _renderer: Renderer2,
    private imageCompress: NgxImageCompressService
  ) {
    this.files = new Array()
  }

  // Storing files in a File array
  isMultiple = false;

  // Upload photos input
  selectedFile: any = null;
  onFileSelected(event: any): void {

    // Reset files array
    this.files = new Array()

    // Save files into files variable
    Array.from(event.target.files as File[]).forEach(file => {
      // File has to be converted to blob and then into a new File in order to change the name
      var blob = file.slice(0, file.size, 'image/jpg');
      this.files!.push(new File([blob], Date.now().toString()+file.name.split("\.")[0], {type: 'image/jpg'}))
    });
    this.hidden = true
    this.savedInGallery = false
    this.retakeButtonText = "RETAKE PHOTO"

    // Set upload button disabled
    if (this.files.length >= 1) {
      this.uploadButtonDisabled = false
    } else {
      this.uploadButtonDisabled = true
    }

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  // Save picture
  async post() {
    this.uploaded = 0
    this.showSpinner = true

    new Promise((resolve,reject)=>{
      Array.from(this.files!).map(async file => {
        // Read the Blob as DataURL using the FileReader API
        const reader = new FileReader();
        reader.onloadend = async () => {
          // Get full res photo as base 64
          const PHOTO_BASE_64 = reader.result as string

          // Get thumbnail as base64
          const THUMB_BASE_64 = this.imageCompress
                                      .compressFile(PHOTO_BASE_64, 0, 50, 80, 700)
                                        .then(compressedImage => {
                                          return compressedImage
                                        });
          // Save picture using express multer (fileupload service)
          if (file) {
            this.UpdateProgress(3);
            // Upload full image
            (await this._uploadService.uploadFiles(PHOTO_BASE_64, 'full', file.name as string))
            .subscribe(async (res: any) => {
              this.UpdateProgress(3);
              // Upload thumbnail
              (await this._uploadService.uploadFiles(await THUMB_BASE_64, 'thumbs' , file.name as string))
              .subscribe(async (res: any) => {
                this.UpdateProgress(1);
                // Create image object to get width and height
                var img = new Image();
                img.onload = () => {
                  // Post to json server
                  this.PhotoService.post(file.name, img.width, img.height).then(async () => {
                    this.UpdateProgress(1);
                    if (this.uploaded == (this.files!.length * 8)){
                      resolve(true)
                    }
                  })
                };
                img.src = await THUMB_BASE_64;
              });
            });
          }
        };
        await reader.readAsDataURL(file)
      })
    }).then(() => {
      new Promise((resolve, reject) => {
        // Final progress update
        this.progress = 100

        // a resolved promise after .6 second to show the progress longer
        setTimeout(() => {
            resolve(true)
        }, 600)
      }).then(() => {
              // Upload fully finished
              this.savedInGallery = true
              this.retakeButtonText = "NEW PHOTO!"
              // Posted picture to DB, stop spinner and show snackbar
              this.showSpinner = false,
              this._snackBar.open("Photo(s) uploaded to gallery!", "close", {
                duration: 4000,
                panelClass: 'upload-snackbar'
              });
              this.uploadButtonDisabled = true
              this.progress = 0
      })
  })}

  UpdateProgress(weight: number) {
    // Total weight is all the weight totaled that is passed in and should be divided by.
    let totalWeight = 8

    this.uploaded += weight

    // Update progress, only if new progress is higher and has been 500 ms since last update
    // Must wait 500 ms, or the CSS transition of the progress bar will flicker back and forth
    if (this.files) {
      let newProgress = (this.uploaded / totalWeight) / this.files?.length * 100
      if (newProgress > this.progress){
        let currentTime = new Date().getTime()
        if (currentTime - 500 > this.lastProgressUpdateTime) {
          this.lastProgressUpdateTime = currentTime
          this.progress = newProgress
        }
      }
    }
  }

  // User name form
  NameInput(event: any): void {
    let username = event.target.value
    // Sets user as cookie
    this._cookieService.set('User', username);
    if (username) {
      // Makes upload card not disabled
      this.uploadDisabled = false
    } else {
      this.uploadDisabled = true
    }
  }

  ngOnInit() {
    if (this._cookieService.get('User')) {
      // Makes upload card not disabled
      this.uploadDisabled = false
    }
  }

  ngAfterViewInit() {
    if (this._cookieService.get('User')) {
      // Set input text to User name cookie
      this._renderer.setProperty(this.nameInput.nativeElement, 'value', this._cookieService.get('User'));
    }
  }

}
