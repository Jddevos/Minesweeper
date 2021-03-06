/* eslint-disable no-unused-vars */
var timerDisplay;
var startTime;
var updatedTime;
var difference;
var tInterval;
var savedTime;
var paused = 0;
var running = 0;

function startTimer() {
	if (!running && paused) {
		startTime = new Date().getTime();
		tInterval = setInterval(getShowTime, 1);
		// change 1 to 1000 above to run script every second instead of every millisecond. one other change will be needed in the getShowTime() function below for this to work. see comment there.

		paused = 0;
		running = 1;
	}
}
function pauseTimer() {
	clearInterval(tInterval);
	savedTime = difference;
	paused = 1;
	running = 0;
}
function resetTimer() {
	timerDisplay = document.getElementById("timerDiv");
	clearInterval(tInterval);
	savedTime = 0;
	difference = 0;
	paused = 0;
	running = 0;
	timerDisplay.innerHTML = "00:00:00";
}
function getShowTime() {
	timerDisplay = document.getElementById("timerDiv");

	updatedTime = new Date().getTime();
	if (savedTime) {
		difference = updatedTime - startTime + savedTime;
	} else {
		difference = updatedTime - startTime;
	}

	// var days = Math.floor(difference / (1000 * 60 * 60 * 24));
	var hours = Math.floor(
		(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((difference % (1000 * 60)) / 1000);
	var milliseconds = Math.floor((difference % 1000) / 10); //Use for 2 digits
	// var milliseconds = Math.floor((difference % (1000))); //Use for 3 digits

	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	milliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds; //Use this line to display 2 digits
	// milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds; //Use this line to display 3 digits

	timerDisplay.innerHTML = minutes + ":" + seconds + ":" + milliseconds;
}
