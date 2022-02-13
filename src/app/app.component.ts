import { Component, OnDestroy, OnInit } from '@angular/core';
import { nightmodeStyle } from 'src/assets/constants';
import { openWeatherMapService } from './services/openWeatherService/open.weather.map.service'
import { forecastData } from '../assets/WeatherApp'
import { coordinates } from './../assets/WeatherApp'
import { GMapService } from './services/googleMapService/g-map.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'weather-map';
  coord :coordinates = { lat: "", lon: "" };
  iconurl = "";
  $weatherDataSub!:any;
  $userPositionSub!:any;
  nightmode = false;
  weatherdetails: any = '';
  forecastList!: forecastData[];
  displayedColumns: string[] = ['date', 'time', 'temp', 'icon'];
  map!: google.maps.Map;
  mapType:boolean = false;
  mapStyle:boolean = false;
  nightMap = new google.maps.StyledMapType(nightmodeStyle)
  
  constructor(private mapServce: openWeatherMapService,private gmap:GMapService) {
    
  }
  
  initMap(): void {
    const udupi = { lat: 13.340, lng: 74.742 };
    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 6,
        center: udupi,    
        mapTypeControlOptions: {
          mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
        },   
      }
    );
    
    const marker = new google.maps.Marker({
      position: udupi,
      map: this.map,
    });
    let infoWindow = new google.maps.InfoWindow({
      content: "Click the map to get Lat/Lng!",
      position: udupi,
    });
    this.map.mapTypes.set("styled_map", this.nightMap);
    //infoWindow.open(map);

    this.map.addListener("click", (mapsMouseEvent: any) => {
      // Close the current InfoWindow.
      infoWindow.close();

      // Create a new InfoWindow.
      infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      // set weather data here
      infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      );
      this.coord = {
        lat: mapsMouseEvent.latLng.toJSON().lat.toFixed(2),
        lon: mapsMouseEvent.latLng.toJSON().lng.toFixed(2)
      }
      this.forecastData();
      this.weatherData();

    });
    //this.searchPlaces();
  }

  weatherData(): void {
    this.$weatherDataSub = this.mapServce.getWeatherData(this.coord).subscribe((data:any) => {
      this.weatherdetails = data;
      this.iconurl = `http://openweathermap.org/img/w/${this.weatherdetails?.weather[0]?.icon}.png`
    })
  }

  forecastData(): void {
    this.mapServce.getForecastData(this.coord).subscribe((data:any) => {
      this.forecastList = data.list.map((data: any) => {
        return {
          time: data.dt_txt,
          temp: data.main.temp,
          iconurl: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
        }
      })
    })
  }

  searchPlaces() {
    const map = this.map;
    const input = document.getElementById("pac-input") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    this.map.addListener("bounds_changed", () => {
      searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
    });

    let markers: google.maps.Marker[] = [];
    searchBox.addListener("places_changed", () => {
      const places = searchBox?.getPlaces();

      if (places?.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places?.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }

        const icon = {
          url: place.icon as string,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
        // this.coord = {
        //   lat: ''+place.geometry.location.lat,
        //   lon: ''+place.geometry.location.lng
        // }
        
      });
      
      this.map.fitBounds(bounds);
    });
  }

  ngOnInit(): void {
    this.initMap()
    this.$userPositionSub =this.mapServce.getUserPosition().subscribe((data: any) => {
      this.coord = {
        lat: data?.coords?.latitude.toFixed(2),
        lon: data?.coords?.longitude.toFixed(2)
      }
      this.weatherData();
    })
    //this.openWeatherMap()
  }

  ngOnDestroy(): void {
    this.$weatherDataSub.unsubscribe();
    this.$userPositionSub.unsubscribe();
  }

  openWeatherMap() {
    var getNormalizedCoord = this.gmap.getNormalizedCoord
    var myMapType = new google.maps.ImageMapType({
      
      getTileUrl: function(coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
          if (!normalizedCoord) {
            return null;
          }
          var bound = Math.pow(2, zoom);
        return "https://tile.openweathermap.org/map/precipitation_new/"+zoom+"/"+ normalizedCoord.x+"/"+ (bound - normalizedCoord.y - 1)+".png?appid=2eb61f63e47d19dd32b796a81c9a198c";
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 15,
    minZoom: 0,
    name: 'mymaptype'
  });
  // this.map.mapTypes.set('mymaptype', myMapType);
  // this.map.setMapTypeId('mymaptype');
  this.map.overlayMapTypes.insertAt(0, myMapType);
  }
  updateMap(){
    console.log(this.mapType);
    if(this.mapType) {
      this.openWeatherMap()
    } else {
      this.map.overlayMapTypes.clear();
    }
  }
  updateNightMode() {
    var mapOptions = {
      zoom: 15,
      mapTypeControl: false
  };
    if(this.mapStyle) {
      
      this.map.setMapTypeId("styled_map");
    } else {
      this.map.setMapTypeId("roadmap");
    }
    
  }
}
