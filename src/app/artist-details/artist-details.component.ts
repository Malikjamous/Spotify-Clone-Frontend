import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Artist } from '../models/artist.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ArtistService } from '../Services/artist.service';
import { Album } from '../models/album.model';
import { AlbumService } from '../Services/album.service';
import { AuthService } from 'src/app/Services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { User } from '../models/user.model';
@Component({
  selector: 'app-artist-details',
  templateUrl: './artist-details.component.html',
  styleUrls: ['./artist-details.component.css'],
})
export class ArtistDetailsComponent implements OnInit, OnDestroy {
  artist: Artist;
  artistAlbums: Album[];
  artistId: number;
  userId: number = null;
  userRole: string;
  isUserRoleAndArtistHasUserId: boolean;
  isAdminRoleAndArtistHasNoUserId: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private albumService: AlbumService,
    private router: Router,
    private authService: AuthService
  ) { }
  // subscribe to the id to get artist albums and the artist if artist dose not exist just navigate to home
  async ngOnInit(): Promise<void> {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.userRole = user.userRole;
        if (this.userRole != 'admin') {
          this.userId = user.userId;
        }
      }
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(async (params: ParamMap) => {
      this.artistId = +params.get('artistId');
      this.artist = await this.artistService.getArtist(this.artistId, this.userId);
      this.isUserRoleAndArtistHasUserId = false;
      this.isAdminRoleAndArtistHasNoUserId = false;
      if (this.userRole === 'user') {
        if (this.artist.userId != null) {
          this.isUserRoleAndArtistHasUserId = true;
        }
      } else {
        if (this.artist.userId === null) {
          this.isAdminRoleAndArtistHasNoUserId = true;
        }
      }
      this.onNewestFirst();
    });
  }
  onSortList(value: string): void {
    switch (value) {
      case 'old':
        this.onOldestFirst();
        break;
      case 'new':
        this.onNewestFirst();
        break;
    }
  }
  async onOldestFirst(): Promise<void> {
    this.artistAlbums = await this.albumService.fetchAlbumsAndSong(
      this.artistId,
      this.userId,
      'ASC',
      this.isAdminRoleAndArtistHasNoUserId,
      this.isUserRoleAndArtistHasUserId
    );
  }
  async onNewestFirst(): Promise<void> {
    this.artistAlbums = await this.albumService.fetchAlbumsAndSong(
      this.artistId,
      this.userId,
      'DESC',
      this.isAdminRoleAndArtistHasNoUserId,
      this.isUserRoleAndArtistHasUserId
    );
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  onEditArtist(): void {
    this.router.navigate(['edit-artist/', this.artistId]);
  }
}
