// Mesin hitung kalkulator ilmiah. Menulis parser sendiri supaya tidak memakai eval
// dan tetap bisa diuji tanpa DOM.

export type AngleMode = 'deg' | 'rad';

type Token =
  | { type: 'number'; value: number }
  | { type: 'name'; value: string }
  | { type: 'op'; value: string };

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sqrt',
  'cbrt',
  'log',
  'ln',
  'abs',
  'exp',
]);

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === ' ') {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = /^\d*\.?\d+(?:[eE][+-]?\d+)?/.exec(input.slice(index));
      if (!match) throw new Error(`Angka tidak valid di posisi ${index + 1}.`);
      tokens.push({ type: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    if (/[a-zA-Zπ]/.test(char)) {
      const match = /^[a-zA-Zπ]+/.exec(input.slice(index));
      if (!match) throw new Error(`Nama tidak valid di posisi ${index + 1}.`);
      tokens.push({ type: 'name', value: match[0].toLowerCase() });
      index += match[0].length;
      continue;
    }

    if ('+-*/^%!()'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }

    throw new Error(`Karakter "${char}" tidak dikenal.`);
  }

  return tokens;
}

function factorial(value: number): number {
  if (value < 0 || !Number.isInteger(value)) return Number.NaN;
  if (value > 170) return Number.POSITIVE_INFINITY;
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) result *= factor;
  return result;
}

function toRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? (value * 180) / Math.PI : value;
}

function applyFunction(name: string, argument: number, mode: AngleMode): number {
  switch (name) {
    case 'sin':
      return Math.sin(toRadians(argument, mode));
    case 'cos':
      return Math.cos(toRadians(argument, mode));
    case 'tan':
      return Math.tan(toRadians(argument, mode));
    case 'asin':
      return fromRadians(Math.asin(argument), mode);
    case 'acos':
      return fromRadians(Math.acos(argument), mode);
    case 'atan':
      return fromRadians(Math.atan(argument), mode);
    case 'sqrt':
      return Math.sqrt(argument);
    case 'cbrt':
      return Math.cbrt(argument);
    case 'log':
      return Math.log10(argument);
    case 'ln':
      return Math.log(argument);
    case 'abs':
      return Math.abs(argument);
    case 'exp':
      return Math.exp(argument);
    default:
      throw new Error(`Fungsi "${name}" tidak dikenal.`);
  }
}

class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly mode: AngleMode,
  ) {}

  parse(): number {
    const value = this.parseExpression();
    if (this.position < this.tokens.length) {
      throw new Error('Ada bagian rumus yang belum selesai.');
    }
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private eatOperator(value: string): boolean {
    const token = this.peek();
    if (token && token.type === 'op' && token.value === value) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    for (;;) {
      if (this.eatOperator('+')) value += this.parseTerm();
      else if (this.eatOperator('-')) value -= this.parseTerm();
      else return value;
    }
  }

  private parseTerm(): number {
    let value = this.parsePower();
    for (;;) {
      if (this.eatOperator('*')) value *= this.parsePower();
      else if (this.eatOperator('/')) value /= this.parsePower();
      else return value;
    }
  }

  private parsePower(): number {
    const base = this.parseUnary();
    if (this.eatOperator('^')) return base ** this.parsePower();
    return base;
  }

  private parseUnary(): number {
    if (this.eatOperator('-')) return -this.parseUnary();
    if (this.eatOperator('+')) return this.parseUnary();
    return this.parsePostfix();
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    for (;;) {
      if (this.eatOperator('!')) value = factorial(value);
      else if (this.eatOperator('%')) value /= 100;
      else return value;
    }
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error('Rumus belum lengkap.');

    if (token.type === 'number') {
      this.position += 1;
      return token.value;
    }

    if (token.type === 'name') {
      this.position += 1;
      const name = token.value;

      if (name in CONSTANTS) return CONSTANTS[name];
      if (!FUNCTIONS.has(name)) throw new Error(`Nama "${name}" tidak dikenal.`);

      if (!this.eatOperator('(')) throw new Error(`Fungsi "${name}" butuh tanda kurung.`);
      const argument = this.parseExpression();
      if (!this.eatOperator(')')) throw new Error(`Kurung untuk "${name}" belum ditutup.`);
      return applyFunction(name, argument, this.mode);
    }

    if (token.type === 'op' && token.value === '(') {
      this.position += 1;
      const value = this.parseExpression();
      if (!this.eatOperator(')')) throw new Error('Kurung belum ditutup.');
      return value;
    }

    throw new Error('Rumus tidak valid.');
  }
}

// Menghitung rumus. Melempar Error dengan pesan Bahasa Indonesia bila tidak valid.
export function evaluateExpression(input: string, mode: AngleMode = 'deg'): number {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Rumus masih kosong.');
  return new Parser(tokenize(trimmed), mode).parse();
}

// Ubah hasil menjadi teks yang rapi: buang nol di belakang, tangani angka besar.
export function formatResult(value: number): string {
  if (Number.isNaN(value)) return 'Tidak terdefinisi';
  if (!Number.isFinite(value)) return value > 0 ? 'Tak hingga' : 'Minus tak hingga';
  if (value === 0) return '0';

  const magnitude = Math.abs(value);
  if (magnitude >= 1e12 || magnitude < 1e-6) return value.toExponential(6);

  const rounded = Number(value.toPrecision(12));
  return String(rounded);
}
