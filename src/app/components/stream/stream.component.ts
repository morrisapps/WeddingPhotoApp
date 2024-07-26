import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css'
})
export class StreamComponent {

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  toolbarHeight = localStorage.getItem("toolbarHeight") as string

  constructor (
    private _renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this._renderer.setStyle(this.rootDiv.nativeElement, 'height', 'calc(100dvh - '+this.toolbarHeight+'px)');
  }
}
