"use client";

import React, { useState } from "react";
import { Calculator, X, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluate } from "mathjs";

interface MathToolsProps {
  onInsertSymbol: (symbol: string) => void;
}

type Btn = { l: string; k: string; cls?: string; span?: 2 };

export function MathTools({ onInsertSymbol }: MathToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isDeg, setIsDeg] = useState(true);
  const [is2nd, setIs2nd] = useState(false);
  const [mem, setMem] = useState(0);
  const [memSet, setMemSet] = useState(false);

  const symbols = [
    "π", "√", "²", "³", "θ", "α", "β", "∞",
    "∫", "∑", "≈", "≠", "≤", "≥", "±", "×", "÷", "°", "Δ"
  ];

  const calcEval = (input: string) => {
    let s = input
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/√\(/g, "sqrt(")
      .replace(/%/g, "/100");
    if (isDeg) {
      s = s
        .replace(/\bsin\(/g, "_sind(")
        .replace(/\bcos\(/g, "_cosd(")
        .replace(/\btan\(/g, "_tand(")
        .replace(/\basin\(/g, "_asind(")
        .replace(/\bacos\(/g, "_acosd(")
        .replace(/\batan\(/g, "_atand(");
      return evaluate(s, {
        _sind: (x: number) => Math.sin(x * Math.PI / 180),
        _cosd: (x: number) => Math.cos(x * Math.PI / 180),
        _tand: (x: number) => Math.tan(x * Math.PI / 180),
        _asind: (x: number) => Math.asin(x) * 180 / Math.PI,
        _acosd: (x: number) => Math.acos(x) * 180 / Math.PI,
        _atand: (x: number) => Math.atan(x) * 180 / Math.PI,
      });
    }
    return evaluate(s);
  };

  const fmt = (n: number): string => {
    if (!isFinite(n) || isNaN(n)) return "Error";
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    if (Math.abs(n) >= 1e12 || (n !== 0 && Math.abs(n) < 1e-7))
      return n.toExponential(6).replace(/\.?0+e/, "e");
    return String(parseFloat(n.toFixed(10)));
  };

  const press = (k: string) => {
    if (k === "DEG") { setIsDeg(d => !d); return; }
    if (k === "2ND") { setIs2nd(v => !v); return; }
    if (k === "MC") { setMem(0); setMemSet(false); return; }
    if (k === "MR") { setExpr(p => p + String(mem)); return; }
    if (k === "M+") {
      try { setMem(m => m + Number(calcEval(expr))); setMemSet(true); } catch { /* ignore */ }
      return;
    }
    if (k === "M-") {
      try { setMem(m => m - Number(calcEval(expr))); setMemSet(true); } catch { /* ignore */ }
      return;
    }
    if (k === "C") { setExpr(""); setResult(null); return; }
    if (k === "⌫") { setExpr(p => p.slice(0, -1)); return; }
    if (k === "=") {
      try {
        const r = fmt(Number(calcEval(expr)));
        setResult(r);
        if (r !== "Error") setExpr(r);
      } catch { setResult("Error"); }
      return;
    }
    if (k === "x²") { setExpr(p => p + "^2"); return; }
    if (k === "x³") { setExpr(p => p + "^3"); return; }
    if (k === "eˣ") { setExpr(p => p + "e^("); return; }
    if (k === "10ˣ") { setExpr(p => p + "10^("); return; }
    if (k === "±") { setExpr(p => p.startsWith("-") ? p.slice(1) : p ? "-" + p : "-"); return; }
    setExpr(p => p + k);
  };

  const s = is2nd;
  const rows: Btn[][] = [
    [
      { l: isDeg ? "DEG" : "RAD", k: "DEG", cls: "bg-amber-500/20 text-amber-400 font-black" },
      { l: "MC", k: "MC", cls: "text-sky-400 bg-sky-400/10" },
      { l: "MR", k: "MR", cls: cn("text-sky-400", memSet ? "bg-sky-400/30 ring-1 ring-sky-400/50" : "bg-sky-400/10") },
      { l: "M+", k: "M+", cls: "text-sky-400 bg-sky-400/10" },
      { l: "M−", k: "M-", cls: "text-sky-400 bg-sky-400/10" },
    ],
    [
      { l: "2nd", k: "2ND", cls: s ? "bg-primary text-white" : "bg-secondary/40 hover:bg-secondary" },
      { l: s ? "sin⁻¹(" : "sin(", k: s ? "asin(" : "sin(" },
      { l: s ? "cos⁻¹(" : "cos(", k: s ? "acos(" : "cos(" },
      { l: s ? "tan⁻¹(" : "tan(", k: s ? "atan(" : "tan(" },
      { l: "C", k: "C", cls: "bg-red-500/20 text-red-500 hover:bg-red-500/30" },
    ],
    [
      { l: s ? "ⁿ√(" : "x²", k: s ? "nthRoot(" : "x²" },
      { l: s ? "ˣ√" : "x³", k: s ? "^(1/" : "x³" },
      { l: "√(", k: "√(" },
      { l: "^", k: "^", cls: "bg-secondary text-primary hover:bg-secondary/80" },
      { l: "⌫", k: "⌫", cls: "bg-red-500/20 text-red-500 hover:bg-red-500/30" },
    ],
    [
      { l: s ? "10ˣ" : "eˣ", k: s ? "10ˣ" : "eˣ" },
      { l: "log(", k: "log(" },
      { l: "ln(", k: "ln(" },
      { l: "(", k: "(" },
      { l: ")", k: ")" },
    ],
    [
      { l: "π", k: "π" },
      { l: "e", k: "e" },
      { l: "%", k: "%" },
      { l: "n!", k: "!" },
      { l: "abs(", k: "abs(", cls: "text-[9px]" },
    ],
    [
      { l: "7", k: "7" }, { l: "8", k: "8" }, { l: "9", k: "9" },
      { l: "÷", k: "÷", cls: "bg-secondary text-primary hover:bg-secondary/80" },
      { l: "×", k: "×", cls: "bg-secondary text-primary hover:bg-secondary/80" },
    ],
    [
      { l: "4", k: "4" }, { l: "5", k: "5" }, { l: "6", k: "6" },
      { l: "+", k: "+", cls: "bg-secondary text-primary hover:bg-secondary/80" },
      { l: "−", k: "-", cls: "bg-secondary text-primary hover:bg-secondary/80" },
    ],
    [
      { l: "1", k: "1" }, { l: "2", k: "2" }, { l: "3", k: "3" },
      { l: ".", k: "." },
      { l: "=", k: "=", cls: "bg-primary text-white hover:bg-primary/90" },
    ],
    [
      { l: "0", k: "0", span: 2 },
      { l: "±", k: "±" },
      { l: "EE", k: "E", cls: "text-[9px]" },
      { l: "1/x", k: "1/(", cls: "text-[9px]" },
    ],
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-10 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
      >
        <Calculator size={16} />
        Herramientas Math
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20 w-80 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col">
      <div className="p-3 bg-secondary/50 border-b border-border flex justify-between items-center shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Calculator size={14} className="text-primary" />
          Herramientas Math
        </span>
        <button onClick={() => setIsOpen(false)} className="hover:bg-border p-1 rounded-md transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto scrollbar-thin">
        {/* Symbol Keyboard */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
            <Hash size={12} />
            Insertar Símbolo
          </p>
          <div className="grid grid-cols-6 gap-1">
            {symbols.map(sym => (
              <button
                key={sym}
                onClick={() => onInsertSymbol(sym)}
                className="bg-secondary/30 hover:bg-primary hover:text-white border border-border rounded-lg p-2 text-sm font-bold transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Scientific Calculator */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
            <Calculator size={12} />
            Calculadora Científica
          </p>

          {/* Display */}
          <div className="bg-background border border-border rounded-xl p-3 mb-2 font-mono text-right shadow-inner">
            <div className="text-[9px] text-muted-foreground min-h-[12px]">
              {isDeg ? "DEG" : "RAD"}{memSet ? ` · M=${fmt(mem)}` : ""}
            </div>
            <div className="text-sm text-foreground overflow-x-auto whitespace-nowrap min-h-[20px] mt-0.5">
              {expr || "0"}
            </div>
            {result && result !== expr && (
              <div className="text-xs text-primary mt-0.5">= {result}</div>
            )}
          </div>

          {/* Buttons grid */}
          <div className="grid grid-cols-5 gap-1">
            {rows.flat().map((btn, i) => (
              <button
                key={i}
                onClick={() => press(btn.k)}
                className={cn(
                  "p-2 rounded-lg text-[11px] font-bold transition-all leading-tight min-h-[30px]",
                  btn.span === 2 ? "col-span-2" : "",
                  btn.cls ?? "bg-secondary/20 hover:bg-secondary border border-transparent hover:border-border"
                )}
              >
                {btn.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
