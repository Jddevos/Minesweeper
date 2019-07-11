# Minesweeper
An HTML/JS game of minesweeper




#### To-Do
- boardNumber is changing in generateLbDisplay?
- Leaderboard styling
- Settings panel
    - Flag, mine, and question character selection
    - Accuracy of timer
    - Colors?
- Code comments
- Code standardization
- Eliminate either curboard OR leaderboards variables
    - Replace `curBoard` with `leaderboards[boardMap.get(boardSize).lb]` ?
    - Only pull in the `curBoard`, and do not hold on to leaderboards ?
- Sensically rename functions



#### Done
- Remove ability to click on flagged mine without removing flag
- Resolved spacing issues in Chrome
- Remove the possiblity of clicking a mine on the first turn
- Preset board size options
- Reset button dynamically changes
- Custom size options
- Things are wonky when flagChar is set to an emoji (&#128681)
- Local high scores