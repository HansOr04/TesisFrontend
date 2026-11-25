# analytics


## Dominio

### simulator.ts

`src/modules/analytics/domain/simulator.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SimIndicator` | tipo | Simulador "¿qué pasaría si…?": recalcula el puntaje por sección y global de una evaluación al fijar puntajes objetivo en algunos KPI, con la misma media ponderada que usa el backend (peso de KPI dentro de la sección, peso de sección en el global). Puro: sin React ni red, testeable. |
| `SimSection` | tipo |  |
| `SimResult` | tipo |  |
| `simulate(sections, targets)` | función | Recalcula puntajes con notas objetivo |
| `marginalGain(sections, indicatorId)` | función | Ganancia en el puntaje global por cada punto que suba el KPI (sensibilidad). |


## Aplicación

### analytics-queries.ts

`src/modules/analytics/application/analytics-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `STALE` (interno) | constante | La analítica es cara de calcular y cambia solo al completar evaluaciones: se cachea 5 minutos por pestaña/parámetros. |
| `analyticsQueries` | constante | Consultas de analítica |


## Infraestructura

### analytics-api.ts

`src/modules/analytics/infrastructure/analytics-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AnalyticsTool` | tipo |  |
| `CorrelationStrength` | tipo |  |
| `SegmentKey` | tipo |  |
| `HistogramBin` | tipo |  |
| `OverviewSection` | tipo |  |
| `OverviewTool` | tipo |  |
| `AnalyticsOverview` | tipo |  |
| `SystemicGap` | tipo |  |
| `GapsResponse` | tipo |  |
| `DriverSection` | tipo |  |
| `CrossToolEntry` | tipo |  |
| `FactorEntry` | tipo |  |
| `CorrelationsResponse` | tipo |  |
| `SegmentRow` | tipo |  |
| `SegmentsResponse` | tipo |  |
| `EffectGroup` | tipo |  |
| `EffectivenessTool` | tipo |  |
| `EffectivenessResponse` | tipo |  |
| `ClusterLevel` | tipo |  |
| `ClusterEntry` | tipo |  |
| `ClustersResponse` | tipo |  |
| `BenchmarkResponse` | tipo |  |
| `fetchAnalyticsOverview(org, token?)` | función | Panorama |
| `fetchAnalyticsGaps(org, tool, token?)` | función | Brechas |
| `fetchAnalyticsCorrelations(org, token?)` | función | Correlaciones |
| `fetchAnalyticsSegments(org, by, token?)` | función | Segmentos |
| `fetchAnalyticsEffectiveness(org, token?)` | función | Efectividad |
| `fetchAnalyticsClusters(org, tool, k, token?)` | función | Tipologías |
| `fetchAnalyticsBenchmark(org, profileId, token?)` | función | Posición relativa |

Campos:

- `ClusterEntry.level`: Código estable de la tipología; `label` es su texto en español.


## Presentación

### analytics-layout.tsx

`src/modules/analytics/presentation/components/analytics-layout.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `TabHeader({ title, question, children, })` | componente | Cabecera de una pestaña: título grande y la pregunta que responde. |
| `MethodCard({ compute, read, lookFor, })` | componente | Bloque metodológico en tres columnas: cómo se calcula, cómo se lee, qué buscar. |
| `KeyFindings({ items })` | componente | Hallazgos clave numerados, en texto grande. |
| `ChartCard({ title, description, howToRead, childre)` | componente | Tarjeta de gráfico a ancho completo con guía de lectura al lado. |
| `Note({ children })` | componente | Glosario / nota de interpretación compacta. |

### analytics-ui.tsx

`src/modules/analytics/presentation/components/analytics-ui.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `useAnalyticsLabels()` | función | Etiquetas traducidas de herramientas y fuerzas de correlación. Las páginas de analítica las obtienen con `useAnalyticsLabels()`. |
| `TOOL_SHORT` | constante | Nombres cortos |
| `TOOL_COLOR` | constante | Color por herramienta |
| `TOOLS` | constante | Herramientas |
| `heatColor(value)` | función | Color de celda para mapas de calor 0–10 (rojo → ámbar → verde). |
| `heatAlpha(value)` | función | Intensidad del mapa de calor |
| `corrColor(r)` | función | Color para correlaciones −1..1 (azul negativo, verde positivo). |
| `StatTile({ label, value, hint, tone = "brand", })` | componente | Cifra destacada |
| `Insight({ children, tone = "brand", })` | componente | Hallazgo en lenguaje natural derivado de los datos (para la memoria). |
| `SectionTitle({ title, subtitle, right, })` | componente | Título de bloque |
| `ToolTabs({ value, onChange, })` | componente | Selector de herramienta |
| `fmt(v, d)` | función | Número con decimales |
| `pct(v)` | función | Porcentaje |

### clusters-tab.tsx

`src/modules/analytics/presentation/components/clusters-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ClustersTab({ tool, k, onToolChange, onKChange, data)` | componente | Pestaña de tipologías |

### correlations-tab.tsx

`src/modules/analytics/presentation/components/correlations-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CorrelationsTab({ data })` | componente | Pestaña de correlaciones |

### effectiveness-tab.tsx

`src/modules/analytics/presentation/components/effectiveness-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `EffectivenessTab({ data })` | componente | Pestaña de efectividad |

### gaps-ranking.tsx

`src/modules/analytics/presentation/components/gaps-ranking.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GapsRanking({ data, tool, })` | componente | Ranking visual de brechas sistémicas: cada KPI es una fila-tarjeta con barras (frecuencia crítica, prioridad), anillo de promedio, cobertura de medidas y un detalle expandible con las organizaciones afectadas. |

### gaps-tab.tsx

`src/modules/analytics/presentation/components/gaps-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GapsTab({ tool, onToolChange, data, loading })` | componente | Pestaña de brechas |

### overview-tab.tsx

`src/modules/analytics/presentation/components/overview-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OverviewTab({ data })` | componente | Pestaña de panorama |

### segments-tab.tsx

`src/modules/analytics/presentation/components/segments-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SegmentsTab({ by, onChange, data, loading, })` | componente | Pestaña de segmentos |

### simulator-tab.tsx

`src/modules/analytics/presentation/components/simulator-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SimulatorTab({ tool, onToolChange, })` | componente | Pestaña del simulador |

Notas:

- `SimulatorTab`: Una por organización (la más reciente con respuestas).

### analytics.page.tsx

`src/modules/analytics/presentation/pages/analytics.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AnalyticsPage()` | componente | Analítica de datos transversal: cada pestaña consume un endpoint del módulo assessment-analytics del backend y genera hallazgos en texto a partir de los números (los mismos que se citan en la memoria). |

Notas:

- `AnalyticsPage`: Cada pestaña consulta solo cuando está activa; React Query cachea los resultados por parámetros, así cambiar de pestaña y volver es inmediato.
