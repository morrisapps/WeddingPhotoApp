import { Component, inject } from "@angular/core";
import { CommonModule, formatDate } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import { HousingService } from '../../services/housing.service';
import { HousingLocation } from '../../housinglocation';
import { FileuploadService } from '../../services/fileupload/fileupload.service';

@Component({
  selector: 'app-shoot',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
  <div>

    <button type="button" mat-raised-button (click)="fileInput.click()" style="margin-bottom: 20px" class="center">Take a Picture!</button>
    <input hidden (change)="onFileSelected($event)" #fileInput type="file" id="cameraFileInput" accept="image/*" capture="environment" name="{{date | date:'yyyy-MM-dd'}}-my.csv">

    <div id="pictureDiv">
      <mat-card >
        <img id="pictureFromCamera" style="height:100%;max-height:100%;max-width:100%"/>
        <mat-card-actions *ngIf="show">
          <button mat-raised-button style="margin-right:10px;margin-left:5px" id="save" (click)="post()">SAVE TO GALLERY</button>
          <button mat-raised-button>DOWNLOAD TO PHONE</button>
        </mat-card-actions>
      </mat-card>
    </div>
  </div>

  `,
  styleUrl: './shoot.component.css'
})


export class ShootComponent {
  housingService: HousingService = inject(HousingService);

  photoBase64: string = "";

  show: boolean = false;

  file?: File;

  date = new Date();

  constructor(private _snackBar: MatSnackBar, private uploadService: FileuploadService) {}

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
                this.housingService.post(reader.result as string, this.file.name)
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

  ngOnInit() {
    // let snack = this._snackBar
    // let cameraFileInput = document.getElementById("cameraFileInput") as HTMLInputElement
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
