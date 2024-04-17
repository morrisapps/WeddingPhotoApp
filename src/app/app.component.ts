import { Component, ElementRef, ViewChild, Renderer2, AfterViewInit } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { RouterModule } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


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
  background = "/assets/graphics/4965010.jpg"
  @ViewChild('toolbar', { read: ElementRef }) toolbar!:ElementRef;
  @ViewChild('drawerContainer', { read: ElementRef }) drawerContainer!:ElementRef;

  constructor(private renderer: Renderer2, public matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer){
    this.matIconRegistry.addSvgIcon(
      'home',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/home.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'camera',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/camera.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'upload',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/upload.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'gallery',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/gallery.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'website',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/website.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'prizes',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/prizes.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'wedding',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/wedding.svg")
    );
  }

  ngAfterViewInit() {
    // Set drawer height to full screen
    this.background = "/assets/graphics/4965010.jpg"
    this.renderer.setStyle(this.drawerContainer.nativeElement, "height", `calc(100dvh - ${this.toolbar.nativeElement.scrollHeight}px)`)
  }

}
