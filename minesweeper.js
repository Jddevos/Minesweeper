/* Global variables */
var board   = new Array();	//This will hold the game board in its entirety
var toCheck = new Array();	//Will hold the list of cells to check when expanding empty space
var totalRows = 0;			//Total number of rows
var totalCols = 0;			//Total number of columns
var totalMins = 0;			//Total number of mines
var boardSize = "sm";		//The size of the board
var generatedBoard = false;	//Has the board been generated yet?
var btnValue = '\u{1f610}';	//Will hold the value of the reset button

/* Display Characters */
//https://unicode.org/emoji/charts-12.0/full-emoji-list.html
const mineChar = "\u{1f4a3}";	//Character to display to indicate a mine
const flagChar = "\u{1f6a9}";	//Character to display to indicate a flag
const quesChar = "\u{02753}";	//Character to display to indicate a question
const wronChar = "\u{1f4a2}";	//Character to display when a flag is incorrect after losing
const explChar = "\u{1f4a5}";	//Character to display when a mine is clicked

/* Board sizes */
var sm = {rows:  8, cols:  8, mines:  10, lb:  0, winFace: '\u{1f642}'};	//8x8_10, Slightly Smiling Face
var md = {rows: 16, cols: 16, mines:  40, lb:  1, winFace: '\u{1f60a}'};	//16x16_40, Smiling Face With Smiling Eyes
var lg = {rows: 16, cols: 30, mines:  99, lb:  2, winFace: '\u{1f929}'};	//16x30_99, Star-Struck
var xl = {rows: 24, cols: 30, mines: 225, lb:  3, winFace: '\u{1f913}'};	//24x30_225, Nerd Face
var cu = {rows:  8, cols:  8, mines:  10, lb: -1, winFace: '\u{1f636}'};	//Face Without Mouth

var boardMap = new Map();
boardMap.set("sm", sm);
boardMap.set("md", md);
boardMap.set("lg", lg);
boardMap.set("xl", xl);
boardMap.set("cu", cu);

/* Storage */
var smBoard = [];		//small leaderboard
var mdBoard = [];		//medium leaderboard
var lgBoard = [];		//large leaderboard
var xlBoard = [];		//extra large leaderboard

var leaderboards = [smBoard,mdBoard,lgBoard,xlBoard];
var curBoard = [];	//The leaderboard for the currently selected size
const leaderboardEntries = 5;		//How many high scores to keep on each leaderboard

document.oncontextmenu = function () {
	return false;	//This disables the right click context menu
}
/*=============================================================================================================*/
/* Before the game starts */
function pageLoad() {
	start();	//Load up the game

	var userName;	//declare userName
	var nameField = document.getElementById('userName');	//Grab the div
	if (!localStorage.getItem('userName')) {	//if the userName doesn't already exist
		userName = prompt("Leaderboard Name", "AAA");	//prompt for the name to use on the leaderboards
		localStorage.setItem('userName', userName);
	}
	nameField.value = localStorage.getItem('userName');	//put the username into the name field


	//leaderboards
	var leaderDiv = document.getElementById('leaders');	//Grab the div

	if (localStorage.getItem('boards')) {	//check if the boards local storage already exists
		// console.log('Loading leaderboards from localStorage');
		leaderboards = JSON.parse(localStorage.getItem('boards'));	//if it does, load it into the leaderboards var
	}
	else {	//if it does not already exist, we need to create it for the first time
		// console.log('Creating leaderboards');
		leaderboards.forEach(generateLbData);	//call function to pre-populate leaderboard data
		localStorage.setItem('boards', JSON.stringify(leaderboards));
	}
	generateLbDisplay();	//display the leaderboard table
}
function start() {
	clearAlerts();	//Clear any alerts
	boardSize = document.querySelector('input[name="size"]:checked').value;	//pull the value out of the selected radio button

	if (boardSize == 'cu') {	//custom size board
		//We need to make the input areas editable
		document.getElementById("rows").disabled = false;
		document.getElementById("cols").disabled = false;
		document.getElementById("mines").disabled = false;

		//Set the totalRows, totalCols, and totalMins variables
		totalRows = parseInt(document.getElementById("rows").value, 10);
		totalCols = parseInt(document.getElementById("cols").value, 10);
		totalMins = parseInt(document.getElementById("mines").value, 10);
	}
	else {	//standard size board
		//We need to make the input areas readOnly
		document.getElementById("rows").disabled = true;
		document.getElementById("cols").disabled = true;
		document.getElementById("mines").disabled = true;

		//Set the totalRows, totalCols, and totalMins variables
		totalRows = boardMap.get(boardSize.toString()).rows;
		totalCols = boardMap.get(boardSize.toString()).cols;
		totalMins = boardMap.get(boardSize.toString()).mines;

		//Set the input boxes so that they match whatever the current selection is
		document.getElementById("rows").value = totalRows;
		document.getElementById("cols").value = totalCols;
		document.getElementById("mines").value = totalMins;
	}
	
	generatedBoard = false;	//Set this to false so that the board will be regenerated

	if (document.getElementById("settings").checkValidity()) {	//If everything is valid, proceed
		flagsLeft = totalMins;	//set the number of flags left
		generateDisplay();	//redraw the board
		// generateLbDisplay();	//redraw the leaderboard
		resetTimer();	//reset timer to 0
	}
	else {	//If things are not valid, display an error
		document.getElementById("alertPanel").innerHTML = "The supplied parameters were not valid.";
		setBtn('\u{1f635}');	//Dizzy Face
	}
}
function generateDisplay() {
	let boardDiv = document.getElementById('board');
	boardDiv.innerHTML = "";

	//Generate info panel
	let infoDiv = document.createElement('div');
	infoDiv.id = "infoContainer";
	
	let timerDiv = document.createElement('div');
	timerDiv.id = "timerDiv";
	timerDiv.className = "timerDiv";
	timerDiv.innerHTML = "00:00:00";
	infoDiv.appendChild(timerDiv);

	let resetDiv = document.createElement('div');
	resetDiv.id = "resetDiv"
	resetDiv.className = "resetDiv";
	resetDiv.innerHTML = "<input type='Button' id='resetBtn' value='\u{1f610}' onclick='rstBtn(this, event)' onmousedown='rstBtn(this, event)' onmouseleave='rstBtn(this, event)' onmouseover='rstBtn(this, event)'/>";
	infoDiv.appendChild(resetDiv);

	let flagsDiv = document.createElement('div');
	flagsDiv.id = "flagsDiv";
	flagsDiv.className = "flagsDiv";
	flagsDiv.innerHTML = totalMins;
	infoDiv.appendChild(flagsDiv);

	boardDiv.appendChild(infoDiv);	//Append to boardDiv

	//Generate cells
	let rowContent = '';	//String to build the individual rows
	for (let i = 0; i < totalRows; i++) {
		let rowDiv = document.createElement('div');
		rowDiv.className = "gameBoardRow";
		rowContent = '';

		for (let j = 0; j < totalCols; j++) {
			//Create div for the individual cell
			rowContent += "<div class='gameBoardBtn' id='cell_"+i+"_"+j+"' row='"+i+"' col='"+j+"' onclick='play(this, event)' oncontextmenu='play(this, event)'></div>";
		}

		rowDiv.innerHTML = rowContent;	//set the innerHTML all at once
		boardDiv.appendChild(rowDiv);
	}
}
function generateBoard(initClick) {
	//Parameters are the initial click. We need to avoid generating mines there
	// console.log("initClick: " +initClick);

	board = new Array();	//Clear the board

	for (var i = 0; i < totalRows; i++) {
		var row = new Array();

		for (var j = 0; j < totalCols; j++) {
			var cell = { value: 0, mine: false, checked: false };
			row.push(cell);
		}
		board.push(row);
	}

	let r = 0;
	let c = 0;

	for (var i = 0; i < totalMins; i++) {
		do {	//get random row and column
			r = Math.floor(Math.random() * totalRows)
			c = Math.floor(Math.random() * totalCols)
			// console.log("Checking " +r+ ", " +c);
		} while (board[r][c].mine == true || r*totalRows+c == initClick)	//This ensures that the initial click isnt a mine and that mines arent repeated

		placeMineAt(r, c);	//place mine
	}

	generatedBoard = true;	//Mark the board as generated
	// console.log(board);
}
function generateLbData(element, index, array) {
	let cur = new Array();
	for (var i=0; i<leaderboardEntries; i++) {	//generate leaderboardEntries number of entries
		cur.push({name: 'AAA', time: '99:99:99', savedTime: 9999999});	//Create an entry with a name and times
	}
	array[index] = cur;	//add the list into the leaderboard list
}
function generateLbDisplay() {
	let leadersDiv = document.getElementById('leaders');
	let boardNumber = boardMap.get(boardSize).lb;

	if (boardNumber < 0) {	//Will be -1 if we are using a custom board size
		return;	//Don't do the rest, it will break
	}

	leadersDiv.innerHTML = '';	//Clear leaderboard
	curBoard = leaderboards[boardNumber];

	let lbTable = document.createElement('table');
	let lbTbody = document.createElement('tbody');

	//Create header column
	for (let i=0; i<leaderboardEntries; i++) {
		let lbRow = document.createElement('tr');	//Create row

		let lbDataName = document.createElement('td');	//Create cell
		let ldDataNameVal = document.createTextNode(curBoard[i].name);
		lbDataName.appendChild(ldDataNameVal);
		lbRow.appendChild(lbDataName);	//Append data to the row

		let lbDataTime = document.createElement('td');	//Create cell
		let ldDataTimeVal = document.createTextNode(curBoard[i].time);
		lbDataTime.appendChild(ldDataTimeVal);
		lbRow.appendChild(lbDataTime);	//Append data to the row

		lbTbody.appendChild(lbRow);	//Append the row to the table body
	}
	lbTable.appendChild(lbTbody);	//Append the table body to the table
	leadersDiv.appendChild(lbTable)	//Append the table to the page
}
function placeMineAt(r, c) {
	// console.log("Placing mine at " +r+ ", " +c)
	board[r][c].mine = true;
	board[r][c].value = mineChar;

	//increment the cells around the mine
	if (!isUndefined(board, r + 1, c) && board[r + 1][c].value != mineChar) { board[r + 1][c].value++; }
	if (!isUndefined(board, r - 1, c) && board[r - 1][c].value != mineChar) { board[r - 1][c].value++; }
	if (!isUndefined(board, r, c + 1) && board[r][c + 1].value != mineChar) { board[r][c + 1].value++; }
	if (!isUndefined(board, r, c - 1) && board[r][c - 1].value != mineChar) { board[r][c - 1].value++; }
	if (!isUndefined(board, r + 1, c + 1) && board[r + 1][c + 1].value != mineChar) { board[r + 1][c + 1].value++; }
	if (!isUndefined(board, r + 1, c - 1) && board[r + 1][c - 1].value != mineChar) { board[r + 1][c - 1].value++; }
	if (!isUndefined(board, r - 1, c + 1) && board[r - 1][c + 1].value != mineChar) { board[r - 1][c + 1].value++; }
	if (!isUndefined(board, r - 1, c - 1) && board[r - 1][c - 1].value != mineChar) { board[r - 1][c - 1].value++; }

	updateFlagCount();
}
function removeMineAt(r, c) {
	// console.log(Removing mine at " +r+ ", " +c)
	board[r][c].mine = false;
	board[r][c].value = "0";

	//decrement the cells around the mine
	if (!isUndefined(board, r + 1, c) && board[r + 1][c].value != mineChar) { board[r + 1][c].value--; }
	if (!isUndefined(board, r - 1, c) && board[r - 1][c].value != mineChar) { board[r - 1][c].value--; }
	if (!isUndefined(board, r, c + 1) && board[r][c + 1].value != mineChar) { board[r][c + 1].value--; }
	if (!isUndefined(board, r, c - 1) && board[r][c - 1].value != mineChar) { board[r][c - 1].value--; }
	if (!isUndefined(board, r + 1, c + 1) && board[r + 1][c + 1].value != mineChar) { board[r + 1][c + 1].value--; }
	if (!isUndefined(board, r + 1, c - 1) && board[r + 1][c - 1].value != mineChar) { board[r + 1][c - 1].value--; }
	if (!isUndefined(board, r - 1, c + 1) && board[r - 1][c + 1].value != mineChar) { board[r - 1][c + 1].value--; }
	if (!isUndefined(board, r - 1, c - 1) && board[r - 1][c - 1].value != mineChar) { board[r - 1][c - 1].value--; }

	updateFlagCount();
}
/*=============================================================================================================*/
/* Game play */
function play(ele, event) {
	var clickedRow = Math.round(ele.getAttribute('row'));
	var clickedCol = Math.round(ele.getAttribute('col'));
	var clickedCell = document.getElementById('cell_' + clickedRow + '_' + clickedCol);

	// console.log("row: "+clickedRow+", col: "+clickedCol);

	if (!generatedBoard) {	//We need to generate the board if it doesnt already exist
		var initCell = Math.round(clickedRow*totalRows+clickedCol);
		// console.log("Num: "+initCell);
		generateBoard(initCell);
	}

	startTimer(); //Start the timer, if it isnt already

	if (event.type == 'click') {	//Left click
		// console.log('Left click at '+clickedRow+", "+clickedCol);
		leftClick(clickedRow, clickedCol, clickedCell);
	}
	if (event.type == 'contextmenu') {	//Right click
		// console.log('Right click at '+clickedRow+", "+clickedCol);
		rightClick(clickedCell);
	}
	updateFlagCount();
	checkWin();	//Check for win
}
function leftClick(clickedRow, clickedCol, clickedCell) {
	setBtn('\u{1f610}');	//Neutral Face

	//Check for a value already being here
	if (clickedCell.innerHTML == "") {	//If there is not anything already there, we can take action
		if (board[clickedRow][clickedCol].mine) {	//Check for Lose
			board[clickedRow][clickedCol].value = explChar;	//set value of clicked cell to the explChar
			clickedCell.classList.add('textM');	//add the appropriate class
			loseEndGame();
			return;
		}
		else if (board[clickedRow][clickedCol].value == 0) {	//Check if blank
			toCheck.push({ row: clickedRow, col: clickedCol });
			board[clickedRow][clickedCol].checked = true;	//Set the cell to checked
			expandEmptySpace();	//Expand until we hit the edge or numbers
		}
		else if (board[clickedRow][clickedCol].value > 0) {	//Check if number
			clickedCell.classList.add('pressed');
			clickedCell.classList.add('text'+board[clickedRow][clickedCol].value);
			clickedCell.innerHTML = board[clickedRow][clickedCol].value;
			board[clickedRow][clickedCol].checked = true;
		}
	}
}
function rightClick(clickedCell) {
	//Switch through empty, F, and ?
	if (!clickedCell.classList.contains('pressed')) {
		if (clickedCell.innerHTML == "") {	//Cell is empty
			clickedCell.innerHTML = flagChar;	//set cell to display the flag character
			clickedCell.classList.add('textF');	//add the appropriate class
			clickedCell.classList.remove('textQ');	//remove irrelevant classes
			setBtn('\u{1f630}');	//display the Anxious Face with Sweat emoji on the reset button
		}
		else if (clickedCell.innerHTML == flagChar) {	//Cell is a flag
			clickedCell.innerHTML = quesChar;	//set cell to display the question character
			clickedCell.classList.add('textQ');	//add the appropriate class
			clickedCell.classList.remove('textF');	//remove irrelevant classes
			setBtn('\u{1f914}');	//display the Thinking Face emoji on the reset button
		}
		else if (clickedCell.innerHTML == quesChar) {	//Cell is a question
			clickedCell.innerHTML = "";	//set cell back to empty
			clickedCell.classList.add();	//add the appropriate class
			clickedCell.classList.remove('textF', 'textQ');	//remove irrelevant classes
			setBtn('\u{1f610}');	//display the Neutral Face emoji on the reset button
		}
	}
}
function expandEmptySpace() {
	while (toCheck.length > 0) {
		let r = toCheck[0].row;
		let c = toCheck[0].col;

		toCheck.shift();	//Dequeue the first element
		// board[r][c].checked = true;	//Set the cell to checked
		document.getElementById('cell_' + r + '_' + c).classList.add('pressed');	//press the button by adding the class

		if (board[r][c].value > 0) {	//Display the value
			document.getElementById('cell_' + r + '_' + c).innerHTML = board[r][c].value;
			document.getElementById('cell_' + r + '_' + c).classList.add('text'+board[r][c].value);
		}
		else if (board[r][c].value == 0) {	//Continue expanding
			document.getElementById('cell_' + r + '_' + c).innerHTML = "";	//Reset the value, just in case a flag exists

			//We want to check all of the neighbors as well
			if (!isUndefined(board, r  , c+1) && !board[r  ][c+1].checked) { toCheck.push({ row: r  , col: c+1 }); board[r  ][c+1].checked = true; }	//N
			if (!isUndefined(board, r+1, c+1) && !board[r+1][c+1].checked) { toCheck.push({ row: r+1, col: c+1 }); board[r+1][c+1].checked = true; }	//NE
			if (!isUndefined(board, r+1, c  ) && !board[r+1][c  ].checked) { toCheck.push({ row: r+1, col: c   }); board[r+1][c  ].checked = true; }	//E
			if (!isUndefined(board, r+1, c-1) && !board[r+1][c-1].checked) { toCheck.push({ row: r+1, col: c-1 }); board[r+1][c-1].checked = true; }	//SE
			if (!isUndefined(board, r-1, c  ) && !board[r-1][c  ].checked) { toCheck.push({ row: r-1, col: c   }); board[r-1][c  ].checked = true; }	//S
			if (!isUndefined(board, r-1, c-1) && !board[r-1][c-1].checked) { toCheck.push({ row: r-1, col: c-1 }); board[r-1][c-1].checked = true; }	//SW
			if (!isUndefined(board, r  , c-1) && !board[r  ][c-1].checked) { toCheck.push({ row: r  , col: c-1 }); board[r  ][c-1].checked = true; }	//W
			if (!isUndefined(board, r-1, c+1) && !board[r-1][c+1].checked) { toCheck.push({ row: r-1, col: c+1 }); board[r-1][c+1].checked = true; }	//NW
		}
		// console.log('Elements left to check: ' +toCheck.length);
	}
}
function updateFlagCount() {
	let foundFlags = 0;

	for (let i = 0; i < totalRows; i++) {
		for (let j = 0; j < totalCols; j++) {
			let c = document.getElementById('cell_' + i + '_' + j);
			if (c.innerHTML == flagChar || (c.innerHTML == mineChar && !c.classList.contains('exploded')))
				foundFlags++;
		}
	}

	let flagsLeft = totalMins - foundFlags;

	document.getElementById('flagsDiv').innerHTML = flagsLeft;
}
/*=============================================================================================================*/
/* End conditions */
function checkWin() {
	var unpressedCells = 0;

	for (var i=0; i<totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var cur = document.getElementById('cell_'+i+'_'+j);
			if (!cur.classList.contains('pressed') && !cur.classList.contains('exploded')) {	//We dont want to count pressed or exploded cells
				unpressedCells++;
			}
		}
	}
	// console.log(unpressedCells+ ' unpressed cells remaining');

	if (unpressedCells == totalMins && document.querySelector('.exploded') == null) {
		pauseTimer();

		displayMines();
		updateFlagCount();
		disableBoard();

		document.getElementById("alertPanel").innerHTML = 'You won!';	//Set alertPanel
		setBtn(boardMap.get(boardSize.toString()).winFace);	//Set btn to appropriate face

		checkSaveTime();	//Attempt to add to leaderboard
	}
}
function checkSaveTime() {
	let place = 0;	//The place that the new time will take
	
	for (let i=curBoard.length; i>0; i--) {
		if (savedTime <= curBoard[i-1].savedTime) {	//Check if new time was faster than the leaderboard time
			place = i;	//Set the place
		}
		else { //Not good enough for the leaderboards
			return;	//We can leave
		}
	}

	if (place <= curBoard.length) {	//We need to add it to the leaderboard
		curBoard.splice(place-1, 0, {name: document.getElementById('userName').value, time: document.getElementById('timerDiv').innerHTML, savedTime: savedTime});	//Add entry in the correct slot
		let loser = curBoard.pop();	//Remove the last place from the leaderboard
		leaderboards.splice(boardMap.get(boardSize).lb, 1, curBoard);	//update leaderboards array
		localStorage.setItem('boards', JSON.stringify(leaderboards));	//save leaderboards array to local storage
		generateLbDisplay();	//Update leaderboard on screen
	}
}
function loseEndGame() {
	var alertPanel = document.getElementById("alertPanel");

	pauseTimer();
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var curCell = document.getElementById('cell_' + i + '_' + j);

			//Explode the unmarked mines
			if (board[i][j].mine && curCell.innerHTML != flagChar) {
				// console.log("Setting cell_"+i+"_"+j+" to "+board[i][j].value);
				curCell.innerHTML = board[i][j].value;
				curCell.classList.add('exploded');
			}

			//X out the incorrect flags
			else if (!board[i][j].mine && curCell.innerHTML == flagChar) {
				// console.log("Setting cell_"+i+"_"+j+" to x");
				curCell.innerHTML = wronChar;
			}
		}
	}
	disableBoard();

	setBtn('\u{1f92f}');	//Exploding Head
	alertPanel.innerHTML = 'You lost.';
}
/*=============================================================================================================*/
/* Utility functions */
function rstBtn(ele, event) {
	//Handle events on the reset button
	type = event.type;	//the type of event it was

	if (type == "click") {
		btnValue = '\u{1f610}';	//reset back to neutral face
		start();	//proceed to start function
	}
	else if (type == "mousedown") {
		btnValue = ele.getAttribute('value');	//save the current value of the reset button
		ele.value='\u{1f92a}';	//GRINNING FACE WITH ONE LARGE AND ONE SMALL EYE
	}
	else if (type == "mouseleave") {
		ele.value = btnValue;	//reset btn value to what was previously saved
	}
}
function clearAlerts() {
	document.getElementById("alertPanel").innerHTML = "";
}
function disableBoard() {
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var curCell = document.getElementById('cell_' + i + '_' + j);
			
			curCell.classList.add('disabled');	//Disable the cell by adding the disabled class
		}
	}
	board = new Array();	//clear the board variable
}
function displayMines() {
	for (let i = 0; i < totalRows; i++) {
		for (let j = 0; j < totalCols; j++) {
			let cur = document.getElementById('cell_' + i + '_' + j);
			if (!cur.classList.contains('pressed') && cur.innerHTML == "" && board[i][j].mine) {
				cur.innerHTML = board[i][j].value;	//display the value of the board at the current location
				cur.classList.add('textF');
			}
		}
	}
}
function isUndefined(_arr, _index1, _index2) {
	//This function identifies whether the passed cell is valid
	try {
		return _arr[_index1][_index2] == undefined;
	} catch (e) {
		return true;
	}
}
function setBtn(emojiCode) {
	document.getElementById("resetBtn").value = emojiCode;
	btnValue = emojiCode;
}