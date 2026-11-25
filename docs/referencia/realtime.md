# realtime


## Aplicación

### use-assessment-session.ts

`src/modules/realtime/application/use-assessment-session.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `useAssessmentSession(org, evaluationId, token, onScoreUpdated, currentUserId?)` | función | Sesión colaborativa del taller (doc ai-ssd 01 §3, 03 §7 F7a): cuando otro facilitador califica un KPI de la misma evaluación, este hook recibe score.updated y dispara onScoreUpdated para que el llamador refresque su estado local (la app no usa TanStack Query para evaluaciones, así que no hay cache que invalidar — el patrón es "avísame y yo recargo"). |

Notas:

- `useAssessmentSession`: baseURL puede ser relativo ("/api" con el proxy de Vite) o absoluto. El namespace del gateway es /assessments; el path de Socket.IO va bajo baseURL para que el proxy lo reenvíe al backend.
- `useAssessmentSession`: El servidor también avisa al autor del guardado; ese eco no trae nada nuevo y solo provocaría recargar la evaluación entera tras cada guardado.


## Infraestructura

### offline-queue.ts

`src/modules/realtime/infrastructure/offline-queue.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `store` (interno) | constante | RNF-03 (F7-B03): las calificaciones del taller no deben perderse si la red se cae a mitad de guardar. Cada mutación que falla por un error de red (no por un rechazo del servidor) se persiste aquí en IndexedDB y se reintenta cuando vuelve la conexión — sin depender de que la pestaña siga abierta. |
| `shouldQueueOffline(error)` | función | Solo un error de red se encola. Si el servidor respondió (validación, permisos, evaluación cerrada), reintentar no lo arregla y hay que avisar. |
| `AssessmentQueuedSave` | tipo |  |
| `enqueueAssessmentSave(item)` | función | Encola un guardado |
| `getPendingAssessmentSaves(evaluationId)` | función | Pendientes |
| `removeAssessmentSave(id)` | función | Quita uno |
| `flushAssessmentQueue(evaluationId, send)` | función | Reintenta cada item pendiente de esta evaluación; los que fallan de nuevo (seguimos sin red) quedan en la cola para el próximo intento. |
