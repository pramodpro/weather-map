import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {coordinates } from '../../../assets/WeatherApp';
@Injectable({
  providedIn: 'root'
})
export class openWeatherMapService {
  constructor(private http:HttpClient) { }
  getUserPosition() {
    return new Observable((observer)=>{
      navigator.geolocation.getCurrentPosition(
        (position)=> {
          observer.next(position)
        },
        (error)=>{
          observer.next(error)
        },
      )
    })
  }
  getWeatherData(coords:coordinates):Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=2eb61f63e47d19dd32b796a81c9a198c
    `)
  }
  getForecastData(coords:coordinates):Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=2eb61f63e47d19dd32b796a81c9a198c
    `)
  }
  // getprecipitaionData(coords:coordinates,time?:any):Observable<any> {
  //   var d = new Date();
  //   d.setDate(d.getDate() - 2);
  //   var twoDaysAgo = Math.floor(d.getTime() / 1000)
  //   return this.http.get(`https://maps.openweathermap.org/maps/2.0/radar/5/${Math.round(+coords.lat)}/${Math.round(+coords.lon)}?&appid=2eb61f63e47d19dd32b796a81c9a198c&tm=${twoDaysAgo}
  //   `)
  // }
}
