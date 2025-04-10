$(document).ready(function() {
  // Initialize variables
  let tempUnit = 'metric'; // Default is Celsius
  let lastCity = ''; // Store last searched city
  let weatherData = null; // Store weather data
  
  // Theme toggle functionality
  $('#theme-toggle-btn').on('click', function() {
    $('body').toggleClass('dark-mode');
    const icon = $(this).find('i');
    if (icon.hasClass('fa-moon')) {
      icon.removeClass('fa-moon').addClass('fa-sun');
    } else {
      icon.removeClass('fa-sun').addClass('fa-moon');
    }
  });
  
  // Temperature unit toggle
  $('#celsius').on('click', function() {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active');
      $('#fahrenheit').removeClass('active');
      tempUnit = 'metric';
      if (lastCity) updateWeather(lastCity);
    }
  });
  
  $('#fahrenheit').on('click', function() {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active');
      $('#celsius').removeClass('active');
      tempUnit = 'imperial';
      if (lastCity) updateWeather(lastCity);
    }
  });
  
  // Current location button
  $('#current-location').on('click', function() {
    if (navigator.geolocation) {
      $('#loading').show();
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          getWeatherByCoordinates(lat, lon);
        },
        function(error) {
          $('#loading').hide();
          alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });
  
  // Weather form submission handler
  $('#weather-form').on('submit', function(e) {
    e.preventDefault(); // Prevent full page reload

    let city = $('#city-input').val().trim();
    if (city === "") {
      alert("Please enter a city name.");
      return;
    }
    
    updateWeather(city);
  });
  
  // Function to update weather by city name
  function updateWeather(city) {
    lastCity = city;
    
    // Show loading indicator and clear previous results
    $('#loading').show();
    $('#weather-result').empty();
    $('#forecast-cards').empty();
    $('#forecast-title').hide();

    // API key and URL
    const apiKey = '7f69904c04026daa9677b3803a812393';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${tempUnit}`;
    
    // Fetch weather data using AJAX
    $.ajax({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        weatherData = data;
        displayWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
      },
      error: function(xhr) {
        let errorMsg = "Sorry, could not fetch the weather data. Please try again.";
        if (xhr.status === 404) {
          errorMsg = "City not found. Please check the spelling and try again.";
        }
        $('#weather-result').html(`<p>${errorMsg}</p>`);
        $('#loading').hide();
      }
    });
  }
  
  // Function to get weather by coordinates
  function getWeatherByCoordinates(lat, lon) {
    const apiKey = '7f69904c04026daa9677b3803a812393';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${tempUnit}`;
    
    $.ajax({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        weatherData = data;
        lastCity = data.name;
        $('#city-input').val(data.name);
        displayWeather(data);
        getForecast(lat, lon);
      },
      error: function() {
        $('#weather-result').html("<p>Sorry, could not fetch the weather data. Please try again.</p>");
        $('#loading').hide();
      }
    });
  }
  
  // Function to display weather data
  function displayWeather(data) {
    // Get weather icon
    const iconClass = getWeatherIconClass(data.weather[0].id);
    const tempSymbol = tempUnit === 'metric' ? '°C' : '°F';
    
    // Build dynamic HTML content for the result
    let resultHtml = `
      <div class="weather-main">
        <div>
          <h2>Weather in ${data.name}</h2>
          <p>${data.weather[0].description}</p>
        </div>
        <div>
          <i class="${iconClass} weather-icon"></i>
          <div class="temp-display">${Math.round(data.main.temp)}${tempSymbol}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="detail-item">
          <i class="fas fa-temperature-half"></i>
          <div>
            <p>Feels like: ${Math.round(data.main.feels_like)}${tempSymbol}</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-droplet"></i>
          <div>
            <p>Humidity: ${data.main.humidity}%</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-wind"></i>
          <div>
            <p>Wind: ${data.wind.speed}${tempUnit === 'metric' ? ' m/s' : ' mph'}</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-gauge"></i>
          <div>
            <p>Pressure: ${data.main.pressure} hPa</p>
          </div>
        </div>
      </div>
    `;
    
    // Fade in the result for a smooth experience
    $('#weather-result').hide().html(resultHtml).fadeIn(800);
    $('#loading').hide();
  }
  
  // Function to get 5-day forecast
  function getForecast(lat, lon) {
    const apiKey = '7f69904c04026daa9677b3803a812393';
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${tempUnit}`;
    
    $.ajax({
      url: forecastUrl,
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        displayForecast(data);
      },
      error: function() {
        console.log("Could not fetch forecast data");
      }
    });
  }
  
  // Function to display forecast
  function displayForecast(data) {
    $('#forecast-title').show();
    $('#forecast-cards').empty();
    
    // Get one forecast per day (noon)
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toDateString();
      
      // Only keep one forecast per day (around noon)
      if (!dailyForecasts[day] && date.getHours() >= 11 && date.getHours() <= 13) {
        dailyForecasts[day] = item;
      }
    });
    
    // Convert to array and get first 5 days
    const forecasts = Object.values(dailyForecasts).slice(0, 5);
    
    // Create forecast cards
    forecasts.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const iconClass = getWeatherIconClass(item.weather[0].id);
      const tempSymbol = tempUnit === 'metric' ? '°C' : '°F';
      
      const forecastHtml = `
        <div class="forecast-card">
          <div class="forecast-date">${dayName}</div>
          <div>${dayDate}</div>
          <i class="${iconClass} forecast-icon"></i>
          <div class="forecast-temp">${Math.round(item.main.temp)}${tempSymbol}</div>
          <div>${item.weather[0].description}</div>
        </div>
      `;
      
      $('#forecast-cards').append(forecastHtml);
    });
  }
  
  // Function to get weather icon class based on weather code
  function getWeatherIconClass(code) {
    // Weather codes: https://openweathermap.org/weather-conditions
    if (code >= 200 && code < 300) { // Thunderstorm
      return 'fas fa-bolt';
    } else if (code >= 300 && code < 400) { // Drizzle
      return 'fas fa-cloud-rain';
    } else if (code >= 500 && code < 600) { // Rain
      return 'fas fa-cloud-showers-heavy';
    } else if (code >= 600 && code < 700) { // Snow
      return 'fas fa-snowflake';
    } else if (code >= 700 && code < 800) { // Atmosphere (fog, haze)
      return 'fas fa-smog';
    } else if (code === 800) { // Clear
      return 'fas fa-sun';
    } else if (code > 800) { // Clouds
      return 'fas fa-cloud';
    }
    return 'fas fa-cloud'; // Default
  }

  // Feedback form submission handler with basic validation
  $('#feedback-form').on('submit', function(e) {
    e.preventDefault();

    let name = $('#name').val().trim();
    let email = $('#email').val().trim();
    let message = $('#message').val().trim();
    let errorMessage = "";

    // Simple validation
    if (name === "" || email === "" || message === "") {
      errorMessage = "All fields are required.";
    } else if (!validateEmail(email)) {
      errorMessage = "Please enter a valid email address.";
    }

    if (errorMessage !== "") {
      $('#feedback-msg').html(`<p style="color:red;">${errorMessage}</p>`);
      return;
    }

    // On valid form, simulate sending data (e.g., via AJAX)
    $('#feedback-msg').html("<p style='color:green;'>Thank you for your feedback!</p>");
    // Optionally, clear the form fields
    $('#feedback-form')[0].reset();
  });

  // Simple email validation function
  function validateEmail(email) {
    // Regular expression for basic email validation
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(String(email).toLowerCase());
  }
});