'use strict';

// Nutzt Fraction/formatFraction aus fraction.js (muss davor geladen werden).

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DENOMS = [3, 4, 5, 6, 7, 8, 10, 12, 20];

function randFraction(maxNum, den) {
  const num = randInt(1, maxNum);
  return new Fraction(num, den);
}

function randDecFraction(minVal, maxVal, decimals) {
  const scale = Math.pow(10, decimals);
  const lo = Math.round(minVal * scale);
  const hi = Math.round(maxVal * scale);
  const n = randInt(lo, hi);
  return new Fraction(n, scale);
}

function fmt(f) {
  return formatFraction(f);
}

function signedStr(f) {
  // Erwartet f evtl. negativ; liefert " + 3" oder " - 3" fürs Anhängen.
  return f.num < 0 ? ` - ${fmt(f.neg())}` : ` + ${fmt(f)}`;
}

// ---------------------------------------------------------------------
// Typ A: Ausklammern & berechnen  (a·b ± a·c)
// ---------------------------------------------------------------------
function generateTypeA() {
  const mode = choice(['frac', 'dec']);
  const a = randInt(2, 9);
  const op = choice(['-', '+']);

  let b, c, prompt;
  if (mode === 'frac') {
    const den = choice(DENOMS);
    let n1 = randInt(1, 3 * den);
    let n2 = randInt(1, 3 * den);
    if (n1 === n2) n2 = n2 === 1 ? n2 + 1 : n2 - 1;
    b = new Fraction(n1, den);
    c = new Fraction(n2, den);
    prompt = `${a} · ${fmt(b)} ${op} ${a} · ${fmt(c)}`;
  } else {
    b = randDecFraction(0.1, 15, 1);
    c = randDecFraction(0.1, 15, 1);
    if (b.equals(c)) c = c.add(new Fraction(1, 10));
    prompt = `${a} · ${fmt(b)} ${op} ${a} · ${fmt(c)}`;
  }

  const aFrac = new Fraction(a, 1);
  const inner = op === '-' ? b.sub(c) : b.add(c);
  const answer = aFrac.mul(inner);

  return {
    kind: 'input',
    prompt: `Klammere aus und berechne:\n${prompt}`,
    answer,
    hint: `Ausklammern: ${a} · (${fmt(b)} ${op} ${fmt(c)})`,
  };
}

// ---------------------------------------------------------------------
// Typ B: Geschickt berechnen
// ---------------------------------------------------------------------
function tplFractionFactorTwoInts() {
  const den = choice(DENOMS);
  const p = randInt(1, den - 1);
  const x = randInt(10, 99);
  const y = randInt(10, 99);
  const coeff = new Fraction(p, den);
  const op = choice(['-', '+']);
  const prompt = `${fmt(coeff)} · ${x} ${op} ${fmt(coeff)} · ${y}`;
  const inner = op === '-' ? x - y : x + y;
  const answer = coeff.mul(new Fraction(inner, 1));
  return { prompt, answer };
}

function tplFractionTimesSum() {
  const outerDen = choice(DENOMS);
  const p = randInt(1, outerDen - 1);
  const coeff = new Fraction(p, outerDen);
  const innerDen = choice(DENOMS);
  const n1 = randInt(1, 2 * innerDen);
  const n2 = randInt(1, 2 * innerDen);
  const op = choice(['+', '-']);
  const b = new Fraction(n1, innerDen);
  const c = new Fraction(n2, innerDen);
  const prompt = `${fmt(coeff)} · (${fmt(b)} ${op} ${fmt(c)})`;
  const inner = op === '-' ? b.sub(c) : b.add(c);
  const answer = coeff.mul(inner);
  return { prompt, answer };
}

function tplNegFractionsCommonFactor() {
  const den = choice(DENOMS);
  const p = randInt(1, den - 1);
  const r = randInt(1, den - 1);
  const k = randInt(2, 40);
  const coeff1 = new Fraction(p, den);
  const coeff2 = new Fraction(r, den);
  const prompt = `-${fmt(coeff1)} · ${k} - ${fmt(coeff2)} · ${k}`;
  const answer = coeff1.neg().mul(new Fraction(k, 1)).sub(coeff2.mul(new Fraction(k, 1)));
  return { prompt, answer };
}

function tplHundredTimesSum() {
  const k = choice([10, 100]);
  const num = randInt(1, k - 1);
  const dec = randDecFraction(0.1, 5, 1);
  const op = choice(['+', '-']);
  const frac = new Fraction(num, k);
  const prompt = `${k} · (${fmt(frac)} ${op} ${fmt(dec)})`;
  const inner = op === '-' ? frac.sub(dec) : frac.add(dec);
  const answer = new Fraction(k, 1).mul(inner);
  return { prompt, answer };
}

function tplIntTimesDecDiff() {
  const a = randInt(2, 9);
  const d1 = randDecFraction(1, 20, 1);
  let d2 = randDecFraction(0.1, 10, 1);
  if (d2.toNumber() >= d1.toNumber()) d2 = randDecFraction(0.1, Math.max(0.2, d1.toNumber() - 0.1), 1);
  const op = choice(['-', '+']);
  const prompt = `${a} · (${fmt(d1)} ${op} ${fmt(d2)})`;
  const inner = op === '-' ? d1.sub(d2) : d1.add(d2);
  const answer = new Fraction(a, 1).mul(inner);
  return { prompt, answer };
}

function tplReverseDistribute() {
  const d = randDecFraction(0.1, 3, 2);
  const x = randInt(2, 20);
  const y = randInt(2, 20);
  const op = choice(['+', '-']);
  const prompt = `${x} · ${fmt(d)} ${op} ${y} · ${fmt(d)}`;
  const inner = op === '-' ? x - y : x + y;
  const answer = d.mul(new Fraction(inner, 1));
  return { prompt, answer };
}

function tplNegSumTimesDec() {
  const a = randInt(2, 60);
  const b = randInt(1, 20);
  const d = randDecFraction(0.1, 3, 1);
  const prompt = `(-${a} - ${b}) · ${fmt(d)}`;
  const answer = new Fraction(-a - b, 1).mul(d);
  return { prompt, answer };
}

const TYPE_B_TEMPLATES = [
  tplFractionFactorTwoInts,
  tplFractionTimesSum,
  tplNegFractionsCommonFactor,
  tplHundredTimesSum,
  tplIntTimesDecDiff,
  tplReverseDistribute,
  tplNegSumTimesDec,
];

function generateTypeB() {
  const tpl = choice(TYPE_B_TEMPLATES);
  const { prompt, answer } = tpl();
  return {
    kind: 'input',
    prompt: `Berechne geschickt:\n${prompt}`,
    answer,
    hint: 'Nutze das Distributivgesetz, wo es das Rechnen erleichtert.',
  };
}

// ---------------------------------------------------------------------
// Typ C: Klammern setzen & berechnen (Summe/Differenz mehrerer Terme)
// ---------------------------------------------------------------------
function generateTypeC() {
  const mode = choice(['frac', 'dec']);
  const termCount = choice([3, 3, 4]);

  const terms = [];
  if (mode === 'frac') {
    const commonDen = choice(DENOMS);
    const otherDen = choice(DENOMS.filter((d) => d !== commonDen));
    terms.push(randFraction(2 * commonDen, commonDen));
    terms.push(randFraction(2 * commonDen, commonDen));
    terms.push(randFraction(2 * otherDen, otherDen));
    if (termCount === 4) {
      terms.push(new Fraction(randInt(1, 5), 1));
    }
  } else {
    for (let i = 0; i < termCount; i++) {
      terms.push(randDecFraction(0.1, 10, choice([1, 2])));
    }
  }

  const signs = terms.map((_, i) => (i === 0 ? 1 : choice([1, -1])));
  const shuffledOrder = shuffle(terms.map((_, i) => i));

  let promptParts = [];
  let answer = new Fraction(0, 1);
  shuffledOrder.forEach((idx, pos) => {
    const term = terms[idx];
    const s = signs[idx];
    const value = s === 1 ? term : term.neg();
    answer = answer.add(value);
    if (pos === 0) {
      promptParts.push(s === 1 ? fmt(term) : `-${fmt(term)}`);
    } else {
      promptParts.push(s === 1 ? `+ ${fmt(term)}` : `- ${fmt(term)}`);
    }
  });

  return {
    kind: 'input',
    prompt: `Setze geschickt Klammern und berechne:\n${promptParts.join(' ')}`,
    answer,
    hint: 'Fasse Terme mit gleichem Nenner bzw. günstige Dezimalzahlen zuerst zusammen.',
  };
}

// ---------------------------------------------------------------------
// Typ D: Äquivalente Ausdrücke zuordnen (Multiple Choice, Mehrfachauswahl)
// ---------------------------------------------------------------------
function generateTypeD() {
  const a = randInt(2, 9);
  const b = randInt(2, 12);
  let c = randInt(2, 12);
  if (c === b) c = c + 1;
  const op = choice(['-', '+']);

  const aF = new Fraction(a, 1);
  const bF = new Fraction(b, 1);
  const cF = new Fraction(c, 1);
  const inner = op === '-' ? bF.sub(cF) : bF.add(cF);
  const reference = aF.mul(inner);

  const opWord = op === '-' ? '-' : '+';

  const candidates = [
    { label: `(${b} ${opWord} ${c}) · ${a}`, value: inner.mul(aF) },
    { label: `${a} · ${b} ${opWord} ${a} · ${c}`, value: aF.mul(bF)[op === '-' ? 'sub' : 'add'](aF.mul(cF)) },
    { label: `${a} · ${b} ${opWord} ${c}`, value: aF.mul(bF)[op === '-' ? 'sub' : 'add'](cF) },
    {
      label: `${c} · ${a} ${opWord} ${b} · ${a}`,
      value: cF.mul(aF)[op === '-' ? 'sub' : 'add'](bF.mul(aF)),
    },
    { label: `${a} · ${c} ${opWord} ${a} · ${b}`, value: aF.mul(cF)[op === '-' ? 'sub' : 'add'](aF.mul(bF)) },
    { label: `${b} · ${c} ${opWord} ${a} · ${c}`, value: bF.mul(cF)[op === '-' ? 'sub' : 'add'](aF.mul(cF)) },
  ];

  const options = candidates.map((cand) => ({
    label: cand.label,
    correct: cand.value.equals(reference),
  }));

  // Sicherheitsnetz: falls zufällig zu wenige/zu viele korrekte Optionen entstehen,
  // Aufgabe neu generieren.
  const correctCount = options.filter((o) => o.correct).length;
  if (correctCount < 1 || correctCount > 4) return generateTypeD();

  return {
    kind: 'multi',
    prompt: `Entscheide, ohne zu rechnen: Welche Rechenausdrücke haben das gleiche Ergebnis wie\n${a} · (${b} ${opWord} ${c})?\n(Es können mehrere richtig sein.)`,
    options: shuffle(options),
    hint: `${a} · (${b} ${opWord} ${c}) = ${a} · ${b} ${opWord} ${a} · ${c} = ${fmt(reference)}`,
  };
}

// ---------------------------------------------------------------------
// Typ E: Stolperstelle / Fehlersuche (Multiple Choice, eine richtige Antwort)
// ---------------------------------------------------------------------
function makeOptions(correctValue, wrongValues) {
  const seen = new Set([fmt(correctValue)]);
  const uniqueWrongs = [];
  for (const w of wrongValues) {
    const key = fmt(w);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueWrongs.push(w);
    }
  }
  const pool = [correctValue, ...uniqueWrongs].slice(0, 4);
  const options = shuffle(
    pool.map((v) => ({ label: fmt(v), correct: v.equals(correctValue) }))
  );
  return options;
}

function errNegTimesMinus() {
  const a = randInt(2, 9);
  const b = randInt(10, 30);
  const c = randInt(2, 9);
  const aF = new Fraction(a, 1);
  const bF = new Fraction(b, 1);
  const cF = new Fraction(c, 1);
  const correct = aF.neg().mul(bF.sub(cF)); // -a·(b-c) = -a·b + a·c
  const mistake = aF.neg().mul(bF).sub(aF.mul(cF)); // -a·b - a·c (Mehdis Fehler)
  const wrongDropSign = aF.mul(bF).sub(aF.mul(cF));
  const wrongBoth = aF.neg().mul(bF).sub(aF.neg().mul(cF)).neg();
  return {
    statement: `Mehdi rechnet: -${a} · (${b} - ${c}) = -${a} · ${b} - ${a} · ${c}`,
    question: `Wie lautet das richtige Ergebnis von -${a} · (${b} - ${c})?`,
    options: makeOptions(correct, [mistake, wrongDropSign, wrongBoth]),
    hint: `Beim Ausmultiplizieren mit -${a} ändern sich beide Vorzeichen: -${a} · (${b} - ${c}) = -${a} · ${b} + ${a} · ${c} = ${fmt(correct)}`,
  };
}

function errDoubleMinusBracket() {
  const p = randInt(30, 90);
  const q = randInt(5, 40);
  const r = randInt(5, 40);
  const pF = new Fraction(p, 1);
  const qF = new Fraction(q, 1);
  const rF = new Fraction(r, 1);
  const correct = pF.sub(qF.neg().sub(rF)); // p - (-q - r) = p + q + r
  const mistake = pF.sub(qF).add(rF); // p - q + r (Mehdis Fehler)
  const wrong2 = pF.sub(qF).sub(rF);
  const wrong3 = pF.add(qF).sub(rF);
  return {
    statement: `Mehdi rechnet: ${p} - (-${q} - ${r}) = ${p} - ${q} + ${r}`,
    question: `Wie lautet das richtige Ergebnis von ${p} - (-${q} - ${r})?`,
    options: makeOptions(correct, [mistake, wrong2, wrong3]),
    hint: `Ein Minus vor der Klammer dreht JEDES Vorzeichen in der Klammer um: ${p} - (-${q} - ${r}) = ${p} + ${q} + ${r} = ${fmt(correct)}`,
  };
}

function errNegTimesPlus() {
  const a = randInt(2, 9);
  const b = randInt(2, 20);
  const c = randInt(2, 20);
  const aF = new Fraction(a, 1);
  const bF = new Fraction(b, 1);
  const cF = new Fraction(c, 1);
  const correct = aF.neg().mul(bF.add(cF)); // -a·(b+c) = -a·b - a·c
  const mistake = aF.neg().mul(bF).add(aF.mul(cF)); // -a·b + a·c (Mehdis Fehler)
  const wrong2 = aF.mul(bF).add(aF.mul(cF));
  const wrong3 = aF.mul(bF).sub(aF.mul(cF));
  return {
    statement: `Mehdi rechnet: -${a} · (${b} + ${c}) = -${a} · ${b} + ${a} · ${c}`,
    question: `Wie lautet das richtige Ergebnis von -${a} · (${b} + ${c})?`,
    options: makeOptions(correct, [mistake, wrong2, wrong3]),
    hint: `Beim Ausmultiplizieren mit -${a} bleibt das Vorzeichen von + gleich, wird also zu -: -${a} · (${b} + ${c}) = -${a} · ${b} - ${a} · ${c} = ${fmt(correct)}`,
  };
}

const TYPE_E_GENERATORS = [errNegTimesMinus, errDoubleMinusBracket, errNegTimesPlus];

function generateTypeE() {
  const gen = choice(TYPE_E_GENERATORS);
  const { statement, question, options, hint } = gen();
  const correctCount = options.filter((o) => o.correct).length;
  if (correctCount !== 1 || options.length < 2) return generateTypeE();
  return {
    kind: 'choice',
    prompt: `Stolperstelle: ${statement}\n${question}`,
    options,
    hint,
  };
}

// ---------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------
const TASK_GENERATORS = {
  A: generateTypeA,
  B: generateTypeB,
  C: generateTypeC,
  D: generateTypeD,
  E: generateTypeE,
};

function generateTask() {
  const type = choice(Object.keys(TASK_GENERATORS));
  return TASK_GENERATORS[type]();
}

function generateTaskSet(n) {
  return Array.from({ length: n }, generateTask);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateTask, generateTaskSet, TASK_GENERATORS };
}
