import { spawn } from "child_process";
import { compileTs } from "./compiler";

interface RunFileOptions {
  entryFile: string;
  build?: {
    outdir: string;
    mode: "build";
  };
  watch?: boolean;
}

export async function runFile(options: RunFileOptions): Promise<void> {
  try {
    const outFile = await compileTs(options.entryFile);
    if (!outFile || typeof outFile !== "string") {
      throw new Error("Expected compiled output file path, but got nothing");
    }

    return new Promise((resolve, reject) => {
      const child = spawn("node", [outFile], { stdio: "inherit" });

      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
      child.on("error", reject);
    });
  } catch (error) {}
}
