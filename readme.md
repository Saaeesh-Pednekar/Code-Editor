Project Architecture


CodeBox/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js          
│
└── backend/
    ├── package.json
    ├── server.js
    ├── routes/
    │    ├── runPython.js
    │    ├── runCpp.js
    │    └── runJava.js
    │
    ├── compiler/
    │    ├── pythonRunner.js
    │    ├── cppRunner.js
    │    └── javaRunner.js
    │
    ├── utils/
    │    └── fileManager.js
    │
    └── temp/