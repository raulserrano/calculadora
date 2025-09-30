// Calculadora: lógica y manejo de eventos
(() => {
  const exprEl = document.getElementById("expr");
  const resultEl = document.getElementById("result");
  const keysEl = document.getElementById("keys");

  const state = {
    displayValue: "0",
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
    expression: "",
    error: false,
  };

  const OPERATORS = {
    "+": (a, b) => a + b,
    "−": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => (b === 0 ? Infinity : a / b),
  };

  function formatNumber(n) {
    if (!isFinite(n)) return "∞";
    // Evitar notación científica para números razonables y recortar decimales
    const s = Math.abs(n) < 1e12 ? n.toString() : n.toExponential(6);
    // Limpiar arrastres de coma flotante
    const cleaned = Number(s).toString();
    return cleaned.length > 14 ? Number(n.toPrecision(12)).toString() : cleaned;
  }

  function updateDisplay() {
    resultEl.textContent = state.displayValue;
    exprEl.textContent = state.expression;
  }

  function clearAll() {
    state.displayValue = "0";
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
    state.expression = "";
    state.error = false;
    updateDisplay();
  }

  function deleteLast() {
    if (state.waitingForSecondOperand) return; // no borrar cuando esperamos segundo operando
    if (state.displayValue.length <= 1 || state.displayValue === "0") {
      state.displayValue = "0";
    } else {
      state.displayValue = state.displayValue.slice(0, -1);
    }
    updateDisplay();
  }

  function inputDigit(d) {
    if (state.error) return;
    if (state.waitingForSecondOperand) {
      state.displayValue = d;
      state.waitingForSecondOperand = false;
    } else {
      state.displayValue = state.displayValue === "0" ? d : state.displayValue + d;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (state.error) return;
    if (state.waitingForSecondOperand) {
      state.displayValue = "0.";
      state.waitingForSecondOperand = false;
    } else if (!state.displayValue.includes(".")) {
      state.displayValue += ".";
    }
    updateDisplay();
  }

  function plusMinus() {
    if (state.error) return;
    if (state.displayValue === "0") return;
    if (state.displayValue.startsWith("-")) {
      state.displayValue = state.displayValue.slice(1);
    } else {
      state.displayValue = "-" + state.displayValue;
    }
    updateDisplay();
  }

  function percent() {
    if (state.error) return;
    const current = parseFloat(state.displayValue);
    const val = current / 100;
    state.displayValue = formatNumber(val);
    updateDisplay();
  }

  function calculate(a, op, b) {
    if (!(op in OPERATORS)) return b;
    const res = OPERATORS[op](a, b);
    if (!isFinite(res)) {
      state.error = true;
      state.expression = "";
      state.displayValue = "Error";
      updateDisplay();
      return null;
    }
    return res;
  }

  function handleOperator(nextOp) {
    if (state.error) return;

    const inputValue = parseFloat(state.displayValue);

    if (state.operator && state.waitingForSecondOperand) {
      // Cambiar operador antes de introducir segundo operando
      state.operator = nextOp;
      state.expression = `${formatNumber(state.firstOperand)} ${state.operator}`;
      updateDisplay();
      return;
    }

    if (state.firstOperand == null) {
      state.firstOperand = inputValue;
    } else if (state.operator) {
      const result = calculate(state.firstOperand, state.operator, inputValue);
      if (result == null) return; // error ya manejado
      state.firstOperand = result;
      state.displayValue = formatNumber(result);
    }

    state.operator = nextOp;
    state.waitingForSecondOperand = true;
    state.expression = `${formatNumber(state.firstOperand)} ${state.operator}`;
    updateDisplay();
  }

  function equals() {
    if (state.error) return;
    if (state.operator == null || state.waitingForSecondOperand) return;

    const second = parseFloat(state.displayValue);
    const result = calculate(state.firstOperand, state.operator, second);
    if (result == null) return;

    state.expression = "";
    state.displayValue = formatNumber(result);
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
    updateDisplay();
  }

  // Clicks
  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button.key");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === "digit") inputDigit(btn.dataset.digit);
    else if (action === "decimal") inputDecimal();
    else if (action === "operator") handleOperator(btn.dataset.op);
    else if (action === "equals") equals();
    else if (action === "clear") clearAll();
    else if (action === "delete") deleteLast();
    else if (action === "percent") percent();
    else if (action === "plusminus") plusMinus();
  });

  // Teclado
  window.addEventListener("keydown", (e) => {
    const k = e.key;

    if (/^\d$/.test(k)) { inputDigit(k); return; }
    if (k === "." || k === ",") { inputDecimal(); return; }
    if (k === "Enter" || k === "=") { e.preventDefault(); equals(); return; }
    if (k === "Backspace") { deleteLast(); return; }
    if (k === "%") { percent(); return; }

    if (k === "+" || k === "-") { handleOperator(k === "+" ? "+" : "−"); return; }
    if (k === "*" || k.toLowerCase() === "x") { handleOperator("×"); return; }
    if (k === "/") { handleOperator("÷"); return; }

    // Numpad keys (por si el navegador reporta otros códigos)
    if (k === "Add") handleOperator("+");
    if (k === "Subtract") handleOperator("−");
    if (k === "Multiply") handleOperator("×");
    if (k === "Divide") handleOperator("÷");
  });

  // Inicial
  updateDisplay();
})();
