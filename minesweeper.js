/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const sym_mine = "\u{1f4a3}"; // Character to display to indicate a mine
const sym_flag = "\u{1f6a9}"; // Character to display to indicate a flag
const sym_ques = "\u{02753}"; // Character to display to indicate a question
const sym_wron = "\u{1f4a2}"; // Character to display when a flag is incorrect after losing
const sym_expl = "\u{1f4a5}"; // Character to display when a mine is clicked

const face_default = "\u{1f610}"; // Face to display by default
const face_flag = "\u{1f630}"; // Face to display after placing a sym_flag
const face_ques = "\u{1f616}"; // Face to display after placing a sym_ques
const face_down = "\u{1f61c}"; // Face to display when the resetBtn is held down
const face_error = "\u{1f635}"; // Face to display when an error occurs
const face_lost = "\u{1f92f}"; // Face to display after losing
const face_won = "\u{1f60e}"; // Face to display after winning

const debug = false; // Used to enable/disable console log printouts en masse

/*========================================DO NOT CHANGE THESE VARIABLES========================================*/
var board = []; // This will hold the game board in its entirety
var toCheck = []; // Will hold the list of cells to check when expanding empty space
var totalRows = 0; // Total number of rows
var totalCols = 0; // Total number of columns
var totalMines = 0; // Total number of mines
var boardSize = "sm"; // The size of the board
var priorRstBtnVal = face_default; // Will hold the value of the reset button
var turnsTaken = 0; // Will hold the total number of turns taken
var gameIsActive = false; // Flag indicating whether the game is currently active
var hasCheated = false; // Flag indicating whether the player has cheated

/* Board sizes */
const boardMap = new Map([
	["sm", { rows: 8, cols: 8, mines: 10 }], // 8x8_10, small
	["md", { rows: 16, cols: 16, mines: 40 }], // 16x16_40, medium
	["lg", { rows: 16, cols: 30, mines: 99 }], // 16x30_99, large
	["xl", { rows: 24, cols: 30, mines: 225 }], // 24x30_225, giant
	["cu", { rows: 8, cols: 8, mines: 10 }] // Custom, defaults to small
]);

/* Storage */
const leaderboardEntries = 10; // How many high scores to keep on each leaderboard
var curBoard = []; // The leaderboard for the currently selected size

/*=============================================================================================================*/
/* Before the game starts */
function start() {
	setTotals(); // Set the total variables
	setAlerts(""); // Clear any alerts
	confirmSettings(); // Confirm the settings are correct
}
function generateGameBoardData() {
	board = []; // Clear the board

	for (var i = 0; i < totalRows; i++) {
		var row = [];
		for (var j = 0; j < totalCols; j++) {
			var cell = { value: 0, mine: false, checked: false }; // Generate default cell data
			row.push(cell);
		}
		board.push(row);
	}
	placeMines(totalMines);
	if (debug) {
		console.log(board);
	}
}
function generateGameBoardDisplay() {
	let boardDiv = document.getElementById("board");
	boardDiv.innerHTML = ""; // Clear the boardDiv

	//Generate info panel
	let infoDiv = document.createElement("div"); // Div for infoContainer
	infoDiv.id = "infoContainer";

	let timerDiv = document.createElement("div"); // Div for timer
	timerDiv.id = "timerDiv";
	timerDiv.className = "timerDiv";
	timerDiv.innerHTML = "00:00:00";
	infoDiv.appendChild(timerDiv); // Append timerDiv to infoDiv

	let resetDiv = document.createElement("div"); // Div for reset button
	resetDiv.id = "resetDiv";
	resetDiv.className = "resetDiv";

	let resetBtn = document.createElement("input"); // Reset button itself
	resetBtn.type = "Button";
	resetBtn.id = "resetBtn";
	resetBtn.value = face_default;
	resetBtn.setAttribute("onclick", "faceBtnHandler(this, event)");
	resetBtn.setAttribute("onmousedown", "faceBtnHandler(this, event)");
	resetBtn.setAttribute("onmouseleave", "faceBtnHandler(this, event)");
	resetBtn.setAttribute("onmouseover", "faceBtnHandler(this, event)");
	resetDiv.appendChild(resetBtn); // Append resetBtn to resetDiv

	infoDiv.appendChild(resetDiv); // Append resetDiv to infoDiv

	let flagsDiv = document.createElement("div"); // Div for flags remaining
	flagsDiv.id = "flagsDiv";
	flagsDiv.className = "flagsDiv";
	flagsDiv.innerHTML = totalMines;
	infoDiv.appendChild(flagsDiv); // Append flagsDiv to infoDiv

	boardDiv.appendChild(infoDiv); // Append infoDiv to boardDiv

	// Generate play area
	let gameDiv = document.createElement("div"); // Div to contain the play area
	gameDiv.id = "gameDiv";

	let rowContent = ""; // String to build the individual rows
	for (let i = 0; i < totalRows; i++) {
		let rowDiv = document.createElement("div");
		rowDiv.className = "gameBoardRow";
		rowContent = "";

		for (let j = 0; j < totalCols; j++) {
			// Create div for the individual cell
			rowContent +=
				'<div class="gameBoardBtn" id="cell_' +
				i +
				"_" +
				j +
				'" row="' +
				i +
				'" col="' +
				j +
				'" onclick="play(this, event)" oncontextmenu="play(this, event)"></div>';
		}

		rowDiv.innerHTML = rowContent; // Set the innerHTML all at once
		gameDiv.appendChild(rowDiv); // Append rowDiv to gameDiv
	}

	boardDiv.appendChild(gameDiv); // Append gameDiv to boardDiv
}
function generateLeaderBoardData() {
	curBoard = localStorage.getItem(
		totalRows + "x" + totalCols + "_" + totalMines
	)
		? JSON.parse(
				localStorage.getItem(
					totalRows + "x" + totalCols + "_" + totalMines
				)
		  )
		: []; // Pull in leaderboard data if it exists
}
function generateLeaderBoardDisplay() {
	let leadersDiv = document.getElementById("leaders"); // Grab the leadersDiv element
	leadersDiv.innerHTML = ""; // Clear leaderboard

	if (localStorage.getItem(totalRows + "x" + totalCols + "_" + totalMines)) {
		// Only draw the leaderboard if high scores exist
		let lbTable = document.createElement("table"); // Define the table
		let lbTbody = document.createElement("tbody"); // Define the body of the table
		let lbHeaderRow = document.createElement("tr"); // Create table header
		let lbHeader = document.createElement("th"); // Create table header cell
		lbHeader.setAttribute("colspan", 2); // Set header to span both columns
		let lbHeaderVal = document.createTextNode(
			totalRows + "x" + totalCols + "_" + totalMines
		); // Create textNode to display board size in the header cell
		lbHeader.appendChild(lbHeaderVal); // Append textNode to Cell
		lbHeaderRow.appendChild(lbHeader); // Append header to the row
		lbTbody.appendChild(lbHeaderRow); // Append the row to the table body

		for (let i = 0; i < curBoard.length; i++) {
			// Loop through every entry in the leaderboard
			let lbRow = document.createElement("tr"); // Create row
			if (i < 3) {
				// Check if we are in the first 3 rows
				lbRow.classList.add("text" + (i + 1)); // Add a text class to color the text
			}

			let lbDataName = document.createElement("td"); // Create cell
			let ldDataNameVal = document.createTextNode(curBoard[i].name);
			lbDataName.appendChild(ldDataNameVal); // Append textNode to the cell
			lbRow.appendChild(lbDataName); // Append data to the row

			let lbDataTime = document.createElement("td"); // Create cell
			let ldDataTimeVal = document.createTextNode(curBoard[i].time);
			lbDataTime.appendChild(ldDataTimeVal); // Append textNode to the cell
			lbRow.appendChild(lbDataTime); // Append data to the row

			lbTbody.appendChild(lbRow); // Append the row to the table body
		}
		lbTable.appendChild(lbTbody); // Append the table body to the table
		leadersDiv.appendChild(lbTable); // Append the table to the page
	}
}
function setTotals() {
	boardSize = document.getElementById("sizeSelector").value; // Pull the boardSize out of the size selector
	totalRows = parseInt(document.getElementById("rows").value, 10); // Pull totalRows out of the settings field
	totalCols = parseInt(document.getElementById("cols").value, 10); // Pull totalCols out of the settings field
	totalMines = parseInt(document.getElementById("mines").value, 10); // Pull totalMines out of the settings field
}
function placeMines(minesToPlace) {
	let r = 0;
	let c = 0;
	for (let i = 0; i < minesToPlace; i++) {
		do {
			// Get random row and column
			r = Math.floor(Math.random() * totalRows); // Grab random row
			c = Math.floor(Math.random() * totalCols); // Grab random column
		} while (board[r][c].mine == true); // Mmake sure that mines arent repeated
		placeMineAt(r, c); // Place mine
	}
}
function placeMineAt(r, c) {
	if (debug) {
		console.log("Placing mine at " + r + ", " + c);
	}
	board[r][c].mine = true; // Place mine

	// Increment the cells around the mine
	if (!isUndefined(board, r + 1, c)) {
		board[r + 1][c].value++;
	} // S
	if (!isUndefined(board, r - 1, c)) {
		board[r - 1][c].value++;
	} // N
	if (!isUndefined(board, r, c + 1)) {
		board[r][c + 1].value++;
	} // E
	if (!isUndefined(board, r, c - 1)) {
		board[r][c - 1].value++;
	} // W
	if (!isUndefined(board, r + 1, c + 1)) {
		board[r + 1][c + 1].value++;
	} // SE
	if (!isUndefined(board, r + 1, c - 1)) {
		board[r + 1][c - 1].value++;
	} // SW
	if (!isUndefined(board, r - 1, c + 1)) {
		board[r - 1][c + 1].value++;
	} // NE
	if (!isUndefined(board, r - 1, c - 1)) {
		board[r - 1][c - 1].value++;
	} // NW
}
function removeMineAt(r, c) {
	if (debug) {
		console.log("Removing mine at " + r + ", " + c);
	}
	board[r][c].mine = false; // Remove mine

	// Decrement the cells around the mine
	if (!isUndefined(board, r + 1, c)) {
		board[r + 1][c].value--;
	} // S
	if (!isUndefined(board, r - 1, c)) {
		board[r - 1][c].value--;
	} // N
	if (!isUndefined(board, r, c + 1)) {
		board[r][c + 1].value--;
	} // E
	if (!isUndefined(board, r, c - 1)) {
		board[r][c - 1].value--;
	} // W
	if (!isUndefined(board, r + 1, c + 1)) {
		board[r + 1][c + 1].value--;
	} // SE
	if (!isUndefined(board, r + 1, c - 1)) {
		board[r + 1][c - 1].value--;
	} // SW
	if (!isUndefined(board, r - 1, c + 1)) {
		board[r - 1][c + 1].value--;
	} // NE
	if (!isUndefined(board, r - 1, c - 1)) {
		board[r - 1][c - 1].value--;
	} // NW
}
/*=============================================================================================================*/
/* Game play */
function play(ele, event) {
	var clickedRow = Math.round(ele.getAttribute("row")); // Pull in row of cell
	var clickedCol = Math.round(ele.getAttribute("col")); // Pull in column of cell
	var clickedCell = document.getElementById(
		"cell_" + clickedRow + "_" + clickedCol
	); // Pull in correct cell

	if (debug) {
		console.log("row: " + clickedRow + ", col: " + clickedCol);
	}

	if (turnsTaken == 0) {
		// Check if this is the first turn
		while (board[clickedRow][clickedCol].mine) {
			// Check if we clicked on a mine
			removeMineAt(clickedRow, clickedCol); // Remove the mine we clicked
			placeMines(1); // Put a new mine somewhere to replace the one we got rid of
		}
	}

	printBoardUndo(); // Run this function, just in case printBoard() has been ran
	startTimer(); // Start the timer, if it isnt already
	gameIsActive = true; // Set the game to active

	if (event.type == "click") {
		// Left click
		if (debug) {
			console.log("Left click at " + clickedRow + ", " + clickedCol);
		}
		leftClick(clickedRow, clickedCol, clickedCell); // Perform leftClick
	} else if (event.type == "contextmenu") {
		// Right click
		if (debug) {
			console.log("Right click at " + clickedRow + ", " + clickedCol);
		}
		rightClick(clickedCell); // Perform rightClick
	}
	turnsTaken++; // Increment turnsTaken
	updateFlagCount(); // Update the flag count
	checkWin(); // Check for win
}
function leftClick(clickedRow, clickedCol, clickedCell) {
	setFace(face_default); // Neutral Face

	if (
		clickedCell.innerHTML != sym_flag &&
		clickedCell.innerHTML != sym_ques
	) {
		// If there is not anything already there, we can take action
		if (board[clickedRow][clickedCol].mine) {
			// Handle clicking on a mine
			clickedCell.innerHTML = sym_expl; // Set value of clicked cell to the sym_expl
			clickedCell.classList.add("textM", "exploded"); // Add the appropriate class
			loseEndGame(); // End game as a loss
			return;
		} else {
			// Handle clicking a number
			clickedCell.classList.add(
				"pressed",
				"text" + board[clickedRow][clickedCol].value
			); // Add correct classes
			clickedCell.innerHTML = board[clickedRow][clickedCol].value; // Set innerHTML
			board[clickedRow][clickedCol].checked = true; // Set cell to checked
			if (board[clickedRow][clickedCol].value == 0) {
				// Check if we need to expand the empty space
				toCheck.push({ row: clickedRow, col: clickedCol }); // Add cell to queue
				expandEmptySpace(); // Expand until we hit the edge or numbers
			}
		}
	}
}
function rightClick(clickedCell) {
	// Switch through empty, F, and ?
	if (!clickedCell.classList.contains("pressed")) {
		// Verify this cell hasn't been pressed already
		if (clickedCell.innerHTML == "") {
			// Cell is empty
			clickedCell.innerHTML = sym_flag; // Set cell to display the flag character
			clickedCell.classList.add("textF"); // Add the appropriate class
			clickedCell.classList.remove("textQ"); // Remove irrelevant classes
			setFace(face_flag); // Display the Anxious Face with Sweat emoji on the reset button
		} else if (clickedCell.innerHTML == sym_flag) {
			// Cell is a flag
			clickedCell.innerHTML = sym_ques; // Set cell to display the question character
			clickedCell.classList.add("textQ"); // Add the appropriate class
			clickedCell.classList.remove("textF"); // Remove irrelevant classes
			setFace(face_ques); // Display the Thinking Face emoji on the reset button
		} else if (clickedCell.innerHTML == sym_ques) {
			// Cell is a question
			clickedCell.innerHTML = ""; // Set cell back to empty
			clickedCell.classList.add(); // Add the appropriate class
			clickedCell.classList.remove("textF", "textQ"); // Remove irrelevant classes
			setFace(face_default); // Display the Neutral Face emoji on the reset button
		}
	}
}
function expandEmptySpace() {
	while (toCheck.length > 0) {
		let r = toCheck[0].row; // Get row of cell we are checking
		let c = toCheck[0].col; // Get column of cell we are checking

		toCheck.shift(); // Dequeue the first element

		document
			.getElementById("cell_" + r + "_" + c)
			.classList.add("pressed", "text" + board[r][c].value); // Add the appropriate classes
		document.getElementById("cell_" + r + "_" + c).innerHTML =
			board[r][c].value; // Display the value
		if (board[r][c].value == 0) {
			// Continue expanding
			if (!isUndefined(board, r + 1, c) && !board[r + 1][c].checked) {
				toCheck.push({ row: r + 1, col: c });
				board[r + 1][c].checked = true;
			} //S
			if (!isUndefined(board, r - 1, c) && !board[r - 1][c].checked) {
				toCheck.push({ row: r - 1, col: c });
				board[r - 1][c].checked = true;
			} //N
			if (!isUndefined(board, r, c + 1) && !board[r][c + 1].checked) {
				toCheck.push({ row: r, col: c + 1 });
				board[r][c + 1].checked = true;
			} //E
			if (!isUndefined(board, r, c - 1) && !board[r][c - 1].checked) {
				toCheck.push({ row: r, col: c - 1 });
				board[r][c - 1].checked = true;
			} //W
			if (
				!isUndefined(board, r + 1, c + 1) &&
				!board[r + 1][c + 1].checked
			) {
				toCheck.push({ row: r + 1, col: c + 1 });
				board[r + 1][c + 1].checked = true;
			} //SE
			if (
				!isUndefined(board, r + 1, c - 1) &&
				!board[r + 1][c - 1].checked
			) {
				toCheck.push({ row: r + 1, col: c - 1 });
				board[r + 1][c - 1].checked = true;
			} //SW
			if (
				!isUndefined(board, r - 1, c + 1) &&
				!board[r - 1][c + 1].checked
			) {
				toCheck.push({ row: r - 1, col: c + 1 });
				board[r - 1][c + 1].checked = true;
			} //NE
			if (
				!isUndefined(board, r - 1, c - 1) &&
				!board[r - 1][c - 1].checked
			) {
				toCheck.push({ row: r - 1, col: c - 1 });
				board[r - 1][c - 1].checked = true;
			} //NW
		}
	}
}
function updateFlagCount() {
	let foundFlags = 0; // Set flag counter to 0

	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every column
			let c = document.getElementById("cell_" + i + "_" + j); // Pull in cell
			if (
				c.innerHTML == sym_flag ||
				(c.innerHTML == sym_mine && !c.classList.contains("exploded"))
			) {
				// Check if this is a flag
				foundFlags++; // Increment flag counter
			}
		}
	}

	document.getElementById("flagsDiv").innerHTML = totalMines - foundFlags; // Set display
}
/*=============================================================================================================*/
/* End conditions */
function checkWin() {
	var unpressedCells = 0; // Set counter to 0

	for (var i = 0; i < totalRows; i++) {
		// Loop through every row
		for (var j = 0; j < totalCols; j++) {
			// Loop through every column
			var cur = document.getElementById("cell_" + i + "_" + j); //pull in cell
			if (
				!cur.classList.contains("pressed") &&
				!cur.classList.contains("exploded")
			) {
				// Check if this is a pressed cell
				unpressedCells++; // Increment counter
			}
		}
	}
	if (debug) {
		console.log(unpressedCells + " unpressed cells remaining");
	}

	if (
		unpressedCells == totalMines &&
		document.querySelector(".exploded") == null
	) {
		// Check if unpressed cells == totalMines, and there aren't any exploded ones
		pauseTimer(); // Pause Timer
		gameIsActive = false; // Mark the game as not active
		setAlerts("You won!"); // Set alertPanel
		checkSaveTime(); // Attempt to add to leaderboard
		displayMines(); // Show remaining mines
		updateFlagCount(); // Update the flag count (in case some were unmarked)
		disableBoard(); // Don't allow any more input
		setFace(face_won); // Set btn to appropriate face
	}
}
function checkSaveTime() {
	let place = 0; // The place that the new time will take in the array

	for (let i = 0; i < curBoard.length; i++) {
		// Search through curBoard
		if (savedTime > curBoard[i].savedTime) {
			// Check if it took longer than the currently searched time
			place++; // Increase the place
		} else {
			// It took less time than the currently searched time
			break; // We can leave
		}
	}

	if (place < leaderboardEntries) {
		// We need to add it to the leaderboard
		let userName; // Declare userName
		if (localStorage.getItem("userName")) {
			// If userName exists in localStorage
			userName = localStorage.getItem("userName"); // Set userName
			document.getElementById("userName").value = userName; // Set userName input field
		} else if (document.getElementById("userName").value != "") {
			// If there is data in the input field
			userName = document.getElementById("userName").value; // Set userName
			localStorage.setItem("userName", userName); // Set userName in localStorage
		} else {
			userName = prompt("Leaderboard Name", "AAAAA"); // Collect the username from the user
			document.getElementById("userName").value = userName; // Set userName input field
			localStorage.setItem(
				"userName",
				userName == null ? "AAAAA" : userName.slice(0, 5)
			); // Save it to localStorage, enforce 5 char limit
		}

		userName = hasCheated ? userName + "*" : userName; // If they have cheated, append an * to their name in the leaderboard

		let finalTime = document.getElementById("timerDiv").innerHTML; // Pull in final time
		curBoard.splice(place, 0, {
			name: userName,
			time: finalTime,
			savedTime: savedTime
		}); // Add entry in the correct slot
		if (curBoard.length > leaderboardEntries) {
			// Check if we have filled the leaderboard yet
			curBoard.pop(); // Remove the last place from the leaderboard
		}
		localStorage.setItem(
			totalRows + "x" + totalCols + "_" + totalMines,
			JSON.stringify(curBoard)
		); // Save leaderboard array to local storage
		generateLeaderBoardDisplay(); // Update leaderboard on screen
		setAlerts("Congrats! You got a high score of " + finalTime + "!"); // Set alert
	}
}
function loseEndGame() {
	pauseTimer(); // Pause the timer
	gameIsActive = false; // Mark the game as not active
	for (var i = 0; i < totalRows; i++) {
		// Loop through every row
		for (var j = 0; j < totalCols; j++) {
			// Loop through every column
			var curCell = document.getElementById("cell_" + i + "_" + j);

			if (
				board[i][j].mine &&
				curCell.innerHTML != sym_flag &&
				curCell.innerHTML != sym_expl
			) {
				// Find mines that aren't marked
				if (debug) {
					console.log(
						"Setting cell_" + i + "_" + j + " to " + sym_mine
					);
				}
				curCell.innerHTML = sym_mine; // Mark them as mines
				curCell.classList.add("textM", "unfound"); // Set the appropriate classes
			}

			//X out the incorrect flags
			else if (!board[i][j].mine && curCell.innerHTML == sym_flag) {
				//Find flags that are incorrect
				if (debug) {
					console.log(
						"Setting cell_" + i + "_" + j + " to " + sym_wron
					);
				}
				curCell.innerHTML = sym_wron; // Mark them as wrong
			}
		}
	}
	disableBoard(); // Disable the board
	setFace(face_lost); // Set face to face_lost
	setAlerts("You lost."); // Inform the player
}
function displayMines() {
	hasCheated = true; // Set hasCheated to true
	if (board.length == 0) {
		// Check if this is being called before the board has been generated
		generateGameBoardData(0); // Create the board real quick to avoid errors
	}
	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every column
			let cur = document.getElementById("cell_" + i + "_" + j); // Grab the cell
			if (
				!cur.classList.contains("pressed") &&
				cur.innerHTML == "" &&
				board[i][j].mine
			) {
				// Check if the cell is an unpressed mine
				cur.innerHTML = sym_flag; // Display the flag character
				cur.classList.add("textF"); // Add the appropriate class
			}
		}
	}
}
function disableBoard() {
	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every column
			let curCell = document.getElementById("cell_" + i + "_" + j); // Grab the cell
			curCell.classList.add("disabled"); // Disable the cell by adding the disabled class
		}
	}
	board = []; // Clear the board variable, as we no longer need it
}
/*=============================================================================================================*/
/* Utility functions */
function openSettings() {
	if (gameIsActive) {
		// Check if game is active
		pauseTimer(); // Pause the timer
		for (let i = 0; i < totalRows; i++) {
			// Loop through every row
			for (let j = 0; j < totalCols; j++) {
				// Loop through every column
				let curCell = document.getElementById("cell_" + i + "_" + j); // Grab the cell
				curCell.classList.add("hidden"); // Hide the cell by adding the hidden class
			}
		}
	}
	document.getElementById("userName").value = localStorage.getItem("userName")
		? localStorage.getItem("userName")
		: ""; // Fill in the userName if possible
	enableDisableInput(); // Enable or disable the input fields correctly
	document.getElementById("settingsModal").style.display = "block"; // Set the modal to be visible
}
function confirmSettings() {
	turnsTaken = 0; // Reset turnsTaken
	hasCheated = false; // Reset hasCheated variable
	setAlerts(""); // Clear alerts
	updateMaxMines(); // Update the maximum mines allowed
	if (document.getElementById("settingsForm").checkValidity()) {
		// If everything is valid, proceed
		setTotals(); // Set totalRows, totalCols, totalMines, and boardSize
		setUserName(); // Set userName
		generateGameBoardData(); // Generate the game board data
		generateGameBoardDisplay(); // Redraw the board
		generateLeaderBoardData(); // Import leaderboard, creating if necessary
		generateLeaderBoardDisplay(); // Display the leaderboard table
		resetTimer(); // Reset timer to 0
		closeSettings(); // Close settings panel
	} else {
		// If things are not valid, display an error
		setAlerts("The supplied parameters were not valid."); // Display an alert
		setFace(face_error); // Set face to face_error
	}
}
function closeSettings() {
	if (gameIsActive) {
		// If the game is active
		startTimer(); // Restart the timer!
	}
	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every row
			let curCell = document.getElementById("cell_" + i + "_" + j); // Grab the cell
			curCell.classList.remove("hidden"); // Unhide the cell by removing the hidden class
		}
	}
	document.getElementById("settingsModal").style.display = "none"; // Set the modal to be not visible
}
function isUndefined(array, row, col) {
	try {
		// We want to attempt to access the passed cell
		if (debug) {
			console.log("Trying to access [" + row + "][" + col + "]");
		}
		return array[row][col] === undefined; // If the cell has a value, this will return false
	} catch (e) {
		return true; // Return true (this is an undefined cell)
	}
}
function faceBtnHandler(ele, event) {
	//Handle events on the reset button
	let type = event.type; // Will hold the type of event it was
	let btn = document.getElementById("resetBtn"); // Grab the resetBtn

	if (ele != btn) {
		// Make sure that this happened on the resetBtn
		return; // Leave, disregarding whatever happened
	}
	if (type == "click") {
		// Check if this was a click event
		priorRstBtnVal = face_default; // Set face to face_default
		start(); // Proceed to start function
	} else if (type == "mousedown") {
		// Check if this was a mousedown event
		setFace(face_down); // Set to held down face
	} else if (type == "mouseleave") {
		// Check if this was a mouseleave event
		setFace(priorRstBtnVal); // Set to prior face
	}
}
function setAlerts(alertString) {
	if (debug) {
		console.log(alertString); // Show alert in console
	}
	document.getElementById("alertPanel").innerHTML =
		"<h2>" + alertString + "</h2>"; // Set the alert panel to display the passed message
}
function setFace(emojiCode) {
	priorRstBtnVal = document.getElementById("resetBtn").value; // Save the resetBtn face to priorRstBtnVal
	document.getElementById("resetBtn").value = emojiCode; // Set the new resetBtn face
}
function setUserName() {
	let userName = document.getElementById("userName").value; // Pull value from input field
	if (userName != localStorage.getItem("userName") && userName != "") {
		// Check if the userName was changed and isn't empty
		localStorage.setItem("userName", userName); // Set value in localStorage if it exists, otherwise set to AAAAA
	}
}
function enableDisableInput() {
	let tempBoardSize = document.getElementById("sizeSelector").value; // Declare a variable to hold the board size within the settings
	if (tempBoardSize == "cu") {
		// Check for custom size board
		document.getElementById("rows").disabled = false; // Make the rows input area editable
		document.getElementById("cols").disabled = false; // Make the columns input area editable
		document.getElementById("mines").disabled = false; // Make the mines input area editable
	} else {
		// Check for standard size board
		document.getElementById("rows").disabled = true; // Make the rows input area disable
		document.getElementById("cols").disabled = true; // Make the columns input area disable
		document.getElementById("mines").disabled = true; // Make the mines input area disable

		document.getElementById("rows").value = boardMap.get(
			tempBoardSize
		).rows; // Set the input boxes to display the value of the selected board size
		document.getElementById("cols").value = boardMap.get(
			tempBoardSize
		).cols; // Set the input boxes to display the value of the selected board size
		document.getElementById("mines").value = boardMap.get(
			tempBoardSize
		).mines; // Set the input boxes to display the value of the selected board size
	}
}
function updateMaxMines() {
	let rInput = document.getElementById("rows"); // Grab the rows input element
	let cInput = document.getElementById("cols"); // Grab the cols input element
	let mInput = document.getElementById("mines"); // Grab the mines input element
	mInput.max = rInput.value * cInput.value - 1; // Set the max number of mines to be one less than the total number of cells
}
function printBoard() {
	hasCheated = true; // Set hasCheated to true
	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every column
			let cur = document.getElementById("cell_" + i + "_" + j); // Grab the cell
			if (
				!cur.classList.contains("pressed") &&
				cur.innerHTML != sym_flag &&
				cur.innerHTML != sym_ques
			) {
				// Check if the cell is unpressed and doesn't have a value
				cur.innerHTML = board[i][j].value; // Display the value
				if (board[i][j].mine) {
					// Detect if the cell is a mine
					cur.classList.add("exploded"); // Add the exploded class
				}
			}
		}
	}
}
function printBoardUndo() {
	for (let i = 0; i < totalRows; i++) {
		// Loop through every row
		for (let j = 0; j < totalCols; j++) {
			// Loop through every column
			let cur = document.getElementById("cell_" + i + "_" + j); // Grab the cell
			if (
				!cur.classList.contains("pressed") &&
				cur.innerHTML != sym_flag &&
				cur.innerHTML != sym_ques
			) {
				// Check if the cell is unpressed and doesn't have a value
				cur.innerHTML = ""; // Remove the number
				if (board[i][j].mine) {
					// Detect if the cell is a mine
					cur.classList.remove("exploded"); // Remove the exploded class
				}
			}
		}
	}
}
function resetLeaderboards() {
	let confirmation = confirm(
		"This will reset all leaderboard data. Are you sure?"
	); // Get confirmation before proceeding
	if (confirmation) {
		// If confirmed, delete data
		let userNameBackup = localStorage.getItem("userName")
			? localStorage.getItem("userName")
			: ""; // Save the userName to a variable if it exists
		localStorage.clear(); // Clear localStorage
		if (userNameBackup.length > 0) {
			// Check if we pulled anything from localStorage
			localStorage.setItem("userName", userNameBackup); // Restore userName to localStorage
		}
		start(); // Proceed to start function
	}
}
