import { spawn } from "child_process";

import {
    createWorkingDirectory,
    writeSource,
    cleanup
} from "../utils/fileManager.js";

const PYTHON_COMMAND =
    process.platform === "win32"
        ? "python"
        : "python3";

export async function runPython(code, stdin = "") {

    const workingDirectory = await createWorkingDirectory();

    try {

        const sourceFile = await writeSource(
            workingDirectory,
            "main.py",
            code
        );

        return await executePython(
            sourceFile,
            stdin,
            workingDirectory
        );

    } finally {

        await cleanup(workingDirectory);

    }

}

function executePython(sourceFile, stdin, cwd) {

    return new Promise((resolve) => {

        const start = Date.now();

        const python = spawn(

            PYTHON_COMMAND,

            [sourceFile],

            {
                cwd
            }

        );

        let stdout = "";
        let stderr = "";

        // Capture stdout
        python.stdout.on("data", (data) => {

            stdout += data.toString();

        });

        // Capture stderr
        python.stderr.on("data", (data) => {

            stderr += data.toString();

        });

        // Python interpreter not found
        python.on("error", (err) => {

            resolve({

                success: false,

                type: "interpreter_error",

                language: "python",

                output: "",

                error: err.message,

                exitCode: -1,

                executionTime: Date.now() - start

            });

        });

        // Pass stdin
        if (stdin) {

            python.stdin.write(stdin);

        }

        python.stdin.end();

        // Timeout protection
        const timeout = setTimeout(() => {

            python.kill("SIGKILL");

            resolve({

                success: false,

                type: "timeout",

                language: "python",

                output: "",

                error: "Execution timed out (5 seconds).",

                exitCode: -1,

                executionTime: Date.now() - start

            });

        }, 5000);

        // Program finished
        python.on("close", (code) => {

            clearTimeout(timeout);

            resolve({

                success: code === 0,

                type: code === 0
                    ? "success"
                    : "runtime_error",

                language: "python",

                output: stdout.trimEnd(),

                error: stderr.trimEnd(),

                exitCode: code,

                executionTime: Date.now() - start

            });

        });

    });

}