# auth


## Dominio

### auth.types.ts

`src/modules/auth/domain/auth.types.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AuthenticatedUser` | tipo |  |
| `OrganisationAccess` | tipo |  |
| `OrganisationRoles` | tipo |  |
| `AuthSession` | tipo |  |
| `AuthState` | tipo |  |

Campos:

- `AuthState.roles`: Roles de evaluación por organización (assessment_admin / assessment_evaluator).
- `AuthState.isActuallySuperAdmin`: true si el usuario real es superadmin global.
- `AuthState.ownedProjects`: Proyectos que creó el superadministrador: solo en esos tiene acceso total.
- `AuthState.sessionExpired`: El token caducó y no se pudo renovar estando dentro de la aplicación. La sesión NO se cierra: la pantalla se queda como estaba y se pide la contraseña para seguir, porque cerrarla perdería lo que hubiera sin guardar.


## Aplicación

### auth-context.tsx

`src/modules/auth/application/auth-context.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AuthContextValue` | tipo |  |
| `AuthProvider({ children })` | componente | Fuente única de verdad de la sesión: token de acceso corto en memoria (renovado con la cookie HttpOnly de refresh) + perfil (/auth/me). Expone la misma forma que usan las páginas (currentUser.accessToken, organisations.current, isActuallySuperAdmin). |
| `useAuth()` | función | Acceso a la sesión |

Campos:

- `AuthContextValue.resumeSession`: Reanuda la sesión caducada sin salir de la pantalla en la que se está.
- `AuthContextValue.reloadProjects`: Vuelve a leer los proyectos (p. ej. después de crear uno).
- `AuthContextValue.currentRoles`: Roles del usuario en la organización actual.
- `AuthContextValue.canAdminister`: Administra el proyecto actual: assessment_admin, o el superadministrador que lo creó. Un superadministrador en un proyecto ajeno es un miembro más.
- `AuthContextValue.isReadOnly`: Visualizador: solo consulta, no puede crear ni calificar.

Notas:

- `hydrate`: El superadministrador entra a los proyectos que creó (la API solo le lista esos) además de aquellos de los que es miembro: sin esto no podía entrar a uno que acababa de crear.
- `AuthProvider`: Al cargar: intenta renovar con la cookie; sin cookie → anónimo.
- `AuthProvider`: Versiones anteriores guardaban el JWT en localStorage.
- `AuthProvider`: Cada renovación silenciosa actualiza el token que ven las páginas (y el socket de tiempo real); si la renovación falla, la sesión se cierra.
- `AuthProvider`: Antes se cerraba la sesión aquí mismo. Eso desmontaba la aplicación y se perdía lo que hubiera en pantalla sin guardar; ahora solo se marca como caducada y el diálogo pide la clave.
- `AuthProvider`: Las consultas se guardan por proyecto, no por usuario: sin vaciarlas, quien entra después en el mismo navegador (un equipo compartido en el taller) veía las organizaciones del usuario anterior hasta recargar la página.
- `AuthProvider`: Reanudar no es volver a entrar: se conserva la organización actual y se refrescan las consultas que hayan fallado mientras la sesión estaba caída.
- `AuthProvider`: El proyecto actual se conserva: hydrate lo recupera de localStorage.

### organisations-queries.ts

`src/modules/auth/application/organisations-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `organisationsKeys` | constante | Claves de caché |
| `organisationsQueries` | constante | Consultas de proyectos |

### users-queries.ts

`src/modules/auth/application/users-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `usersKeys` | constante | Claves de caché |
| `usersQueries` | constante | Consultas de usuarios |


## Infraestructura

### auth-api.ts

`src/modules/auth/infrastructure/auth-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `loginWithPassword(email, password)` | función | Inicia sesión |
| `loginWithGoogle(idToken)` | función | Inicia sesión con Google |
| `MeResponse` | tipo |  |
| `fetchMe(token)` | función | Perfil y roles |
| `logoutSession()` | función | Cierra la sesión en el servidor (revoca el refresh token de la cookie). |
| `fetchAuthProviders()` | función | Proveedores |

Notas:

- `parse`: cuerpo vacío
- `logoutSession`: sin red: la sesión local se cierra igual

### organisations-api.ts

`src/modules/auth/infrastructure/organisations-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `Organisation` | tipo | Organización (inquilino) con el volumen de datos que contiene. |
| `CreateOrganisationInput` | tipo |  |
| `ProvisionedTemplate` | tipo |  |
| `CreateOrganisationResult` | tipo |  |
| `fetchOrganisations(token?)` | función | Proyectos |
| `createOrganisation(data, token?)` | función | Crea |
| `updateOrganisation(id, data, token?)` | función | Renombra |
| `provisionOrganisation(id, token?)` | función | Reaplica las plantillas base sobre una organización existente. |
| `AssignableUser` | tipo | Usuario ya creado en la plataforma, para asignarlo a un proyecto. |
| `fetchAssignableUsers(search?, token?)` | función | Cuentas asignables |

### users-api.ts

`src/modules/auth/infrastructure/users-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentRoleCode` | tipo |  |
| `ViewerVisibility` | tipo | Qué organizaciones evaluadas ve un visualizador. |
| `OrganisationUser` | tipo |  |
| `CreateUserInput` | tipo |  |
| `UpdateUserInput` | tipo |  |
| `fetchOrganisationUsers(org, token?)` | función | Usuarios |
| `createOrganisationUser(org, data, token?)` | función | Crea o agrega |
| `updateOrganisationUser(org, id, data, token?)` | función | Edita |
| `removeOrganisationUser(org, id, token?)` | función | Saca del proyecto |
| `setViewerVisibility(org, id, data, token?)` | función | Define qué organizaciones evaluadas ve un usuario con rol de visualizador. |

Notas:

- Solo en el rol de visualizador.


## Presentación

### google-sign-in-button.tsx

`src/modules/auth/presentation/google-sign-in-button.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GoogleSignInButton({ onError, })` | componente | Botón "Iniciar sesión con Google" (Google Identity Services). Carga el script bajo demanda y entrega el id_token al backend (POST /auth/google). |

### login-page.tsx

`src/modules/auth/presentation/login-page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `LoginPage()` | componente | Pantalla de acceso |

### assignable-user-list.tsx

`src/modules/auth/presentation/organisations/assignable-user-list.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssignableUserList({ users, loading, pickedId, onPick, name)` | componente | Buscador y lista de cuentas existentes para elegir una. Lo usan el equipo del proyecto (asignar usuario) y el alta de proyecto (elegir administrador). |

Notas:

- `AssignableUserList`: Nombre del grupo de radios; distinto por formulario.

### organisations.page.tsx

`src/modules/auth/presentation/organisations/organisations.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `slugify(name)` (interno) | función | Sugiere un identificador a partir del nombre escrito. |
| `OrganisationsPage()` | componente | Alta y mantenimiento de proyectos (inquilinos). Solo superadmin, y cada uno ve únicamente los proyectos que creó. Un proyecto nuevo nace con sus tres plantillas y su administrador, y desde aquí mismo se le asignan usuarios existentes o se crean nuevos. |

Notas:

- `OrganisationsPage`: Paso siguiente natural: armar el equipo del proyecto recién creado.
- `OrganisationFormDialog`: Uno mismo ya es la opción «Yo».
- `OrganisationFormDialog`: Solo se envían los datos del modo elegido: una cuenta existente conserva su nombre y su contraseña.
- `create`: El proyecto nuevo aparece en el selector sin volver a entrar.

### project-members-dialog.tsx

`src/modules/auth/presentation/organisations/project-members-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ProjectMembersDialog({ organisation, onOpenChange, onChanged,)` | componente | Desde «Gestión de proyectos» el superadministrador arma el equipo de cada proyecto que creó: asigna usuarios que ya existen en la plataforma, crea usuarios nuevos y, a los visualizadores, les habilita qué organizaciones evaluadas pueden ver. |

Notas:

- `add`: Lo que ve el visualizador se marcó junto con el rol.

### session-expired-dialog.tsx

`src/modules/auth/presentation/session-expired-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SessionExpiredDialog({ email, onResume, onLogout, })` | componente | La sesión caducó estando dentro de la aplicación. En vez de mandar al usuario a la pantalla de acceso —lo que desmonta todo y se lleva por delante el formulario a medio llenar—, se bloquea la pantalla con este diálogo: se escribe la contraseña y se sigue exactamente donde se estaba. No se puede cerrar con Escape ni clicando fuera: mientras la sesión no se reanude, cualquier cosa que se intente guardar fallaría. |

### roles.ts

`src/modules/auth/presentation/users/roles.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ROLE_OPTIONS` | constante | Etiquetas y descripciones vienen del diccionario (app.users.role*). |
| `roleTone(role)` | función | Color del rótulo de cada rol en la tabla. |
| `roleOf(u)` | función | Rol principal de un usuario |

### users.page.tsx

`src/modules/auth/presentation/users/users.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `UsersPage()` | componente | Administración de usuarios y permisos de la organización actual. |

Campos:

- `FormValues.visibility`: Solo para el rol de visualizador: qué organizaciones evaluadas ve.

Notas:

- `UsersPage`: Solo el superadministrador dueño del proyecto otorga superadministrador.
- `UsersPage`: La cuenta de un superadministrador (contraseña, activación) solo la toca otro superadministrador; aquí se gestiona su rol.
- `UsersPage`: Lo que ve el visualizador se eligió en el mismo formulario.

### viewer-visibility-dialog.tsx

`src/modules/auth/presentation/users/viewer-visibility-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `NO_VISIBILITY` | constante | Sin organizaciones habilitadas |
| `viewerVisibilityOf(user)` | función | Visibilidad de un usuario |
| `useVisibilitySummary()` | función | Texto corto de lo que ve un visualizador, para la tabla de usuarios. |
| `normalizeVisibility(v)` | función | Lo que se guarda: con "todas" la lista no hace falta. |
| `ViewerScopePicker({ org, value, onChange, listClassName, })` | componente | Lista de casillas con las organizaciones evaluadas del proyecto: un administrador (o el superadministrador dueño del proyecto) elige cuáles ve el visualizador, o todas, incluidas las que se registren después. Se usa dentro del formulario del usuario y en el diálogo de visibilidad. |
| `ViewerVisibilityDialog({ org, user, onOpenChange, onSaved, })` | componente | Diálogo para cambiar después lo que ve un visualizador existente. |
