import { Component, inject, ElementRef, ViewChild, Renderer2 } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  takeButtonDisabled: boolean = true;
  files?: File[];
  date = new Date();

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

  // Take Photo button
  selectedFile: any = null;
  onFileSelected(event: any): void {

    // Reset files array
    this.files = new Array()

    // Save files into files variable
    Array.from(event.target.files as File[]).forEach(file => {
      // File has to be converted to blob and then into a new File in order to change the name
      var blob = file.slice(0, file.size, 'image/jpg');
      this.files!.push(new File([blob], Date.now().toString()+file.name, {type: 'image/jpg'}))
    });
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

    Array.from(this.files!).forEach(file => {
            console.log(file)
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
              // Post to json server
              this.PhotoService.post(file.name).then(async () => {
                // Save picture using express multer (fileupload service)
                if (file) {
                  (await this._uploadService.uploadFiles(await THUMB_BASE_64, 'thumbs' , file.name as string))
                  .subscribe((res: any) => {});
                  (await this._uploadService.uploadFiles(PHOTO_BASE_64, 'full', file.name as string))
                  .subscribe((res: any) => {});
                  this.savedInGallery = true
                  this.retakeButtonText = "NEW PHOTO!"
                }
              })
            };
            reader.readAsDataURL(file)
    });
    // Posted picture to DB, stop spinner and show snackbar
    this.showSpinner = false,
    this._snackBar.open("Photo uploaded to gallery!", "close", {
      duration: 4000,
      panelClass: 'saved-snackbar'
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
