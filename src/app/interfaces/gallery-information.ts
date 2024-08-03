import { GalleryComment } from './gallery-comment';

export interface GalleryInformation {
  id: string;
  author: string;
  width: number;
  height: number;
  likes: number;
  date: Date;
  showncount: number;
  prevcount: number;
  comments: GalleryComment[];
  // bestGroomBride: boolean;
  // bestBooth: boolean;
  // BestGoofy: boolean;
  // bestGroovy: boolean;
}
