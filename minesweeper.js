var board = new Array();	//This will hold the game board in its entirety
var toCheck = new Array();	//Will hold the list of cells to check when expanding empty space
var totalRows = 0;
var totalCols = 0;
var totalMines = 0;
var generatedBoard = false;
var mineChar = "O";	//Character to display to indicate a mine
var flagChar = "F";	//Character to display to indicate a flag
var quesChar = "?";	//Character to display to indicate a question

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

		window.alert('You won!');
	}
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
	timerSpan = document.createElement('span');
	flagsSpan = document.createElement('span');

	infoDiv.id = "infoContainer";
	timerSpan.className = "timer";
	timerSpan.id = "timer";
	timerSpan.innerHTML = "00:00:000";
	flagsSpan.className = "remainingFlags";
	flagsSpan.id = "remainingFlags";
	flagsSpan.innerHTML = "flags left";

	infoDiv.appendChild(timerSpan);
	infoDiv.appendChild(flagsSpan);

	boardDiv.appendChild(infoDiv);	//Append to boardDiv

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
	var alertPanel = document.getElementById('alertPanel').innerHTML;

	alertPanel = "";

	if (totalRows < 5 || totalRows > 35) {
		valid = false;
	}
	else if (totalCols < 5 || totalCols > 75) {
		valid = false;
	}
	else if (totalMines < 1 || totalMines > totalRows*totalCols-1) {
		valid = false;
	}

	return valid;
}

function loseEndGame() {
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
			}
			else if (clickedBtn.innerHTML == flagChar) {
				clickedBtn.innerHTML = quesChar;
				clickedBtn.className = "gameBoardBtn textQ"
			}
			else if (clickedBtn.innerHTML == quesChar) {
				clickedBtn.innerHTML = "";
				clickedBtn.className = "gameBoardBtn"
			}
		}
	}

	updateFlagCount();

	//Check for win
	checkWin();
}

function start() {
	//pull in generation information
	totalRows = parseInt(document.getElementById("rows").value);
	totalCols = parseInt(document.getElementById("cols").value);
	totalMines = parseInt(document.getElementById("mines").value);

	document.getElementById("mines").max = totalRows*totalCols-1;

	generatedBoard = false;	//Set this to false so that the board will regenerated

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

	document.getElementById('remainingFlags').innerHTML = flagsLeft;
}