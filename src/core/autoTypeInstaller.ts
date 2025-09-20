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
}
