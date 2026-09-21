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

/**
 * Erzwingt Bruchschreibweise (a/b bzw. nur a bei ganzen Zahlen), auch wenn der
 * Nenner "zufällig" dezimal darstellbar wäre (z. B. 20). Für Aufgaben, die
 * bewusst mit Brüchen arbeiten – sonst würde z. B. 29/40 als 0.725
 * angezeigt und die Bruch-/Dezimal-Schreibweisen würden wild gemischt.
 */
function fmtFrac(f) {
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`;
}

/**
 * Liefert zwei (vorzeichenbehaftete) Brüche über dem Nenner `den`, deren Summe
 * exakt die ganze Zahl k ergibt (k aus [kMin, kMax]). Das ist der "Trick" hinter
 * geschicktem Klammernsetzen: eine Teilsumme wird überraschend glatt.
 */
function niceFractionPair(den, kMin, kMax) {
  const k = randInt(kMin, kMax);
  const numA = randInt(1, 3 * den) * choice([1, -1]);
  const a = new Fraction(numA, den);
  const b = new Fraction(k, 1).sub(a);
  return [a, b];
}

/**
 * Wie niceFractionPair, aber für Dezimalzahlen (z. B. 3,82 + 0,18 = 4).
 */
function niceDecimalPair(decimals, kMin, kMax) {
  const k = randInt(kMin, kMax);
  const magnitude = randDecFraction(0.1, 12, decimals);
  const a = choice([1, -1]) === 1 ? magnitude : magnitude.neg();
  const b = new Fraction(k, 1).sub(a);
  return [a, b];
}

// ---------------------------------------------------------------------
// Typ A: Ausklammern & berechnen  (a·b ± a·c)
// ---------------------------------------------------------------------
function generateTypeA() {
  const mode = choice(['frac', 'dec']);
  const fmtTerm = mode === 'frac' ? fmtFrac : fmt;
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
    prompt = `${a} · ${fmtTerm(b)} ${op} ${a} · ${fmtTerm(c)}`;
  } else {
    // b und c so wählen, dass b op c eine glatte ganze Zahl ergibt
    // (wie im Aufgabenblatt: 1,4 + 1,6 = 3, 2,3 − 0,3 = 2).
    c = randDecFraction(0.1, 9.9, 1);
    const whole = randInt(1, 9);
    if (op === '-') {
      b = c.add(new Fraction(whole, 1));
    } else {
      const target = new Fraction(Math.ceil(c.toNumber()) + whole, 1);
      b = target.sub(c);
    }
    prompt = `${a} · ${fmtTerm(b)} ${op} ${a} · ${fmtTerm(c)}`;
  }

  const aFrac = new Fraction(a, 1);
  const inner = op === '-' ? b.sub(c) : b.add(c);
  const answer = aFrac.mul(inner);

  return {
    kind: 'input',
    prompt: `Klammere aus und berechne:\n${prompt}`,
    answer,
    hint: `Ausklammern: ${a} · (${fmtTerm(b)} ${op} ${fmtTerm(c)})`,
  };
}

// ---------------------------------------------------------------------
// Typ B: Geschickt berechnen
// ---------------------------------------------------------------------
function tplFractionFactorTwoInts() {
  // x und y so wählen, dass x op y ein Vielfaches des Nenners ist – dann kürzt
  // sich der Bruch beim Ausklammern glatt weg (wie 5/6·90 − 5/6·84 = 5/6·6 = 5).
  const den = choice(DENOMS);
  const p = randInt(1, den - 1);
  const coeff = new Fraction(p, den);
  const op = choice(['-', '+']);
  const y = randInt(10, 60);
  const kMax = Math.max(2, Math.min(8, Math.floor(60 / den)));
  const k = randInt(2, kMax);
  let x;
  if (op === '-') {
    x = y + k * den;
  } else {
    x = k * den - y;
    while (x < 10) x += den;
  }
  const prompt = `${fmtFrac(coeff)} · ${x} ${op} ${fmtFrac(coeff)} · ${y}`;
  const inner = op === '-' ? x - y : x + y;
  const answer = coeff.mul(new Fraction(inner, 1));
  return { prompt, answer };
}

function tplFractionTimesSum() {
  // n1, n2 so wählen, dass n1 op n2 ein Vielfaches von innerDen ist – die
  // Klammer wird dann zu einer kleinen ganzen Zahl (wie 4/3·(9/20+11/20)=4/3·1).
  const outerDen = choice(DENOMS);
  const p = randInt(1, outerDen - 1);
  const coeff = new Fraction(p, outerDen);
  const innerDen = choice(DENOMS);
  const op = choice(['+', '-']);
  const n2 = randInt(1, 2 * innerDen);
  const k = randInt(1, 3);
  let n1;
  if (op === '+') {
    n1 = k * innerDen - n2;
    while (n1 < 1) n1 += innerDen;
  } else {
    n1 = n2 + k * innerDen;
  }
  const b = new Fraction(n1, innerDen);
  const c = new Fraction(n2, innerDen);
  const prompt = `${fmtFrac(coeff)} · (${fmtFrac(b)} ${op} ${fmtFrac(c)})`;
  const inner = op === '-' ? b.sub(c) : b.add(c);
  const answer = coeff.mul(inner);
  return { prompt, answer };
}

function tplNegFractionsCommonFactor() {
  // p + r als Vielfaches von den wählen, damit sich die Brüche beim
  // Ausklammern zu einer ganzen Zahl addieren (wie -19/40 - 21/40 = -1).
  const den = choice(DENOMS);
  const r = randInt(1, den - 1);
  const m = randInt(1, 2);
  let p = m * den - r;
  while (p < 1) p += den;
  const k = randInt(2, 40);
  const coeff1 = new Fraction(p, den);
  const coeff2 = new Fraction(r, den);
  const prompt = `-${fmtFrac(coeff1)} · ${k} - ${fmtFrac(coeff2)} · ${k}`;
  const answer = coeff1.neg().mul(new Fraction(k, 1)).sub(coeff2.mul(new Fraction(k, 1)));
  return { prompt, answer };
}

function tplHundredTimesSum() {
  const k = choice([10, 100]);
  const num = randInt(1, k - 1);
  const dec = randDecFraction(0.1, 5, 1);
  const op = choice(['+', '-']);
  const frac = new Fraction(num, k);
  const prompt = `${k} · (${fmtFrac(frac)} ${op} ${fmt(dec)})`;
  const inner = op === '-' ? frac.sub(dec) : frac.add(dec);
  const answer = new Fraction(k, 1).mul(inner);
  return { prompt, answer };
}

function tplIntTimesDecDiff() {
  // d1 op d2 so konstruieren, dass eine glatte ganze Zahl herauskommt
  // (wie 4·(5,3 − 1,3) = 4·4).
  const a = randInt(2, 9);
  const op = choice(['-', '+']);
  const d2 = randDecFraction(0.1, 9.9, 1);
  const whole = randInt(1, 9);
  let d1;
  if (op === '-') {
    d1 = d2.add(new Fraction(whole, 1));
  } else {
    const target = new Fraction(Math.ceil(d2.toNumber()) + whole, 1);
    d1 = target.sub(d2);
  }
  const prompt = `${a} · (${fmt(d1)} ${op} ${fmt(d2)})`;
  const inner = op === '-' ? d1.sub(d2) : d1.add(d2);
  const answer = new Fraction(a, 1).mul(inner);
  return { prompt, answer };
}

function tplReverseDistribute() {
  // x op y auf ein Vielfaches von 10 bringen, damit das Endergebnis rund wird
  // (wie 3·0,75 + 7·0,75 = 10·0,75).
  const d = randDecFraction(0.1, 3, 2);
  const op = choice(['+', '-']);
  const y = randInt(2, 15);
  const roundTarget = choice([10, 20]);
  let x;
  if (op === '+') {
    x = roundTarget - y;
    if (x < 2) x += roundTarget;
  } else {
    x = y + roundTarget;
  }
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
// Wichtig: "geschicktes Klammernsetzen" lohnt sich nur, wenn irgendwo zwei
// Terme stecken, die sich besonders leicht zusammenfassen lassen (gleicher
// Nenner bzw. eine glatte ganze Zahl als Teilsumme) – sonst ist jede
// Reihenfolge gleich mühsam. Deshalb bauen wir immer genau so ein Paar ein
// und mischen es unter zufällig platzierte, unabhängige "Füll"-Terme.
function generateTypeC() {
  const mode = choice(['frac', 'dec']);
  const fmtTerm = mode === 'frac' ? fmtFrac : fmt;
  const termCount = choice([3, 3, 4]);
  const contributions = [];

  if (mode === 'frac') {
    const commonDen = choice(DENOMS);
    const [pairA, pairB] = niceFractionPair(commonDen, -3, 4);
    contributions.push(pairA, pairB);

    const otherDen = choice(DENOMS.filter((d) => d !== commonDen));
    const filler = randFraction(2 * otherDen, otherDen);
    contributions.push(choice([1, -1]) === 1 ? filler : filler.neg());

    if (termCount === 4) {
      if (choice([true, false])) {
        contributions.push(new Fraction(randInt(1, 6) * choice([1, -1]), 1));
      } else {
        const remainingDens = DENOMS.filter((d) => d !== commonDen && d !== otherDen);
        const den2 = choice(remainingDens);
        const filler2 = randFraction(2 * den2, den2);
        contributions.push(choice([1, -1]) === 1 ? filler2 : filler2.neg());
      }
    }
  } else {
    const decimals = choice([1, 2]);
    const [pairA, pairB] = niceDecimalPair(decimals, -6, 12);
    contributions.push(pairA, pairB);

    for (let i = 2; i < termCount; i++) {
      const filler = randDecFraction(0.1, 10, choice([1, 2]));
      contributions.push(choice([1, -1]) === 1 ? filler : filler.neg());
    }
  }

  const order = shuffle(contributions.map((_, i) => i));
  const promptParts = [];
  let answer = new Fraction(0, 1);
  order.forEach((idx, pos) => {
    const c = contributions[idx];
    answer = answer.add(c);
    const magStr = fmtTerm(c.num < 0 ? c.neg() : c);
    if (pos === 0) {
      promptParts.push(c.num < 0 ? `-${magStr}` : magStr);
    } else {
      promptParts.push(c.num < 0 ? `- ${magStr}` : `+ ${magStr}`);
    }
  });

  const [pairA, pairB] = contributions;
  const pairSum = pairA.add(pairB);
  const pairBMagStr = fmtTerm(pairB.num < 0 ? pairB.neg() : pairB);
  const pairOp = pairB.num < 0 ? '-' : '+';

  return {
    kind: 'input',
    prompt: `Setze geschickt Klammern und berechne:\n${promptParts.join(' ')}`,
    answer,
    hint: `Kombiniere zuerst ${fmtTerm(pairA)} ${pairOp} ${pairBMagStr} = ${fmtTerm(pairSum)}, der Rest ist dann einfach.`,
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
// Die Optionen sind vollständig vorgerechnete Fortsetzungszeilen (nicht nur
// Endergebnisse) – Mehdis fehlerhafte Zeile ist immer als Distraktor dabei.
// So muss man wirklich erkennen, WELCHE Vorzeichen falsch gesetzt wurden,
// statt die Aufgabe einfach unabhängig neu zu berechnen.
function buildCorrectionOptions(candidates) {
  // candidates[0] muss die tatsächlich korrekte Fortsetzung sein.
  const correctValue = candidates[0].value;
  const seen = new Set();
  const unique = [];
  for (const cand of candidates) {
    if (!seen.has(cand.label)) {
      seen.add(cand.label);
      unique.push(cand);
    }
  }
  return shuffle(unique.map((cand) => ({ label: cand.label, correct: cand.value.equals(correctValue) })));
}

function errNegTimesMinus() {
  const a = randInt(2, 9);
  const b = randInt(10, 30);
  const c = randInt(2, 9);
  const aF = new Fraction(a, 1);
  const bF = new Fraction(b, 1);
  const cF = new Fraction(c, 1);
  const options = buildCorrectionOptions([
    { label: `-${a} · ${b} + ${a} · ${c}`, value: aF.neg().mul(bF).add(aF.mul(cF)) }, // richtig
    { label: `-${a} · ${b} - ${a} · ${c}`, value: aF.neg().mul(bF).sub(aF.mul(cF)) }, // Mehdis Fehler
    { label: `${a} · ${b} - ${a} · ${c}`, value: aF.mul(bF).sub(aF.mul(cF)) },
    { label: `${a} · ${b} + ${a} · ${c}`, value: aF.mul(bF).add(aF.mul(cF)) },
  ]);
  return {
    statement: `Mehdi rechnet: -${a} · (${b} - ${c}) = -${a} · ${b} - ${a} · ${c}`,
    options,
    hint: `Beim Ausmultiplizieren mit -${a} ändern sich beide Vorzeichen in der Klammer: -${a} · (${b} - ${c}) = -${a} · ${b} + ${a} · ${c}`,
  };
}

function errDoubleMinusBracket() {
  const p = randInt(30, 90);
  const q = randInt(5, 40);
  const r = randInt(5, 40);
  const pF = new Fraction(p, 1);
  const qF = new Fraction(q, 1);
  const rF = new Fraction(r, 1);
  const options = buildCorrectionOptions([
    { label: `${p} + ${q} + ${r}`, value: pF.add(qF).add(rF) }, // richtig
    { label: `${p} - ${q} + ${r}`, value: pF.sub(qF).add(rF) }, // Mehdis Fehler
    { label: `${p} - ${q} - ${r}`, value: pF.sub(qF).sub(rF) },
    { label: `${p} + ${q} - ${r}`, value: pF.add(qF).sub(rF) },
  ]);
  return {
    statement: `Mehdi rechnet: ${p} - (-${q} - ${r}) = ${p} - ${q} + ${r}`,
    options,
    hint: `Ein Minus vor der Klammer dreht JEDES Vorzeichen in der Klammer um: ${p} - (-${q} - ${r}) = ${p} + ${q} + ${r}`,
  };
}

function errNegTimesPlus() {
  const a = randInt(2, 9);
  const b = randInt(2, 20);
  const c = randInt(2, 20);
  const aF = new Fraction(a, 1);
  const bF = new Fraction(b, 1);
  const cF = new Fraction(c, 1);
  const options = buildCorrectionOptions([
    { label: `-${a} · ${b} - ${a} · ${c}`, value: aF.neg().mul(bF).sub(aF.mul(cF)) }, // richtig
    { label: `-${a} · ${b} + ${a} · ${c}`, value: aF.neg().mul(bF).add(aF.mul(cF)) }, // Mehdis Fehler
    { label: `${a} · ${b} + ${a} · ${c}`, value: aF.mul(bF).add(aF.mul(cF)) },
    { label: `${a} · ${b} - ${a} · ${c}`, value: aF.mul(bF).sub(aF.mul(cF)) },
  ]);
  return {
    statement: `Mehdi rechnet: -${a} · (${b} + ${c}) = -${a} · ${b} + ${a} · ${c}`,
    options,
    hint: `Beim Ausmultiplizieren mit -${a} bleibt das Vorzeichen von + bei + und wird zu -: -${a} · (${b} + ${c}) = -${a} · ${b} - ${a} · ${c}`,
  };
}

const TYPE_E_GENERATORS = [errNegTimesMinus, errDoubleMinusBracket, errNegTimesPlus];

function generateTypeE() {
  const gen = choice(TYPE_E_GENERATORS);
  const { statement, options, hint } = gen();
  const correctCount = options.filter((o) => o.correct).length;
  if (correctCount !== 1 || options.length < 2) return generateTypeE();
  return {
    kind: 'choice',
    prompt: `Stolperstelle: Welche Fortsetzung korrigiert Mehdis Fehler richtig?\n${statement}`,
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

function generateTask(type) {
  const key = type || choice(Object.keys(TASK_GENERATORS));
  return TASK_GENERATORS[key]();
}

// Garantiert, dass jeder Durchlauf mindestens eine Aufgabe von jedem Typ
// enthält (sonst kann Typ E "Stolperstelle" bei rein zufälliger Auswahl
// gelegentlich einen ganzen Durchlauf lang gar nicht auftauchen).
function generateTaskSet(n) {
  const types = Object.keys(TASK_GENERATORS);
  const guaranteed = types.map((type) => generateTask(type));
  const extra = Array.from({ length: Math.max(0, n - types.length) }, () => generateTask());
  return shuffle([...guaranteed, ...extra]).slice(0, n);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateTask, generateTaskSet, TASK_GENERATORS };
}
