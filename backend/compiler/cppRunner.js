import { spawn } from "child_process";
import path from "path";

import {
    createWorkingDirectory,
    writeSource,
    cleanup
} from "../utils/fileManager.js";

const CPP_FILE = "main.cpp";

const EXE_FILE =
    process.platform === "win32"
        ? "main.exe"
        : "main";

const GPP = "g++";

export async function runCpp(code, stdin = "") {

    const workDir = await createWorkingDirectory();

    try {

        const cppPath = await writeSource(
            workDir,
            CPP_FILE,
            code
        );

        const compileResult = await compileCpp(
            cppPath,
            workDir
        );

        if (!compileResult.success) {
            return compileResult;
        }

        return await executeCpp(
            workDir,
            stdin
        );

    } finally {

        await cleanup(workDir);

    }

}

function compileCpp(sourceFile, cwd) {

    return new Promise((resolve) => {

        const start = Date.now();

        const compiler = spawn(

            GPP,

            [
                sourceFile,
                "-std=c++17",
                "-O2",
                "-o",
                EXE_FILE
            ],

            {
                cwd
            }

        );

        let errors = "";

        compiler.stderr.on("data", data => {

            errors += data.toString();

        });

        compiler.on("error", err => {

            resolve({

                success: false,

                type: "compile_error",

                language: "cpp",

                output: "",

                error:
                    "g++ compiler not found.\n\n" +
                    err.message,

                exitCode: -1,

                executionTime: Date.now() - start

            });

        });

        compiler.on("close", code => {

            if (code === 0) {

                resolve({

                    success: true,

                    type: "success",

                    language: "cpp",

                    output: "",

                    error: "",

                    exitCode: 0,

                    executionTime: Date.now() - start

                });

            }

            else {

                resolve({

                    success: false,

                    type: "compile_error",

                    language: "cpp",

                    output: "",

                    error: errors,

                    exitCode: code,

                    executionTime: Date.now() - start

                });

            }

        });

    });

}

function executeCpp(cwd, stdin) {

    return new Promise((resolve) => {

        const start = Date.now();

        const executable =
            process.platform === "win32"
                ? path.join(cwd, EXE_FILE)
                : "./" + EXE_FILE;

        const processRunner = spawn(

            executable,

            [],

            {
                cwd
            }

        );

        let stdout = "";

        let stderr = "";

        processRunner.stdout.on("data", data => {

            stdout += data.toString();

        });

        processRunner.stderr.on("data", data => {

            stderr += data.toString();

        });

        processRunner.on("error", err => {

            resolve({

                success: false,

                type: "runtime_error",

                language: "cpp",

                output: "",

                error: err.message,

                exitCode: -1,

                executionTime: Date.now() - start

            });

        });

        processRunner.stdin.write(stdin);

        processRunner.stdin.end();

        const timeout = setTimeout(() => {

            processRunner.kill();

            resolve({

                success: false,

                type: "timeout",

                language: "cpp",

                output: "",

                error: "Execution timed out (5 seconds).",

                exitCode: -1,

                executionTime: Date.now() - start

            });

        }, 5000);

        processRunner.on("close", code => {

            clearTimeout(timeout);

            resolve({

                success: code === 0,

                type: code === 0
                    ? "success"
                    : "runtime_error",

                language: "cpp",

                output: stdout,

                error: stderr,

                exitCode: code,

                executionTime: Date.now() - start

            });

        });

    });

}