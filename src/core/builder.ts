import { promises as fs } from "fs";
import path from "path";
import { compileTs } from "./compiler";
import { build } from "esbuild";

interface BuildOptions {
  srcDir?: string;
  outDir?: string;
}

export async function collectTsFiles(
  dir: string,
  files: string[] = []
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // recuse into subfolder
      if (!["node_modules", ".git", "dist", ".ghostts"].includes(entry.name)) {
        await collectTsFiles(fullPath, files);
      }
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function buildProject(options: BuildOptions) {
  const srcDir = options.srcDir ?? "src";
  const outDir = options.outDir ?? "dist";
  try {
    console.log(`🚀 Building TypeScript project...`);
    console.log(`   Source: ${srcDir}`);
    console.log(`   Output: ${outDir}`);

    // Clean output directory (like tsc)
    try {
      await fs.rm(outDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned ${outDir}`);
    } catch (error) {
      // Directory might not exist, that's fine
      console.error("Directory might not exists");
    }

    // ensure dist exists
    await fs.mkdir(outDir, { recursive: true });

    // collect files
    const tsFiles = await collectTsFiles(srcDir);

    if (tsFiles.length === 0) {
      console.log("❌ No TypeScript files found in", srcDir);
      return;
    }

    console.log(`📁 Found ${tsFiles.length} TypeScript files`);

    // compile each files
    let successCount = 0;
    for (const file of tsFiles) {
      try {
        const outFile = await compileTs(file, {
          mode: "build",
          srcDir,
          outdir: outDir,
        });
        if (!outFile) {
          throw new Error("Error building project");
        }
        console.log(`✅ Built: ${path.relative(process.cwd(), file)}`);
        console.log(`✅ Built: ${path.relative(process.cwd(), outFile)}`);
      } catch (error) {
        console.error(`❌ Failed to compile ${file}:`, error);
        throw error; // Stop on first error
      }
    }

    console.log(`✅ Successfully compiled ${successCount} file(s)`);
    console.log(`📦 Output directory: ${outDir}`);
  } catch (error) {
    throw error;
  }
}
