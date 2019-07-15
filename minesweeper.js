/* Global variables */
const sym_mine	= '\u{1f4a3}';	//Character to display to indicate a mine
const sym_flag	= '\u{1f6a9}';	//Character to display to indicate a flag
const sym_ques	= '\u{02753}';	//Character to display to indicate a question
const sym_wron	= '\u{1f4a2}';	//Character to display when a flag is incorrect after losing
const sym_expl	= '\u{1f4a5}';	//Character to display when a mine is clicked

const face_default	= '\u{1f610}';	//Face to display by default
const face_flag		= '\u{1f630}';	//Face to display after placing a sym_flag
const face_ques		= '\u{1f616}';	//Face to display after placing a sym_ques
const face_down		= '\u{1f61c}';	//Face to display when the resetBtn is held down
const face_error	= '\u{1f635}';	//Face to display when an error occurs
const face_lost		= '\u{1f92f}';	//Face to display after losing
const face_smWin	= '\u{1f609}';	//Face to display after winning a sm board
const face_mdWin	= '\u{1f60a}';	//Face to display after winning a md board
const face_lgWin	= '\u{1f60d}';	//Face to display after winning a lg board
const face_xlWin	= '\u{1f60e}';	//Face to display after winning a xl board
const face_cuWin	= '\u{1f636}';	//Face to display after winning a cu board

/*========================================DO NOT CHANGE THESE VARIABLES========================================*/
var board   = [];	//This will hold the game board in its entirety
var toCheck = [];	//Will hold the list of cells to check when expanding empty space
var totalRows = 0;	//Total number of rows
var totalCols = 0;	//Total number of columns
var totalMines = 0;	//Total number of mines
var boardSize = 'sm';	//The size of the board
var priorRstBtnVal = face_default;	//Will hold the value of the reset button
var turnsTaken = 0;	//Will hold the total number of turns taken

/* Board sizes */
const boardMap = new Map([
	['sm',{rows:  8, cols:  8, mines:  10}],
	['md',{rows: 16, cols: 16, mines:  40}],
	['lg',{rows: 16, cols: 30, mines:  99}],
	['xl',{rows: 24, cols: 30, mines: 225}],
	['cu',{rows:  8, cols:  8, mines:  10}]
]);

/* Storage */
const leaderboardEntries = 20;		//How many high scores to keep on each leaderboard
var curBoard = [];	//The leaderboard for the currently selected size
/*=============================================================================================================*/
/* Before the game starts */
function pageLoad() {
	closeSettings();	//Close the settings modal if it is open
	setTotals();	//Set the total variables
	start();	//Load up the game
}
function start() {
	setAlerts('');	//Clear any alerts
	turnsTaken = 0;	//Reset turnsTaken
	confirmSettings();
}
function generateGameBoardData() {
	board = [];	//Clear the board

	for (var i=0; i<totalRows; i++) {
		var row = [];
		for (var j=0; j<totalCols; j++) {
			var cell = { value: 0, mine: false, checked: false };
			row.push(cell);
		}
		board.push(row);
	}
	placeMines(totalMines);	//place totalMines mines
	// console.log(board);
}
function generateGameBoardDisplay() {
	let boardDiv = document.getElementById('board');
	boardDiv.innerHTML = '';

	//Generate info panel
	let infoDiv = document.createElement('div');
	infoDiv.id = 'infoContainer';

	let timerDiv = document.createElement('div');	//div for timer
	timerDiv.id = 'timerDiv';
	timerDiv.className = 'timerDiv';
	timerDiv.innerHTML = '00:00:00';
	infoDiv.appendChild(timerDiv);	//append timerDiv to infoDiv

	let resetDiv = document.createElement('div');	//div for reset button
	resetDiv.id = 'resetDiv';
	resetDiv.className = 'resetDiv';

	let resetBtn = document.createElement('input');	//reset button itself
	resetBtn.type = 'Button';
	resetBtn.id = 'resetBtn';
	resetBtn.value = face_default;
	resetBtn.setAttribute('onclick', 'faceBtnHandler(this, event)');
	resetBtn.setAttribute('onmousedown', 'faceBtnHandler(this, event)');
	resetBtn.setAttribute('onmouseleave', 'faceBtnHandler(this, event)');
	resetBtn.setAttribute('onmouseover', 'faceBtnHandler(this, event)');
	resetDiv.appendChild(resetBtn);		//append resetBtn to resetDiv

	infoDiv.appendChild(resetDiv);	//append resetDiv to infoDiv

	let flagsDiv = document.createElement('div');	//div for flags remaining
	flagsDiv.id = 'flagsDiv';
	flagsDiv.className = 'flagsDiv';
	flagsDiv.innerHTML = totalMines;
	infoDiv.appendChild(flagsDiv);	//append flagsDiv to infoDiv

	boardDiv.appendChild(infoDiv);	//append infoDiv to boardDiv

	//Generate play area
	let gameDiv = document.createElement('div');	//div to contain the play area
	gameDiv.id = 'gameDiv';

	let rowContent = '';	//String to build the individual rows
	for (let i=0; i<totalRows; i++) {
		let rowDiv = document.createElement('div');
		rowDiv.className = 'gameBoardRow';
		rowContent = '';

		for (let j=0; j<totalCols; j++) {
			//Create div for the individual cell
			rowContent += '<div class=\'gameBoardBtn\' id=\'cell_'+i+'_'+j+'\' row=\''+i+'\' col=\''+j+'\' onclick=\'play(this, event)\' oncontextmenu=\'play(this, event)\'></div>';
		}

		rowDiv.innerHTML = rowContent;	//set the innerHTML all at once
		gameDiv.appendChild(rowDiv);	//append rowDiv to gameDiv
	}

	boardDiv.appendChild(gameDiv);	//append gameDiv to boardDiv
}
function generateLeaderBoardData() {
	curBoard = localStorage.getItem('lead_'+boardSize) ? JSON.parse(localStorage.getItem('lead_'+boardSize)) : [];
}
function generateLeaderBoardDisplay() {
	// boardSize = document.getElementById('sizeSelector').value;	//pull the value out of the selected radio button
	let leadersDiv = document.getElementById('leaders');
	leadersDiv.innerHTML = '';	//Clear leaderboard

	if (boardSize == 'cu') {	//Check for custom board size
		curBoard = [];	//Clear the current leaderboard
		setAlerts('Custom sized boards don\'t have leaderboards!');
		return;	//Don't do the rest, it will break
	}
	else {	//Standard board size
		if (localStorage.getItem('lead_'+boardSize)){	//Only draw the leaderboard if high scores exist
			let lbTable = document.createElement('table');
			let lbTbody = document.createElement('tbody');

			//Create header column
			let lbHeaderRow = document.createElement('tr');	//Create table header

			let lbHeaderName = document.createElement('th');	//Create cell
			let lbHeaderNameVal = document.createTextNode('Name');
			lbHeaderName.appendChild(lbHeaderNameVal);
			lbHeaderRow.appendChild(lbHeaderName);	//Append header to the row

			let lbHeaderTime = document.createElement('th');	//Create table header
			let lbHeaderTimeVal = document.createTextNode('Time');
			lbHeaderTime.appendChild(lbHeaderTimeVal);
			lbHeaderRow.appendChild(lbHeaderTime);	//Append header to the row

			lbTbody.appendChild(lbHeaderRow);	//Append the row to the table body

			for (let i=0; i<curBoard.length; i++) {
				let lbRow = document.createElement('tr');	//Create row
				if (i<3) {
					lbRow.classList.add('text'+(i+1));
				}

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
			leadersDiv.appendChild(lbTable);	//Append the table to the page
		}
	}
}
function setTotals() {
	boardSize = document.getElementById('sizeSelector').value;	//pull the boardSize out of the size selector
	totalRows = parseInt(document.getElementById('rows').value, 10);	//pull totalRows out of the settings field
	totalCols = parseInt(document.getElementById('cols').value, 10);	//pull totalCols out of the settings field
	totalMines = parseInt(document.getElementById('mines').value, 10);	//pull totalMines out of the settings field
}
function placeMines(minesToPlace) {
	let r = 0;
	let c = 0;
	for (let i=0; i<minesToPlace; i++) {
		do {	//get random row and column
			r = Math.floor(Math.random() * totalRows);
			c = Math.floor(Math.random() * totalCols);
		} while (board[r][c].mine == true);	//make sure that mines arent repeated
		placeMineAt(r, c);	//place mine
	}
}
function placeMineAt(r, c) {
	// console.log('Placing mine at '+r+', '+c);
	board[r][c].mine = true;

	//increment the cells around the mine
	if (!isUndefined(board, r+1, c  )) { board[r+1][c  ].value++; }
	if (!isUndefined(board, r-1, c  )) { board[r-1][c  ].value++; }
	if (!isUndefined(board, r  , c+1)) { board[r  ][c+1].value++; }
	if (!isUndefined(board, r  , c-1)) { board[r  ][c-1].value++; }
	if (!isUndefined(board, r+1, c+1)) { board[r+1][c+1].value++; }
	if (!isUndefined(board, r+1, c-1)) { board[r+1][c-1].value++; }
	if (!isUndefined(board, r-1, c+1)) { board[r-1][c+1].value++; }
	if (!isUndefined(board, r-1, c-1)) { board[r-1][c-1].value++; }
}
function removeMineAt(r, c) {
	// console.log('Removing mine at '+r+ ', ' +c);
	board[r][c].mine = false;	//set it to not a mine

	//decrement the cells around the mine
	if (!isUndefined(board, r+1, c  )) { board[r+1][c  ].value--; }
	if (!isUndefined(board, r-1, c  )) { board[r-1][c  ].value--; }
	if (!isUndefined(board, r  , c+1)) { board[r  ][c+1].value--; }
	if (!isUndefined(board, r  , c-1)) { board[r  ][c-1].value--; }
	if (!isUndefined(board, r+1, c+1)) { board[r+1][c+1].value--; }
	if (!isUndefined(board, r+1, c-1)) { board[r+1][c-1].value--; }
	if (!isUndefined(board, r-1, c+1)) { board[r-1][c+1].value--; }
	if (!isUndefined(board, r-1, c-1)) { board[r-1][c-1].value--; }
}
/*=============================================================================================================*/
/* Game play */
function play(ele, event) {
	var clickedRow = Math.round(ele.getAttribute('row'));
	var clickedCol = Math.round(ele.getAttribute('col'));
	var clickedCell = document.getElementById('cell_'+clickedRow+'_'+clickedCol);
	// console.log('row: '+clickedRow+', col: '+clickedCol);

	if (turnsTaken == 0) {	//check if this is the first turn
		while (board[clickedRow][clickedCol].mine) {	//check if we clicked on a mine
			removeMineAt(clickedRow, clickedCol);	//remove the mine we clicked
			placeMines(1);	//put a new mine somewhere to replace the one we got rid of
		}
	}

	printBoardUndo();	//Run this function, just in case printBoard() has been ran
	startTimer(); //Start the timer, if it isnt already

	if (event.type == 'click') {	//Left click
		// console.log('Left click at '+clickedRow+', '+clickedCol);
		leftClick(clickedRow, clickedCol, clickedCell);
	}
	else if (event.type == 'contextmenu') {	//Right click
		// console.log('Right click at '+clickedRow+', '+clickedCol);
		rightClick(clickedCell);
	}
	turnsTaken++;	//Increment turnsTaken
	updateFlagCount();	//Update the flag count
	checkWin();	//Check for win
}
function leftClick(clickedRow, clickedCol, clickedCell) {
	setFace(face_default);	//Neutral Face

	if (clickedCell.innerHTML != sym_flag && clickedCell.innerHTML != sym_ques) {	//If there is not anything already there, we can take action
		if (board[clickedRow][clickedCol].mine) {	//Handle clicking on a mine
			clickedCell.innerHTML = sym_expl;	//set value of clicked cell to the sym_expl
			clickedCell.classList.add('textM', 'exploded');	//add the appropriate class
			loseEndGame();
			return;
		}
		else {	//Handle clicking a number
			clickedCell.classList.add('pressed', 'text'+board[clickedRow][clickedCol].value);
			clickedCell.innerHTML = board[clickedRow][clickedCol].value;
			board[clickedRow][clickedCol].checked = true;
			if (board[clickedRow][clickedCol].value == 0) {
				toCheck.push({ row: clickedRow, col: clickedCol });
				expandEmptySpace();	//Expand until we hit the edge or numbers
			}
		}
	}
}
function rightClick(clickedCell) {
	//Switch through empty, F, and ?
	if (!clickedCell.classList.contains('pressed')) {
		if (clickedCell.innerHTML == '') {	//Cell is empty
			clickedCell.innerHTML = sym_flag;	//set cell to display the flag character
			clickedCell.classList.add('textF');	//add the appropriate class
			clickedCell.classList.remove('textQ');	//remove irrelevant classes
			setFace(face_flag);	//display the Anxious Face with Sweat emoji on the reset button
		}
		else if (clickedCell.innerHTML == sym_flag) {	//Cell is a flag
			clickedCell.innerHTML = sym_ques;	//set cell to display the question character
			clickedCell.classList.add('textQ');	//add the appropriate class
			clickedCell.classList.remove('textF');	//remove irrelevant classes
			setFace(face_ques);	//display the Thinking Face emoji on the reset button
		}
		else if (clickedCell.innerHTML == sym_ques) {	//Cell is a question
			clickedCell.innerHTML = '';	//set cell back to empty
			clickedCell.classList.add();	//add the appropriate class
			clickedCell.classList.remove('textF', 'textQ');	//remove irrelevant classes
			setFace(face_default);	//display the Neutral Face emoji on the reset button
		}
	}
}
function expandEmptySpace() {
	while (toCheck.length > 0) {
		let r = toCheck[0].row;
		let c = toCheck[0].col;

		toCheck.shift();	//Dequeue the first element

		document.getElementById('cell_'+r+'_'+c).classList.add('pressed', 'text'+board[r][c].value);	//add the appropriate classes
		document.getElementById('cell_'+r+'_'+c).innerHTML = board[r][c].value;	//Display the value
		if (board[r][c].value == 0) {	//Continue expanding
			if (!isUndefined(board, r  , c+1) && !board[r  ][c+1].checked) { toCheck.push({ row: r  , col: c+1 }); board[r  ][c+1].checked = true; }	//N
			if (!isUndefined(board, r+1, c+1) && !board[r+1][c+1].checked) { toCheck.push({ row: r+1, col: c+1 }); board[r+1][c+1].checked = true; }	//NE
			if (!isUndefined(board, r+1, c  ) && !board[r+1][c  ].checked) { toCheck.push({ row: r+1, col: c   }); board[r+1][c  ].checked = true; }	//E
			if (!isUndefined(board, r+1, c-1) && !board[r+1][c-1].checked) { toCheck.push({ row: r+1, col: c-1 }); board[r+1][c-1].checked = true; }	//SE
			if (!isUndefined(board, r-1, c  ) && !board[r-1][c  ].checked) { toCheck.push({ row: r-1, col: c   }); board[r-1][c  ].checked = true; }	//S
			if (!isUndefined(board, r-1, c-1) && !board[r-1][c-1].checked) { toCheck.push({ row: r-1, col: c-1 }); board[r-1][c-1].checked = true; }	//SW
			if (!isUndefined(board, r  , c-1) && !board[r  ][c-1].checked) { toCheck.push({ row: r  , col: c-1 }); board[r  ][c-1].checked = true; }	//W
			if (!isUndefined(board, r-1, c+1) && !board[r-1][c+1].checked) { toCheck.push({ row: r-1, col: c+1 }); board[r-1][c+1].checked = true; }	//NW
		}
	}
}
function updateFlagCount() {
	let foundFlags = 0;

	for (let i=0; i<totalRows; i++) {
		for (let j=0; j<totalCols; j++) {
			let c = document.getElementById('cell_'+i+'_'+j);
			if (c.innerHTML == sym_flag || (c.innerHTML == sym_mine && !c.classList.contains('exploded')))
				foundFlags++;
		}
	}

	document.getElementById('flagsDiv').innerHTML = totalMines-foundFlags;
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

	if (unpressedCells == totalMines && document.querySelector('.exploded') == null) {
		pauseTimer();

		displayMines();
		updateFlagCount();
		disableBoard();

		setAlerts('You won!');	//Set alertPanel
		setFace(eval('face_'+boardSize+'Win'));	//Set btn to appropriate face

		checkSaveTime();	//Attempt to add to leaderboard
	}
}
function checkSaveTime() {
	let place = 0;	//The place that the new time will take in the array
	
	for (let i=0; i<curBoard.length; i++) {	//Search through curBoard
		if (savedTime > curBoard[i].savedTime) {	//Check if it took longer than the currently searched time
			place++;	//Increase the place
		}
		else {	//It took less time than the currently searched time
			break;	//We can leave
		}
	}

	if (place < leaderboardEntries) {	//We need to add it to the leaderboard
		let userName;
		if (localStorage.getItem('userName')) {	//If userName exists in localStorage
			userName = localStorage.getItem('userName');	//Set userName
			document.getElementById('userName').value = userName;	//Set userName input field 
		}
		else if (document.getElementById('userName').value != '') {	//If there is data in the input field
			console.log(document.getElementById('userName').value);
			userName = document.getElementById('userName').value;	//Set userName
			console.log(document.getElementById('userName').value);
			localStorage.setItem('userName', userName);	//Set userName in localStorage 
		}
		else {
			userName = prompt('Leaderboard Name', 'AAAAA');	//Collect the username from the user
			document.getElementById('userName').value = userName;	//Set userName input field
			localStorage.setItem('userName', userName==null?'AAAAA':userName.slice(0,5));	//Save it to localStorage, enforce 5 char limit
		}

		let finalTime = document.getElementById('timerDiv').innerHTML;
		curBoard.splice(place, 0, {name: userName, time: finalTime, savedTime: savedTime});	//Add entry in the correct slot
		if (curBoard.length > leaderboardEntries) {	//Check if we have filled the leaderboard yet
			curBoard.pop();	//Remove the last place from the leaderboard
		}
		localStorage.setItem('lead_'+boardSize, JSON.stringify(curBoard));	//save leaderboard array to local storage
		generateLeaderBoardDisplay();	//Update leaderboard on screen
		setAlerts('Congrats! You got a high score of '+finalTime+'!');
	}
}
function loseEndGame() {
	pauseTimer();
	for (var i=0; i<totalRows; i++) {
		for (var j = 0; j < totalCols; j++) {
			var curCell = document.getElementById('cell_'+i+'_'+j);

			//Explode the unmarked mines
			if (board[i][j].mine && curCell.innerHTML != sym_flag && curCell.innerHTML != sym_expl) {
				// console.log('Setting cell_'+i+'_'+j+' to '+sym_mine);
				curCell.innerHTML = sym_mine;
				curCell.classList.add('textM', 'exploded');
			}

			//X out the incorrect flags
			else if (!board[i][j].mine && curCell.innerHTML == sym_flag) {
				// console.log('Setting cell_'+i+'_'+j+' to '+sym_wrong);
				curCell.innerHTML = sym_wron;
			}
		}
	}
	disableBoard();
	setFace(face_lost);	//Exploding Head
	setAlerts('You lost.');
}
function displayMines() {
	if (board.length == 0) {	//Check if this is being called before the board has been generated
		generateGameBoardData(0);	//Create the board real quick to avoid errors
	}
	for (let i=0; i<totalRows; i++) {	//Loop through every row
		for (let j=0; j<totalCols; j++) {	//Loop through every column
			let cur = document.getElementById('cell_'+i+'_'+j);	//Grab the cell
			if (!cur.classList.contains('pressed') && cur.innerHTML == '' && board[i][j].mine) {
				cur.innerHTML = sym_flag;	//display the flag character
				cur.classList.add('textF');
			}
		}
	}
}
function disableBoard() {
	for (let i=0; i<totalRows; i++) {
		for (let j=0; j<totalCols; j++) {
			let curCell = document.getElementById('cell_'+i+'_'+j);
			curCell.classList.add('disabled');	//Disable the cell by adding the disabled class
		}
	}
	board = [];	//clear the board variable
}
/*=============================================================================================================*/
/* Utility functions */
function openSettings() {
	pauseTimer();	//Pause the time!
	for (let i=0; i<totalRows; i++) {	//Hide board
		for (let j=0; j<totalCols; j++) {
			let curCell = document.getElementById('cell_'+i+'_'+j);
			curCell.classList.add('hidden');	//Hide the cell by adding the hidden class
		}
	}
	document.getElementById('userName').value = localStorage.getItem('userName') ? localStorage.getItem('userName') : '';	//Fill in the userName if possible
	enableDisableInput();	//enable or disable the input fields correctly
	document.getElementById('settingsModal').style.display = 'block';	//Set the modal to be visible
}
function confirmSettings() {
	setAlerts('');	//Clear alerts
	if (document.getElementById('settingsForm').checkValidity()) {	//If everything is valid, proceed
		setTotals();	//Set totalRows, totalCols, totalMines, and boardSize
		// changeName();	//Set the new name in localStorage if necessary
		generateGameBoardData();	//generate the game board data
		generateGameBoardDisplay();	//redraw the board
		generateLeaderBoardData();	//import leaderboard, creating if necessary
		generateLeaderBoardDisplay();	//display the leaderboard table	
		resetTimer();	//reset timer to 0
		closeSettings();
	}
	else {	//If things are not valid, display an error
		setAlerts('The supplied parameters were not valid.');
		setFace(face_error);	//Dizzy Face
	}
}
function closeSettings() {
	if (savedTime > 0) {	//If the game has ran at all
		startTimer();	//Restart the timer!
	}
	for (let i=0; i<totalRows; i++) {	//Show board
		for (let j=0; j<totalCols; j++) {
			let curCell = document.getElementById('cell_'+i+'_'+j);
			curCell.classList.remove('hidden');	//Unhide the cell by removing the hidden class
		}
	}
	document.getElementById('settingsModal').style.display = 'none';	//Set the modal to be not visible
}
function isUndefined(_arr, _index1, _index2) {
	//This function identifies whether the passed cell is valid
	try {
		return _arr[_index1][_index2] == undefined;
	} catch (e) {
		return true;
	}
}
function faceBtnHandler(ele, event) {
	//Handle events on the reset button
	let type = event.type;	//the type of event it was
	let btn = document.getElementById('resetBtn');	//grab the resetBtn

	if (ele != btn) {	//Make sure that this happened on the resetBtn
		return;	//Leave, disregarding whatever happened
	}
	if (type == 'click') {
		priorRstBtnVal = face_default;	//set to default face
		start();	//proceed to start function
	}
	else if (type == 'mousedown') {
		priorRstBtnVal = btn.value;	//save the current value of the reset button
		setFace(face_down);	//set to held down face
	}
	else if (type == 'mouseleave') {
		setFace(priorRstBtnVal);	//set to prior face
	}
}
function setAlerts(alertString) {
	document.getElementById('alertPanel').innerHTML = '<h2>'+alertString+'</h2>';	//set the alert panel to display the passed message
}
function setFace(emojiCode) {
	priorRstBtnVal = document.getElementById('resetBtn').value;	//Save the btn face
	document.getElementById('resetBtn').value = emojiCode;	//Set the new btn face
}
function enableDisableInput() {
	let tempBoardSize = document.getElementById('sizeSelector').value;
	if (tempBoardSize == 'cu') {	//custom size board
		//We need to make the input areas editable
		document.getElementById('rows').disabled = false;
		document.getElementById('cols').disabled = false;
		document.getElementById('mines').disabled = false;
	}
	else {	//standard size board
		//We need to make the input areas readOnly
		document.getElementById('rows').disabled = true;
		document.getElementById('cols').disabled = true;
		document.getElementById('mines').disabled = true;

		//Set the input boxes so that they match whatever the current selection is
		document.getElementById('rows').value = boardMap.get(tempBoardSize).rows;
		document.getElementById('cols').value = boardMap.get(tempBoardSize).cols;
		document.getElementById('mines').value = boardMap.get(tempBoardSize).mines;
	}
}
function printBoard() {
	for (let i=0; i<totalRows; i++) {	//Loop through every row
		for (let j=0; j<totalCols; j++) {	//Loop through every column
			let cur = document.getElementById('cell_'+i+'_'+j);
			if (!cur.classList.contains('pressed') && cur.innerHTML != sym_flag && cur.innerHTML != sym_ques) {
				cur.innerHTML = board[i][j].value;
			}
			if (board[i][j].mine && cur.innerHTML != sym_flag && cur.innerHTML != sym_ques) {
				cur.classList.add('exploded');
			}
		}
	}		
}
function printBoardUndo() {
	for (let i=0; i<totalRows; i++) {	//Loop through every row
		for (let j=0; j<totalCols; j++) {	//Loop through every column
			let cur = document.getElementById('cell_'+i+'_'+j);

			if (!cur.classList.contains('pressed') && cur.innerHTML != sym_flag && cur.innerHTML != sym_ques) {	//detect if we've used the printBoard function
				cur.innerHTML = '';	//remove the number
				cur.classList.remove('exploded');	//remove the exploded class if it is there
			}
		}
	}		
}
function resetLeaderboards() {
	let confirmation = confirm('This will reset all leaderboard data. Are you sure?');	//Get confirmation
	if (confirmation) {	//If confirmed, delete data
		localStorage.removeItem('lead_sm');
		localStorage.removeItem('lead_md');
		localStorage.removeItem('lead_lg');
		localStorage.removeItem('lead_xl');
		localStorage.removeItem('lead_cu');
		pageLoad();	//Reload the page
	}
}