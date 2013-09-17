function updateWeather() {
	// Update weather (http://simpleweatherjs.com)
	var degree = "&#176;"

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

	if (curr_hour == 0) {
		curr_hour = 12;
	}

	$("header .time").html(formatTime([curr_hour, curr_min]));
	$("header .weekday").html(d_names[curr_day]);
	$("header .date").html(m_names[curr_month] + " " + curr_date);

	// Update schedule
	var sample_schedule = [
		{
			"time" : [10,0],
			"length" : 30,
			"name" : "Block 5"
		},
		{
			"time" : [10,30],
			"length" : 30,
			"name" : "Block 6"
		},
		{
			"time" : [11,0],
			"length" : 30,
			"name" : "Block 7"
		},
		{
			"time" : [11,30],
			"length" : 30,
			"name" : "Block 8"
		}
	];

	var currentIndex = 0;

	for (var i = 0; i < sample_schedule.length; i++) {
		// console.log(sample_schedule[i].name);
		if (happeningNow(sample_schedule[i], [curr_hour, curr_min])) {
			currentIndex = i;
			break;
		}
	};

	console.log(sample_schedule[currentIndex].name);
}

function happeningNow(block, time) {
	var classTime = block.time;
	var classLength = block.length;

	for (var i = 0; i <= classLength; i++) {
		var tempTime = classTime.slice(0); // Clones the array

		// Probably not the most efficient way of doing this, but hey it works
		if ((tempTime[1] + i) >= 60) { // Loop through, checking every minute that the class is happening to see if it's happening now
			tempTime[0] = tempTime[0] + 1;
		}

		tempTime[1] = (tempTime[1] + i) % 60;

		if ((tempTime[0] == time[0]) && (tempTime[1] == time[1])) {
			return true;
		}
	};

	return false;
}

function formatTime(time) {
	var curr_hour = time[0];
	var curr_min = time[1] + "";
	
	if (curr_min.length == 1) {
		curr_min = "0" + curr_min;
	}

	return curr_hour + ":" + curr_min;
}

window.setInterval(function() {
	updatePage();
}, 1000); // Every second

window.setInterval(function() {
	updateWeather();
}, 60000); // Every minute

$(document).ready(function(){
	updatePage();
	updateWeather();

	$("header").fitText(3.0);
	$("#schedule li").fitText(4.0);
	$("#schedule li .block").fitText(2.0);
	$("#schedule li.current-class .block").fitText(0.7);
	$("footer #current-temp").fitText(0.12);
	$("footer #temps").fitText(0.2);
});