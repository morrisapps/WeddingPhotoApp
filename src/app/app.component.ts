import { Component, ElementRef, ViewChild, Renderer2, AfterViewInit } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { RouterModule } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeComponent,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements AfterViewInit {
  title = 'home';

  @ViewChild('toolbar', { read: ElementRef }) toolbar!:ElementRef;
  @ViewChild('drawerContainer', { read: ElementRef }) drawerContainer!:ElementRef;

  constructor (private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Set drawer height to full screen
    this.renderer.setStyle(this.drawerContainer.nativeElement, "height", `calc(100dvh - ${this.toolbar.nativeElement.scrollHeight}px)`)
  }

}
