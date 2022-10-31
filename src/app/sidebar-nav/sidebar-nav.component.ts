import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlbumService } from '../Services/album.service';
import { ArtistService } from 'src/app/Services/artist.service';
import { Song } from '../models/song.model';
import { AuthService } from '../Services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GlobalDataService } from '../Services/global-data.service';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css'],
})
export class SidebarNavComponent implements OnInit, OnDestroy {
  isFavoriteSongExist: boolean;
  starFill = false;
  isArtistExist = false;
  searchInput: string;
  favoriteSongs: Song[] = [];
  userId: number;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private globalDataService: GlobalDataService
  ) { }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // check all Artists and if one Exist set boolean to true
  async ngOnInit(): Promise<void> {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.userId = user.userId;
      }
    });
    this.onCheckArtistExist();
    this.onGetFavoriteSongs();
  }
  async onGetFavoriteSongs(): Promise<void> {
    this.favoriteSongs = await this.albumService.getFavoriteSongs(this.userId);
    this.onCheckFavoriteSongsExist();
    this.albumService.favoriteSongs.subscribe(async () => {
      this.favoriteSongs = await this.albumService.getFavoriteSongs(this.userId);
      this.onCheckFavoriteSongsExist();
    });
  }
  onCheckFavoriteSongsExist(): void {
    if (this.favoriteSongs.length === 0) {
      this.isFavoriteSongExist = false;
    } else {
      this.isFavoriteSongExist = true;
    }
  }
  // navigate to favorite Component to Show filtered Artists
  onFilterFavoriteSongs(): void {
    this.router.navigate(['favorite']);
  }
  // get the Search input implemented
  onSearch(): void {
    this.artistService.searchArtist(this.searchInput);
  }
  onNewArtist(): void {
    this.router.navigate(['create-artist'], { relativeTo: this.route });
  }

  onCheckArtistExist(): void {
    this.artistService.artists.pipe(takeUntil(this.destroy$)).subscribe(async (artists) => {
      if (await artists.length === 0) {
        this.isArtistExist = false;
      } else {
        this.isArtistExist = true;
      }
    });
    this.globalDataService.globalArtists.pipe(takeUntil(this.destroy$)).subscribe(async (globalArtists) => {
      if (await globalArtists.length === 0) {
        this.isArtistExist = false;
      } else {
        this.isArtistExist = true;
      }
    });
  }
}
