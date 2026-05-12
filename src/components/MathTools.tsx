"use client";

import React, { useState } from "react";
import { Calculator, X, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathToolsProps {
  onInsertSymbol: (symbol: string) => void;
}

export function MathTools({ onInsertSymbol }: MathToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const symbols = [
    "π", "√", "²", "³", "θ", "α", "β", "∞",
    "∫", "∑", "≈", "≠", "≤", "≥", "±", "×", "÷", "°", "Δ"
  ];

  const handleCalcKeyPress = (key: string) => {
    if (key === "C") {
      setCalcInput("");
      setCalcResult(null);
    } else if (key === "=") {
      try {
        // Safe evaluation replacing common symbols
        let expr = calcInput
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/π/g, "Math.PI")
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/√\(/g, "Math.sqrt(");
        
        // Handle power
        expr = expr.replace(/\^/g, "**");

        // Use Function instead of eval for slightly better safety, though still in browser client side it's okay
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${expr}`)();
        
        if (Number.isFinite(res)) {
          // Format to avoid long decimals like 0.30000000000000004
          const formatted = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(6)).toString();
          setCalcResult(formatted);
          setCalcInput(formatted);
        } else {
          setCalcResult("Error");
        }
      } catch (e) {
        setCalcResult("Error");
      }
    } else {
      setCalcInput(prev => prev + key);
    }
  };

  const calcButtons = [
    "sin(", "cos(", "tan(", "C",
    "log(", "ln(", "√(", "^",
    "7", "8", "9", "÷",
    "4", "5", "6", "×",
    "1", "2", "3", "-",
    "0", ".", "π", "+",
    "(", ")", "C", "="
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
      <div className="p-3 bg-secondary/50 border-b border-border flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Calculator size={14} className="text-primary" />
          Herramientas Math
        </span>
        <button onClick={() => setIsOpen(false)} className="hover:bg-border p-1 rounded-md transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
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
                title={`Insertar ${sym}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border my-2" />

        {/* Scientific Calculator */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
            <Calculator size={12} />
            Calculadora
          </p>
          
          <div className="bg-background border border-border rounded-xl p-3 mb-2 font-mono text-right overflow-hidden shadow-inner relative">
            <div className="text-sm text-foreground overflow-x-auto whitespace-nowrap min-h-[20px]">{calcInput || "0"}</div>
            {calcResult && calcResult !== calcInput && (
              <div className="text-xs text-primary mt-1 opacity-80">= {calcResult}</div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1">
            {calcButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleCalcKeyPress(btn)}
                className={cn(
                  "p-2 rounded-lg text-xs font-bold transition-all",
                  btn === "=" ? "bg-primary text-white col-span-2 hover:bg-primary/90" : 
                  btn === "C" ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" :
                  ["+", "-", "×", "÷", "^"].includes(btn) ? "bg-secondary text-primary hover:bg-secondary/80" :
                  "bg-secondary/20 hover:bg-secondary border border-transparent hover:border-border"
                )}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
