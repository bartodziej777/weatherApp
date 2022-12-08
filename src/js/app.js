import cloudsImg from "../img/clouds.svg";
import fogImg from "../img/fog.svg";
import rainImg from "../img/rain.svg";
import snowImg from "../img/snow.svg";
import stormImg from "../img/storm.svg";
import sunImg from "../img/sun.svg";

//API
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search?";
const NUM_RESULTS = 1;

const form = document.querySelector("#input");
const units = {
  temp: "°C",
  wind: "mph",
  precipation: "mm",
  hour: "",
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Satursday",
];

const weather = {
  0: `${sunImg}`,
  1: `${cloudsImg}`,
  2: `${cloudsImg}`,
  3: `${cloudsImg}`,
  45: `${fogImg}`,
  48: `${fogImg}`,
  51: `${rainImg}`,
  53: `${rainImg}`,
  55: `${rainImg}`,
  56: `${rainImg}`,
  57: `${rainImg}`,
  61: `${rainImg}`,
  63: `${rainImg}`,
  65: `${rainImg}`,
  66: `${rainImg}`,
  67: `${rainImg}`,
  71: `${snowImg}`,
  73: `${snowImg}`,
  75: `${snowImg}`,
  77: `${snowImg}`,
  80: `${rainImg}`,
  81: `${rainImg}`,
  82: `${rainImg}`,
  85: `${snowImg}`,
  86: `${snowImg}`,
  95: `${stormImg}`,
  96: `${stormImg}`,
  99: `${stormImg}`,
};

const getLocation = async function (query) {
  try {
    const respond = await fetch(`${GEO_API}name=${query}&count=${NUM_RESULTS}`);
    const data = await respond.json();
    if (!data.results) throw new Error(`Failed to find location`);
    //console.log(data.results[0]);
    return ({ latitude, longitude, name, country } = data.results[0]);
  } catch (err) {
    throw "Failed to get location";
  }
};

const getWeather = async function (lat, lng) {
  try {
    const respond = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&current_weather=true&timezone=auto`
    );
    const data = await respond.json();
    const today = {
      temp: data.current_weather.temperature,
      tempMax: data.daily.temperature_2m_max[0],
      tempMin: data.daily.temperature_2m_min[0],
      wind: data.current_weather.windspeed,
      weatherCode: data.current_weather.weathercode,
      precipitationSum: data.daily.precipitation_sum[0],
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
    };
    const nextDays = [];

    for (let i = 1; i <= 5; i++) {
      const day = {
        date: data.daily.time[i],
        weatherCode: data.daily.weathercode[i],
        temp: data.daily.temperature_2m_max[i],
      };
      nextDays.push(day);
    }

    return [today, nextDays];
  } catch (err) {
    throw new Error("Failed to load weather");
  }
};

const updateUI = function (currentWeather, futureWeather, location) {
  const main = document.querySelector("main");
  main.innerHTML = `<section class="currentWeather">
    <div class="currentWeather__location">
        <h1 class="currentWeather__location-city">${location.city}</h1>
        <h3 class="currentWeather__location-country">${location.country}</h3>
      </div>
    <div class="container">
    <div class="currentWeather__main">
      <div class="currentWeather__temperature">
        <span class="currentWeather__temperature-value">${
          currentWeather.temp
        }</span>
        <span class="currentWeather__temperature-unit">${units.temp}</span>
      </div>
      <img class="currentWeather__icon" src="${
        weather[currentWeather.weatherCode]
      }" alt="weather icon">
      </img>
    </div>
    <div class="currentWeather__details">
      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="highV">${currentWeather.tempMax}</span>
          <span class="detail-unit" id="highU">${units.temp}</span>
        </div>
        <p class="detail-name">High</p>
      </div>

      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="windV">${currentWeather.wind}</span>
          <span class="detail-unit" id="windU">${units.wind}</span>
        </div>
        <p class="detail-name">Wind</p>
      </div>

      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="sunriseV">${currentWeather.sunrise.slice(
            -5
          )}</span>
          <span class="detail-unit" id="sunriseU">${units.hour}</span>
        </div>
        <p class="detail-name">Sunrise</p>
      </div>

      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="lowV">${currentWeather.tempMin}</span>
          <span class="detail-unit" id="lowU">${units.temp}</span>
        </div>
        <p class="detail-name">Low</p>
      </div>

      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="precV">${
            currentWeather.precipitationSum
          }</span>
          <span class="detail-unit" id="precU">${units.precipation}</span>
        </div>
        <p class="detail-name">Precipitation</p>
      </div>

      <div class="detail">
        <div class="detail-content">
          <span class="detail-value" id="sunsetV">${currentWeather.sunset.slice(
            -5
          )}</span>
          <span class="detail-unit" id="sunsetU">${units.hour}</span>
        </div>
        <p class="detail-name">Sunset</p>
      </div>
    </div>
    </div>
  </section>
  <section class="futureWeather">
    <h2 class="heading-secondary">Next Days</h2>
    <div class="futureWeather__container"></div>
  </section>`;

  //next days
  const dayContainer = document.querySelector(".futureWeather__container");
  dayContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const date = new Date(futureWeather[i].date);
    let markup = `
    <div class="day">
      <p class="day__name">${days[date.getDay()]}</p>
      <div class="day__temperature">
        <span class="day__temperature-value">${futureWeather[i].temp}</span>
        <span class="day__temperature-unit">${units.temp}</span>
      </div>
      <img class="day__icon" src="${
        weather[`${futureWeather[i].weatherCode}`]
      }" ></img>
    </div>
    `;
    dayContainer.insertAdjacentHTML("beforeend", markup);
  }
};

const renderError = function (msg) {
  let markup = `<div class="error">
  <h3 class="error__title">Upss... Something gone wrong</h3>
  <p class="error__msg">
    ${msg}. Try again.
  </p>
  <button class="error__btn">Ok</button>
  </div>`;
  const errors = document.querySelector(".errors");
  const overlay = document.querySelector(".overlay");
  errors.innerHTML = markup;
  overlay.classList.add("overlay--active");
  document.querySelector(".error__btn").focus();

  document.querySelector(".error__btn").addEventListener("click", function (e) {
    overlay.classList.remove("overlay--active");
    errors.innerHTML = "";
  });
};

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const input = document.querySelector("#input__field");
  const query = input.value;
  if (!query) return;
  input.value = "";

  try {
    const {
      latitude: lat,
      longitude: lng,
      name: city,
      country,
    } = await getLocation(query);
    const [currentWeather, futureWeather] = await getWeather(lat, lng);
    updateUI(currentWeather, futureWeather, { city, country });
  } catch (err) {
    renderError(err);
  }
});
