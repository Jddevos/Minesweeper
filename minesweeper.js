/* Global variables */
var board = new Array();	//This will hold the game board in its entirety
var toCheck = new Array();	//Will hold the list of cells to check when expanding empty space
var totalRows = 0;			//Total number of rows
var totalCols = 0;			//Total number of columns
var totalMins = 0;			//Total number of mines
var boardSize = "sm";		//The size of the board
var generatedBoard = false;	//Has the board been generated yet?
var btnValue = '\u{1f610}';	//Will hold the value of the reset button

/* Display Characters */
//https://unicode.org/emoji/charts-12.0/full-emoji-list.html
var mineChar = "\u{1f4a3}";	//Character to display to indicate a mine
var flagChar = "\u{1f6a9}";	//Character to display to indicate a flag
var quesChar = "\u{02753}";	//Character to display to indicate a question
var wronChar = "\u{1f4a2}";	//Character to display when a flag is incorrect after losing
var explChar = "\u{1f4a5}";	//Character to display when a mine is clicked

/* Board sizes */
var sm = {rows:  8, cols:  8, mines:  10, winFace: '\u{1f642}'};	//8x8_10, Slightly Smiling Face
var md = {rows: 16, cols: 16, mines:  40, winFace: '\u{1f60a}'};	//16x16_40, Smiling Face With Smiling Eyes
var lg = {rows: 16, cols: 30, mines:  99, winFace: '\u{1f929}'};	//16x30_99, Star-Struck
var xl = {rows: 24, cols: 30, mines: 225, winFace: '\u{1f913}'};	//24x30_225, Nerd Face
var cu = {rows:  8, cols:  8, mines:  10, winFace: '\u{1f636}'};	//Face Without Mouth

/* Map of board sizes */
var boardMap = new Map();
boardMap.set("sm", sm);
boardMap.set("md", md);
boardMap.set("lg", lg);
boardMap.set("xl", xl);
boardMap.set("cu", cu);

/* Leaderboard */
let leaderboards = new Array();	//Local array of the leaderboards
localStorage.setItem('boards', JSON.stringify(leaderboards));
// const data = JSON.parse(localStorage.getItem('boards'));

document.oncontextmenu = function () {
	return false;	//This disables the right click context menu
}

/* Before the game starts */
function generateDisplay() {
	boardDiv = document.getElementById('board');
	boardDiv.innerHTML = "";

	//Generate info panel
	infoDiv = document.createElement('div');
	infoDiv.id = "infoContainer";
	
	timerDiv = document.createElement('div');
	timerDiv.id = "timer";
	timerDiv.className = "timer";
	timerDiv.innerHTML = "00:00:00";
	infoDiv.appendChild(timerDiv);

	resetDiv = document.createElement('div');
	resetDiv.id = "resetDiv"
	resetDiv.className = "resetDiv";
	resetDiv.innerHTML = "<input type='Button' id='resetBtn' value='\u{1f610}' onclick='rstBtn(this, event)' onmousedown='rstBtn(this, event)' onmouseleave='rstBtn(this, event)' onmouseover='rstBtn(this, event)'/>";
	infoDiv.appendChild(resetDiv);

	flagsDiv = document.createElement('div');
	flagsDiv.id = "flagsDiv";
	flagsDiv.className = "flagsDiv";
	flagsDiv.innerHTML = totalMins;
	infoDiv.appendChild(flagsDiv);

	boardDiv.appendChild(infoDiv);	//Append to boardDiv

	//Generate cells
	for (var i = 0; i < totalRows; i++) {
		var rowDiv = document.createElement('div');
		rowDiv.className = "gameBoardRow";

		for (var j = 0; j < totalCols; j++) {
			//Create div for the individual cell
			rowDiv.innerHTML += "<div class='gameBoardBtn' id='cell_"+i+"_"+j+"' row='"+i+"' col='"+j+"' onclick='play(this, event)' oncontextmenu='play(this, event)'></div>";
		}
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
			var cell = { value: "0", mine: false, checked: false };
			row.push(cell);
		}
		board.push(row);
	}

	for (var i = 0; i < totalMins; i++) {
		//get random row and column
		do {
			r = Math.floor(Math.random() * totalRows)
			c = Math.floor(Math.random() * totalCols)
			// console.log("Checking " +r+ ", " +c);
		} while (board[r][c].mine == true || r*totalRows+c == initClick)
		//This while calculation ensures that the initial click isnt a mine and that mines arent repeated

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
	}

	generatedBoard = true;	//Mark the board as generated
	// console.log(board);
}
function pageLoad() {
	leaderDiv = document.getElementById('leaders');	//Grab the div

	if (localStorage.getItem('boards')) {	//check if the boards local storage already exists
		leaderboards = JSON.parse(localStorage.getItem('boards'));	//if it does, load it into the leaderboards var
	}
	else {	//if it does not already exist, we need to create it for the first time
		for (var i=0; i<boardMap.length(); i++) {
			//Create default array here
			
		}
	}





	start();	//Load up the game	
}
function start() {
	clearAlerts();	//Clear any alerts

	boardSize = document.querySelector('input[name="size"]:checked').value;	//pull the value out of the selected radio button

	if (boardSize.toString() == 'cu') {	//custom size board
		//We need to make the input areas editable
		document.getElementById("rows").readOnly = false;
		document.getElementById("cols").readOnly = false;
		document.getElementById("mines").readOnly = false;

		//Set the totalRows, totalCols, and totalMins variables
		totalRows = parseInt(document.getElementById("rows").value, 10);
		totalCols = parseInt(document.getElementById("cols").value, 10);
		totalMins = parseInt(document.getElementById("mines").value, 10);
	}
	else {	//standard size board
		//We need to make the input areas readOnly
		document.getElementById("rows").readOnly = true;
		document.getElementById("cols").readOnly = true;
		document.getElementById("mines").readOnly = true;

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
		resetTimer();	//reset timer to 0
	}
	else {	//If things are not valid, display an error
		document.getElementById("alertPanel").innerHTML = "The supplied parameters were not valid.";
		setBtn(128565);	//Dizzy Face
	}
}

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
		if (board[clickedRow][clickedCol].value == 0) {	//Check if blank
			toCheck.push({ row: clickedRow, col: clickedCol });
			//We want to set this button to pressed, and expand until we hit the edge or numbers
			while (toCheck.length > 0) {
				expandEmptySpace();
			}
		}
		if (board[clickedRow][clickedCol].value > 0) {	//Check if number
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
	r = parseInt(toCheck[0].row, 10);
	c = parseInt(toCheck[0].col, 10);

	// console.log('r: ' + r);
	// console.log('c: ' + c);	

	//Dequeue the first element
	toCheck.shift();

	//Set the cell to checked
	board[r][c].checked = true;


	//Add the class
	document.getElementById('cell_' + r + '_' + c).classList.add('pressed');

	//Display the value
	if (parseInt(board[r][c].value) > 0) {
		document.getElementById('cell_' + r + '_' + c).innerHTML = board[r][c].value;
		document.getElementById('cell_' + r + '_' + c).classList.add('text'+board[r][c].value);
	}

	if (board[r][c].value == 0) {
		//Reset the value, just in case a flag exists
		document.getElementById('cell_' + r + '_' + c).innerHTML = "";

		//We want to check all of the neighbors as well
		if (!isUndefined(board, r + 1, c) && !board[r + 1][c].checked) { toCheck.push({ row: r + 1, col: c }); board[r + 1][c].checked = true; }
		if (!isUndefined(board, r - 1, c) && !board[r - 1][c].checked) { toCheck.push({ row: r - 1, col: c }); board[r - 1][c].checked = true; }
		if (!isUndefined(board, r, c + 1) && !board[r][c + 1].checked) { toCheck.push({ row: r, col: c + 1 }); board[r][c + 1].checked = true; }
		if (!isUndefined(board, r, c - 1) && !board[r][c - 1].checked) { toCheck.push({ row: r, col: c - 1 }); board[r][c - 1].checked = true; }
		if (!isUndefined(board, r + 1, c + 1) && !board[r + 1][c + 1].checked) { toCheck.push({ row: r + 1, col: c + 1 }); board[r + 1][c + 1].checked = true; }
		if (!isUndefined(board, r + 1, c - 1) && !board[r + 1][c - 1].checked) { toCheck.push({ row: r + 1, col: c - 1 }); board[r + 1][c - 1].checked = true; }
		if (!isUndefined(board, r - 1, c + 1) && !board[r - 1][c + 1].checked) { toCheck.push({ row: r - 1, col: c + 1 }); board[r - 1][c + 1].checked = true; }
		if (!isUndefined(board, r - 1, c - 1) && !board[r - 1][c - 1].checked) { toCheck.push({ row: r - 1, col: c - 1 }); board[r - 1][c - 1].checked = true; }
	}
	// console.log('Elements left to check: ' +toCheck.length);
	// console.log(toCheck[0].row + ' ' + toCheck[0].col);
}
function updateFlagCount() {
	var foundFlags = 0;

	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var c = document.getElementById('cell_' + i + '_' + j);
			if (c.innerHTML == flagChar || (c.innerHTML == mineChar && !c.classList.contains('exploded')))
				foundFlags++;
		}
	}

	var flagsLeft = totalMins - foundFlags;

	document.getElementById('flagsDiv').innerHTML = flagsLeft;
}

/* End conditions */
function checkWin() {
	var unpressedCells = 0;

	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var cur = document.getElementById('cell_'+i+'_'+j);
			if (!cur.classList.contains('pressed') && !cur.classList.contains('exploded')) {	//We dont want to count pressed or exploded cells
				unpressedCells++;
			}
			else if (cur.value == flagChar) {	//This is unnecessary, as flagged cells will not be pressed. Including for completionism
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

		//Attempt to add to leaderboard
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
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var cur = document.getElementById('cell_' + i + '_' + j);
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