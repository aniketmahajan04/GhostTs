import path from "path";
import fs from "fs";
interface TypeInstallerResult {
  installed: string[];
  skipped: string[];
  errors: string[];
}

export class AutoTypeInstaller {
  private packageManager: "npm" | "yarn" | "pnpm" = "npm";
  private projectRootPath: string;

  constructor(projectRootPath: string = process.cwd()) {
    this.projectRootPath = projectRootPath;
    this.detectPackageManager();
  }

  async installFromErrors(errors: string[]): Promise<TypeInstallerResult> {
    console.log("🔍 Analyzing type errors...");

    const missingTypes = this.parseTypeErrors(errors);
    if (missingTypes.length === 0) {
      return { installed: [], skipped: [], errors: [] };
    }

    console.log(`📦 Installing types for: ${missingTypes.join(",")}`);
    return this.installTypePackages(missingTypes);
  }

  async installFromPackageJson(): Promise<TypeInstallerResult> {
    let packageJsonPath = path.join(this.projectRootPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return { installed: [], skipped: [], errors: [] };
    }
    console.log("📦 Analyzing package.json for missing types...");

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const missingTypes = this.findMissingTypes(dependencies);
    if (missingTypes.length === 0) {
      console.log("✅ All type definitions are already installed.");
      return { installed: [], skipped: [], errors: [] };
    }

    console.log(`📦 Installing types for: ${missingTypes.join(",")}`);
    return this.installTypePackages(missingTypes);
  }

  // HYBRID: Try package.json then error driven
  async autoInstall(errors: string[] = []): Promise<TypeInstallerResult> {
    console.log("🤖 Auto-installing type definitions...");

    // Step 1: Try installing from package.json
    const packageJsonResult = await this.installFromPackageJson();

    // Step 2: If that fails, install from errors
    if (errors.length > 0) {
      const errorResult = await this.installFromErrors(errors);
      return {
        installed: [...packageJsonResult.installed, ...errorResult.installed],
        skipped: [...packageJsonResult.skipped, ...errorResult.skipped],
        errors: [...packageJsonResult.errors, ...errorResult.errors],
      };
    }

    return packageJsonResult;
  }

  private parseTypeErrors(errors: string[]): string[] {
    const missingTypes = new Ser<string>();

    for (const error of errors) {
      // Parse Typescript errors like
      // "Could not find module 'express' or its corresponding type declarations."
      // "Could not find a declaration file for module 'lodash'."

      const moduleMatch = error.match(
        /Could not find module ['"`]([^'"`]+)['"`].*type declarations/,
      );
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        if (this.needsType(moduleName)) {
          missingTypes.add(moduleName);
        }
      }

      const declarationMatch = error.match(
        /Could not find a declaration file for module ['"`]([^'"`]+)['"`]/,
      );
      if (declarationMatch) {
        const moduleName = declarationMatch[1];
        if (this.needsType(moduleName)) {
          missingTypes.add(moduleName);
        }
      }
    }
    return Array.from(missingTypes);
  }

  private async findMissingTypes(
    dependencies: Record<string, string>,
  ): Promise<string[]> {
    const missingTypes: string[] = [];

    for (const packageName of Object.keys(dependencies)) {
      // skip package that don't need types
      if (!this.needsType(packageName)) {
        continue;
      }

      const typePackageName = `@types/${packageName}`;

      // check if @types are already installed
      if (
        !dependencies[typePackageName] &&
        !(await this.isTypePackageInstalled(typePackageName))
      ) {
        // check if @types package exists on npm
        if (await this.typePackageExists(typePackageName)) {
          missingTypes.push(typePackageName);
        }
      }
    }
    return missingTypes;
  }
  private needsType(packageName: string): boolean {
    // package that don't need @types (have built-in types)
    const hasBuiltInTypes = [
      "typescript",
      "react",
      "vue",
      "svelte",
      "@types/", // already types package
      "ghostts", // our own package
    ];

    return !hasBuiltInTypes.some((pkg) => packageName.startsWith(pkg));
  }
}
