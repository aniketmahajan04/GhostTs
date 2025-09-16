import { ChildProcess, spawn } from "child_process";
import { compileTs } from "./compiler";
import {
  formatError,
  formatRuntimeError,
  formatTSDiagnostic,
} from "../errors/errors";
import { typeCheckWithAPI } from "./typeChecker";

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
    console.log("🔍 type checking...");
    const result = typeCheckWithAPI(options.entryFile);

    if (!result.success) {
      console.log(`❌ Found ${result.diagnostics.length} type error(s):\n`);

      for (const diagnostic of result.diagnostics) {
        console.error(formatTSDiagnostic(diagnostic));
      }

      process.exit(1);
    }

    const outFile = await compileTs(options.entryFile, { mode: "run" });
    if (!outFile || typeof outFile !== "string") {
      throw new Error("Expected compiled output file path, but got nothing");
    }
    const child = spawn("node", [outFile], {
      stdio: ["inherit", "pipe", "pipe"],
    });

    // Pipe stdout normally
    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    // catch runtime errors
    child.stderr.on("data", (data) => {
      const rawError = data.toString();
      const formatted = formatRuntimeError(rawError);
      console.error(formatted);
    });

    child.on("error", (err: any) => {
      console.error("Failed to start subprocess.", err);
    });

    return child;
  } catch (err: any) {
    // throw error;
    if (err.errors && Array.isArray(err.errors)) {
      console.error(formatError(err));
    } else {
      console.error("Error during compilation:", err);
    }
    process.exit(1);
  }
}
