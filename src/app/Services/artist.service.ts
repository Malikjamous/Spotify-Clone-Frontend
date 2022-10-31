import { Injectable } from '@angular/core';
import { Artist } from 'src/app/models/artist.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/Services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  artists = new BehaviorSubject<Artist[]>([]);
  artist = new Subject<Artist>();
  userRole: string = "";
  // get argument that user provide in the Search input and that array result
  search = new BehaviorSubject<{ searchInput: string; artists: Artist[] }>({ searchInput: '', artists: [] });
  constructor(private http: HttpClient, private authService: AuthService) {
  }
  addNewArtist(artist: Artist): void {
    this.authService.user.subscribe((user) => {
      console.log(user, 'user');
      if (user) {
        this.userRole = user.userRole;
      }
    });
    console.log(this.userRole, 'hier from user role');
    if (this.userRole === "user") {
      this.http
        .post<Artist>('http://localhost:8080/api/user/' + artist.userId + '/artists', artist)
        .subscribe((res) => {
          this.artist.next(res);
        });
    } else {
      this.http
        .post<Artist>('http://localhost:8080/api/admin/' + 'artists', artist)
        .subscribe((res) => {
          this.artist.next(res);
        });
    }

  }

  // fetch the data to get all artist back
  fetchArtists(userId: number): void {
    this.http
      .get<Artist[]>('http://localhost:8080/api/user/' + userId + '/artists').subscribe((artists) => {
        this.artists.next(artists);
      });
  }

  // get provided Artist by id back
  getArtist(artistId: number, userId: number): Promise<Artist> {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      return this.http.get<Artist>('http://localhost:8080/api/user/' + userId + '/artists/' + artistId).toPromise();
    } else {
      return this.http.get<Artist>('http://localhost:8080/api/admin' + '/artists/' + artistId).toPromise();
    }
  }
  // get all Artists back
  getArtists(): Artist[] {
    return this.artists.value;
  }
  // search for Artist and return artist if artist is include in the Search input
  searchArtist(searchInput: string): void {
    this.search.next({
      searchInput,
      artists: this.artists.value.filter((artist): boolean => {
        const artistNameLowercase = artist.name.toLowerCase();
        const searchInputLowercase = searchInput.toLowerCase();

        const nameIncludesSearchInput = artistNameLowercase.includes(searchInputLowercase);
        return nameIncludesSearchInput;
      }),
    });
  }

  updateArtist(userId: number, artistId: number, updatedArtist): void {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      this.http.patch<Artist>('http://localhost:8080/api/user/' + userId + '/artists/' + artistId, updatedArtist).subscribe(
        (res) => {
          this.artist.next(res);
        });
    } else {
      this.http
        .patch<Artist>('http://localhost:8080/api/admin' + '/artists/' + artistId, updatedArtist).subscribe(
          (res) => {
            this.artist.next(res);
          });
    }
  }

}
