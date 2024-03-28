import { Component, inject, ElementRef, ViewChild, Renderer2 } from "@angular/core";
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { PhotoService } from '../../services/photo.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';

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
    ReactiveFormsModule
  ],
  template: `
  <div>
    <mat-card *ngIf="!show" class="center">
      <mat-card-title class="center-content">What's your name?</mat-card-title>
      <mat-card-content>
        <p>
            <input #nameInput type="text" matInput placeholder="name" id="nameInput" (input)="NameInput($event)">
        </p>
          <div class="center-content">
            <button #takePictureButton disabled="{{disabled}}" type="button" mat-raised-button (click)="fileInput.click()" style="margin-bottom: 20px" id="takePictureButton">Take a Picture!</button>
            <input hidden (change)="onFileSelected($event)" #fileInput type="file" id="cameraFileInput" accept="image/*" capture="environment">
          </div>
      </mat-card-content>
    </mat-card>

    <div id="pictureDiv" class="center">
      <mat-card style="width: 95dvw;">
        <img id="pictureFromCamera" style="height:100%;max-height:100%;max-width:100%"/>
      </mat-card>
    </div>
  </div>

  <div class="footer" *ngIf="show">
    <mat-card style="width: 100dvw;">
      <mat-card-actions class="center-content">
        <button mat-raised-button style="margin-right:10px;margin-left:5px" id="save" (click)="post()" class="button">SAVE TO GALLERY</button>
        <button mat-raised-button class="button">DOWNLOAD TO PHONE</button>
      </mat-card-actions>
    </mat-card>
  </div>

  <mat-spinner class="center" *ngIf="showSpinner"></mat-spinner>
  `,
  styleUrl: './shoot.component.css'
})


export class ShootComponent {

  @ViewChild('nameInput', { read: ElementRef }) nameInput!:ElementRef;

  PhotoService: PhotoService = inject(PhotoService);

  photoBase64: string = "";

  show: boolean = false;
  showSpinner: boolean = false;

  disabled: boolean = true;

  file?: File;

  date = new Date();

  constructor(private _snackBar: MatSnackBar, private uploadService: FileuploadService, private cookieService: CookieService, private renderer: Renderer2) {}

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
    this.file = new File([blob], Date.now() + ".jpg", {type: 'image/jpg'})
    pictureDiv.hidden = false
    this.show = true

    // Encode the file using the FileReader API
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   //this.photoBase64 = reader.result
    //     console.log(reader.result);
    //     // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
    // };
    // reader.readAsDataURL(cameraFileInput.files![0]);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  // Save picture
  post() {
    this.showSpinner = true
    let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement
    // Get the remote image as a Blob with the fetch API
    fetch(pictureFromCamera.src)
        .then((res) => res.blob())
        .then((blob) => {
            // Read the Blob as DataURL using the FileReader API
            const reader = new FileReader();
            reader.onloadend = () => {
              if (this.file) {
                console.log(this.file.name)
                this.PhotoService.post(reader.result as string, this.file.name).then(() => this.showSpinner = false)
              }

                // Logs data:image/jpeg;base64,wL2dvYWwgbW9yZ...

                // Convert to Base64 string
                // const base64 = getBase64StringFromDataURL(reader.result);
                // console.log(base64);
                // Logs wL2dvYWwgbW9yZ...
            };
            reader.readAsDataURL(blob);
        });

        // Save picture using express multer (fileupload service)
    if (this.file) {
        this.uploadService.uploadFile(this.file)
        .subscribe((res: any) => {
            alert(res.msg);

        });
    }
  }

  // User name form
  NameInput(event: any): void {
    let username = event.target.value
    // Sets user as cookie
    this.cookieService.set('User', username);
    if (username) {
      // Makes take picture button not disabled
      this.disabled = false
    } else {
      this.disabled = true
    }
  }

  ngOnInit() {
    if (this.cookieService.get('User')) {
      // Makes take picture button not disabled
      this.disabled = false
    }
  }

  ngAfterViewInit() {
    if (this.cookieService.get('User')) {
      // Set input text to User name cookie
      this.renderer.setProperty(this.nameInput.nativeElement, 'value', this.cookieService.get('User'));
    }
    // let snack = this._snackBar
    // let pictureFromCamera = document.getElementById("pictureFromCamera") as HTMLInputElement
    // let pictureDiv = document.getElementById("pictureDiv") as HTMLInputElement

    // cameraFileInput.addEventListener("change", function () {
    //   pictureFromCamera.setAttribute("src", window.URL.createObjectURL(
    //     (this.files![0])
    //   ));
    //   pictureDiv.hidden = false
    //   snack.open("fdf")
    // });
  }
}
