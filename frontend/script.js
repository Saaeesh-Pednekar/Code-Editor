/* ============================================================
   STARTER TEMPLATES
   ============================================================ */
const TEMPLATES = {
python: `print("Hello, World!")`,
cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
};

const LANG_META = {
  python: { file: 'run.py', ext: '.py', mode: 'python', color: '#8FB08B' },
  cpp:    { file: 'run.cpp', ext: '.cpp', mode: 'text/x-c++src', color: '#D8A657' },
  java:   { file: 'run.java', ext: '.java', mode: 'text/x-java', color: '#8FB6C9' }
};

// ! State of the code and creates temporary storage
const state = {
    lang: sessionStorage.getItem("codebox-language") || "python",
    code: {
        python:
            sessionStorage.getItem("codebox-python")
            || TEMPLATES.python,
        cpp:
            sessionStorage.getItem("codebox-cpp")
            || TEMPLATES.cpp,
        java:
            sessionStorage.getItem("codebox-java")
            || TEMPLATES.java
    }
};

const API = "http://localhost:5000/api";
// const API = "https://your-server.onrender.com/api";

let backendOnline = false;

// ! Backend Check Function
async function checkBackend() {

    try {
        const response = await fetch("http://localhost:5000/");
        backendOnline = response.ok;
    }

    catch {
        backendOnline = false;
    }

    if (!backendOnline) {
        stState.textContent = "Backend Offline";
        statusbar.classList.add("err");
    }

    else {
        statusbar.classList.remove("err");
        if (!runBtn.disabled) {
            stState.textContent = "Ready";
        }
    }
}

// ! CodeMirror Properties
const cm = CodeMirror(document.getElementById("editorHost"), {
    value: state.code[state.lang],
    mode: LANG_META[state.lang].mode,
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    viewportMargin: Infinity,

    extraKeys: {
        "Cmd-Enter": runCurrent,
        "Ctrl-Enter": runCurrent
    }
});

// ! Change the language
cm.on("change", () => {
    const code = cm.getValue();
    state.code[state.lang] = code;
    sessionStorage.setItem(
        `codebox-${state.lang}`,
        code
    );
});

/* ============================================================
   TABS
   ============================================================ */
const tabsEl = document.getElementById('tabs');
Object.keys(LANG_META).forEach(lang => {
  const m = LANG_META[lang];
  const el = document.createElement('div');
  el.className = 'tab' + (lang === state.lang ? ' active' : '');
  el.dataset.lang = lang;
  el.style.setProperty('--lang-color', m.color);
  el.innerHTML = `<span class="swatch"></span>${m.file.split('.')[0]}<span class="ext">.${m.ext.replace('.', '')}</span>`;
  el.addEventListener('click', () => switchLang(lang));
  tabsEl.appendChild(el);
});

// ! Function to switch language
function switchLang(lang) {

    if (lang === state.lang) return;

    // Save current language's code
    state.code[state.lang] = cm.getValue();
    sessionStorage.setItem(
        `codebox-${state.lang}`,
        state.code[state.lang]
    );

    // Change language
    state.lang = lang;
    sessionStorage.setItem(
        "codebox-language",
        lang
    );

    const m = LANG_META[lang];
    cm.setOption("mode", m.mode);
    cm.setValue(state.code[lang]);

    document.getElementById("editorLabel").textContent = m.file;
    document.querySelectorAll(".tab")
        .forEach(t =>
            t.classList.toggle(
                "active",
                t.dataset.lang === lang
            )
        );

    document.getElementById("stLang").textContent = "● " + lang[0].toUpperCase() + lang.slice(1);
    document.getElementById("simNotice").style.display = "none";
    document.getElementById("toggleJs").style.display = "none";
    document.getElementById("jsOutput").style.display = "none";
}

// ! Console Status Helpers
const consoleEl = document.getElementById("console");
const statusbar = document.getElementById("statusbar");
const stState = document.getElementById("stState");
const stTime = document.getElementById("stTime");
const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");

// ============================================================
// PREVENT BUTTONS FROM SUBMITTING / RELOADING THE PAGE
// ============================================================

if (runBtn) {
    runBtn.type = "button";
}

if (clearBtn) {
    clearBtn.type = "button";
}

// Prevent any form containing these controls from submitting.
document.addEventListener("submit", function (event) {

    if (
        event.target.contains(runBtn) ||
        event.target.contains(clearBtn)
    ) {
        event.preventDefault();
        event.stopPropagation();
    }

}, true);

// ! Set Console Function
function setConsole(text, cls){
  consoleEl.textContent = '';
  if(cls) consoleEl.innerHTML = `<span class="${cls}">${escapeHtml(text)}</span>`;
  else consoleEl.textContent = text;
}

// ! Append Console Function
function appendConsole(text, cls){
  const span = document.createElement('span');
  if(cls) span.className = cls;
  span.textContent = text;
  consoleEl.appendChild(span);
}

// ! Escape Html Function
function escapeHtml(s){
    return String(s).replace(/[&<>]/g,c=>({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;"
    })[c]);
}

// ! Set Busy Function
function setBusy(isBusy) {

    runBtn.disabled = isBusy;
    runBtn.classList.toggle("running", isBusy);

    if (!isBusy) {
        runBtn.textContent = "▶ Run";
        return;
    }

    if (state.lang === "python") {
        runBtn.textContent = "Running...";
        stState.textContent = "Running Python";
    } 
    else {
        runBtn.textContent = "Compiling...";
        stState.textContent = "Compiling";
    }
}

// ! Function to display error
function setErrState(isErr){
  statusbar.classList.toggle('err', isErr);
}

// ! Clear Button
document.getElementById("clearBtn").addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    consoleEl.innerHTML =
        '<span class="placeholder">Run a program to see output here.</span>';

    stTime.textContent = "";
    setErrState(false);
});

// ! Run Button
document.getElementById("runBtn").addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    runCurrent();
});

// ! Run Current Function
async function runCurrent(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (runBtn.disabled) return;

    const lang = state.lang;
    const code = cm.getValue();
    const stdin = document.getElementById("stdin").value;
    // IMPORTANT:
    // Save the latest code before execution.
    state.code[lang] = code;
    setBusy(true);
    setErrState(false);
    setConsole("", null);

    try {
        let result;

        switch (lang) {
            case "python":
                result = await runPython(code, stdin);
                break;

            case "cpp":
                result = await runCpp(code, stdin);
                break;

            case "java":
                result = await runJava(code, stdin);
                break;

            default:
                throw new Error("Unsupported language.");
        }
        displayResult(result);
    }

    catch (err) {

        appendConsole(
            err?.message || "Unknown error.",
            "line-err"
        );
        setErrState(true);

    }

    finally {
        setBusy(false);
    }
}

// ! Running Python Code
async function runPython(code, stdin) {

    try {
        const response = await fetch(`${API}/python`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                stdin
            })
        });

        if (!response.ok) {
            throw new Error("Compiler server error.");
        }
        return await response.json();

    }

    catch (err) {
        return {
            success: false,
            type: "server_error",
            language: "python",
            output: "",
            error: err.message,
            exitCode: -1,
            executionTime: 0
        };
    }
}

// ! Running CPP Code
async function runCpp(code, stdin) {

    try {
        const response = await fetch(`${API}/cpp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                stdin
            })
        });

        if (!response.ok) {
            throw new Error("Compiler server error.");
        }
        return await response.json();
    }

    catch (err) {
        return {
            success: false,
            type: "server_error",
            language: "cpp",
            output: "",
            error: err.message,
            exitCode: -1,
            executionTime: 0
        };
    }
}

// ! Running Java Code
async function runJava(code, stdin) {

    try {
        const response = await fetch(`${API}/java`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                stdin
            })
        });

        if (!response.ok) {
            throw new Error("Compiler server error.");
        }
        return await response.json();
    }

    catch (err) {
        return {
            success: false,
            type: "server_error",
            language: "java",
            output: "",
            error: err.message,
            exitCode: -1,
            executionTime: 0
        };
    }
}

// ! Function to display the output
function displayResult(result){

    consoleEl.innerHTML = "";
    setErrState(false);

    if(result.type === "success"){
      const output = result.output ?? "";

        if(output.trim().length){
            appendConsole(output);
        }

        else{
            appendConsole("(Program exited successfully)", "placeholder");
        }
    }

    else{

        switch(result.type){

          case "compile_error":
          appendConsole(
          "❌ Compilation Failed\n\n",
          "line-err");
          appendConsole(result.error,"line-err");
          break;

          case "runtime_error":
          appendConsole(
          "⚠ Runtime Error\n\n",
          "line-err");
          appendConsole(result.error,"line-err");
          break;

          case "timeout":
          appendConsole(
          "⌛ Execution Timed Out\n\n",
          "line-err");
          appendConsole(result.error,"line-err");
          break;

          case "interpreter_error":
          appendConsole(
          "⚠ Interpreter Not Found\n\n",
          "line-err");
          appendConsole(result.error,"line-err");
          break;

          case "server_error":
          appendConsole(
          "⚠ Backend Offline\n\n",
          "line-err");
          appendConsole(result.error,"line-err");
          break;

          default:
          appendConsole(
            "⚠ Unknown Error\n\n",
            "line-err"
          );
          appendConsole(
            result.error || "Unknown compiler response.",
            "line-err"
          );
          break;
        }

        setErrState(true);

    }

    stTime.textContent =
        `${result.executionTime} ms`;

    stState.textContent =
    `${result.language.toUpperCase()} | Exit ${result.exitCode}`;

}

checkBackend();

setInterval(checkBackend, 10000);