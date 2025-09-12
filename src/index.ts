// Initial command setup ghostts <filename>

import { Command } from "commander";

interface CliOptions {
  watch?: boolean;
}

const program = new Command();

program
  .name("ghostts")
  .description("GhostTs -- zero-config Typescript tool")
  .argument("<file>", "entry .ts file")
  .option("-w, --watch", "watch mode")
  .action(async (file: string, option: CliOptions) => {
    try {
      if (option.watch) {
        await watchFile(file);
      } else {
        await runFile(file);
      }
    } catch (error) {
      console.log("Error: ", error.message);
      process.exit(1);
    }
  });

program.parse();
