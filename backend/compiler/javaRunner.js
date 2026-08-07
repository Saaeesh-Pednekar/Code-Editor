import { spawn } from "child_process";

import {
    createWorkingDirectory,
    writeSource,
    cleanup
} from "../utils/fileManager.js";

const JAVA_FILE = "Main.java";

const JAVAC = "javac";
const JAVA = "java";

export async function runJava(code, stdin = "") {

    const workingDirectory = await createWorkingDirectory();

    try {

        const sourceFile = await writeSource(
            workingDirectory,
            JAVA_FILE,
            code
        );

        const compileResult = await compileJava(
            sourceFile,
            workingDirectory
        );

        if (!compileResult.success) {

            return compileResult;

        }

        return await executeJava(
            workingDirectory,
            stdin
        );

    }

    finally {

        await cleanup(workingDirectory);

    }

}

function compileJava(sourceFile, cwd) {

    return new Promise((resolve) => {

        const start = Date.now();

        const compiler = spawn(

            JAVAC,

            [sourceFile],

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

                language: "java",

                output: "",

                error:
                    "javac compiler not found.\n\n" +
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

                    language: "java",

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

                    language: "java",

                    output: "",

                    error: errors,

                    exitCode: code,

                    executionTime: Date.now() - start

                });

            }

        });

    });

}

function executeJava(cwd, stdin) {

    return new Promise((resolve) => {

        const start = Date.now();

        const runner = spawn(

            JAVA,

            ["Main"],

            {
                cwd
            }

        );

        let stdout = "";

        let stderr = "";

        runner.stdout.on("data", data => {

            stdout += data.toString();

        });

        runner.stderr.on("data", data => {

            stderr += data.toString();

        });

        runner.on("error", err => {

            resolve({

                success: false,

                type: "runtime_error",

                language: "java",

                output: "",

                error: err.message,

                exitCode: -1,

                executionTime: Date.now() - start

            });

        });

        if (stdin) {

            runner.stdin.write(stdin);

        }

        runner.stdin.end();

        const timeout = setTimeout(() => {

            runner.kill("SIGKILL");

            resolve({

                success: false,

                type: "timeout",

                language: "java",

                output: "",

                error: "Execution timed out (5 seconds).",

                exitCode: -1,

                executionTime: Date.now() - start

            });

        }, 5000);

        runner.on("close", code => {

            clearTimeout(timeout);

            resolve({

                success: code === 0,

                type: code === 0
                    ? "success"
                    : "runtime_error",

                language: "java",

                output: stdout.trimEnd(),

                error: stderr.trimEnd(),

                exitCode: code,

                executionTime: Date.now() - start

            });

        });

    });

}