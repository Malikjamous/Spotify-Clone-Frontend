import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Artist } from '../models/artist.model';
import { Album } from '../models/album.model';
@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {

  globalArtists = new BehaviorSubject<Artist[]>([]);
  globalArtist = new Subject<Artist>();
  // get argument that user provide in the Search input and that array result
  constructor(private http: HttpClient) {
  }
  fetchArtists(): void {
    this.http
      .get<Artist[]>('http://localhost:8080/api/admin/artists').subscribe((artists) => {
        this.globalArtists.next(artists);
      });
  }
  // fetch all albums in artist details
  fetchAlbumsAndSong(artistId: number, orderDir: string): Promise<Album[]> {
    return this.http
      .get<Album[]>(
        'http://localhost:8080/api/admin/artists/' + artistId +
        '/albums' + '?orderBy=date&orderDir=' + orderDir).toPromise();
  }
}
