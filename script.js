const inputElement = document.getElementById('terminal-input');
const historyElement = document.getElementById('history');

// Automatically focus the input field on click anywhere inside terminal
function focusInput() {
    inputElement.focus();
}

// Intercept the "Enter" key press
inputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const command = inputElement.value.trim();
        if (command) {
            logToTerminal(`js-user:$ ${command}`);
            executeCommand(command);
        }
        inputElement.value = ''; // Clear line
        window.scrollTo(0, document.body.scrollHeight); // Auto-scroll down
    }
});

// Write log blocks to the terminal layout
function logToTerminal(text, isError = false) {
    const line = document.createElement('div');
    line.textContent = text;
    if (isError) line.style.color = '#ff3333';
    historyElement.appendChild(line);
}

// Engine to process commands or evaluate JS
function executeCommand(cmd) {
    // Custom predefined system commands
    switch(cmd.toLowerCase()) {
        case 'help':
            logToTerminal("Available commands: 'help', 'clear', or type any valid JavaScript expression (e.g. '2 + 2')");
            return;
        case 'clear':
            historyElement.innerHTML = '';
            return;
    }

    // Evaluate JavaScript commands dynamically
    try {
        // Redirect evaluation to safe function instantiation scope
        const result = new Function(`return (${cmd})`)();
        logToTerminal(result !== undefined ? String(result) : 'undefined');
    } catch (error) {
        logToTerminal(`Error: ${error.message}`, true);
    }
}
