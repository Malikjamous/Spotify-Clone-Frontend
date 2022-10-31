import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artist } from 'src/app/models/artist.model';
import { ArtistService } from 'src/app/Services/artist.service';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { GlobalDataService } from '../../Services/global-data.service';

@Component({
  selector: 'app-sidebar-list',
  templateUrl: './sidebar-list.component.html',
  styleUrls: ['./sidebar-list.component.css'],
})
export class SidebarListComponent implements OnInit, OnDestroy {
  artists: Artist[];
  globalArtists: Artist[];
  searchedArtists: Artist[];
  searchInput: string;
  userId: number = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isUser: boolean;
  constructor(private authService: AuthService, private artistService: ArtistService, private globalDataService: GlobalDataService) { }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // get all Artist and Searched Artist info by subscribe to artists
  ngOnInit(): void {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        if (user.userRole === 'user') {
          this.isUser = true;
        } else {
          this.isUser = false
        }
        this.artistService.fetchArtists(user.userId);
        this.globalDataService.fetchArtists();
      }
    });
    this.artistService.artists.pipe(takeUntil(this.destroy$)).subscribe((artists: Artist[]) => {
      this.artists = artists;
    });
    this.globalDataService.globalArtists.pipe(takeUntil(this.destroy$)).subscribe((artists: Artist[]) => {
      this.globalArtists = artists;
    })
    this.artistService.search.pipe(takeUntil(this.destroy$)).subscribe((search) => {
      this.searchInput = search.searchInput;
      this.searchedArtists = search.artists;
    });
  }
}
