import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuid } from "uuid";

// ! Use the operating system's temporary directory.

const TEMP_DIR = path.join(
    os.tmpdir(),
    "codebox"
);


// ! ENSURE TEMP DIRECTORY EXISTS

export async function ensureTempDirectory() {

    try {

        await fs.access(TEMP_DIR);

    }

    catch {

        await fs.mkdir(
            TEMP_DIR,
            {
                recursive: true
            }
        );

    }

}


// ! GET TEMP DIRECTORY

export function getTempDirectory() {

    return TEMP_DIR;

}

export async function createWorkingDirectory() {

    await ensureTempDirectory();

    const id = uuid();

    const workingDirectory = path.join(
        TEMP_DIR,
        id
    );

    await fs.mkdir(
        workingDirectory,
        {
            recursive: true
        }
    );

    return workingDirectory;

}


export async function writeSource(
    directory,
    filename,
    code
) {

    const filePath = path.join(
        directory,
        filename
    );

    await fs.writeFile(
        filePath,
        code,
        "utf8"
    );

    return filePath;

}

export async function writeInput(
    directory,
    stdin
) {

    const inputFile = path.join(
        directory,
        "input.txt"
    );

    await fs.writeFile(
        inputFile,
        stdin ?? "",
        "utf8"
    );

    return inputFile;

}


export async function cleanup(directory) {

    if (!directory) {
        return;
    }

    try {

        await fs.rm(
            directory,
            {
                recursive: true,
                force: true
            }
        );

    }

    catch (err) {

        console.error(
            "Failed to cleanup working directory:",
            err
        );

    }

}