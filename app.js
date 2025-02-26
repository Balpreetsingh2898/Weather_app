$(document).ready(function() {
    // Weather form submission handler
    $('#weather-form').on('submit', function(e) {
      e.preventDefault();  // Prevent full page reload
  
      let city = $('#city-input').val().trim();
      if (city === "") {
        alert("Please enter a city name.");
        return;
      }
  
      // Show loading indicator and clear previous results
      $('#loading').show();
      $('#weather-result').empty();
  
      // API key and URL (replace YOUR_API_KEY with a valid key from OpenWeatherMap)
      const apiKey = '7f69904c04026daa9677b3803a812393';
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
      // Fetch weather data using AJAX
      $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
          // Build dynamic HTML content for the result
          let resultHtml = `
            <h3>Weather in ${data.name}</h3>
            <p>Temperature: ${data.main.temp} °C</p>
            <p>Weather: ${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
          `;
          // Fade in the result for a smooth experience
          $('#weather-result').hide().html(resultHtml).fadeIn(800);
        },
        error: function() {
          $('#weather-result').html("<p>Sorry, could not fetch the weather data. Please try again.</p>");
        },
        complete: function() {
          // Hide the loading indicator after the request is complete
          $('#loading').hide();
        }
      });
    });
  
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
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
      return re.test(String(email).toLowerCase());
    }
  });
  