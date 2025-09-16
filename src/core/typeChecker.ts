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
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  return {
    success: diagnostics.length === 0,
    diagnostics: diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error
    ),
  };
}
