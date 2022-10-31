import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArtistService } from '../Services/artist.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Artist } from '../models/artist.model';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-heading',
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.css'],
})
export class HeadingComponent implements OnInit, OnDestroy {
  artist: Artist;
  artistId: number;
  editMode: boolean;
  userId: number;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private route: ActivatedRoute, private artistService: ArtistService, private authService: AuthService) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnInit(): Promise<void> {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.userId = user.userId;
    });
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe((urls) => {
      urls.map((url) => {
        if (url.path === 'edit-album') {
          this.editMode = true;
        }
      });
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      this.artistId = +params.get('artistId');
    });
    this.artist = await this.artistService.getArtist(this.artistId, this.userId);
  }
}
