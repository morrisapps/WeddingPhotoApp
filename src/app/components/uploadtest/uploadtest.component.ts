// app.component.ts
import { CommonModule }
    from '@angular/common';
import { Component }
    from '@angular/core';
import { FormsModule }
    from '@angular/forms';
import { RouterOutlet }
    from '@angular/router';
import { FileuploadService }
    from '../../services/fileupload/fileupload.service';

    @Component({
      selector: 'app-uploadtest',
      standalone: true,
      imports: [
        CommonModule,
        FormsModule,
        RouterOutlet],
      templateUrl: './uploadtest.component.html',
      styleUrl: './uploadtest.component.css'
    })
export class UploadTestComponent {

    // Storing files in a File array
    files?: File;
    isMultiple = false;

    // Injecting uploadservice
    constructor(private uploadService: FileuploadService) { }

    // Function to use the service to upload files
    uploadFiles(filesElement: HTMLInputElement) {

        // Check whether the files array is not undefined
        if (this.files) {
            this.uploadService.uploadFile(this.files)
            .subscribe((res: any) => {
                alert(res.msg);

                // Resetting the input file tag
                filesElement.value = '';
            });
        } else {
            alert('Please select files to upload!');
        }
    }
    changeFiles(event: any) {

        // On file change set it to files array
        this.files = event.target.files;
    }
}
