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
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DBService } from '../../services/db.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { DialogComponent } from "../dialog/dialog.component";
import imageCompression from "browser-image-compression";
import { DomSanitizer } from "@angular/platform-browser";
import { Buffer } from 'buffer';
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";

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
    MatRadioModule,
    FormsModule,
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
  uploadSectionDisabled: boolean = true;

  // Defaulted radiobutton to Full
  radioButtonValue: string = "Full";


  files?: File[];
  date = new Date();

  currentFileName = ""
  progress = 0
  totalProgress = 0
  currentFileProgress = 0

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
      this.uploadSectionDisabled = false
    } else {
      this.uploadSectionDisabled = true
    }
  }

  // Save picture
  async post() {
    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then(async (result) => {
      if (!result) {
        this.showSpinner = true
        this.showCheck = false
        this.showFileInput = false
        // Start update progress
        this.progress = 0.1
        this.totalProgress = 0
        this.currentFileProgress = 0
        new Promise(async (resolve,reject)=>{
          for await (const file of this.files!) {
            await new Promise(async (resolve,reject)=>{
              const fileExtensionlastIndex = file.name.lastIndexOf(".");
              const fileName = Date.now().toString()+file.name.slice(0, fileExtensionlastIndex);
              const fileExtension = file.name.slice(fileExtensionlastIndex);

              try {
                this.UpdateProgress(fileName+fileExtension, 0, true)
                // timeout of 1 second to show the progress bar longer
                setTimeout(async () => {
                // Save picture using express multer (fileupload service)
                  if (file) {
                    // Upload file
                    (await (this._uploadService.uploadFile(file, fileName, fileExtension, file.type)))
                    .subscribe({
                      next: (progress: any) => {
                        console.log("Uploading Progress: "+progress)
                        this.UpdateProgress(fileName+fileExtension, progress);
                      },
                      error: (err: any) => {
                        if (err.error && err.error.message) {
                          console.log(err.error.message)
                          this.handleUploadError('Could not upload the file! ' + err.error.message)

                        } else {
                          console.log(err)
                          this.handleUploadError('Could not upload the file! ' + err)
                        }
                      },
                      complete: () => {
                        // Set localStorage with photo name to flag that this user posted this picture.
                        // Triggers delete button in gallery
                        localStorage.setItem(fileName, "true");
                        console.log("complete");
                        // End promise in loop and signal for next file to be processed
                        resolve(true)
                      }
                    })
                  }
                }, 1000)
              } catch(error) {
                console.log("Error occured: "+error)
                this.handleUploadError("An issue occured when uploading this picture.<br>Please try again.")
              }
            })
            .then(() => {
              if (this.files![this.files!.length - 1] === file){
                console.log("last")
                resolve(true)
              }
            })
          }
        }).then(() => {
            // Upload fully finished
            // Posted picture to DB, stop spinner and show snackbar
            this.showSpinner = false,
            this._snackBar.open("Photo(s) uploaded to gallery!", "", {
              duration: 4000,
              panelClass: 'upload-snackbar'
            });

            this.uploadSectionDisabled = true
            this.fileForm.nativeElement.reset()
            this.progress = 0

            this.showCheck = true
        })
      }
    })
  }

  handleUploadError(message: string) {
    this._dialog.open(DialogComponent, {
      data: {
        title: "Error",
        message: message,
        button1: "Okay",
        button1Color: "#fd7543",
        button1TextColor: "White"
      }
    })
    this.uploadSectionDisabled = true
    this.fileForm.nativeElement.reset()
    this.progress = 0
    this.showSpinner = false
    this.showCheck = false
    this.showFileInput = true
  }

  UpdateProgress(FileName: string, Weight: number, NewFile = false) {
    this.currentFileName = FileName


    if (NewFile && this.files) {
      this.totalProgress += this.currentFileProgress / this.files?.length
    }

    this.currentFileProgress = Weight * 100
    if (this.files) {
      this.progress = this.currentFileProgress / this.files?.length
      this.progress += this.totalProgress
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
        this.uploadSectionDisabled = false
      }
    } else {
      this.uploadDisabled = true
      this.uploadSectionDisabled = true
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
    this._renderer.setStyle(this.rootDiv.nativeElement, 'height', 'calc(100dvh - '+this.toolbarHeight+'px - 20px)');

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
