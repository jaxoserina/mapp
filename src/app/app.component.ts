import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { GmapService } from './gmap.service';
import { HttpClient } from '@angular/common/http';
import { mapNumber } from '../assets/functions/mapNumber';
import { styledMap } from '../assets/constants/styledMap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mapElement') mapElement: ElementRef;

  private map: any;
  results: string[];

  constructor(private gapi: GmapService, private http: HttpClient) {
  }

  ngAfterViewInit(): void {

    /**
     * Init map api [google.maps]
     */
    this.gapi.loadScript(() => {
      const maps = window['google']['maps'];
      console.log(maps);
      // const loc = new maps.LatLng(53.52476717517185, -2.5434842249308414);
      const loc = new maps.LatLng(51.561638, -0.14);

      const styledMapType = new maps.StyledMapType(styledMap, {name: 'Dark Map'});

      this.map = new maps.Map(this.mapElement.nativeElement, {
        zoom: 13,
        center: loc,
        scrollwheel: true,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: false,
        scaleControl: true,
        zoomControlOptions: {
          style: maps.ZoomControlStyle.LARGE,
          position: maps.ControlPosition.RIGHT_BOTTOM
        }
      });
      this.map.mapTypes.set('styled_map', styledMapType);
      this.map.setMapTypeId('styled_map');
      this.map.data.loadGeoJson('assets/lonely.geojson');
      this.map.data.addListener('mouseover', function(event) {
       // console.log(event.feature.getProperty('PREVALENCE'));
      });
      this.map.data.setStyle(function(feature) {
        const lon = feature.getProperty('PREVALENCE');
        const value = 255 - Math.round(mapNumber(lon, 0, 5, 0, 255));
        const color = 'rgb(' + value + ',' + value + ',' + 0 + ')';
        return {
          fillColor: color,
          strokeWeight: 1
        };
      });

      this.http.get('assets/letting.json').subscribe(data => {
        this.results = data['data'];
        console.log(this.results[0]);
        console.log(this.results[0][15]); // total bidders
        console.log(this.results[0][16]); // successful bid points
        console.log(this.results[0][23]); // longitude
        console.log(this.results[0][24]); // latitude
        const heatmapData = [];
        this.results.map(x => {
          heatmapData.push({
            location: new maps.LatLng(x[24], x[23]),
            weight: parseInt(x[15], 10)
          });
        });
        console.log(heatmapData);

        const heatmap = new maps.visualization.HeatmapLayer({
          data: heatmapData
        });
        const gradient = [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
        heatmap.set('gradient', gradient);
        heatmap.set('radius', 70);
        heatmap.set('opacity', 1);
        heatmap.setMap(this.map);
      });
    });
  }

}
