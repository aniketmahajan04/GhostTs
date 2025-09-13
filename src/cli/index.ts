#!/usr/bin/env node

// Initial command setup ghostts <filename>

import { Command } from "commander";
import { runFile } from "../core/runner";
import { watchFile } from "../watch/watcher";

interface CliOptions {
  watch?: boolean;
  build?: BuildOptions;
}
interface BuildOptions {
  mode: "build";
  outdir: string;
}

const program = new Command();

program.name("ghostts").description("GhostTs -- zero-config Typescript tool");

program
  .argument("<file>", "entry .ts file")
  .option("-w, --watch", "watch mode")
  .action(async (file: string, option: CliOptions) => {
    try {
      if (option.watch) {
        console.log("watching...");
        await watchFile(file);
      } else {
        await runFile({ entryFile: file });
      }
    } catch (error) {
      console.log("Error: ", error);
      process.exit(1);
    }
  });

program
  .command("build")
  .argument("<file>", "entry .ts file")
  .option("--outdir <dir>", "output directory", "./dist")
  .action(async (file: string, option: CliOptions) => {});
//Disk-base compilation for deployment

program.parse();
