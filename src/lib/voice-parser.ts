import { Taco, ParsedOrderItem } from './types';

// ============================================================
// Voice Order Parser — Spanish (es-MX)
// Taquería Jefe de Jefes — menú completo
// Convierte lenguaje natural en ítems del carrito con especificaciones
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
  'alambre de bistec': 'Alambre de Bisteck',
  'hawaiano': 'Alambre Hawaiano',
  'alambre hawaiano': 'Alambre Hawaiano',
  'hawaii': 'Alambre Hawaiano',
  'burra': 'Burra',
  'alambre burra': 'Burra',
  'especial': 'Alambre Especial',
  'alambre especial': 'Alambre Especial',
  'tlaconete': 'Tlaconete',
  'alambre tlaconete': 'Tlaconete',
  'charro': 'Charro',
  'alambre charro': 'Charro',
  'sencillo': 'Alambre Sencillo',
  'alambre sencillo': 'Alambre Sencillo',
  'fortachon': 'Fortachón',
  'fortachón': 'Fortachón',
  'alambre fortachon': 'Fortachón',
  // Tacos (órdenes de 5)
  'tasajo': 'Tacos de Tasajo',
  'tacos tasajo': 'Tacos de Tasajo',
  'tacos de tasajo': 'Tacos de Tasajo',
  'orden de tasajo': 'Tacos de Tasajo',
  'chuleta': 'Tacos de Chuleta',
  'tacos chuleta': 'Tacos de Chuleta',
  'tacos de chuleta': 'Tacos de Chuleta',
  'orden de chuleta': 'Tacos de Chuleta',
  'tacos pastor': 'Tacos al Pastor',
  'tacos al pastor': 'Tacos al Pastor',
  'orden de pastor': 'Tacos al Pastor',
  // Suizo & Sincronizada
  'suizo': 'Suizo',
  'sincronizada': 'Sincronizada',
  'sincronizadas': 'Sincronizada',
  // Quesadilla
  'quesadilla': 'Quesadilla',
  'quesadillas': 'Quesadilla',
  // Bebidas
  'refresco': 'Refresco Desechable',
  'refresco desechable': 'Refresco Desechable',
  'refrescos': 'Refresco Desechable',
  'coca': 'Refresco Desechable',
  'coca cola': 'Refresco Desechable',
  'refresco de vidrio': 'Refresco en Vidrio',
  'refresco vidrio': 'Refresco en Vidrio',
  'coca de vidrio': 'Refresco en Vidrio',
  'boing': 'Boing',
  'boings': 'Boing',
  'jugo': 'Boing',
  'jugo boing': 'Boing',
};

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

// Find best matching taco from menu
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

// Extract comprehensive customizations from a text segment (affirmative & negative)
export function extractCustomizations(text: string): string {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  // 1. Cebolla
  if (/sin\s+cebolla/.test(lowerText)) {
    found.push('sin cebolla');
  } else if (/extra\s+cebolla|con\s+mucha\s+cebolla/.test(lowerText)) {
    found.push('extra cebolla');
  } else if (/con\s+cebolla/.test(lowerText)) {
    found.push('con cebolla');
  }

  // 2. Cilantro
  if (/sin\s+cilantro/.test(lowerText)) {
    found.push('sin cilantro');
  } else if (/extra\s+cilantro/.test(lowerText)) {
    found.push('extra cilantro');
  } else if (/con\s+cilantro/.test(lowerText)) {
    found.push('con cilantro');
  }

  // 3. Verdura (cebolla + cilantro combo)
  if (/sin\s+verdura/.test(lowerText)) {
    found.push('sin verdura');
  } else if (/con\s+todo/.test(lowerText)) {
    found.push('con todo');
  } else if (/con\s+verdura/.test(lowerText)) {
    found.push('con verdura');
  }

  // 4. Salsas y Picante
  if (/salsa\s+verde\s+aparte/.test(lowerText)) {
    found.push('salsa verde aparte');
  } else if (/sin\s+salsa\s+verde/.test(lowerText)) {
    found.push('sin salsa verde');
  } else if (/con\s+salsa\s+verde|salsa\s+verde/.test(lowerText)) {
    found.push('con salsa verde');
  }

  if (/salsa\s+roja\s+aparte/.test(lowerText)) {
    found.push('salsa roja aparte');
  } else if (/sin\s+salsa\s+roja/.test(lowerText)) {
    found.push('sin salsa roja');
  } else if (/con\s+salsa\s+roja|salsa\s+roja/.test(lowerText)) {
    found.push('con salsa roja');
  }

  if (/salsa[s]?\s+aparte/.test(lowerText) && !found.some(f => f.includes('aparte'))) {
    found.push('salsa aparte');
  } else if (/sin\s+salsa|sin\s+chile/.test(lowerText)) {
    found.push('sin salsa');
  } else if (/extra\s+salsa/.test(lowerText)) {
    found.push('extra salsa');
  }

  if (/muy\s+picante|bien\s+picoso/.test(lowerText)) {
    found.push('muy picante');
  } else if (/sin\s+picante|sin\s+chile/.test(lowerText)) {
    if (!found.includes('sin salsa')) found.push('sin picante');
  } else if (/picante|picoso/.test(lowerText) && !found.some(f => f.includes('picante'))) {
    found.push('picante');
  }

  // 5. Queso
  if (/sin\s+queso/.test(lowerText)) {
    found.push('sin queso');
  } else if (/extra\s+queso|con\s+mucho\s+queso/.test(lowerText)) {
    found.push('extra queso');
  } else if (/con\s+queso|bien\s+gratinado/.test(lowerText)) {
    found.push('con queso');
  }

  // 6. Piña
  if (/sin\s+pi[nñ]a/.test(lowerText)) {
    found.push('sin piña');
  } else if (/con\s+pi[nñ]a|extra\s+pi[nñ]a/.test(lowerText)) {
    found.push('con piña');
  }

  // 7. Limón
  if (/lim[oó]n(es)?\s+aparte/.test(lowerText)) {
    found.push('limón aparte');
  } else if (/con\s+lim[oó]n/.test(lowerText)) {
    found.push('con limón');
  } else if (/sin\s+lim[oó]n/.test(lowerText)) {
    found.push('sin limón');
  }

  // 8. Aguacate / Guacamole
  if (/sin\s+aguacate|sin\s+guacamole/.test(lowerText)) {
    found.push('sin aguacate');
  } else if (/con\s+guacamole|guacamole/.test(lowerText)) {
    found.push('con guacamole');
  } else if (/con\s+aguacate|aguacate/.test(lowerText)) {
    found.push('con aguacate');
  }

  // 9. Término / Preparación
  if (/bien\s+dorad[oa]/.test(lowerText)) {
    found.push('bien dorado');
  } else if (/bien\s+cocid[oa]/.test(lowerText)) {
    found.push('bien cocido');
  } else if (/t[eé]rmino\s+medio/.test(lowerText)) {
    found.push('término medio');
  }

  // 10. Tortilla
  if (/doble\s+tortilla|con\s+copia/.test(lowerText)) {
    found.push('doble tortilla');
  }

  // 11. Otros ingredientes de alambres
  if (/sin\s+tocino/.test(lowerText)) {
    found.push('sin tocino');
  } else if (/con\s+tocino|extra\s+tocino/.test(lowerText)) {
    found.push('con tocino');
  }

  if (/sin\s+jam[oó]n/.test(lowerText)) {
    found.push('sin jamón');
  } else if (/con\s+jam[oó]n/.test(lowerText)) {
    found.push('con jamón');
  }

  if (/sin\s+champi[nñ]on(es)?/.test(lowerText)) {
    found.push('sin champiñones');
  } else if (/con\s+champi[nñ]on(es)?/.test(lowerText)) {
    found.push('con champiñones');
  }

  if (/sin\s+pimiento/.test(lowerText)) {
    found.push('sin pimiento');
  } else if (/con\s+pimiento/.test(lowerText)) {
    found.push('con pimiento');
  }

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
  const segments = text.split(/\s+y\s+|\s*,\s*|\s+ademas\s+|\s+tambien\s+/);

  for (const segment of segments) {
    const words = segment.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

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
