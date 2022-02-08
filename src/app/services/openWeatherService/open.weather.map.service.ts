import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  getweatherData(coords:any):Observable<any> {
    console.log(coords.lat)
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=2eb61f63e47d19dd32b796a81c9a198c
    `)
  }
  getforecastData(coords:any):Observable<any> {
    console.log(coords.lat)
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=2eb61f63e47d19dd32b796a81c9a198c
    `)
  }
}
