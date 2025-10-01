import { build } from "esbuild";
import path from "path";
import { promises as fs } from "fs";

interface CompileOptions {
  mode?: "run" | "build";
  outdir?: string;
  srcDir?: string;
}

const loaderConfig = {
  ".json": "json" as const,

  // may be in future
  // ".sql": "text" as const,
  // ".html": "text" as const,
  // ".txt": "text" as const,
  // ".md": "text" as const,
};

export async function compileTs(
  entryFile: string,
  option: CompileOptions
): Promise<string | void> {
  try {
    const projectRoot = path.dirname(entryFile);
    const alias = {
      "@": projectRoot,
      "~": projectRoot,
    };
    if (option.mode === "build") {
      const srcDir = option.srcDir ?? "src";
      const outDir = option.outdir ?? "dist";

      const relPath = path.relative(srcDir, entryFile).replace(/\.ts$/, ".js");
      const outPath = path.resolve(outDir, relPath);

      // Ensure the output directory exists
      const outFileDir = path.dirname(outPath);
      await fs.mkdir(outFileDir, { recursive: true });

      await build({
        entryPoints: [entryFile],
        bundle: false,
        platform: "node",
        format: "cjs",
        sourcemap: true,
        logLevel: "silent",
        outdir: path.dirname(outPath),
        write: true,
        target: "node14",
        allowOverwrite: true,
        mainFields: ["main", "module"],
        conditions: ["node"],
        loader: loaderConfig,
        alias: alias,
      });
      return outPath;
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
        allowOverwrite: true,
        mainFields: ["main", "module"],
        conditions: ["node"],
        loader: loaderConfig,
        alias: alias,
      });
      return outFile;
    }
  } catch (error) {
    console.error("Error ", error);
  }
}
