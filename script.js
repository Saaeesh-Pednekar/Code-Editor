let editor;
let pyodide;

// 1. Initialise Monaco Editor
require.config({ paths: { 'vs': 'https://cloudflare.com' } });
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: `def greet(name):\n return f"Hello, {name} from the browser!"\n\nprint(greet("Developer"))\r\n\r\n# Try math operations\r\nimport math\r\nprint("Pi is:", math.pi)`,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
});

// 2. Initialise Pyodide Python WASM Engine
async function initPython() {
    try {
        pyodide = await loadPyodide();
        document.getElementById('status').innerText = "Python ready. Click Run!";
        document.getElementById('run-btn').disabled = false;
    } catch (err) {
        document.getElementById('status').innerText = "Failed to load Python.";
        console.error(err);
    }
}
initPython();

// 3. Execute Code and Intercept Standard Output
document.getElementById('run-btn').addEventListener('click', async () => {
    const outputDiv = document.getElementById('output');
    outputDiv.innerText = "Running...\n";
    const userCode = editor.getValue();
    
    try {
        // Redirect python print() statements directly to our HTML div
        pyodide.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
            sys.stderr = io.StringIO()
        `);

        // Run the user's script
        await pyodide.runPythonAsync(userCode);

        // Fetch stdout logs from the redirect tool
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        outputDiv.innerText = stdout + stderr;
    } catch (err) {
        outputDiv.innerText = err.message;
    }
});
