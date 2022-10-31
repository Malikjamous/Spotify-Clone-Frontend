import { Component, OnInit, Input } from '@angular/core';
import { Artist } from 'src/app/models/artist.model';

@Component({
  selector: 'app-artist-item',
  templateUrl: './artist-item.component.html',
  styleUrls: ['./artist-item.component.css'],
})
export class ArtistItemComponent implements OnInit {
  // artist input to get all artist to the sidebar list
  @Input() artist: Artist;
  constructor() { }

  ngOnInit(): void { }
}
