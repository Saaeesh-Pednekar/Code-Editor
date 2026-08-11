# 💻 Online Code Editor & Code Execution Platform

A full-stack online code editor that allows users to write, execute, and test programs directly from a web browser.

The platform provides a browser-based coding environment with support for multiple programming languages and communicates with a backend execution service through REST APIs. The backend is containerized using Docker, making the application easy to run consistently across development and deployment environments.

---

## 📌 Project Overview

The **Online Code Editor & Code Execution Platform** is designed to provide a lightweight browser-based programming environment similar to online coding platforms.

Users can:

- Write source code directly in the browser
- Select a programming language
- Execute the program
- Provide standard input
- View program output
- View compilation/runtime errors
- Receive execution status and results
- Run code without installing a compiler or interpreter locally

The project demonstrates the integration of:

- Frontend web development
- REST API communication
- Backend programming
- Code compilation and execution
- Process management
- Docker containerization
- Cloud deployment

---

## ✨ Features

### 📝 Code Editor

- Browser-based code editor
- Syntax-aware programming environment
- Code input and editing
- Language selection
- Clear and reset functionality

### ▶️ Code Execution

- Execute source code through the backend
- Support for multiple programming languages
- Compilation for compiled languages
- Direct execution for interpreted languages
- Standard input support
- Standard output capture

### ⚠️ Error Handling

The platform handles different types of execution errors:

- Compilation errors
- Runtime errors
- Syntax errors
- Invalid code
- Process failures
- Backend/API errors
- Execution timeouts

### ⏱️ Execution Control

Programs are executed as separate processes and the backend can control execution time.

This prevents a program from running indefinitely.

Example:

```text
User Code
   │
   ▼
Backend
   │
   ▼
Compile / Execute
   │
   ├── Success ──► Output
   │
   ├── Error ────► Error Message
   │
   └── Timeout ──► Execution Timeout


##☁️ Cloud Deployment

                   ┌───────────────────────┐
                   │       User Browser    │
                   └───────────┬───────────┘
                               │
                               │ HTTPS
                               ▼
                   ┌───────────────────────┐
                   │       Frontend        │
                   │       Web App         │
                   └───────────┬───────────┘
                               │
                               │ REST API
                               ▼
                   ┌───────────────────────┐
                   │       Backend         │
                   │   Code Execution API  │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │Compiler / Interpreter │
                   │ Python / C++ / Java   │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Execution Result     │
                   │ Output / Error / Time │
                   └───────────────────────┘

##🏗️ System Architecture

┌──────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                           │
│                                                          │
│       ┌──────────────┐   ┌──────────────┐                │
│       │ Code Editor  │   │ Language     │                │
│       │              │   │ Selector     │                │
│       └──────┬───────┘   └──────┬───────┘                │
│              │                  │                        │
│              └─────────┬────────┘                        │
│                        ▼                                 │
│                  Execute Button                          │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ HTTP POST
                        ▼
┌──────────────────────────────────────────────────────┐
│                    BACKEND API                       │
│                                                      │
│            Code Execution Endpoint                   │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │ Validate Request│                     │
│              └────────┬────────┘                     │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │ Select Language │                     │
│              └────────┬────────┘                     │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │ Compile / Run   │                     │
│              └────────┬────────┘                     │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │ Capture Output  │                     │
│              └────────┬────────┘                     │
└───────────────────────┼──────────────────────────────┘
                        │
                        ▼
                JSON Response
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                      │
│       Display Output / Error / Status                │
└──────────────────────────────────────────────────────┘

##🛠️ Technologies Used

####Frontend
1. HTML5
2. CSS3
3. JavaScript
4. Code editor UI
5. Fetch API

####Backend
1. Python
2. REST API
3. Backend web framework
4. Subprocess / process execution
5. JSON-based request and response handling


###Programming Languages Supported

The project is designed to execute multiple programming languages, including:

Python
C++
Java

###DevOps & Deployment

Docker
Docker Compose
Git
GitHub
Render
Vercel

##📂 Project Structure

code-editor/
│
├── frontend/
│   │
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   │
│   └── assets/
│
├── backend/
│   │
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
│
├── .gitignore
│
└── README.md


##🌐 Deployment Architecture

                  Internet
                     │
                     ▼
          ┌────────────────────┐
          │      Vercel        │
          │     Frontend       │
          └─────────┬──────────┘
                    │
                    │ HTTPS REST API
                    ▼
          ┌────────────────────┐
          │      Render        │
          │      Backend       │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ Code Execution     │
          │ Environment        │
          └────────────────────┘

##📊 Performance Considerations

Code execution performance depends on several factors:

Programming language
Compiler/interpreter startup time
Code complexity
Server CPU
Memory availability
Container startup time
Network latency
Backend implementation


##📈 Future Enhancements

The project can be extended with:

###👤 User Authentication
User registration
Login
JWT authentication
User profiles

###💾 Code Saving

Allow users to save programs.

###📚 Code History

Store previous submissions and execution results.

###🎨 Advanced Code Editor

Integrate a professional editor such as Monaco Editor.
Potential features:

Syntax highlighting
Autocomplete
Code formatting
IntelliSense
Line numbers
Multiple files

###📊 Execution Metrics

Display:
Execution time
Memory usage
CPU usage
Exit code

##🎯 Learning Outcomes

This project demonstrates practical knowledge of:

Full-stack web development
REST API development
HTTP communication
Client-server architecture
Backend programming
Process management
Compiler/interpreter execution
Docker
Docker Compose
Cloud deployment
API integration
Error handling
Application architecture
Basic DevOps practices

##👨‍💻 Author

Saaeesh Pednekar
Computer Science & Engineering

Interested in:
Software Development
Backend Development
Cloud & DevOps

##⭐ Acknowledgements

This project was developed as a practical full-stack project to understand:

Web application architecture
REST APIs
Code execution systems
Docker containerization
Cloud deployment
Frontend-backend integration