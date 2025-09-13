import { build } from "esbuild";
import path from "path";

interface CompileOptions {
  mode?: "run" | "build";
  outdir?: string;
}
export async function compileTs(
  entryFile: string,
  option: CompileOptions = { mode: "run" },
): Promise<string | void> {
  try {
    if (option.mode === "build") {
      await build({
        entryPoints: [entryFile],
        bundle: true,
        platform: "node",
        format: "cjs",
        sourcemap: "inline",
        logLevel: "silent",
        write: option.mode === "build", // write only in build modes
        outdir: option.mode === "build" ? (option.outdir ?? "dist") : undefined,
      });
      return;
    } else {
      const outFile = path.resolve(process.cwd(), ".ghostts", "run.js");
      await build({
        entryPoints: [entryFile],
        bundle: true,
        platform: "node",
        format: "cjs",
        sourcemap: "inline",
        logLevel: "silent",
        write: true,
        outfile: outFile,
      });
      return outFile;
    }
  } catch (error) {
    throw error;
  }
}
