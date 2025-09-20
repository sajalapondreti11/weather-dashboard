const apiKey = "1004fde70831df26a2e9883c1702eee4"; // 🔑 Replace with your OpenWeatherMap API key
const unsplashKey = "8oNTIQKCSWaxD_ryjp4-b6ooQWQBybIqc-kmijaeHfY"; // 🔑 Replace with your Unsplash Access Key

// 🔄 Loader functions
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// Fetch current weather
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city name!");

  showLoader(); // Show spinner

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      alert("City not found!");
      return;
    }

    // Show weather card
    const weatherCard = document.getElementById("weather");
    weatherCard.classList.remove("hidden");
    setTimeout(() => weatherCard.classList.add("show"), 100);

    document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").innerText = `🌡 ${data.main.temp}°C`;
    document.getElementById("condition").innerText = `☁ ${data.weather[0].main}`;
    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Air Quality
    getAirQuality(data.coord.lat, data.coord.lon);

    // Forecast + hourly
    getForecast(city);

    // Monument background
    setCityBackground(city);

  } catch (error) {
    console.error("Error fetching weather:", error);
    alert("Something went wrong. Please try again later.");
  } finally {
    hideLoader(); // Hide spinner
  }
}

// Fetch 5-day forecast
async function getForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("forecast").classList.remove("hidden");
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    const days = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      if (!days[dayKey]) days[dayKey] = [];
      days[dayKey].push(item);
    });

    Object.keys(days).forEach((dayKey, idx) => {
      const dayData = days[dayKey][0];
      const div = document.createElement("div");
      div.classList.add("forecast-day");

      const date = new Date(dayData.dt * 1000);
      div.innerHTML = `
        <p>${date.toLocaleDateString("en-US", { weekday: "short" })}</p>
        <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="icon">
        <p>${dayData.main.temp}°C</p>
      `;

      div.addEventListener("click", () => {
        document.querySelectorAll(".forecast-day").forEach(card =>
          card.classList.remove("selected")
        );
        div.classList.add("selected");

        document.querySelector(".hourly-list").classList.remove("hidden");
        renderHourlyCards(days[dayKey]);
      });

      forecastContainer.appendChild(div);

      if (idx === 0) {
        div.classList.add("selected");
        document.querySelector(".hourly-list").classList.remove("hidden");
        renderHourlyCards(days[dayKey]);
      }
    });

  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

// Render hourly forecast
function renderHourlyCards(hourlyData) {
  const hourlyContainer = document.getElementById("hourlyContainer");
  hourlyContainer.innerHTML = "";

  hourlyData.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("hourly-card");
    card.style.animationDelay = `${index * 0.1}s`;

    const date = new Date(item.dt * 1000);
    const time = date.getHours() + ":00";

    card.innerHTML = `
      <p>${time}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
      <p>${item.main.temp}°C</p>
    `;

    hourlyContainer.appendChild(card);
  });
}

// Air Quality
async function getAirQuality(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const aqi = data.list[0].main.aqi;
    let status = "";
    if (aqi === 1) status = "Good 😀";
    else if (aqi === 2) status = "Fair 🙂";
    else if (aqi === 3) status = "Moderate 😐";
    else if (aqi === 4) status = "Poor 😷";
    else if (aqi === 5) status = "Very Poor 🤢";

    document.getElementById("airQuality").innerText = `Air Quality: ${status}`;
  } catch (error) {
    console.error("Error fetching AQI:", error);
  }
}

// Monument Background
async function setCityBackground(city) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${city}+monument&client_id=${unsplashKey}&orientation=landscape`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const imageUrl = data.results[randomIndex].urls.full;

      document.body.style.background = `url(${imageUrl}) no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    } else {
      document.body.style.background = "linear-gradient(to right, #6dd5ed, #2193b0)";
    }
  } catch (error) {
    console.error("Error fetching monument image:", error);
  }
}
