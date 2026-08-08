# Codebox — Multi-Language Online Code Runner

Codebox is a full-stack, containerized online code execution platform that allows users to write, compile, and execute **Python, C++, and Java** programs directly from a browser-based code editor.

The platform uses **CodeMirror** for the editor, **Nginx** for serving the frontend and reverse-proxying API requests, and an **Express.js backend** that executes programs using the actual language runtimes and compilers — `python3`, `g++`, and `javac`/JVM.

Unlike a JavaScript-based language simulator, Codebox provides real compiler and interpreter execution, producing genuine compilation errors, runtime errors, standard output, and exit codes.

---

## 🚀 Features

- Multi-language online code editor
- Python support using the real `python3` interpreter
- C++ support using the real `g++` compiler
- Java support using `javac` and the JVM
- CodeMirror-based syntax-highlighted editor
- Language switching between Python, C++, and Java
- Standard input support
- Real compiler errors and warnings
- Runtime error reporting
- Execution timeout handling
- Exit code reporting
- Execution time measurement
- Keyboard execution using `Ctrl + Enter` / `Cmd + Enter`
- Separate temporary workspace for every execution
- Automatic cleanup of temporary compiler files
- Express.js REST API
- Nginx frontend server and reverse proxy
- Dockerized frontend and backend
- Docker Compose orchestration
- Dedicated Docker bridge network
- Backend CPU and memory limits

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         │                     │
                         │   CodeMirror Editor │
                         └──────────┬──────────┘
                                    │
                              HTTP :8080
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │    Frontend Container     │
                    │                            │
                    │          Nginx             │
                    │                            │
                    │ HTML / CSS / JavaScript    │
                    │ CodeMirror                 │
                    └─────────────┬──────────────┘
                                  │
                              /api/*
                                  │
                         Docker Bridge Network
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     Backend Container      │
                    │                            │
                    │       Express :5000        │
                    │                            │
                    │ ┌────────────────────────┐ │
                    │ │ Python 3               │ │
                    │ │ GCC / g++              │ │
                    │ │ OpenJDK / javac        │ │
                    │ └────────────────────────┘ │
                    └─────────────┬──────────────┘
                                  │
                         Temporary Workspace
                                  │
                                  ▼
                         /tmp/codebox/<UUID>/