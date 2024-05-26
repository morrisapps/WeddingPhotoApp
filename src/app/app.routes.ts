import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { ShootComponent } from './components/shoot/shoot.component';
import { UploadComponent } from './components/upload/upload.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page'
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Administrator Control'
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    title: 'Gallery'
  },
  {
    path: 'shoot',
    component: ShootComponent,
    title: 'Take a photo'
  },
  {
    path: 'upload',
    component: UploadComponent,
    title: 'Upload Photos'
  },
  {
    path: 'photos',
    redirectTo: '../../photos',
    title: 'photos'
  }
];
