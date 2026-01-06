import { create, all } from 'mathjs';
import { EqnSolution } from '../types';

const math = create(all);

// Configure mathjs to be predictable
math.config({
  number: 'BigNumber',
  precision: 64,
});

export const evaluateExpression = (expression: string, isDegree: boolean = true): string => {
  try {
    // Basic sanitization and replacement for visual symbols
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√\(/g, 'sqrt(')
      .replace(/\^/g, '^') // Power
      .replace(/%/g, '/100'); // Simple percent handling

    // Handle Log10 vs Ln
    sanitized = sanitized.replace(/log\(/g, 'log10(');
    sanitized = sanitized.replace(/ln\(/g, 'log('); 

    if (isDegree) {
       sanitized = sanitized.replace(/sin\(([^)]+)\)/g, 'sin(($1) deg)');
       sanitized = sanitized.replace(/cos\(([^)]+)\)/g, 'cos(($1) deg)');
       sanitized = sanitized.replace(/tan\(([^)]+)\)/g, 'tan(($1) deg)');
    }

    const result = math.evaluate(sanitized);
    return formatResult(result);
  } catch (error) {
    return "Error";
  }
};

const formatResult = (result: any): string => {
  if (math.isComplex(result)) {
    const re = math.format(result.re, { precision: 10, lowerExp: -9, upperExp: 9 });
    const im = math.format(result.im, { precision: 10, lowerExp: -9, upperExp: 9 });
    // @ts-ignore
    if (Math.abs(result.im) < 1e-15) return re;
    // @ts-ignore
    if (Math.abs(result.re) < 1e-15) return `${im}i`;
    // @ts-ignore
    return `${re} ${result.im < 0 ? '-' : '+'} ${Math.abs(result.im)}i`;
  }
  
  if (math.isBigNumber(result) || typeof result === 'number') {
    return math.format(result, { precision: 10, lowerExp: -9, upperExp: 9 });
  }
  return result.toString();
}

// --- Helpers for Exact Math ---

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

const simplifySqrt = (n: number) => {
    if (n === 0) return { coeff: 0, radical: 0 };
    if (n < 0) return { coeff: 1, radical: n }; // handled elsewhere
    let coeff = 1;
    // Check small factors
    for (let i = 2; i * i <= n; i++) {
        while (n % (i * i) === 0) {
            coeff *= i;
            n /= (i * i);
        }
    }
    return { coeff, radical: n };
};

// Returns exact string for (-b +/- sqrt(delta)) / 2a
const getQuadRootString = (a: number, b: number, delta: number, sign: number): string => {
    // Formula: (-b + sign*sqrt(delta)) / 2a
    const denom = 2 * a;
    
    // Case 1: Perfect Square
    const sqrtDelta = Math.sqrt(delta);
    if (Number.isInteger(sqrtDelta)) {
        const num = -b + sign * sqrtDelta;
        // Simplify fraction num/denom
        const common = Math.abs(gcd(Math.round(num), Math.round(denom)));
        const n = num / common;
        const d = denom / common;
        if (d === 1) return `${n}`;
        if (d === -1) return `${-n}`;
        if (d < 0) return `${-n}/${-d}`;
        return `${n}/${d}`;
    }

    // Case 2: Surd simplification
    const { coeff, radical } = simplifySqrt(delta);
    // numerator is -b + sign * coeff * sqrt(radical)
    // We check if we can divide all terms (b, coeff, denom) by a common factor
    const common = Math.abs(gcd(Math.abs(gcd(Math.round(b), Math.round(coeff))), Math.round(denom)));
    
    const b_sim = -b / common;
    const c_sim = coeff / common; // coeff of sqrt
    const d_sim = denom / common;

    let res = "";
    
    // Build Numerator String
    if (b_sim !== 0) res += `${b_sim}`;
    
    // Add Surd part
    const effectiveSign = sign * (d_sim < 0 ? -1 : 1); // fix sign if denom flipped
    const op = effectiveSign > 0 ? (res ? "+" : "") : "-";
    
    // Only show 1 if it's the only thing or explicit? usually implicit for sqrt
    const c_abs = Math.abs(c_sim);
    const surdPart = (c_abs === 1 ? "" : c_abs) + "√" + radical;
    
    res += `${op}${surdPart}`;

    const absD = Math.abs(d_sim);
    if (absD !== 1) {
        return `(${res})/${absD}`;
    }
    return res;
};

// --- Equation Solvers ---

export const solveLinear2 = (vals: number[]): EqnSolution[] => {
  const [a1, b1, c1, a2, b2, c2] = vals;
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-12) return [{ label: "Info", exactStr: "No Unique Solution", decimalStr: "No Unique Solution" }];
  
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  
  return [
    createSolution("X", x),
    createSolution("Y", y)
  ];
};

export const solveLinear3 = (vals: number[]): EqnSolution[] => {
  try {
    const A = [[vals[0], vals[1], vals[2]], [vals[4], vals[5], vals[6]], [vals[8], vals[9], vals[10]]];
    const B = [vals[3], vals[7], vals[11]];
    // @ts-ignore
    const res = math.lusolve(A, B);
    return [
      // @ts-ignore
      createSolution("X", res[0][0]),
      // @ts-ignore
      createSolution("Y", res[1][0]),
      // @ts-ignore
      createSolution("Z", res[2][0])
    ];
  } catch (e) {
    return [{ label: "Error", exactStr: "Math Error", decimalStr: "Math Error" }];
  }
};

export const solveQuadratic = (vals: number[]): EqnSolution[] => {
  // aX^2 + bX + c = 0
  const [a, b, c] = vals;
  if (a === 0) return solveLinear2([b, -1, -c, 0, 0, 0]); // Fallback or Error
  
  return solveQuadExactInternal(a, b, c);
};

const solveQuadExactInternal = (a: number, b: number, c: number): EqnSolution[] => {
    const delta = b * b - 4 * a * c;

    if (delta >= 0) {
        const x1Exact = getQuadRootString(a, b, delta, 1);
        const x2Exact = getQuadRootString(a, b, delta, -1);
        
        const x1Dec = (-b + Math.sqrt(delta)) / (2 * a);
        const x2Dec = (-b - Math.sqrt(delta)) / (2 * a);

        return [
            { label: "X₁", exactStr: x1Exact, decimalStr: math.format(x1Dec, {precision: 8}) },
            { label: "X₂", exactStr: x2Exact, decimalStr: math.format(x2Dec, {precision: 8}) }
        ];
    } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(Math.abs(delta)) / (2 * a);
        const rS = math.format(real, {precision: 5});
        const iS = math.format(imag, {precision: 5});
        return [
            { label: "X₁", exactStr: `${rS} + ${iS}i`, decimalStr: `${rS} + ${iS}i` },
            { label: "X₂", exactStr: `${rS} - ${iS}i`, decimalStr: `${rS} - ${iS}i` }
        ];
    }
}

export const solveCubic = (vals: number[]): EqnSolution[] => {
    // aX^3 + bX^2 + cX + d = 0
    const [a, b, c, d] = vals;
    
    // Case 0: Not cubic
    if (Math.abs(a) < 1e-9) return solveQuadratic([b, c, d]);

    // Case 1: d = 0 -> x(ax^2 + bx + c) = 0
    // Roots are 0 and roots of Quad
    if (Math.abs(d) < 1e-9) {
        const quadSolutions = solveQuadExactInternal(a, b, c);
        // Add X3 = 0. We sort roughly to keep 0 at end or beginning.
        // Usually Casio displays roots in descending order.
        return [
            ...quadSolutions,
            { label: "X₃", exactStr: "0", decimalStr: "0" }
        ].map((sol, i) => ({ ...sol, label: `X${getSub(i+1)}` }));
    }

    // Case 2: Full Cubic (fallback to Numerical for now as exact cubic formulas are huge)
    // We can try to check for simple integer roots later if needed.
    return solveCubicNumerical(a, b, c, d);
}

const solveCubicNumerical = (a: number, b: number, c: number, d: number): EqnSolution[] => {
    // Standard Cardano/Numerical
    // Normalize
    const A = b / a;
    const B = c / a;
    const C = d / a;
    const sqA = A * A;
    const p = B - sqA / 3;
    const q = (2 * sqA * A) / 27 - (A * B) / 3 + C;
    const D = (q * q) / 4 + (p * p * p) / 27;

    const offset = A / 3;
    let roots: number[] = [];

    if (Math.abs(D) < 1e-9) {
       if (Math.abs(p) < 1e-9) {
           roots = [-offset, -offset, -offset];
       } else {
           const t1 = 2 * Math.cbrt(-q / 2);
           const t2 = -t1 / 2;
           roots = [t1 - offset, t2 - offset, t2 - offset];
       }
    } else if (D > 0) {
        const sqrtD = Math.sqrt(D);
        const u = Math.cbrt(-q / 2 + sqrtD);
        const v = Math.cbrt(-q / 2 - sqrtD);
        const t1 = u + v - offset;
        // Complex roots ignored for standard simple cubic view usually or shown as complex
        // We will just return the real one and 2 complex
        const realPart = -(u + v) / 2 - offset;
        const imagPart = (Math.sqrt(3) / 2) * (u - v);
        return [
            createSolution("X₁", t1),
            { label: "X₂", exactStr: formatComplex(realPart, imagPart), decimalStr: formatComplex(realPart, imagPart) },
            { label: "X₃", exactStr: formatComplex(realPart, -imagPart), decimalStr: formatComplex(realPart, -imagPart) }
        ];
    } else {
        const phi = Math.acos( -q / 2 / Math.sqrt( -(p*p*p)/27 ) );
        const r = 2 * Math.sqrt(-p/3);
        roots = [
            r * Math.cos(phi / 3) - offset,
            r * Math.cos((phi + 2 * Math.PI) / 3) - offset,
            r * Math.cos((phi + 4 * Math.PI) / 3) - offset
        ];
    }

    roots.sort((n1, n2) => n2 - n1); // Descending
    return roots.map((r, i) => createSolution(`X${getSub(i+1)}`, r));
}

// Utils
const createSolution = (lbl: string, val: number): EqnSolution => {
    const s = math.format(val, { precision: 8 });
    return { label: lbl, exactStr: s, decimalStr: s };
}

const formatComplex = (re: number, im: number) => {
    const rS = math.format(re, {precision: 5});
    const iS = math.format(Math.abs(im), {precision: 5});
    return `${rS} ${im < 0 ? '-' : '+'} ${iS}i`;
}

const getSub = (n: number) => {
    const subs = ['₀','₁','₂','₃'];
    return subs[n] || n;
}

export const CONSTANTS = [
  { code: '01', symbol: 'mp', name: 'Proton mass', value: '1.6726219 × 10⁻²⁷', unit: 'kg' },
  { code: '02', symbol: 'mn', name: 'Neutron mass', value: '1.6749274 × 10⁻²⁷', unit: 'kg' },
  { code: '03', symbol: 'me', name: 'Electron mass', value: '9.1093835 × 10⁻³¹', unit: 'kg' },
  { code: '06', symbol: 'h', name: 'Planck constant', value: '6.6260701 × 10⁻³⁴', unit: 'Js' },
  { code: '24', symbol: 'NA', name: 'Avogadro constant', value: '6.0221407 × 10²³', unit: 'mol⁻¹' },
  { code: '35', symbol: 'g', name: 'Standard gravity', value: '9.80665', unit: 'ms⁻²' },
];

export const CONVERSIONS = [
  { id: '1', name: 'in → cm', from: 'in', to: 'cm', formula: 'x * 2.54' },
  { id: '2', name: 'cm → in', from: 'cm', to: 'in', formula: 'x / 2.54' },
  { id: '3', name: 'ft → m', from: 'ft', to: 'm', formula: 'x * 0.3048' },
  { id: '4', name: 'kg → lb', from: 'kg', to: 'lb', formula: 'x * 2.20462' },
  { id: '5', name: 'km/h → m/s', from: 'km/h', to: 'm/s', formula: 'x / 3.6' },
];