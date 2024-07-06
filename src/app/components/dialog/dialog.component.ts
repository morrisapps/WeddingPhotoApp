import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent {

  @ViewChild('input', { read: ElementRef }) input!:ElementRef;
  @ViewChild('button1', { read: ElementRef }) button1!:ElementRef;
  @ViewChild('button2', { read: ElementRef }) button2!:ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    dialogRef.disableClose = true
  }

  onButton1(): void {
    let returnData = {button1: true, button2: false, input: this.input.nativeElement.value}
    this.dialogRef.close(returnData);
  }
  onButton2(): void {
    let returnData = {button1: false, button2: true, input: this.input.nativeElement.value}
    this.dialogRef.close(returnData);
  }

  // input form
  inputForm(event: any): void {
    let input = event.target.value
    if (input) {
      this.button1.nativeElement.disabled = false
      // Makes take picture button not disabled
    //   this.takeButtonDisabled = false
    // } else {
    //   this.takeButtonDisabled = true
    } else {
      this.button1.nativeElement.disabled = true
    }
  }

  ngAfterViewInit(){
    // Disable button 1 if input is active
    if (this.data.input == true) {
      this.button1.nativeElement.disabled = true
    }
  }

}
