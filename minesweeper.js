/* Global variables */
var board = new Array();	//This will hold the game board in its entirety
var toCheck = new Array();	//Will hold the list of cells to check when expanding empty space
var totalRows = 0;	//Total number of rows
var totalCols = 0;	//Total number of columns
var totalMines = 0;	//Total number of mines
var generatedBoard = false;	//Has the board been generated yet?
var mineChar = "O";	//Character to display to indicate a mine
var flagChar = "F";	//Character to display to indicate a flag
var quesChar = "?";	//Character to display to indicate a question
var boardSize = "sm";	//The size of the board

/* Board sizes */
var sm = {rows: 8, cols: 8, mines: 10};
var md = {rows: 16, cols: 16, mines: 40};
var lg = {rows: 16, cols: 30, mines: 99};

document.oncontextmenu = function () {
	//This disables the right click context menu
	return false;
}

function checkWin() {
	var unpressedCells = 0;

	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var cur = document.getElementById('btn_' + i + '_' + j);
			if (!cur.classList.contains('pressed') && !cur.classList.contains('exploded')) {
				//We dont want to count pressed or exploded cells
				unpressedCells++;
			}
			else if (cur.value == flagChar) {
				//This is unnecessary, as flagged cells will not be pressed. Including for completionism
				unpressedCells++;
			}
		}
	}
	// console.log(unpressedCells+ ' unpressed cells remaining');

	if (unpressedCells == totalMines && document.querySelector('.exploded') == null) {
		pauseTimer();

		displayMines();
		updateFlagCount();
		disableBoard();

		// window.alert('You won!');
		document.getElementById("alertPanel").innerHTML = 'You won!';

		//Set btn to appropriate face
		if (boardSize == "sm") {setBtn(128578);}
		if (boardSize == "md") {setBtn(128522);}
		if (boardSize == "lg") {setBtn(129321);}
	}
}

function clearAlerts() {
	document.getElementById("alertPanel").innerHTML = "";
}

function disableBoard() {
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var curBtn = document.getElementById('btn_' + i + '_' + j);

			//Disable the button by adding the disabled class
			curBtn.className += " disabled";
		}
	}

	//clear the board variable
	board = new Array();
}

function displayMines() {
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var cur = document.getElementById('btn_' + i + '_' + j);
			if (!cur.classList.contains('pressed') && cur.innerHTML == "" && board[i][j].mine) {
				cur.innerHTML = mineChar;
				cur.classList.add('textB');
			}
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
	document.getElementById('btn_' + r + '_' + c).className += " pressed";

	//Display the value
	if (parseInt(board[r][c].value) > 0) {
		document.getElementById('btn_' + r + '_' + c).innerHTML = board[r][c].value;
		document.getElementById('btn_' + r + '_' + c).className += " text" + board[r][c].value;
	}

	if (board[r][c].value == 0) {
		//Reset the value, just in case a flag exists
		document.getElementById('btn_' + r + '_' + c).innerHTML = "";

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

function generateBoard(initClick) {
	//Parameters are the initial click. We need to avoid generating mines there
	// console.log("initClick: " +initClick);

	//Clear the board
	board = new Array();

	for (var i = 0; i < totalRows; i++) {
		var row = new Array();

		for (var j = 0; j < totalCols; j++) {
			var cell = { value: "0", mine: false, checked: false };
			row.push(cell);
		}
		board.push(row);
	}

	for (var i = 0; i < totalMines; i++) {
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

	//Mark the board as generated
	generatedBoard = true;

	// console.log(board);
}

function generateDisplay() {
	boardDiv = document.getElementById("board");
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
	//Initial innerHTML contents are set below, in the call to setBtn
	infoDiv.appendChild(resetDiv);

	flagsDiv = document.createElement('div');
	flagsDiv.id = "flagsDiv";
	flagsDiv.className = "flagsDiv";
	flagsDiv.innerHTML = totalMines;
	infoDiv.appendChild(flagsDiv);

	boardDiv.appendChild(infoDiv);	//Append to boardDiv
	
	setBtn(128528);	//Set resetDiv to contain the neutral face

	//Generate cells
	for (var i = 0; i < totalRows; i++) {
		var rowDiv = document.createElement('div');
		rowDiv.className = "gameBoardRow";

		for (var j = 0; j < totalCols; j++) {
			//Create div for the individual cell
			rowDiv.innerHTML += "<div class='gameBoardBtn' id='btn_" + i + "_" + j + "' row='" + i + "' col='" + j + "' onclick='play(this, event)' oncontextmenu='play(this, event)'></div>";
		}
		boardDiv.appendChild(rowDiv);
	}
}

function isUndefined(_arr, _index1, _index2) {
	try {
		return _arr[_index1][_index2] == undefined;
	} catch (e) {
		return true;
	}
}

function isValid() {
	//Check validity of input
	var valid = true;
	var alertPanel = document.getElementById("alertPanel");

	// //Clear alert panel
	// alertPanel.innerHTML = '';

	// if (totalRows < document.getElementById('rows').min || totalRows > document.getElementById('rows').max) {
	// 	valid = false;
	// }
	// else if (totalCols < document.getElementById('cols').min || totalCols > document.getElementById('cols').max) {
	// 	valid = false;
	// }
	// //
	// else if (totalMines < document.getElementById('mines').min || totalMines > totalRows*totalCols-1) {
	// 	valid = false;
	// }

	return valid;
}

function loseEndGame() {
	var alertPanel = document.getElementById("alertPanel");

	pauseTimer();
	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var curBtn = document.getElementById('btn_' + i + '_' + j);

			//Explode the unmarked mines
			if (board[i][j].mine && curBtn.innerHTML != flagChar) {
				// console.log("Setting btn_"+i+"_"+j+" to "+board[i][j].value);
				curBtn.innerHTML = board[i][j].value;
				curBtn.className += " exploded";
			}

			//X out the incorrect flags
			else if (!board[i][j].mine && curBtn.innerHTML == flagChar) {
				// console.log("Setting btn_"+i+"_"+j+" to x");
				curBtn.innerHTML = "x";
			}
		}
	}
	disableBoard();

	setBtn(129327);	//Exploded head
	alertPanel.innerHTML = 'You lost.';
}

function setBtn(emojiCode) {
	document.getElementById("resetDiv").innerHTML = "<input type='Button' id='resetBtn' value='&#"+emojiCode+"' onclick='start()'>";
}

function setSize() {
	boardSize = document.querySelector('input[name="size"]:checked').value;

	switch(boardSize) {
		case "sm":
			totalRows = sm.rows;
			totalCols = sm.cols;
			totalMines =  sm.mines;
			break;
		case "md":
			totalRows = md.rows;
			totalCols = md.cols;
			totalMines =  md.mines;
			break;
		case "lg":
			totalRows = lg.rows;
			totalCols = lg.cols;
			totalMines =  lg.mines;
			break;
		default:
			document.getElementById("alertPanel").innerHTML = "An error has occurred in board size selection. Defaulting to small board.";
			totalRows = sm.rows;
			totalCols = sm.cols;
			totalMines =  sm.mines;
	}
}

function play(ele, event) {
	var clickedRow = Math.round(ele.getAttribute('row'));
	var clickedCol = Math.round(ele.getAttribute('col'));
	var clickedBtn = document.getElementById('btn_' + clickedRow + '_' + clickedCol);

	// console.log("row: "+clickedRow+", col: "+clickedCol);

	//We need to generate the board if it doesnt already exist
	if (!generatedBoard) {
		var initCell = Math.round(clickedRow*totalRows+clickedCol);
		// console.log("Num: "+initCell);
		generateBoard(initCell);
	}

	startTimer(); //Start the timer, if it isnt already

	if (event.type == 'click') {
		//Left click
		// console.log('Left click at '+clickedRow+", "+clickedCol);

		setBtn(128528);	//Reset face to neutral

		//Check for a value already being here
		if (clickedBtn.innerHTML == "") {
			//If there is not anything already there, we can take action

			//Check for Lose
			if (board[clickedRow][clickedCol].mine) {
				clickedBtn.className += " textM";
				loseEndGame();
				return;
			}

			//Check if blank
			if (board[clickedRow][clickedCol].value == 0) {
				toCheck.push({ row: clickedRow, col: clickedCol });
				//We want to set this button to pressed, and expand until we hit the edge or numbers
				while (toCheck.length > 0) {
					expandEmptySpace();
				}
			}

			//Check if number
			if (board[clickedRow][clickedCol].value > 0) {
				clickedBtn.className += " pressed text" + board[clickedRow][clickedCol].value;
				clickedBtn.innerHTML = board[clickedRow][clickedCol].value;
				board[clickedRow][clickedCol].checked = true;
			}
		}
	}
	if (event.type == 'contextmenu') {
		//Right click
		// console.log('Right click at '+clickedRow+", "+clickedCol);

		//Switch through empty, F, and ?
		if (!clickedBtn.classList.contains('pressed')) {
			if (clickedBtn.innerHTML == "") {
				clickedBtn.innerHTML = flagChar;
				clickedBtn.className = "gameBoardBtn textF"
				setBtn(128681);	//Flag emoji
			}
			else if (clickedBtn.innerHTML == flagChar) {
				clickedBtn.innerHTML = quesChar;
				clickedBtn.className = "gameBoardBtn textQ"
				setBtn(129300);	//Thinking face
			}
			else if (clickedBtn.innerHTML == quesChar) {
				clickedBtn.innerHTML = "";
				clickedBtn.className = "gameBoardBtn"
				setBtn(128528);	//Reset to neutral
			}
		}
	}

	updateFlagCount();

	//Check for win
	checkWin();
}

function start() {
	//Clear any alerts
	clearAlerts();

	//Set the total variables
	setSize();
	
	generatedBoard = false;	//Set this to false so that the board will be regenerated

	if (isValid()) {
		flagsLeft = totalMines;
		generateDisplay();
		resetTimer();
	}
}

function updateFlagCount() {
	var foundFlags = 0;

	for (var i = 0; i < totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var c = document.getElementById('btn_' + i + '_' + j);
			if (c.innerHTML == flagChar || (c.innerHTML == mineChar && !c.classList.contains('exploded')))
				foundFlags++;
		}
	}

	var flagsLeft = totalMines - foundFlags;

	document.getElementById('flagsDiv').innerHTML = flagsLeft;
}