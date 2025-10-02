#!/usr/bin/env node

// Initial command setup ghostts <filename>

import { Command } from "commander";
import { runFile } from "../core/runner";
import { watchFile } from "../watch/watcher";
import { buildProject } from "../core/builder";
import { formatRuntimeError } from "../errors/errors";

interface CliOptions {
  watch?: boolean;
}
interface BuildOptions {
  mode: "build";
  outdir?: string;
}

const program = new Command();

program
  .name("ghostts")
  .description("GhostTs -- zero-config Typescript tool")
  .version("1.0.0");

program
  .command("run")
  .argument("<file>", "entry .ts file")
  .description("Execute a Typescript file.")
  .option("-w, --watch", "watch mode")
  // .option("-h, --help", "display help for command")
  .action(async (file: string, option: CliOptions) => {
    try {
      if (option.watch) {
        console.log("watching...");
        await watchFile(file);
      } else {
        await runFile({ entryFile: file });
      }
    } catch (error: any) {
      console.log("Error: ", error);
      process.exit(1);
    }
  });

program
  .command("build")
  .argument("<srcDir>", "source folder (like ./src)")
  .description("Build a Typescript project.")
  .option("--outdir <dir>", "output directory", "./dist")
  // .option("-h, --help", "display help for command")
  .action(async (srcDir: string, option: BuildOptions) => {
    try {
      // console.log(`🔨 Building project from ${srcDir} to ${option.outdir}`);
      await buildProject({ srcDir, outDir: option.outdir });
    } catch (error) {
      console.error("❌ Build failed:", error);
      process.exit(1);
    }
  });
//Disk-base compilation for deployment

program.on("command:*", () => {
  console.error(
    "Invalid command: %s\nTry ghostts --help for a list of available commands.",
    program.args.join(" ")
  );
  process.exit(1);
});
program.parse();
