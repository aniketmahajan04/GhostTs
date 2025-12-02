import { ChildProcess } from "child_process";
import { runFile } from "../core/runner";
import chokidar from "chokidar";
import { showSpinner } from "../util/utils";
import path from "path";
import { AutoTypeInstaller } from "../core/autoTypeInstaller";

const PROCESS_KILL_TIMEOUT = 1000;

export async function watchFile(entryFile: string) {
  let child: ChildProcess | null = null;
  let typeInstallerInitialized = false;
  const projectRoot = path.dirname(entryFile);

  console.log("👀 Watching:", entryFile);

  const runOnce = async () => {
    try {
      if (child && child.pid) {
        const spinnerInterval = showSpinner();

        child.kill("SIGTERM");

        await new Promise((resolve) => {
          let resolved = false;

          child?.on("exit", () => {
            if (!resolved) {
              resolved = true;
              resolve(undefined);
            }
          });

          setTimeout(() => {
            if (!resolved) {
              if (child && !child.killed) {
                child.kill("SIGKILL");
              }
              resolved = true;
              resolve(undefined);
            }
          }, PROCESS_KILL_TIMEOUT);
        });

        clearInterval(spinnerInterval);
        process.stdout.write("\r                    \r");
        child = null;
      }

      // Only run type installer on initial run or if package.json changes
      if (!typeInstallerInitialized) {
        const typeInstaller = new AutoTypeInstaller(projectRoot);
        const installed = await typeInstaller.installFromPackageJson();
        typeInstallerInitialized = true;

        if (installed && installed.installed.length > 0) {
          console.log(
            `✅ Installed types for: ${installed.installed.join(", ")}`,
          );
        }
      }

      //   console.log("🚀 Starting new process...");
      child = await runFile({ entryFile: entryFile });
      //   console.log("✅ New process started with PID:", child.pid);
    } catch (error) {
      console.error("❌ Error in runOnce:", error);
    }
  };

  await runOnce();

  // Set up file watcher
  const watcher = chokidar.watch([entryFile, "**/*.ts", "package.json"], {
    ignored: ["node_modules", "dist", ".ghostts"],
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("🔍 File watcher is ready and monitoring changes...");
  });

  watcher.on("change", async (path) => {
    // 1. Clear the screen immediately to start fresh
    console.clear();

    // 2. Log the file path prominently at the new top of the screen.
    console.log(
      `\n\x1b[44m\x1b[37m REBUILD \x1b[0m \x1b[36mChange detected in:\x1b[0m ${path}\n`,
    );

    // Reset type installer if package.json changes
    if (path.endsWith("package.json")) {
      typeInstallerInitialized = false;
      console.log("📦 Dependencies changed, will re-check types...");
      await runOnce();
    } else {
      console.log(`👻 Rebuilding due to change in ${path}...`);
      await runOnce(); // Skip type installer
    }
  });

  watcher.on("error", (error) => {
    console.error("❌ File watcher error:", error);
  });

  // Graceful shutdown handling
  process.on("SIGINT", async () => {
    if (child && child.pid) {
      child.kill("SIGTERM");

      // Wait briefly for graceful shutdown
      setTimeout(() => {
        if (child && !child.killed) {
          //   console.log("⚡ Force killing child process");
          child.kill("SIGKILL");
        }
      }, 1000);
    }

    await watcher.close();
    console.log("👋 Goodbye!");
    process.exit(0);
  });
}
