/* ============================================================
   STARTER TEMPLATES
   ============================================================ */
const TEMPLATES = {
python: `# Python — this one runs for real, via Pyodide (WebAssembly)
print("Hello, World!")
`,
cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
}
`,
java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`
};

const LANG_META = {
  python: { file: 'run.py', ext: '.py', mode: 'python', color: '#8FB08B' },
  cpp:    { file: 'run.cpp', ext: '.cpp', mode: 'text/x-c++src', color: '#D8A657' },
  java:   { file: 'run.java', ext: '.java', mode: 'text/x-java', color: '#8FB6C9' }
};

const state = {
  lang: 'python',
  code: { python: TEMPLATES.python, cpp: TEMPLATES.cpp, java: TEMPLATES.java },
  pyodide: null,
  pyodideLoading: false
};

/* ============================================================
   EDITOR (CodeMirror)
   ============================================================ */
const cm = CodeMirror(document.getElementById('editorHost'), {
  value: state.code.python,
  mode: 'python',
  lineNumbers: true,
  indentUnit: 4,
  tabSize: 4,
  indentWithTabs: false,
  viewportMargin: Infinity,
  extraKeys: {
    'Cmd-Enter': runCurrent,
    'Ctrl-Enter': runCurrent
  }
});

cm.on('change', () => { state.code[state.lang] = cm.getValue(); });

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

function switchLang(lang){
  if(lang === state.lang) return;
  state.code[state.lang] = cm.getValue();
  state.lang = lang;
  const m = LANG_META[lang];
  cm.setOption('mode', m.mode);
  cm.setValue(state.code[lang]);
  document.getElementById('editorLabel').textContent = m.file;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.lang === lang));
  document.getElementById('stLang').textContent = '● ' + lang[0].toUpperCase() + lang.slice(1);
  document.getElementById('simNotice').classList.toggle('hidden', lang === 'python');
  document.getElementById('toggleJs').style.display = lang === 'python' ? 'none' : '';
  document.getElementById('jsOutput').style.display = 'none';
  document.getElementById('toggleJs').textContent = 'view generated JS';
}

/* ============================================================
   CONSOLE / STATUS HELPERS
   ============================================================ */
const consoleEl = document.getElementById('console');
const statusbar = document.getElementById('statusbar');
const stState = document.getElementById('stState');
const stTime = document.getElementById('stTime');
const runBtn = document.getElementById('runBtn');

function setConsole(text, cls){
  consoleEl.textContent = '';
  if(cls) consoleEl.innerHTML = `<span class="${cls}">${escapeHtml(text)}</span>`;
  else consoleEl.textContent = text;
}
function appendConsole(text, cls){
  const span = document.createElement('span');
  if(cls) span.className = cls;
  span.textContent = text;
  consoleEl.appendChild(span);
}
function escapeHtml(s){
  return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}
function setBusy(isBusy){
  runBtn.disabled = isBusy;
  runBtn.classList.toggle('running', isBusy);
  runBtn.textContent = isBusy ? '■ Running…' : '▶ Run';
  statusbar.classList.toggle('busy', isBusy);
  stState.textContent = isBusy ? 'running' : 'idle';
}
function setErrState(isErr){
  statusbar.classList.toggle('err', isErr);
}

document.getElementById('clearBtn').addEventListener('click', () => {
  setConsole('', null);
  consoleEl.innerHTML = '<span class="placeholder">Run a program to see output here.</span>';
  document.getElementById('jsOutput').style.display = 'none';
  document.getElementById('toggleJs').textContent = 'view generated JS';
});
document.getElementById('runBtn').addEventListener('click', runCurrent);
document.getElementById('toggleJs').addEventListener('click', () => {
  const box = document.getElementById('jsOutput');
  const link = document.getElementById('toggleJs');
  const showing = box.style.display !== 'none';
  box.style.display = showing ? 'none' : 'block';
  link.textContent = showing ? 'view generated JS' : 'hide generated JS';
});

/* ============================================================
   RUN DISPATCH
   ============================================================ */
async function runCurrent(){
  if(runBtn.disabled) return;
  const lang = state.lang;
  const code = cm.getValue();
  const stdin = document.getElementById('stdin').value;
  setBusy(true);
  setErrState(false);
  setConsole('', null);
  const t0 = performance.now();
  try{
    if(lang === 'python'){
      await runPython(code, stdin);
    } else if(lang === 'cpp'){
      runTranspiled('cpp', code, stdin);
    } else if(lang === 'java'){
      runTranspiled('java', code, stdin);
    }
  } catch(e){
    appendConsole('\n' + (e && e.message ? e.message : String(e)), 'line-err');
    setErrState(true);
  } finally {
    const dt = (performance.now() - t0).toFixed(0);
    stTime.textContent = dt + ' ms';
    setBusy(false);
  }
}

/* ============================================================
   PYTHON — real execution via Pyodide
   ============================================================ */
async function ensurePyodide(){
  if(state.pyodide) return state.pyodide;
  if(state.pyodideLoading){
    while(state.pyodideLoading) await new Promise(r => setTimeout(r, 100));
    return state.pyodide;
  }
  state.pyodideLoading = true;
  document.getElementById('loadState').textContent = ' — loading Python runtime…';
  setConsole('Loading Python (WebAssembly runtime, first run only)…', null);
  try{
    if(!window.loadPyodide){
      await loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    }
    state.pyodide = await loadPyodide();
    document.getElementById('loadState').textContent = ' — ready';
    setTimeout(() => document.getElementById('loadState').textContent = '', 1500);
    return state.pyodide;
  } catch(e){
    document.getElementById('loadState').textContent = ' — failed to load';
    throw new Error('Could not load the Python runtime (network/CDN blocked?): ' + e.message);
  } finally {
    state.pyodideLoading = false;
  }
}
function loadScript(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('script load failed: ' + src));
    document.head.appendChild(s);
  });
}

async function runPython(code, stdinText){
  const pyodide = await ensurePyodide();
  setConsole('', null);
  const lines = stdinText.split('\n');

  pyodide.setStdout({ batched: (msg) => appendConsole(msg + '\n', null) });
  pyodide.setStderr({ batched: (msg) => appendConsole(msg + '\n', 'line-err') });

  pyodide.globals.set('__stdin_lines', lines);
  try{
    await pyodide.runPythonAsync(`
import builtins, js
__lines = list(__stdin_lines)
__idx = 0
def __input(prompt=''):
    global __idx
    if prompt:
        print(prompt, end='')
    if __idx < len(__lines):
        v = __lines[__idx]
        __idx += 1
        return v
    return ''
builtins.input = __input
`);
    await pyodide.runPythonAsync(code);
    if(consoleEl.textContent.trim() === '' && !consoleEl.querySelector('span')){
      appendConsole('(no output)', 'placeholder');
    }
  } catch(e){
    appendConsole('\n' + formatPyError(e), 'line-err');
    setErrState(true);
  }
}
function formatPyError(e){
  const msg = e && e.message ? e.message : String(e);
  const lines = msg.split('\n').filter(Boolean);
  return lines[lines.length - 1] || msg;
}

/* ============================================================
   SHARED TRANSPILE HELPERS
   ============================================================ */
function splitTopLevel(str, ops){
  const parts = []; let cur = ''; let depth = 0; let inStr = false; let strCh = '';
  for(let i = 0; i < str.length; i++){
    const c = str[i];
    if(inStr){
      cur += c;
      if(c === strCh && str[i-1] !== '\\') inStr = false;
      continue;
    }
    if(c === '"' || c === "'"){ inStr = true; strCh = c; cur += c; continue; }
    if(c === '(' || c === '['){ depth++; cur += c; continue; }
    if(c === ')' || c === ']'){ depth--; cur += c; continue; }
    if(depth === 0){
      let matched = false;
      for(const op of ops){
        if(str.slice(i, i + op.length) === op){
          parts.push(cur); cur = ''; i += op.length - 1; matched = true; break;
        }
      }
      if(matched) continue;
    }
    cur += c;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}
function extractBraceBlock(src, openBraceIndex){
  let depth = 0;
  for(let i = openBraceIndex; i < src.length; i++){
    if(src[i] === '{') depth++;
    else if(src[i] === '}'){ depth--; if(depth === 0) return { body: src.slice(openBraceIndex + 1, i) }; }
  }
  return { body: src.slice(openBraceIndex + 1) };
}
function injectLoopGuards(code){
  code = code.replace(/for\s*\(([^;{}]*);([^;{}]*);([^){}]*)\)\s*\{/g,
    (m,a,b,c) => `for(${a};${b};${c}){ if(++__iterObj.v > __MAXIT) throw new Error('Iteration limit exceeded — possible infinite loop'); `);
  code = code.replace(/while\s*\(([^){}]*)\)\s*\{/g,
    (m,c) => `while(${c}){ if(++__iterObj.v > __MAXIT) throw new Error('Iteration limit exceeded — possible infinite loop'); `);
  return code;
}
const TYPE_WORDS = '(?:int|long long|long|short|double|float|char|bool|boolean|byte|void|auto|size_t)';

/* ============================================================
   C++ -> JS transpiler (simplified, syntax-subset)
   ============================================================ */
function transpileCpp(src){
  let code = src;
  code = code.replace(/^\s*#.*$/gm, '');
  code = code.replace(/using\s+namespace\s+std\s*;/g, '');
  code = code.replace(/std::/g, '');
  code = code.replace(/vector\s*<[^<>]*>\s*([A-Za-z_]\w*)/g, 'let $1 = []');
  code = code.replace(new RegExp('\\b' + TYPE_WORDS + '\\s+([A-Za-z_]\\w*)\\s*\\(', 'g'), 'function $1(');
  code = code.replace(/cout\s*<<([\s\S]*?);/g, (m, g) => {
    const parts = splitTopLevel(g, ['<<']);
    return `output(${parts.join(', ')});`;
  });
  code = code.replace(/cin\s*>>([\s\S]*?);/g, (m, g) => {
    const parts = splitTopLevel(g, ['>>']);
    return parts.map(v => `${v} = __input();`).join(' ');
  });
  code = code.replace(/\.push_back\(/g, '.push(');
  code = code.replace(/\.size\(\)/g, '.length');
  code = code.replace(/\bnullptr\b/g, 'null');
  code = code.replace(/\bNULL\b/g, 'null');
  code = code.replace(new RegExp('\\b' + TYPE_WORDS + '\\b\\s*[&*]?\\s*', 'g'), '');
  code = code.replace(/\bstring\b\s*/g, '');
  code = injectLoopGuards(code);
  if(/function\s+main\s*\(/.test(code)) code += '\nmain();\n';
  return code;
}

/* ============================================================
   Java -> JS transpiler (simplified, syntax-subset)
   ============================================================ */
function transpileJava(src){
  let code = src.replace(/^\s*(import|package)\s+.*$/gm, '');

  const mainSig = /(?:public\s+)?(?:static\s+)?(?:public\s+)?void\s+main\s*\([^)]*\)\s*\{/;
  const m = mainSig.exec(code);
  let body;
  if(m){
    body = extractBraceBlock(code, m.index + m[0].length - 1).body;
  } else {
    body = code; // fallback: treat whole snippet as body
  }

  body = body.replace(/Scanner\s+\w+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)\s*;/g, '');
  body = body.replace(/\.nextInt\(\)/g, "parseInt(__input())");
  body = body.replace(/\.nextDouble\(\)/g, "parseFloat(__input())");
  body = body.replace(/\.next(?:Line)?\(\)/g, '__input()');

  body = body.replace(/System\.out\.println\(([\s\S]*?)\);/g, (m, g) => g.trim() ? `output(${g}, '\\n');` : `output('\\n');`);
  body = body.replace(/System\.out\.print\(([\s\S]*?)\);/g, (m, g) => `output(${g});`);
  body = body.replace(/System\.out\.printf\(([\s\S]*?)\);/g, (m, g) => {
    const parts = splitTopLevel(g, [',']);
    const fmt = parts[0];
    const rest = parts.slice(1);
    return `output(__sprintf(${fmt}, [${rest.join(', ')}]));`;
  });

  body = body.replace(/new\s+(?:ArrayList|LinkedList)\s*<[^<>]*>\s*\(\s*\)/g, '[]');
  body = body.replace(/new\s+(?:HashMap|TreeMap)\s*<[^<>]*,[^<>]*>\s*\(\s*\)/g, '{}');
  body = body.replace(/(?:ArrayList|List|LinkedList)\s*<[^<>]*>\s*/g, 'let ');
  body = body.replace(/(?:HashMap|Map|TreeMap)\s*<[^<>]*,[^<>]*>\s*/g, 'let ');
  body = body.replace(/\.add\(/g, '.push(');
  body = body.replace(/\.get\(([^()]*)\)/g, '[$1]');
  body = body.replace(/\.size\(\)/g, '.length');

  body = body.replace(new RegExp('\\b' + TYPE_WORDS + '\\b\\s*(\\[\\])?\\s*', 'g'), '');
  body = body.replace(/\bString\b\s*(\[\])?\s*/g, '');
  body = body.replace(/\bvar\b\s*/g, '');
  body = body.replace(/\bnull\b/g, 'null');

  body = injectLoopGuards(body);
  return `function main(){\n${body}\n}\nmain();`;
}

/* ============================================================
   RUNTIME for transpiled code
   ============================================================ */
function sprintfImpl(fmt, args){
  let i = 0;
  return String(fmt).replace(/%(\.\d+)?([dsfc%])/g, (m, prec, type) => {
    if(type === '%') return '%';
    const val = args[i++];
    if(type === 'd') return String(parseInt(val));
    if(type === 'f'){ const p = prec ? parseInt(prec.slice(1)) : 6; return Number(val).toFixed(p); }
    if(type === 's') return String(val);
    if(type === 'c') return typeof val === 'number' ? String.fromCharCode(val) : String(val);
    return m;
  });
}

function runTranspiled(lang, sourceCode, stdinText){
  const jsBody = lang === 'cpp' ? transpileCpp(sourceCode) : transpileJava(sourceCode);
  document.getElementById('jsOutput').textContent = jsBody;

  const stdinTokens = (stdinText || '').split(/\s+/).filter(Boolean);
  let stdinPtr = 0;
  const __input = () => stdinPtr < stdinTokens.length ? stdinTokens[stdinPtr++] : '';
  const printf = (fmt, ...args) => output(sprintfImpl(fmt, args));
  const endl = '\n';
  const __iterObj = { v: 0 };
  const __MAXIT = 2000000;

  let hadOutput = false;
  function output(...args){
    hadOutput = true;
    appendConsole(args.map(a => a === undefined ? '' : String(a)).join(''), null);
  }

  try{
    const fn = new Function('output', '__input', '__sprintf', 'printf', 'endl', '__iterObj', '__MAXIT', jsBody);
    fn(output, __input, sprintfImpl, printf, endl, __iterObj, __MAXIT);
    if(!hadOutput) appendConsole('(no output)', 'placeholder');
  } catch(e){
    appendConsole((hadOutput ? '\n' : '') + 'Runtime error: ' + e.message, 'line-err');
    setErrState(true);
  }
}

/* init */
document.getElementById('simNotice').classList.remove('hidden');