 dayW = 0;

function checkEnter(event) {
  if (event.key === 'Enter') {
    getWeather();
  }
}

function getWeather() {
  const apiKey = '1faa10b13fb5a04748431009b8c15051';
  const city = document.getElementById('city-input').value  ;  

 
  

  
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);

       const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayW);  

      const targetDayString = targetDate.toISOString().split('T')[0];  

       const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.startsWith(targetDayString));
       
     
         const middayForecast = dailyForecasts[Math.floor(dailyForecasts.length / 2)];
         
        const temperature = Math.round(middayForecast.main.temp); console.log(temperature)
        const weatherCondition = middayForecast.weather[0].main.toLowerCase();console.log(weatherCondition)

         document.getElementById('temperature').innerHTML = `${temperature} <span>°C</span>`;
        document.getElementById('summary').textContent = weatherCondition;
        updatedate(targetDayString)

        updateWeather(weatherCondition);
  
    })
    .catch(error => {
      console.error('Error:', error);
    });

    
}

 

function nextDay() { 
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  if(dayW < 5) {
    dayW++;
    nextBtn.style.display = 'block';  
    prevBtn.style.display = 'block';  
    getWeather();
  }
  if(dayW+1 == 6){
    nextBtn.style.display = 'none';  
  }
}

function previousDay() {
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  if(dayW > 0) {
    dayW--;
    nextBtn.style.display = 'block';  
    prevBtn.style.display = 'block';  
    getWeather();
  }
  if(dayW == 0){
    prevBtn.style.display = 'none';  
  }
}





function getCityFromPC() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = '1faa10b13fb5a04748431009b8c15051'; // Replace with your OpenWeatherMap API key

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const city = data.name;
           document.getElementById('city-input').value  = city;
           getWeather()
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
}



function updatedate(targetDayString) {

  if(dayW == 0){
    document.getElementById('date').textContent = "Today";  
  }
  else{
    if(dayW == 1){
      document.getElementById('date').textContent = "Tomorrow";  
    }
    else{
      document.getElementById('date').textContent = targetDayString;  

    }
  }

}
 


function updateWeather(condition) {
  let weatherType;

  switch (condition) {
    case 'clear':
      changeWeather(weather[4]);
      break;
    case 'clouds':
      changeWeather(weather[2]);
      break;
    case 'rain':
      changeWeather(weather[2]);
      break;
    case 'snow':
      changeWeather(weather[0]);
      break;
    case 'thunderstorm':
      changeWeather(weather[3]);
      break;
    case 'wind':
      changeWeather(weather[1]);
      break;
    case 'mist':
      changeWeather(weather[1]);
      break;
    default:
      changeWeather(weather[4]);
      break;
  }
}
