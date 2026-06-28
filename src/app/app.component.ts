import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherResult } from './weather.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'weather-app';
  cityName: string = '';
  weather: WeatherResult | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private weatherService: WeatherService) {}

  searchWeather() {
    if (!this.cityName.trim()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.weather = null;

    this.weatherService.getWeatherByCity(this.cityName).subscribe({
      next: (result) => {
        this.weather = result;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'City not found. Please try again.';
        this.isLoading = false;
      }
    });
  }
}