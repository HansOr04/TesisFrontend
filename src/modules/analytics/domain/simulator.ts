// Simulador "¿qué pasaría si…?": recalcula el puntaje por sección y global de
// una evaluación al fijar puntajes objetivo en algunos KPI, con la misma
// media ponderada que usa el backend (peso de KPI dentro de la sección, peso
// de sección en el global). Puro: sin React ni red, testeable.

export interface SimIndicator {
  id: string;
  code: string;
  name: string;
  weight: number;
  score: number;
}

export interface SimSection {
  number: number;
  name: string;
  weight: number;
  indicators: SimIndicator[];
}

export interface SimResult {
  globalScore: number;
  sections: { number: number; name: string; before: number; after: number }[];
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

function weightedAvg(items: { weight: number; score: number }[]): number {
  const tw = items.reduce((a, i) => a + i.weight, 0);
  if (tw <= 0) return 0;
  return round2(items.reduce((a, i) => a + i.weight * i.score, 0) / tw);
}

export function simulate(
  sections: SimSection[],
  targets: Record<string, number>
): SimResult {
  const perSection = sections.map((s) => {
    const before = weightedAvg(s.indicators);
    const after = weightedAvg(
      s.indicators.map((i) => ({
        weight: i.weight,
        score: targets[i.id] ?? i.score,
      }))
    );
    return { number: s.number, name: s.name, weight: s.weight, before, after };
  });
  const scored = perSection.filter(
    (s) => sections.find((x) => x.number === s.number)!.indicators.length > 0
  );
  return {
    globalScore: weightedAvg(
      scored.map((s) => ({ weight: s.weight, score: s.after }))
    ),
    sections: perSection.map(({ number, name, before, after }) => ({
      number,
      name,
      before,
      after,
    })),
  };
}

/** Ganancia en el puntaje global por cada punto que suba el KPI (sensibilidad). */
export function marginalGain(
  sections: SimSection[],
  indicatorId: string
): number {
  const section = sections.find((s) =>
    s.indicators.some((i) => i.id === indicatorId)
  );
  if (!section) return 0;
  const ind = section.indicators.find((i) => i.id === indicatorId)!;
  const sectionWeightTotal = section.indicators.reduce(
    (a, i) => a + i.weight,
    0
  );
  const globalWeightTotal = sections
    .filter((s) => s.indicators.length > 0)
    .reduce((a, s) => a + s.weight, 0);
  if (sectionWeightTotal === 0 || globalWeightTotal === 0) return 0;
  return (
    round2(
      (ind.weight / sectionWeightTotal) *
        (section.weight / globalWeightTotal) *
        1000
    ) / 1000
  );
}
