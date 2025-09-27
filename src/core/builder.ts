import { promises as fs } from "fs";
import path from "path";
import { compileTs } from "./compiler";
import ts from "typescript";
import { formatError, formatTSDiagnostic } from "../errors/errors";
import { AutoTypeInstaller } from "./autoTypeInstaller";

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

    const projectRoot = path.resolve(srcDir, "..");
    const typeInstaller = new AutoTypeInstaller(projectRoot);
    await typeInstaller.installFromPackageJson();

    // Type check all files at once (faster than individial checks)
    console.log("🔍 Type cheking...");
    const typeCheckConfig = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      rootDir: srcDir,
      baseUrl: srcDir,
      paths: { "@/*": ["./*"] },
    };

    let program = ts.createProgram(tsFiles, typeCheckConfig);
    let diagnostics = ts.getPreEmitDiagnostics(program);
    let errors = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error
    );

    if (errors.length > 0) {
      const errorMessages = errors.map((d) =>
        typeof d.messageText === "string"
          ? d.messageText
          : d.messageText.messageText
      );

      const installResult =
        await typeInstaller.installFromErrors(errorMessages);

      if (installResult.installed.length > 0) {
        console.log("🔄 Retrying type checking after installing types...");

        // Retry type checking
        program = ts.createProgram(tsFiles, typeCheckConfig);
        diagnostics = ts.getPreEmitDiagnostics(program);
        errors = diagnostics.filter(
          (d) => d.category === ts.DiagnosticCategory.Error
        );

        if (errors.length === 0) {
          console.log("✅ Type check passed after installing types!");
        }
      }

      // Show errors if still failing
      if (errors.length > 0) {
        console.log(`❌ Found ${errors.length} type error(s):\n`);
        for (const diagnostics of errors) {
          console.error(formatTSDiagnostic(diagnostics));
        }

        process.exit(1);
      }
    } else {
      console.log("✅ Type check passed");
    }

    console.log("✅ Type check passed");

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

        successCount++;
        console.log(`✅ Built: ${path.relative(process.cwd(), file)}`);
        console.log(`✅ Built: ${path.relative(process.cwd(), outFile)}`);
      } catch (error: any) {
        console.error(`❌ Failed to compile ${file}:`, error);

        if (error.errors && Array.isArray(error.errors)) {
          console.error(formatError(error)); // ✅ USE: ESBuild compilation errors
        } else {
          console.error("Error:", error.message || error);
        }
        throw error; // Stop on first error
      }
    }

    console.log(`✅ Successfully compiled ${successCount} file(s)`);
    console.log(`📦 Output directory: ${outDir}`);
  } catch (err: any) {
    // throw err;
    if (err.errors && Array.isArray(err.errors)) {
      console.error(formatError(err));
    } else {
      console.error("Error during compilation:", err);
    }
    process.exit(1);
  }
}
