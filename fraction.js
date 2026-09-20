'use strict';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

class Fraction {
  constructor(num, den = 1) {
    if (den === 0) throw new Error('Nenner darf nicht 0 sein');
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }

  static fromNumber(n) {
    if (Number.isInteger(n)) return new Fraction(n, 1);
    const str = String(n);
    const dot = str.indexOf('.');
    if (dot === -1) return new Fraction(Math.round(n), 1);
    const decimals = str.length - dot - 1;
    const den = Math.pow(10, decimals);
    return new Fraction(Math.round(n * den), den);
  }

  add(o) {
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(o) {
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(o) {
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(o) {
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  neg() {
    return new Fraction(-this.num, this.den);
  }

  equals(o) {
    // Beide Seiten sind durch den Konstruktor bereits vollständig gekürzt,
    // daher genügt ein exakter Vergleich von Zähler und Nenner.
    return this.num === o.num && this.den === o.den;
  }

  toNumber() {
    return this.num / this.den;
  }

  isInteger() {
    return this.den === 1;
  }

  toString() {
    if (this.den === 1) return String(this.num);
    return `${this.num}/${this.den}`;
  }
}

/**
 * Gibt die exakte Dezimaldarstellung zurück, falls der (gekürzte) Nenner
 * nur die Primfaktoren 2 und 5 enthält (terminierender Dezimalbruch),
 * sonst null.
 */
function toDecimalString(f) {
  let d = f.den;
  let factor2 = 0;
  let factor5 = 0;
  while (d % 2 === 0) {
    d /= 2;
    factor2++;
  }
  while (d % 5 === 0) {
    d /= 5;
    factor5++;
  }
  if (d !== 1) return null;

  const shift = Math.max(factor2, factor5);
  const multiplier = Math.pow(2, shift - factor2) * Math.pow(5, shift - factor5);
  const scaledNum = f.num * multiplier;
  const denPow = Math.pow(10, shift);
  const negative = scaledNum < 0;
  const abs = Math.abs(scaledNum);
  const intPart = Math.floor(abs / denPow);
  const fracPart = abs % denPow;
  let fracStr = shift > 0 ? String(fracPart).padStart(shift, '0') : '';
  fracStr = fracStr.replace(/0+$/, '');
  const result = String(intPart) + (fracStr ? '.' + fracStr : '');
  return negative && (intPart !== 0 || fracStr !== '') ? '-' + result : result;
}

/** Formatiert einen Fraction möglichst lesbar: Dezimalzahl wenn möglich, sonst a/b. */
function formatFraction(f) {
  const dec = toDecimalString(f);
  return dec !== null ? dec : `${f.num}/${f.den}`;
}

/**
 * Parst eine Nutzereingabe in einen Fraction. Akzeptiert:
 * ganze Zahlen, Dezimalzahlen (mit "." oder ","), Brüche "a/b".
 * Wirft einen Error bei ungültiger Eingabe.
 */
function parseAnswer(input) {
  const trimmed = String(input).trim().replace(/\s+/g, '');
  if (trimmed === '') throw new Error('Bitte eine Antwort eingeben');

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length !== 2) throw new Error('Ungültiger Bruch');
    const num = Number(parts[0].replace(',', '.'));
    const den = Number(parts[1].replace(',', '.'));
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
      throw new Error('Ungültiger Bruch');
    }
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      throw new Error('Zähler und Nenner müssen ganze Zahlen sein');
    }
    return new Fraction(num, den);
  }

  const normalized = trimmed.replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) throw new Error('Ungültige Zahl');
  return Fraction.fromNumber(value);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Fraction, parseAnswer, gcd, formatFraction, toDecimalString };
}
