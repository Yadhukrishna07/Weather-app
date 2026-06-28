import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface WeatherResult {
  cityName: string;
  country: string;
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  }[];
}

interface WeatherApiResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getWeatherByCity(cityName: string): Observable<WeatherResult> {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;

    return this.http.get<GeocodingResponse>(geocodeUrl).pipe(
      switchMap(geoData => {
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('City not found');
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

        return this.http.get<WeatherApiResponse>(weatherUrl).pipe(
          switchMap(weatherData => {
            const result: WeatherResult = {
              cityName: name,
              country: country,
              temperature: weatherData.current_weather.temperature,
              windSpeed: weatherData.current_weather.windspeed,
              weatherCode: weatherData.current_weather.weathercode,
              description: this.getWeatherDescription(weatherData.current_weather.weathercode)
            };
            return [result];
          })
        );
      })
    );
  }

  private getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Freezing fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  }
}