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
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DBService } from '../../services/db.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { DialogComponent } from "../dialog/dialog.component";
import imageCompression from "browser-image-compression";
import { DomSanitizer } from "@angular/platform-browser";

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
  @ViewChild('fileForm', { read: ElementRef }) fileForm!:ElementRef;
  @ViewChild('textEllipsis', { read: ElementRef }) textEllipsis!:ElementRef;

  DBService: DBService = inject(DBService);
  photoBase64: string = "";

  showSpinner: boolean = false;
  showCheck: boolean = false;
  showFileInput: boolean = true;

  uploadDisabled: boolean = true;
  uploadButtonDisabled: boolean = true;


  files?: File[];
  date = new Date();

  uploaded = 0
  progress = 0
  lastProgressUpdateTime = 0

  Promises = []

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  toolbarHeight = "0"

  constructor(
    private _snackBar: MatSnackBar,
    private _uploadService: FileuploadService,
    private _renderer: Renderer2,
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer,
    private _dialog: MatDialog
  ) {
    this.files = new Array()
    // Import svg icons
    this._matIconRegistry.addSvgIcon(
      'upload',
      this._domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/upload.svg")
    );
    this._matIconRegistry.addSvgIcon(
      'anotherphoto',
      this._domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/anotherphoto.svg")
    );
    this._matIconRegistry.addSvgIcon(
      'viewgallery',
      this._domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/viewgallery.svg")
    );
    this._matIconRegistry.addSvgIcon(
      'camerapicture',
      this._domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/camerapicture.svg")
    );
  }

  // Storing files in a File array
  isMultiple = false;

  // Upload photos input
  onFileSelected(event: any): void {
    // Set files array
    this.files = event.target.files as File[]

    this.showCheck = false
    this.showFileInput = true

    // Set upload button disabled
    if (this.files.length >= 1 && (localStorage.getItem('User'))) {
      this.uploadButtonDisabled = false
    } else {
      this.uploadButtonDisabled = true
    }
  }

  // Save picture
  async post() {
    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then(async (result) => {
      if (!result) {
        this.uploaded = 0
        this.showSpinner = true
        this.showCheck = false
        this.showFileInput = false

        new Promise((resolve,reject)=>{
          Array.from(this.files!).map(file => {

            let fileName = Date.now().toString()+file.name.split("\.")[0]
            const reader = new FileReader();
            // Read the Blob as DataURL using the FileReader API
            reader.onloadend = async () => {
              try {
                // Get full res photo as base 64
                const PHOTO_BASE_64 = reader.result as string

                // Save picture using express multer (fileupload service)
                if (file) {
                  this.UpdateProgress(3);
                  // Upload full image
                  (await this._uploadService.uploadFiles(PHOTO_BASE_64, fileName as string))
                  .subscribe({

                    next: (res) => {
                      this.UpdateProgress(3);
                      // Create image object to get width and height
                      var img = new Image();
                      img.onload = () => {
                        // Post to json server
                        this.DBService.post(fileName, img.width, img.height).then(async () => {
                          this.UpdateProgress(2);
                          // Set localStorage with photo name to flag that this user posted this picture.
                          // Triggers delete button in gallery
                          localStorage.setItem(fileName, "true");
                          if (this.uploaded == (this.files!.length * 8)){
                            resolve(true)
                          }
                        })
                      };
                      img.src = PHOTO_BASE_64;
                    },

                    error: (res) => {
                      this._dialog.open(DialogComponent, {
                        data: {
                          title: "Error",
                          message: "An issue occured when uploading this picture.<br>Please try again.",
                          button1: "Okay",
                          button1Color: "#fd7543",
                          button1TextColor: "White"
                        }
                      })
                      this.uploadButtonDisabled = true
                      this.fileForm.nativeElement.reset()
                      this.progress = 0
                      this.showSpinner = false
                      this.showCheck = false
                      this.showFileInput = true
                    }

                  });
                }
              } catch(error) {
                console.log("Error posting image: "+error)
              }
            };

            // Compress file
            imageCompression(file, {
              maxSizeMB: 1
            })
            .then(function (compressedFile) {
              // Gather photo file as blob for reader
              var blob = compressedFile.slice(0, compressedFile.size, 'image/jpg');
              reader.readAsDataURL(blob);
            })
            .catch(function (error) {
              console.log("Failed to compress: "+error+"\nUsing uncompressed file.");
              // Attempt using un-compressed file
              var blob = file.slice(0, file.size, 'image/jpg');
              reader.readAsDataURL(blob);
            });

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

            // Posted picture to DB, stop spinner and show snackbar
            this.showSpinner = false,
            this._snackBar.open("Photo(s) uploaded to gallery!", "", {
              duration: 4000,
              panelClass: 'upload-snackbar'
            });

            this.uploadButtonDisabled = true
            this.fileForm.nativeElement.reset()
            this.progress = 0

            this.showCheck = true
          })
        })
      }
    })
  }

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
    localStorage.setItem('User', username)
    if (username) {
      // Makes upload card not disabled
      this.uploadDisabled = false
      if (this.files!.length >= 1) {
        this.uploadButtonDisabled = false
      }
    } else {
      this.uploadDisabled = true
      this.uploadButtonDisabled = true
    }
  }

  ngOnInit() {
    this.toolbarHeight = localStorage.getItem("toolbarHeight") as string

    if (localStorage.getItem('User')) {
      // Makes upload card not disabled
      this.uploadDisabled = false
    }
  }

  ngAfterViewInit() {
    // When selecting name input, make all text highlighted
    let nameInput = document.getElementById("nameInput") as HTMLInputElement
    nameInput.addEventListener(`focus`, () => nameInput.select());

    if (localStorage.getItem('User')) {
      // Set input text to User name cookie
      this._renderer.setProperty(this.nameInput.nativeElement, 'value', localStorage.getItem('User'));
    }
    // set root div height minus 20 px margin
    this._renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');

    // Display dialog message on first entering. Should only be once.
    if (localStorage.getItem("uploadDialogFlag") != "true") {
      this._dialog.open(DialogComponent, {
        data: {
          title: "About uploading",
          message: "You can upload all your photos here if you rather use your camera's app.</br>Make sure you have already taken your pictures.",
          button1: "Groovy!",
          button1Color: "#fd7543",
          button1TextColor: "White"
        }
      })
      localStorage.setItem("uploadDialogFlag", "true")
    }

  }
}
