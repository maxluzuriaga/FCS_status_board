function updatePage() {
	// Update date and time
	var m_names = new Array("January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December");
	var d_names = new Array("Sunday", "Monday", "Tuesday",
"Wednesday", "Thursday", "Friday", "Saturday");

	var d = new Date();

	var curr_day = d.getDay();
	var curr_date = d.getDate();
	var curr_month = d.getMonth();

	var curr_hour = d.getHours() % 12;
	var curr_min = d.getMinutes();

	curr_min = curr_min + "";
	
	if (curr_min.length == 1) {
		curr_min = "0" + curr_min;
	}

	if (curr_hour == 0) {
		curr_hour = 12;
	}

	$("header .time").html(curr_hour + ":" + curr_min)
	$("header .weekday").html(d_names[curr_day]);
	$("header .date").html(m_names[curr_month] + " " + curr_date);

	// Update weather (http://simpleweatherjs.com)
	var degree = "&#176;"

		// 	<div id="current-temp">
		// 	<strong>65&#176;</strong>
		// </div>
		// <div id="temps">
		// 	<span class="high-temp">70&#176;</span>
		// 	<span class="low-temp">48&#176;</span>
		// </div>

	$.simpleWeather({
		zipcode: '',
		woeid: '2524350', // For Wynnewood, PA
		location: '',
		unit: 'f',
		success: function(weather) {
			$("#current-temp strong").html(weather.temp + degree);
			$("footer .high-temp").html(weather.high + degree);
			$("footer .low-temp").html(weather.low + degree);
		},
		error: function(error) {
			console.log("Weather error");
		}
	});
}

window.setInterval(function() {
	updatePage();
}, 1000);

$(document).ready(function(){
	updatePage();

	$("header").fitText(3.0);
	$("#schedule li").fitText(4.0);
	$("#schedule li.current-class .block").fitText(1.0);
	$("footer #current-temp").fitText(0.12);
	$("footer #temps").fitText(0.2);
});