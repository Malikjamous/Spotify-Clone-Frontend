import { Injectable } from '@angular/core';
import { Album } from '../models/album.model';
import { Song } from '../models/song.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/Services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  favoriteSongs = new Subject<Song>();
  album = new Subject<Album>();
  userId: number;
  userRole: string;
  constructor(private http: HttpClient, private authService: AuthService) {
  }
  // create a new album
  addNewAlbum(album: Album, userId): void {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      this.http
        .post<Album>('http://localhost:8080/api/user/' + userId + '/artists/' + album.artistId + '/albums', album)
        .subscribe((res) => {
          this.album.next(res);
        });
    } else {
      this.http
        .post<Album>('http://localhost:8080/api/admin/artists/' + album.artistId + '/albums', album)
        .subscribe((res) => {
          this.album.next(res);
        });
    }
  }
  // fetch all albums in artist details
  fetchAlbumsAndSong(artistId: number, userId: number, orderDir: string, isAdminRoleAndArtistHasNoUserId: boolean, isUserRoleAndArtistHasUserId: boolean): Promise<Album[]> {
    if (isAdminRoleAndArtistHasNoUserId || !isUserRoleAndArtistHasUserId) {
      return this.http
        .get<Album[]>(
          'http://localhost:8080/api/admin/artists/' + artistId +
          '/albums' + '?orderBy=date&orderDir=' + orderDir).toPromise();
    }
    if (isUserRoleAndArtistHasUserId) {
      return this.http
        .get<Album[]>(
          'http://localhost:8080/api/user/' +
          userId + '/artists/' + artistId +
          '/albums' + '?orderBy=date&orderDir=' + orderDir).toPromise();
    }

  }
  // get one album by index
  getAlbum(albumId: number, artistId: number, userId: number): Promise<Album> {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      return this.http
        .get<Album>('http://localhost:8080/api/user/' + userId + '/artists/' + artistId + '/albums/' + albumId).toPromise();
    } else {
      return this.http
        .get<Album>('http://localhost:8080/api/admin/artists/' + artistId + '/albums/' + albumId).toPromise();
    }
  }

  // set all songs that the  User provide to Favorite
  setFavoriteSongs(songFav: any, userId): void {
    if (songFav.artistId === undefined) {
      songFav.artistId = songFav.favSong.artistId;
    }
    if (songFav.albumId === undefined) {
      songFav.albumId = songFav.favSong.albumId;
    }
    if (songFav.songId === undefined) {
      songFav.songId = songFav.favSong.songId;
    }
    this.http
      .patch<Song>(
        'http://localhost:8080/api/user/' + userId + '/artists/' +
        songFav.artistId +
        '/albums/' +
        songFav.albumId +
        '/songs/' +
        songFav.songId,
        songFav
      )
      .subscribe((res) => {
        this.favoriteSongs.next(res);
        // this.fetchAlbumsAndSong(songFav.artistId, userId, 'DESC');
      });
  }
  // get all FavoriteSongs
  getFavoriteSongs(userId): Promise<Song[]> {
    return this.http.get<Song[]>('http://localhost:8080/api/user/' + userId + '/favSongs').toPromise();
  }

  updateAlbumAndSongs(userId: number, artistId: number, albumId: number, updatedAlbum): void {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      this.http
        .patch<Album>('http://localhost:8080/api/user/' + userId + '/artists/'
          + artistId + '/albums/' + albumId, updatedAlbum).subscribe(
            (res) => {
              this.album.next(res);
            });
    } else {
      this.http
        .patch<Album>('http://localhost:8080/api/admin/artists/'
          + artistId + '/albums/' + albumId, updatedAlbum).subscribe(
            (res) => {
              this.album.next(res);
            });
    }
  }

  deleteSong(userId: number, artistId: number, albumId: number, songId: number): Promise<Song> {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      return this.http.delete<Song>('http://localhost:8080/api/user/' + userId + '/artists/'
        + artistId + '/albums/' + albumId + '/songs/' + songId).toPromise();
    } else {
      return this.http.delete<Song>('http://localhost:8080/api/admin/artists/'
        + artistId + '/albums/' + albumId + '/songs/' + songId).toPromise();
    }
  }
  deleteFavSong(userId: number, artistId: number, albumId: number, songId: number): Promise<Song> {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
      }
    });
    if (this.userRole === "user") {
      return this.http.delete<Song>('http://localhost:8080/api/user/' + userId + '/artists/'
        + artistId + '/albums/' + albumId + '/songs/favoriteSong/' + songId).toPromise();
    }
  }
}
