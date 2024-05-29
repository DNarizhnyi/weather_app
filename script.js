const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "тиждень";

// Глобальна змінна для зберігання списку міст
let cities = [];

// Функція для завантаження списку міст з файлу
function loadCities() {
  fetch('worldcitiespop.csv')
    .then(response => response.text())
    .then(data => {
      // Розбиваємо дані на рядки
      const rows = data.split('\n');
      
      // Проходимо по кожному рядку, створюємо об'єкти міст і додаємо їх до масиву
      rows.forEach(row => {
        const columns = row.split(',');
        const city = columns[0]; // Передбачається, що назва міста знаходиться у першому стовпці
        cities.push({ name: city });
      });
    })
    .catch(error => console.error('Помилка завантаження міст:', error));
}

// Викликаємо функцію завантаження міст при завантаженні сторінки
window.onload = loadCities;

// Функція для отримання дати та часу
// Функція для отримання дати та часу
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П'ятниця",
    "Субота",
  ];
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

// Оновлення дати та часу
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// Функція для отримання публічної IP-адреси з сервісу ipinfo.io
function getPublicIp() {
  fetch("https://ipinfo.io/?token=a3d324767bb04b", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      const city = data.city;
      currentCity = city;
      getWeatherData(city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// Функція для отримання погодних даних
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;

      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = getHour(today.sunrise);
      sunSet.innerText = getHour(today.sunset);
    })
    .catch((err) => {
      alert("Місто не знайдено в нашій базі даних");
    });
}

// Функція для оновлення прогнозу
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// Функція для отримання погодних іконок
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "conditions_weather/Conditions/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "conditions_weather/Conditions/15.png";
  } else if (condition === "rain") {
    return "conditions_weather/Conditions/39.png";
  } else if (condition === "clear-day") {
    return "conditions_weather/Conditions/26.png";
  } else if (condition === "clear-night") {
    return "conditions_weather/Conditions/10.png";
  } else {
    return "conditions_weather/Conditions/26.png";
  }
}

// Функція для зміни фону в залежності від погодних умов
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "conditions_weather/background/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "conditions_weather/background/pcn.jpg";
  } else if (condition === "rain") {
    bg = "conditions_weather/background/rain.webp";
  } else if (condition === "clear-day") {
    bg = "conditions_weather/background/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "conditions_weather/background/cn.jpg";
  } else {
    bg = "conditions_weather/background/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

// Отримання годин з hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  
  return `${hour}:${min}`;
}

// Функція для отримання назви дня з дати
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П'ятниця",
    "Субота",
  ];
  return days[day.getDay()];
}

// Функція для вимірювання статусу УФ-індексу
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Низький";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Помірний";
  } else if (uvIndex <= 7) {
    uvText.innerText = "Високий";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Дуже високий";
  } else {
    uvText.innerText = "Екстремальний";
  }
}

// Функція для отримання статусу вологості
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Низька";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Помірна";
  } else {
    humidityStatus.innerText = "Висока";
  }
}

// Функція для отримання статусу видимості
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Густий туман";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Помірний туман";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Легкий туман";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Дуже легкий туман";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Легка димка";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Дуже легка димка";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Чисте повітря";
  } else {
    visibilityStatus.innerText = "Дуже чисте повітря";
  }
}

// Функція для отримання статусу якості повітря
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Добре👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Помірне😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Нездорове для чутливих груп😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Нездорове😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Дуже нездорове😨";
  } else {
    airQualityStatus.innerText = "Небезпечне😱";
  }
}

// Функція для обробки форми пошуку
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /* перевіряємо, чи елемент починається з таких же літер, як значення текстового поля:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /* створюємо елемент li для кожного збігаючого елемента:*/
      b = document.createElement("li");
      /* робимо жирними співпадаючі літери:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /* вставляємо input-поле, яке буде містити поточне значення масиву:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /* виконуємо функцію при кліку на значенні елемента (DIV-елемент):*/
      b.addEventListener("click", function (e) {
        /* вставляємо значення для поля вводу автозаповнення:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});

// Встановлення одиниці температури за замовчуванням
celciusBtn.classList.add("active");
tempUnit.forEach((unit) => {
  unit.addEventListener("click", () => {
    tempUnit.forEach((btn) => btn.classList.remove("active"));
    unit.classList.add("active");
    if (unit.classList.contains("celcius")) {
      currentUnit = "c";
      getWeatherData(currentCity, currentUnit, hourlyorWeek);}
  });
});

hourlyBtn.addEventListener("click", () => {
  hourlyorWeek = "hourly";
  hourlyBtn.classList.add("active");
  weekBtn.classList.remove("active");
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

weekBtn.addEventListener("click", () => {
  hourlyorWeek = "week";
  weekBtn.classList.add("active");
  hourlyBtn.classList.remove("active");
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});
