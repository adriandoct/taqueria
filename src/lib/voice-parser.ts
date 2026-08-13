import { Taco, ParsedOrderItem } from './types';

// ============================================================
// Voice Order Parser — Spanish (es-MX)
// Taquería Jefe de Jefes — menú completo
// Convierte lenguaje natural en ítems del carrito
// ============================================================

// Number words in Spanish
const NUMBER_WORDS: Record<string, number> = {
  un: 1, uno: 1, una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
};

// Aliases to help voice matching for the Jefe de Jefes menu
// Maps spoken variations → canonical menu item name
const VOICE_ALIASES: Record<string, string> = {
  // Alambres
  'pastor': 'Alambre al Pastor',
  'alambre pastor': 'Alambre al Pastor',
  'alambre al pastor': 'Alambre al Pastor',
  'bisteck': 'Alambre de Bisteck',
  'bistec': 'Alambre de Bisteck',
  'bistek': 'Alambre de Bisteck',
  'alambre bisteck': 'Alambre de Bisteck',
  'alambre bistec': 'Alambre de Bisteck',
  'alambre de bisteck': 'Alambre de Bisteck',
  'hawaiano': 'Alambre Hawaiano',
  'alambre hawaiano': 'Alambre Hawaiano',
  'hawaii': 'Alambre Hawaiano',
  'burra': 'Burra',
  'alambre burra': 'Burra',
  'especial': 'Alambre Especial',
  'alambre especial': 'Alambre Especial',
  'tlaconete': 'Tlaconete',
  'charro': 'Charro',
  'alambre charro': 'Charro',
  'sencillo': 'Alambre Sencillo',
  'alambre sencillo': 'Alambre Sencillo',
  'fortachon': 'Fortachón',
  'fortachón': 'Fortachón',
  // Tacos
  'tasajo': 'Tacos de Tasajo',
  'tacos tasajo': 'Tacos de Tasajo',
  'tacos de tasajo': 'Tacos de Tasajo',
  'chuleta': 'Tacos de Chuleta',
  'tacos chuleta': 'Tacos de Chuleta',
  'tacos de chuleta': 'Tacos de Chuleta',
  'tacos pastor': 'Tacos al Pastor',
  'tacos al pastor': 'Tacos al Pastor',
  // Suizo & Sincronizada
  'suizo': 'Suizo',
  'sincronizada': 'Sincronizada',
  // Quesadilla
  'quesadilla': 'Quesadilla',
  'quesadillas': 'Quesadilla',
  // Bebidas
  'refresco': 'Refresco Desechable',
  'refresco desechable': 'Refresco Desechable',
  'refresco de vidrio': 'Refresco en Vidrio',
  'refresco vidrio': 'Refresco en Vidrio',
  'boing': 'Boing',
  'jugo': 'Boing',
  'agua': 'Boing',
};

// Customization keywords
const CUSTOMIZATION_PATTERNS = [
  /sin\s+cebolla/gi,
  /sin\s+cilantro/gi,
  /sin\s+salsa/gi,
  /sin\s+chile/gi,
  /con\s+todo/gi,
  /salsa\s+verde\s+aparte/gi,
  /salsa\s+roja\s+aparte/gi,
  /bien\s+dorad[oa]/gi,
  /extra\s+salsa/gi,
  /extra\s+queso/gi,
  /picante/gi,
  /muy\s+picante/gi,
  /sin\s+picante/gi,
  /doble\s+tortilla/gi,
  /limón\s+aparte/gi,
  /guacamole/gi,
  /aguacate/gi,
  /sin\s+tocino/gi,
  /sin\s+jamón/gi,
];

// Normalize text: lowercase, remove accents, trim
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Find best matching taco from menu — first checks aliases, then fuzzy
function findBestTacoMatch(phrase: string, tacos: Taco[]): { taco: Taco; score: number } | null {
  const normPhrase = normalize(phrase);

  // 1. Check aliases first (exact)
  for (const [alias, canonicalName] of Object.entries(VOICE_ALIASES)) {
    if (normalize(alias) === normPhrase) {
      const taco = tacos.find((t) => normalize(t.nombre) === normalize(canonicalName));
      if (taco) return { taco, score: 0 };
    }
  }

  // 2. Check if phrase is substring of any alias or canonical name
  for (const [alias, canonicalName] of Object.entries(VOICE_ALIASES)) {
    if (normalize(alias).includes(normPhrase) || normPhrase.includes(normalize(alias))) {
      const taco = tacos.find((t) => normalize(t.nombre) === normalize(canonicalName));
      if (taco) return { taco, score: 0 };
    }
  }

  // 3. Direct taco name match
  let bestScore = Infinity;
  let bestTaco: Taco | null = null;
  for (const taco of tacos) {
    const normNombre = normalize(taco.nombre);
    if (normNombre.includes(normPhrase) || normPhrase.includes(normNombre)) {
      return { taco, score: 0 };
    }
    const dist = levenshtein(normPhrase, normNombre);
    if (dist < bestScore) {
      bestScore = dist;
      bestTaco = taco;
    }
  }

  // Only return if confident (score <= 4)
  if (bestTaco && bestScore <= 4) {
    return { taco: bestTaco, score: bestScore };
  }
  return null;
}

// Extract customizations from a text segment
function extractCustomizations(text: string): string {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  if (/sin\s+cebolla/.test(lowerText)) found.push('sin cebolla');
  if (/sin\s+cilantro/.test(lowerText)) found.push('sin cilantro');
  if (/sin\s+salsa/.test(lowerText)) found.push('sin salsa');
  if (/sin\s+chile/.test(lowerText)) found.push('sin chile');
  if (/con\s+todo/.test(lowerText)) found.push('con todo');
  if (/salsa\s+verde\s+aparte/.test(lowerText)) found.push('salsa verde aparte');
  if (/salsa\s+roja\s+aparte/.test(lowerText)) found.push('salsa roja aparte');
  if (/bien\s+dorad/.test(lowerText)) found.push('bien dorado');
  if (/extra\s+salsa/.test(lowerText)) found.push('extra salsa');
  if (/extra\s+queso/.test(lowerText)) found.push('extra queso');
  if (/muy\s+picante/.test(lowerText)) found.push('muy picante');
  else if (/sin\s+picante/.test(lowerText)) found.push('sin picante');
  else if (/picante/.test(lowerText)) found.push('picante');
  if (/doble\s+tortilla/.test(lowerText)) found.push('doble tortilla');
  if (/lim[oó]n\s+aparte/.test(lowerText)) found.push('limón aparte');
  if (/guacamole/.test(lowerText)) found.push('guacamole');
  if (/aguacate/.test(lowerText)) found.push('aguacate');
  if (/sin\s+tocino/.test(lowerText)) found.push('sin tocino');
  if (/sin\s+jam[oó]n/.test(lowerText)) found.push('sin jamón');

  return found.join(', ');
}

// ============================================================
// Main parser function
// ============================================================
export function parseVoiceOrder(transcript: string, tacos: Taco[]): ParsedOrderItem[] {
  const results: ParsedOrderItem[] = [];

  // Normalize the full transcript
  const text = transcript.toLowerCase();

  // Split by conjunctions to identify separate order segments
  const segments = text.split(/\s+y\s+|\s*,\s*/);

  for (const segment of segments) {
    const words = segment.split(/\s+/);
    let cantidad = 1;
    let tacoMatch: { taco: Taco; score: number } | null = null;

    // Extract quantity
    for (let i = 0; i < words.length; i++) {
      const numVal = NUMBER_WORDS[words[i]];
      if (numVal !== undefined) {
        cantidad = numVal;
        break;
      }
    }

    // Try to match taco names from 1 to 4 word windows
    for (let windowSize = 4; windowSize >= 1; windowSize--) {
      for (let i = 0; i <= words.length - windowSize; i++) {
        const phrase = words.slice(i, i + windowSize).join(' ');
        // Skip pure number words
        if (NUMBER_WORDS[phrase] !== undefined && windowSize === 1) continue;
        const match = findBestTacoMatch(phrase, tacos);
        if (match && (!tacoMatch || match.score < tacoMatch.score)) {
          tacoMatch = match;
        }
      }
      if (tacoMatch && tacoMatch.score === 0) break;
    }

    // Extract customizations from this segment
    const especificaciones = extractCustomizations(segment);

    if (tacoMatch) {
      const confidence = tacoMatch.score === 0 ? 1.0 : Math.max(0, 1 - tacoMatch.score / 10);
      results.push({
        nombreTaco: tacoMatch.taco.nombre,
        cantidad,
        especificaciones,
        confidence,
      });
    }
  }

  return results;
}
