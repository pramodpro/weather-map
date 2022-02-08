import { Component, OnDestroy, OnInit } from '@angular/core';
import { nightmodeStyle } from 'src/assets/constants';
import { openWeatherMapService } from './services/openWeatherService/open.weather.map.service'
import { forecastData } from '../assets/WeatherApp'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'weather-map';
  coord = {lat :"",lon:""};
  iconurl = "";
  nightmode = false;
  weatherdetails:any = {
    weather : []
  };
  forecastList!: forecastData[];
  displayedColumns: string[] = ['time', 'temp', 'icon'];
  map!: google.maps.Map;
  constructor(private mapServce:openWeatherMapService){
  }
  initMap(): void {
    const udupi = { lat: 13.340, lng: 74.742 };
    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 15,
        center: udupi,
        styles: this.nightmode?nightmodeStyle:[]
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
  
    //infoWindow.open(map);
  
    this.map.addListener("click", (mapsMouseEvent:any) => {
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
        lat:mapsMouseEvent.latLng.toJSON().lat.toFixed(2),
        lon:mapsMouseEvent.latLng.toJSON().lng.toFixed(2)
      }
      this.mapServce.getweatherData(this.coord).subscribe((data)=>{
        this.weatherdetails = data;
        this.iconurl = `http://openweathermap.org/img/w/${this.weatherdetails?.weather[0]?.icon}.png`
      })
      this.mapServce.getforecastData(this.coord).subscribe((data)=> {
        console.log(data)
        this.forecastList = data.list.map((data:any)=>{
          return {
            time: data.dt_txt,
            temp:data.main.temp,
            iconurl: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
          }
        })
        console.log(this.forecastList);

      })
      //infoWindow.open(map);
    });
    this.searchPlaces();
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
    });
    this.map.fitBounds(bounds);
  });
}

  ngOnInit(): void {
    this.initMap()
    var a = this.mapServce.getUserPosition().subscribe((data:any)=>{
      this.coord = {
        lat:data?.coords?.latitude.toFixed(2),
        lon:data?.coords?.longitude.toFixed(2)
      }
      this.mapServce.getweatherData(this.coord).subscribe((data)=>{
        this.weatherdetails = data;
      })
    })
  }
  ngOnDestroy(): void {
      
  }
  
}
