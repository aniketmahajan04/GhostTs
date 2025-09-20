import * as ts from "typescript";

interface TypeChechResult {
  success: boolean;
  diagnostics: ts.Diagnostic[];
}

export function typeCheckWithAPI(filepath: string): TypeChechResult {
  const program = ts.createProgram([filepath], {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    noEmit: true,
    esModuleInterop: true, // Add this
    allowSyntheticDefaultImports: true, // Add this
    skipLibCheck: true, // Add this to skip @types issue
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  return {
    success: diagnostics.length === 0,
    diagnostics: diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error
    ),
  };
}
