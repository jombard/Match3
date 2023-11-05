// Define the constants and variables
let score = 0;
const gridDimension = 10;
const colors = [
    'hsl(171, 100%, 50%)', // Pastel Cyan
    'hsl(141, 100%, 50%)', // Pastel Green
    'hsl(263, 100%, 50%)',  // Pastel Purple
    'hsl(340, 100%, 50%)', // Pastel Pink
    'hsl(48, 100%, 50%)',  // Pastel Yellow
    'hsl(28, 100%, 50%)'   // Pastel Orange
  ];
  
let selectedBlob = null;

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score; // Update the score display
  }

// Async game loop function
async function gameLoop() {
    while (true) {
        // Here you could add your game's logic that needs to run continuously
        dropBlobsDown();
        checkForMatches();

        // Wait for 250 milliseconds before the next loop iteration
        await new Promise(resolve => setTimeout(resolve, 250));
    }
}

function dropBlobsDown() {
    while (checkForEmptySpaces()) {
        applyGravity();
        refillGrid();
    }
}

function checkForEmptySpaces() {
    for (let col = 0; col < gridDimension; col++) {
        for (let row = gridDimension - 1; row >= 0; row--) {
            const index = col + row * gridDimension;
            const blob = getBlobAtIndex(index);
            if (blob && blob.style.backgroundColor === '') {
                return true
            }
        }
    }

    return false
}

// Apply gravity to the blobs
function applyGravity() {
    for (let col = 0; col < gridDimension; col++) {
        for (let row = gridDimension - 2; row >= 0; row--) { // Start from second-to-last row
            const index = col + row * gridDimension;
            const blob = getBlobAtIndex(index);
            const belowIndex = col + (row + 1) * gridDimension;
            const belowBlob = getBlobAtIndex(belowIndex);

            // If the current blob has color and the space below is empty, let it fall
            if (blob.style.backgroundColor && !belowBlob.style.backgroundColor) {
                belowBlob.style.backgroundColor = blob.style.backgroundColor;
                blob.style.backgroundColor = ''; // Clear the current blob's color
            }
        }
    }
}


// Refill the grid where there are empty spaces
function refillGrid() {
    for (let i = 0; i < gridDimension; i++) {
        const index = i;
        const blob = getBlobAtIndex(index);
        if (blob && blob.style.backgroundColor === '') {
            blob.style.backgroundColor = getRandomColor();
        }
    }
}

// Generate the game board
function createBoard() {
    const gameBoard = document.getElementById('gameBoard');

    for (let i = 0; i < gridDimension * gridDimension; i++) {
        const blob = document.createElement('div');
        blob.classList.add('blob');
        blob.setAttribute('data-index', i);
        blob.style.backgroundColor = ''// getRandomColor();
        blob.addEventListener('click', selectBlob);
        gameBoard.appendChild(blob);
    }

    gameLoop()
}

// Get a random color
function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Select a blob
function selectBlob() {
    if (selectedBlob) {
        // Swap logic goes here
        trySwap(this);
    } else {
        // First blob selected
        this.style.border = '3px solid white';
        selectedBlob = this;
    }
}

// Swap blobs
function trySwap(targetBlob) {
    const firstIndex = parseInt(selectedBlob.getAttribute('data-index'));
    const secondIndex = parseInt(targetBlob.getAttribute('data-index'));
    
    // Check if the targetBlob is adjacent to the selectedBlob
    const difference = Math.abs(firstIndex - secondIndex);
    const isAdjacent = difference === 1 || difference === gridDimension;

    if (isAdjacent) {
        // Perform the swap
        const tempColor = selectedBlob.style.backgroundColor;
        selectedBlob.style.backgroundColor = targetBlob.style.backgroundColor;
        targetBlob.style.backgroundColor = tempColor;

        // Reset selection
        selectedBlob.style.border = "3px solid transparent";
        selectedBlob = null;

        // After swapping check for any matches
        checkForMatches();
    } else {
        // Not adjacent, reset
        selectedBlob.style.border = "3px solid transparent";
        selectedBlob = null;
        selectBlob.call(targetBlob);
    }
}

// Check for matches
function checkForMatches() {
    let matches = [];
    let boardNeedsUpdate = false; // Flag to check if we found any match

    // Helper function to add indexes to matches
    function addMatch(index) {
        if (!matches.includes(index)) {
            matches.push(index);
        }
    }

    // Check for horizontal matches
    for (let row = 0; row < gridDimension; row++) {
        for (let col = 0; col < gridDimension - 2; col++) {
            const startIndex = row * gridDimension + col;
            const blob = getBlobAtIndex(startIndex);
            if (blob.style.backgroundColor) {
                let matchLength = 1;
                for (let i = 1; i < gridDimension - col; i++) {
                    const nextBlob = getBlobAtIndex(startIndex + i);
                    if (nextBlob.style.backgroundColor === blob.style.backgroundColor) {
                        matchLength++;
                    } else {
                        break;
                    }
                }
                // Check if we have a match of 3 or more
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        addMatch(startIndex + i);
                    }
                    if (matchLength >= 5) {
                        removeAllOfColor(blob.style.backgroundColor);
                        boardNeedsUpdate = true;
                    }
                    col += matchLength - 1; // Skip checked blobs
                }
            }
        }
    }

    // Check for vertical matches
    for (let col = 0; col < gridDimension; col++) {
        for (let row = 0; row < gridDimension - 2; row++) {
            const startIndex = row * gridDimension + col;
            const blob = getBlobAtIndex(startIndex);
            if (blob.style.backgroundColor) {
                let matchLength = 1;
                for (let i = 1; i < gridDimension - row; i++) {
                    const nextBlob = getBlobAtIndex(startIndex + i * gridDimension);
                    if (nextBlob.style.backgroundColor === blob.style.backgroundColor) {
                        matchLength++;
                    } else {
                        break;
                    }
                }
                // Check if we have a match of 3 or more
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        addMatch(startIndex + i * gridDimension);
                    }
                    if (matchLength >= 5) {
                        removeAllOfColor(blob.style.backgroundColor);
                        boardNeedsUpdate = true;
                    }
                    row += matchLength - 1; // Skip checked blobs
                }
            }
        }
    }

    // If no 5-match was found, clear the matches
    if (!boardNeedsUpdate) {
        for (let i = 0; i < matches.length; i++) {
            const blob = getBlobAtIndex(matches[i]);
            blob.style.backgroundColor = ''; // Clear the blob's color
            updateScore(1); // Increment the score by 1
        }
    }
}

// Utility function to remove all blobs of a given color
function removeAllOfColor(color) {
    let count = 0; // Count how many blobs of this color are removed
    for (let i = 0; i < gridDimension * gridDimension; i++) {
        const blob = getBlobAtIndex(i);
        if (blob.style.backgroundColor === color) {
            blob.style.backgroundColor = '';
            count++;
        }
    }
    updateScore(count); // Add the count to the score
}


// Utility function to get the blob element by its index in the grid
function getBlobAtIndex(index) {
    return document.querySelector(`.blob[data-index="${index}"]`);
}


// Start the game
createBoard();
