import { blue, bold, dim, gray, red, redBright, yellow } from "colorette";
import fs from "fs";
import path from "path";
import ts from "typescript";

export function formatError(err: any): string {
  if (!err || !err.errors || !Array.isArray(err.errors)) {
    return red("Unknown error: " + String(err));
  }
  let outError = "";
  for (const e of err.errors) {
    const loc = e.location;
    if (loc) {
      const filePath = loc.file || "<input>";
      const line = loc.line;
      const column = loc.column;

      let fileContent: string[] = [];
      try {
        const text = fs.readFileSync(filePath, "utf-8");
        fileContent = text.split("\n");
      } catch {
        fileContent = [];
      }
      const errorLine = fileContent[line - 1] || "";
      outError += `\n${red("error")}: ${e.text}\n`;
      outError += `  ${blue(filePath)}:${yellow(line.toString())}:${yellow(column.toString())}}\n`;

      // code frame
      outError += `  ${dim(line - 1)} | ${fileContent[line - 2] ?? ""}\n`;
      outError += `  ${yellow(line)} | ${errorLine}\n`;
      outError += `   ${" ".repeat(column)}${red("^")}\n}`;
      outError += `  ${dim(line + 1)} | ${fileContent[line] ?? ""}\n\n`;
    } else {
      outError += `${red("error")}: ${e.text}\n`;
    }
  }
  return outError;
}

export function formatRuntimeError(raw: string): string {
  const lines = raw.split("\n");

  const header = bold(red("Runtime Error:"));
  const formatted = lines
    .map((line, idx) => {
      if (idx === 0) {
        return redBright(line); // main error message
      }
      if (line.trim().startsWith("at")) {
        return gray(line); // stack trace
      }
      return line;
    })
    .join("\n");

  return `${header}\n${formatted}`;
}

export function formatTSDiagnostic(diagnostic: ts.Diagnostic): string {
  if (!diagnostic.file || diagnostic.start === undefined) {
    return `Error: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
  }

  const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start
  );
  const filename = path.relative(process.cwd(), diagnostic.file.fileName);
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

  // Get source line for context
  const sourceLines = diagnostic.file.text.split("\n");
  const errorLine = sourceLines[line];

  let output = "";
  output += `${red("error")}: ${message}\n`;
  output += `  ${blue(filename)}:${yellow(line + 1)}:${yellow(character + 1)}\n`;

  // code frame
  if (line > 0) {
    output += `  ${dim(yellow(line.toString().padStart(2)))} | ${sourceLines[line - 1] || ""}\n`;
  }
  output += `  ${yellow((line + 1).toString().padStart(2))} | ${errorLine}\n`;
  output += `  ${" ".repeat(character + 5)}${red("^")}\n`;
  if (line + 1 < sourceLines.length) {
    output += `  ${dim(yellow((line + 2).toString().padStart(2)))} | ${sourceLines[line + 1] || ""}\n`;
  }

  return output;
}
