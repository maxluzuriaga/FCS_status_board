var letterDay = "";
var loading;
var schedule;
var oldIndex;

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

function buildSchedule() {
	var request = $.get("http://maxluzuriaga.com/get_letter_day.php", function(data) {
		var oldDay = letterDay;

		var d = new Date();

		var curr_year = d.getFullYear();
		var curr_month = d.getMonth() + 1;
		var curr_date = d.getDate();

		if (curr_month < 10) {
			curr_month = "0" + curr_month;
		}

		var dayformatted = "" + curr_year + curr_month + curr_date;

		// https://code.google.com/p/ijp/
		icalParser.parseIcal(data);

		for (var i = 0; i < icalParser.ical.events.length; i++) {
			var ev = icalParser.ical.events[i];

			if (ev.dtstart.value == dayformatted) {
				var arr = ev.summary.value.split(" ");
				if (arr[1] == "Day") {
					letterDay = arr[0];
					break;
				}
			}
		};

		if (oldDay != letterDay) {
			// Day has changed, build schedule
			schedule = [];

			var weekday = d.getDay() - 1;

			var blocks = {
				"A" : [5, 3, 6, 1, 2],
				"B" : [6, 4, 1, 2, 3],
				"C" : [1, 5, 2, 3, 4],
				"D" : [2, 6, 3, 4, 5],
				"E" : [3, 1, 4, 5, 6],
				"F" : [4, 2, 5, 6, 1]
			}

			var days = [
				[ // Monday
					"Chorus Block",
					75
				],
				[ // Tuesday
					"Community Block",
					40
				],
				[], // Wednesday
				[ // Thursday
					"Chorus Block",
					75
				],
				[ // Friday
					"Community Block",
					"Assembly"
				]
			];

			var homeroom = buildBlock("Homeroom", [8,25], 5);
			var recess = buildBlock("Recess", [11,10], 10);

			schedule.push(homeroom);

			if ((letterDay == "W") || (weekday == 2)) {
				// Wednesday
				// W: 1, 2, mtn 4 wor, 3, recess, community, 7, 4/early, 4/late, 6, 5
				schedule.push(buildBlock(1, [8,30], 40));
				schedule.push(buildBlock(2, [9,10], 40));
				schedule.push(buildBlock("Meeting for Worship", [9,50], 40));
				schedule.push(buildBlock(3, [10,30], 40));
				schedule.push(recess);
				schedule.push(buildBlock("Community Block", [11,20], 40));
				schedule.push(buildBlock(7, [12,00], 40));
				schedule.push(buildBlock("Block 4 / Early Lunch", [12,40], 40));
				schedule.push(buildBlock("Block 4 / Late Lunch", [13,20], 35));
				schedule.push(buildBlock(6, [13,55], 40));
				schedule.push(buildBlock(5, [14,35], 35));
			} else if (weekday == 4) {
				// Friday
				// "C" : [1, 5, 2, 3, 4];
				var dayblocks = blocks[letterDay];
				var freeblocks = days[weekday];

				schedule.push(buildBlock(dayblocks[0], [8,30], 40));
				schedule.push(buildBlock(freeblocks[0], [9,10], 40));
				schedule.push(buildBlock(freeblocks[1], [9,50], 40));
				schedule.push(buildBlock(dayblocks[2], [10,30], 40));
				schedule.push(recess);
				schedule.push(buildBlock(dayblocks[3], [11,20], 80));
				schedule.push(buildBlock("Block " + dayblocks[4] + " / Early Lunch", [12,40], 40));
				schedule.push(buildBlock("Block " + dayblocks[4] + " / Late Lunch", [13,20], 35));
				schedule.push(buildBlock(dayblocks[1], [13,55], 40));
			} else {
				// Other days
				var dayblocks = blocks[letterDay];
				var dayinfo = days[weekday];

				schedule.push(buildBlock(dayblocks[0], [8,30], 40));
				schedule.push(buildBlock(dayblocks[1], [9,10], 40));
				schedule.push(buildBlock(dayinfo[0], [9,50], 40));
				schedule.push(buildBlock(dayblocks[2], [10,30], 40));
				schedule.push(recess);
				schedule.push(buildBlock(dayblocks[3], [11,20], 80));
				schedule.push(buildBlock("Block " + dayblocks[4] + " / Early Lunch", [12,40], 40));
				schedule.push(buildBlock("Block " + dayblocks[4] + " / Late Lunch", [13,20], 35));
				schedule.push(buildBlock(7, [13,55], dayinfo[1]));
			}

			loading = false;
		}
	});
}

function buildBlock(name, time, length) {
	if ((typeof name) == "string") {
		return {
			"time" : time,
			"length" : length,
			"name" : name
		};
	} else {
		return {
			"time" : time,
			"length" : length,
			"name" : "Block " + name
		};
	}
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

	var curr_hour = d.getHours();
	var curr_min = d.getMinutes();

	$("header .time").html(formatTime([curr_hour, curr_min]));
	$("header .weekday").html(d_names[curr_day]);
	$("header .date").html(m_names[curr_month] + " " + curr_date);

	var currentIndex;

	if (loading) {
		// Some loading code
	} else {
		for (var i = 0; i < schedule.length; i++) {
			if (happeningNow(schedule[i], [curr_hour, curr_min])) {
				currentIndex = i;
				break;
			}
		}

		// TODO: handle situation where there's no class (before/after school)
		// TODO: handle days with no school (weekends, holidays)

		if (currentIndex != oldIndex) {
			oldIndex = currentIndex;

			var items = [];

			for (var n = currentIndex - 1; n <= currentIndex + 3; n++) {
				if (n < 0) {
					continue; // If we're on the first block, don't insert block before
				} else if (n >= schedule.length) { // Likewise if we're beyond the schedule's bounds
					break;
				}

				var block = schedule[n];
				var additionalClass = '';

				if (n == currentIndex) {
					additionalClass = ' current-class';
				} else if (n == currentIndex - 1) {
					additionalClass = ' last-class';
				}

				items.push('<li class="group' + additionalClass + '"><time class="start-time">' + formatTime(block.time) + '</time><span class="block">' + block.name + '</span></li>');
			}

			$("#schedule ol").html(items.join(""));
			layoutText();
		}
	}
}

function happeningNow(block, time) {
	var classTime = block.time;
	var classLength = block.length;

	for (var i = 0; i < classLength; i++) {
		var tempTime = classTime.slice(0); // Clones the array

		// TODO: optimize this calculation
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
	var curr_hour = time[0] % 12;
	var curr_min = time[1] + "";

	if (curr_hour == 0) {
		curr_hour = 12;
	}
	
	if (curr_min.length == 1) {
		curr_min = "0" + curr_min;
	}

	return curr_hour + ":" + curr_min;
}

function layoutText() {
	$("header").fitText(3.0);
	$("footer #current-temp").fitText(0.12);
	$("footer #temps").fitText(0.2);

	$("#schedule li").fitText(4.0);
	$("#schedule li .block").fitText(2.0);
	$("#schedule li.last-class .block").fitText(2.9);
	$("#schedule li.current-class .block").fitText(0.9);
}

window.setInterval(function() {
	updatePage();
}, 1000); // Every second

window.setInterval(function() {
	updateWeather();
}, 60000); // Every minute

$(document).ready(function(){
	loading = true;

	buildSchedule();
	updatePage();
	updateWeather();

	layoutText();
});