import { GalleryComment } from './gallery-comment';

export interface GalleryInformation {
  id: string;
  fileExtension: string;
  fileType: string;
  author: string;
  width: number;
  height: number;
  likes: number;
  date: Date;
  showncount: number;
  prevcount: number;
  comments: GalleryComment[];
  isTemplate: boolean;
}
