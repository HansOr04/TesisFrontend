// Rutas del router (deben coincidir con los archivos de src/routes).
export enum routeKeys {
  root = "/",
  login = "/login",
  loggedIn = "/_loggedin",

  // Núcleo: perfiles, panel consolidado, administración
  assessment = "/_loggedin/assessments/",
  assessmentDashboard = "/_loggedin/assessments/dashboard",
  assessmentNew = "/_loggedin/assessments/new",
  assessmentAssociationDetail = "/_loggedin/assessments/associations/$profileId",
  assessmentAdminGlobal = "/_loggedin/assessments/admin-global",
  assessmentAnalytics = "/_loggedin/assessments/analytics",
  assessmentUsers = "/_loggedin/assessments/users",

  // Herramienta Organizativa
  organizationalTool = "/_loggedin/assessments/organizational/",
  organizationalToolEvaluationId = "/_loggedin/assessments/organizational/$evaluationId/",
  organizationalToolSummary = "/_loggedin/assessments/organizational/$evaluationId/summary",
  organizationalToolActionPlan = "/_loggedin/assessments/organizational/$evaluationId/action-plan/",
  organizationalToolMeasureDetail = "/_loggedin/assessments/organizational/$evaluationId/action-plan/$measureId",
  organizationalToolDimensionAnalysis = "/_loggedin/assessments/organizational/$evaluationId/dimension/$number",
  organizationalToolAdmin = "/_loggedin/assessments/organizational/admin",

  // Herramienta de Capacidades
  capacityTool = "/_loggedin/assessments/capacity/",
  capacityToolEvaluationId = "/_loggedin/assessments/capacity/$evaluationId/",
  capacityToolSummary = "/_loggedin/assessments/capacity/$evaluationId/summary",
  capacityToolActionPlan = "/_loggedin/assessments/capacity/$evaluationId/action-plan/",
  capacityToolMeasureDetail = "/_loggedin/assessments/capacity/$evaluationId/action-plan/$measureId",
  capacityToolAreaAnalysis = "/_loggedin/assessments/capacity/$evaluationId/area/$number",
  capacityToolAdmin = "/_loggedin/assessments/capacity/admin",

  // Herramienta de Riesgos
  riskTool = "/_loggedin/assessments/risk/",
  riskToolEvaluationId = "/_loggedin/assessments/risk/$evaluationId/",
  riskToolSummary = "/_loggedin/assessments/risk/$evaluationId/summary",
  riskToolMitigation = "/_loggedin/assessments/risk/$evaluationId/mitigation",
  riskToolPrincipleAnalysis = "/_loggedin/assessments/risk/$evaluationId/principle/$number",
  riskToolAdmin = "/_loggedin/assessments/risk/admin",
}
