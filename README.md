<div align="center">
  <h1> 👻 GhostTS </h1>

> **Zero-config TypeScript execution and build tool for Node.js** 

Run TypeScript files instantly without configuration. GhostTS automatically installs missing type definitions, compiles your code, and handles all the setup - so you can focus on writing TypeScript.

[![npm version](https://img.shields.io/npm/v/ghostts.svg)](https://www.npmjs.com/package/ghostts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---
</div>

## ✨ Why GhostTS?

| Feature | Description |
|---------|-------------|
| 🚀 **Zero Configuration** | No `tsconfig.json`, no setup, no hassle |
| 🤖 **Auto Type Installation** | Missing `@types/*` packages? We install them for you |
| ⚡ **Fast** | Powered by ESBuild for blazing-fast builds |
| 🎨 **Beautiful Errors** | Clear, formatted error messages with code context |
| 👀 **Watch Mode** | Auto-restart on file changes for seamless development |
| 📦 **Production Builds** | Compile entire projects like `tsc` |

---

## 📥 Installation
### Install Globaly

```bash
npm install -g ghostts
```
### or Install in Project
```bash
npm install ghostts
```
---

## 🚀 Quick Start

### Run a TypeScript file instantly
```bash
ghostts run server.ts
```

### Enable watch mode for development
```bash
ghostts run server.ts --watch
```

### Build a project for production
```bash
ghostts build src/main_file.ts --outdir dist
```

---

## 💡 Usage

### Running Files

Execute any TypeScript file without configuration:

```bash
ghostts run app.ts
```

**Example:**

```typescript
// server.ts
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello TypeScript!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

**Output:**
```bash
$ ghostts run server.ts
📦 Analyzing package.json for missing types...
📦 Installing types for: @types/express
✅ Successfully installed 1 type packages
🔍 Type checking...
✅ Type check passed
Server running on http://localhost:3000
```

> 🎉 GhostTS automatically detected and installed `@types/express` - no manual intervention needed!

---

### 👀 Watch Mode

Automatically restart your application when files change:

```bash
ghostts run server.ts --watch
```

Perfect for development - save a file and see changes instantly!

---

### 📦 Building Projects

Compile your entire TypeScript project for production deployment:

```bash
ghostts build src/main_file.ts --outdir dist
```

**Before:**
```
my-project/
├── src/
│   ├── index.ts
│   ├── controllers/
│   │   └── user.ts
│   └── utils/
│       └── helper.ts
└── package.json
```

**After:**
```
my-project/
├── src/ (unchanged)
├── dist/ (generated) ✨
│   ├── index.js
│   ├── controllers/
│   │   └── user.js
│   └── utils/
│       └── helper.js
└── package.json
```

Directory structure is preserved, source maps are generated, and your project is ready for deployment! 🚀

---

## 🤖 Automatic Type Installation

GhostTS automatically manages TypeScript type definitions for you!

### How It Works

1. **📄 Package.json Scanning** - Checks your dependencies for missing `@types/*` packages on first run
2. **🔍 Error-Driven Installation** - When TypeScript errors mention missing types, installs them automatically
3. **🧠 Smart Detection** - Only installs types for packages that need them (skips packages with built-in types)

### Example Flow

```typescript
// You write this code
import lodash from "lodash";
import axios from "axios";

// GhostTS detects missing types and runs:
// npm install -D @types/lodash @types/axios
// Then proceeds with compilation - all automatic! ✨
```

> **🔒 Security Note:** GhostTS only installs type definition packages (`@types/*`), never runtime packages. You maintain full control over what code runs in your project.

---

## 🎯 Supported Features

### JSON Imports

Import JSON files directly:

```typescript
import config from "./config.json";

console.log(config.port);           // 3000
console.log(config.database.host);  // localhost
```

### Modern TypeScript

Full support for modern TypeScript features:

- ✅ Async/await
- ✅ Optional chaining
- ✅ Nullish coalescing
- ✅ Decorators (experimental)
- ✅ And more!

### Package Manager Detection

Works seamlessly with:

- 📦 **npm** (default)
- 🧶 **yarn** (detected via `yarn.lock`)
- 📌 **pnpm** (detected via `pnpm-lock.yaml`)

---

## 🎨 Error Handling

GhostTS provides clear, formatted error messages:

### TypeScript Errors
```
error: Type 'string' is not assignable to type 'number'.

  server.ts:12:7

  11 |
  12 | const port: number = "3000";
             ^
  13 | app.listen(port);
```

### Runtime Errors
```
Runtime Error: TypeError: Cannot read property 'name' of undefined
  at getUser (/path/to/app.js:15:20)
  at main (/path/to/app.js:25:5)
```

### Missing Package Hints
```
💡 Package 'express' needs to be installed:
   npm install express
```

---

## 📁 The `.ghostts` Directory

GhostTS creates a `.ghostts` directory in your project for temporary compilation:

```
your-project/
├── .ghostts/
│   └── run.js          # Temporary bundled file
├── src/
└── package.json
```

### Why does this exist?

When you run `ghostts run server.ts`, GhostTS needs to:
1. Compile your TypeScript to JavaScript
2. Bundle it with dependencies for fast execution
3. Store it somewhere for Node.js to run

The `.ghostts/run.js` file is this temporary, bundled output. It's automatically overwritten on each run.

### Should I commit it?

**No.** Add it to your `.gitignore`:

```gitignore
.ghostts/
node_modules/
dist/
```

### Can I delete it?

**Yes!** It's regenerated on every run. The directory is only used during development for the `run` command.

---

## 📖 CLI Reference

### Commands

```bash
ghostts run <file>      # Execute a TypeScript file
ghostts build <srcDir>  # Build a TypeScript project
ghostts --version       # Show version number
ghostts --help          # Show help information
```

### Options

**Run Command:**
```bash
ghostts run server.ts           # Execute once
ghostts run server.ts --watch   # Watch mode (auto-restart on changes)
ghostts run --help              # Show run command help
```

**Build Command:**
```bash
ghostts build src                    # Build with default output (./dist)
ghostts build src --outdir build     # Build with custom output directory
ghostts build --help                 # Show build command help
```

---

## ⚙️ Configuration

GhostTS uses sensible TypeScript defaults:

```json
{
  "target": "ES2020",
  "module": "commonjs",
  "strict": true,
  "esModuleInterop": true,
  "allowSyntheticDefaultImports": true,
  "skipLibCheck": true,
  "resolveJsonModule": true
}
```

> 💡 No `tsconfig.json` required. Add one if you need custom settings for your IDE.

---

## 📊 Comparison with Other Tools

| Feature | GhostTS | ts-node | tsx | tsc |
|---------|---------|---------|-----|-----|
| Zero config | ✅ | ❌ | ✅ | ❌ |
| Auto type install | ✅ | ❌ | ❌ | ❌ |
| Watch mode | ✅ | ❌* | ✅ | ❌* |
| Fast compilation | ✅ (ESBuild) | ❌ (TSC) | ✅ (ESBuild) | ❌ (TSC) |
| Project builds | ✅ | ❌ | ❌ | ✅ |
| Error formatting | ✅ | ✅ | ❌ | ✅ |

*Requires additional tools like nodemon

---

## 📚 Examples

### Express API

```typescript
import express from "express";
import { json } from "body-parser";

const app = express();
app.use(json());

app.get("/api/users", async (req, res) => {
  // Your logic here
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log("API ready at http://localhost:3000");
});
```

```bash
ghostts run api.ts --watch
```

---

### CLI Tool

```typescript
import { Command } from "commander";
import { readFileSync } from "fs";

const program = new Command();

program
  .name("mytool")
  .version("1.0.0")
  .argument("<file>")
  .action((file: string) => {
    const content = readFileSync(file, "utf-8");
    console.log(`File size: ${content.length} bytes`);
  });

program.parse();
```

```bash
ghostts run cli.ts
```

---

### Building for Production

```typescript
// src/index.ts
import { createServer } from "./lib/server";
import config from "./config.json";

async function main() {
  const server = createServer(config);
  await server.start();
}

main().catch(console.error);
```

```bash
# Build the project
ghostts build src/main_file.ts --outdir dist

# Deploy and run with Node.js
node dist/index.js
```

---

## 🔧 Troubleshooting

### Types not installing automatically

Check that you have a `package.json` in your project:
```bash
npm init -y
```

### Build fails with import errors

Ensure all runtime packages are installed:
```bash
npm install express lodash axios
```

> 💡 GhostTS installs types, but you need to install the actual packages.

### Watch mode not detecting changes

Make sure you're not in a directory that's being ignored. GhostTS skips:
- `node_modules/`
- `dist/`
- `.git/`
- `.ghostts/`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on GitHub.

---

## 📄 License

MIT © Aniket

---

<div align="center">

**Built with ❤️ for TypeScript developers who value simplicity.**

### 👻 GhostTS - Write TypeScript, skip the setup.

[⭐ Star on GitHub](https://github.com/yourusername/ghostts) • [🐛 Report Bug](https://github.com/yourusername/ghostts/issues) • [💡 Request Feature](https://github.com/yourusername/ghostts/issues)

</div>

