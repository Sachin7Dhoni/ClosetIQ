import { useEffect, useState } from "react";
import axios from "axios";

export default function WeatherBox({ onWeather }) {

  const [weather, setWeather] = useState(null);

  useEffect(() => {

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const apiKey = "YOUR_OPENWEATHER_API_KEY";

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        setWeather(res.data);

        onWeather(res.data);
      }
    );

  }, []);

  if (!weather) {

    return <h2>Loading weather...</h2>;

  }

  return (

    <div className="weather-box">

      <h2>
        🌤 {weather.name}
      </h2>

      <h3>
        {weather.main.temp}°C
      </h3>

      <p>
        {weather.weather[0].main}
      </p>

    </div>

  );
}