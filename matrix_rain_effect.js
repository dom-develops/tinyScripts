const readline = require('readline');

const columns = process.stdout.columns;
const rows = process.stdout.rows;
const drops = [];

// Init drops for each column
for (let x = 0; x < columns; x++) {
    drops[x] = Math.floor(Math.random() * rows);
}

setInterval(() => {
    // Set text color to green
    process.stdout.write('\x1b[32m');

    // Loop over columns
    for (let i = 0; i < columns; i++) {
        // Randomly choose a Katakana character
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);

        // Move cursor to the current position
        process.stdout.cursorTo(i, drops[i]);

        // Print the character
        process.stdout.write(char);

        // Reset cursor position to avoid overflow
        process.stdout.cursorTo(0, 0);

        // Randomly reset the drop
        if (drops[i] > rows || Math.random() > 0.975) {
            drops[i] = 0;
        } else {
            drops[i]++;
        }
    }
}, 50);
