import { ChildProcess } from "child_process";
import { runFile } from "../core/runner";
import chokidar from "chokidar";
import { showSpinner } from "../util/utils";

const PROCESS_KILL_TIMEOUT = 1000;

export async function watchFile(entryFile: string) {
  let child: ChildProcess | null = null;
  console.log("👀 Watching:", entryFile);

  const runOnce = async () => {
    try {
      if (child && child.pid) {
        // console.log("About to kill process PID:", child.pid);
        const spinnerInterval = showSpinner();

        child.kill("SIGTERM");
        // console.log("📤 SIGTERM sent to PID:", child.pid);

        await new Promise((resolve) => {
          let resolved = false;

          child?.on("exit", (code, signal) => {
            if (!resolved) {
              console.log(
                `✅ Process ${child?.pid} exited with code: ${code}, signal: ${signal}`
              );
              resolved = true;
              resolve(undefined);
            }
          });

          setTimeout(() => {
            if (!resolved) {
              console.log(
                `⚡ Timeout reached, force killing PID: ${child?.pid}`
              );
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
        // console.log("🧹 Cleanup complete");
        child = null;
      } else {
        console.log("ℹ️  No existing process to kill");
      }

      //   console.log("🚀 Starting new process...");
      child = await runFile({ entryFile: entryFile });
      //   console.log("✅ New process started with PID:", child.pid);
    } catch (error) {
      console.error("❌ Error in runOnce:", error);
    }
  };

  // Initial run
  //   console.log("🎬 Starting initial execution...");
  await runOnce();

  // Set up file watcher
  //   console.log("👀 Setting up file watcher for:", entryFile);
  const watcher = chokidar.watch([entryFile, "**/*.ts", "**/*.tsx"], {
    ignored: ["node_modules", "dist", ".ghostts"],
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("🔍 File watcher is ready and monitoring changes...");
  });

  watcher.on("change", async (path) => {
    console.log("🔥 File change detected:", path);
    console.clear();
    console.log(`👻 Rebuilding due to change in ${path}...`);
    await runOnce();
  });

  watcher.on("error", (error) => {
    console.error("❌ File watcher error:", error);
  });

  // Graceful shutdown handling
  process.on("SIGINT", async () => {
    // console.log("\n🛑 Received SIGINT, shutting down gracefully...");

    if (child && child.pid) {
      //   console.log("🔪 Killing child process:", child.pid);
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
