import { ChildProcess, spawn } from "child_process";
import { compileTs } from "./compiler";

interface RunFileOptions {
  entryFile: string;
  build?: {
    outdir: string;
    mode: "build";
  };
  watch?: boolean;
}

export async function runFile(options: RunFileOptions): Promise<ChildProcess> {
  try {
    const outFile = await compileTs(options.entryFile);
    if (!outFile || typeof outFile !== "string") {
      throw new Error("Expected compiled output file path, but got nothing");
    }
    const child = spawn("node", [outFile], {
      stdio: "inherit",
    });
    child.on("error", (err: any) => {
      console.error("Failed to start subprocess.", err);
    });
    return child;
  } catch (error) {
    throw error;
  }
}
