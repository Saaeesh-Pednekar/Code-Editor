import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const TEMP_DIR = path.join(process.cwd(), "temp");

export async function ensureTempDirectory() {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
}

export function getTempDirectory() {
    return TEMP_DIR;
}

export async function createWorkingDirectory() {

    await ensureTempDirectory();

    const id = uuid();

    const workingDirectory = path.join(TEMP_DIR, id);

    await fs.mkdir(workingDirectory);

    return workingDirectory;
}

export async function writeSource(directory, filename, code) {

    const filePath = path.join(directory, filename);

    await fs.writeFile(filePath, code, "utf8");

    return filePath;
}

export async function writeInput(directory, stdin) {

    const inputFile = path.join(directory, "input.txt");

    await fs.writeFile(inputFile, stdin ?? "", "utf8");

    return inputFile;
}

export async function cleanup(directory) {

    try {

        await fs.rm(directory, {
            recursive: true,
            force: true
        });

    } catch (err) {

        console.log(err);

    }

}