# REPORTE DE ANÁLISIS DE BUGS - SISTEMA HDM MEFASA

**Fecha de Análisis:** $(date)  
**Analista:** Sistema de Análisis Automatizado  
**Versión del Sistema:** Backend NestJS 11.x / Frontend Next.js 15.5.2

---

## RESUMEN EJECUTIVO

Se han identificado **20 bugs** distribuidos en las siguientes categorías:
- **CRÍTICOS:** 3 bugs
- **ALTOS:** 7 bugs  
- **MEDIOS:** 6 bugs
- **BAJOS:** 4 bugs

---

## BUGS CRÍTICOS (Seguridad y Funcionalidad Crítica)

### BUG-001: Uso Inseguro de JWT_SECRET para Contraseña Temporal
**Severidad:** CRÍTICA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/auth/auth.service.ts:493`

**Descripción:**
Se usa `JWT_SECRET` concatenado con un string para generar contraseñas temporales de usuarios de Microsoft OAuth. Esto es extremadamente inseguro porque:
1. Expone el secreto JWT en la base de datos (aunque hasheado)
2. Crea un patrón predecible de contraseñas
3. Si alguien obtiene acceso a la BD, puede intentar descifrar el JWT_SECRET

**Código Problemático:**
```typescript
const tempPassword = process.env.JWT_SECRET + '-microsoft-oauth';
```

**Impacto:**
- Compromiso potencial del secreto JWT
- Vulnerabilidad en la seguridad de autenticación
- Riesgo de acceso no autorizado al sistema

**Solución Recomendada:**
```typescript
import * as crypto from 'crypto';
const tempPassword = crypto.randomBytes(32).toString('hex');
```

---

### BUG-002: Configuración TLS Insegura (rejectUnauthorized: false)
**Severidad:** CRÍTICA  
**Categoría:** Seguridad  
**Ubicación:** 
- `backend/src/auth/auth.service.ts:91`
- `backend/src/app.module.ts:64`
- `backend/src/data-source.ts:29`

**Descripción:**
Se configura `rejectUnauthorized: false` en las conexiones TLS/SSL, lo que desactiva la verificación de certificados. Esto permite ataques Man-in-the-Middle (MITM).

**Código Problemático:**
```typescript
tls: {
  rejectUnauthorized: false // ❌ Inseguro
}
```

**Impacto:**
- Vulnerable a ataques MITM
- Datos sensibles pueden ser interceptados
- Violación de mejores prácticas de seguridad

**Solución Recomendada:**
```typescript
tls: {
  rejectUnauthorized: process.env.NODE_ENV !== 'development' // Solo en desarrollo local
}
// O mejor aún, usar certificados válidos en todos los entornos
```

---

### BUG-003: Falta de Validación de Autorización en Endpoint de Perfil
**Severidad:** CRÍTICA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/auth/auth.controller.ts:106-110`

**Descripción:**
El endpoint `GET /auth/profile/:id` solo requiere autenticación (`@UseGuards(AuthGuard)`) pero no verifica que el usuario autenticado sea el propietario del perfil solicitado. Cualquier usuario autenticado puede acceder al perfil de cualquier otro usuario.

**Código Problemático:**
```typescript
@Get('profile/:id')
@UseGuards(AuthGuard)
profile(@Param('id') id: number) {
    return this.authService.getProfile(id);
}
```

**Impacto:**
- Acceso no autorizado a datos de otros usuarios
- Violación de privacidad
- Exposición de información sensible

**Solución Recomendada:**
```typescript
@Get('profile/:id')
@UseGuards(AuthGuard)
profile(@Param('id') id: number, @Request() req) {
    // Verificar que el usuario solo pueda acceder a su propio perfil
    // o que tenga permisos de administrador
    if (req.user.id !== id && req.user.role !== 'Administrador') {
        throw new ForbiddenException('No tienes permisos para acceder a este perfil');
    }
    return this.authService.getProfile(id);
}
```

---

## BUGS DE ALTA SEVERIDAD

### BUG-004: Race Condition en Refresh Token
**Severidad:** ALTA  
**Categoría:** Lógica  
**Ubicación:** `frontend/src/lib/httpClient.ts:48-148`

**Descripción:**
Aunque hay un mecanismo de cola para manejar múltiples peticiones simultáneas durante el refresh del token, existe una condición de carrera potencial:
1. Si dos peticiones llegan simultáneamente cuando `isRefreshing = false`
2. Ambas pueden iniciar el proceso de refresh
3. Esto puede causar múltiples llamadas al endpoint de refresh

**Código Problemático:**
```typescript
if (this.isRefreshing) {
  // Esperar...
} else {
  this.isRefreshing = true; // ❌ No es atómico
  // ...
}
```

**Impacto:**
- Múltiples refresh tokens generados innecesariamente
- Posible revocación de tokens válidos
- Degradación del rendimiento

**Solución Recomendada:**
Usar un mutex o Promise compartido:
```typescript
private refreshPromise: Promise<string | null> | null = null;

if (this.isRefreshing && this.refreshPromise) {
  return this.refreshPromise.then(() => this.retryRequest(originalRequest));
}

this.isRefreshing = true;
this.refreshPromise = this.refreshAccessToken().finally(() => {
  this.isRefreshing = false;
  this.refreshPromise = null;
});
```

---

### BUG-005: Exposición de Información en Mensajes de Error
**Severidad:** ALTA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/auth/auth.controller.ts:84`

**Descripción:**
En el callback de Microsoft, se expone el mensaje de error completo al frontend en la URL, lo que puede revelar información sensible sobre la configuración del sistema.

**Código Problemático:**
```typescript
const errorUrl = `${frontendUrl}/login?error=${encodeURIComponent('Authentication failed: ' + error.message)}`;
```

**Impacto:**
- Exposición de detalles internos del sistema
- Información útil para atacantes
- Posible filtración de stack traces

**Solución Recomendada:**
```typescript
const errorUrl = `${frontendUrl}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`;
// Log el error completo en el servidor, no en la URL
this.logger.error('Microsoft callback error:', error);
```

---

### BUG-006: Falta de Validación de Tipo de Archivo Real
**Severidad:** ALTA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/files/files.controller.ts:51-65`

**Descripción:**
Solo se valida el `file_type` enviado por el cliente, pero no se verifica el contenido real del archivo. Un atacante puede enviar un archivo malicioso con un `file_type` permitido.

**Código Problemático:**
```typescript
if (!allowedTypes.includes(createFileDto.file_type.toLowerCase())) {
  throw new BadRequestException(...);
}
// ❌ No se valida el contenido real del archivo
```

**Impacto:**
- Posibilidad de subir archivos maliciosos
- Ejecución de código malicioso si se procesa incorrectamente
- Vulnerabilidad a ataques de tipo "file upload"

**Solución Recomendada:**
```typescript
import * as fileType from 'file-type';

// Validar el contenido real del archivo
const base64Data = createFileDto.file_data.split(',')[1] || createFileDto.file_data;
const fileBuffer = Buffer.from(base64Data, 'base64');
const detectedType = await fileType.fromBuffer(fileBuffer);

if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
  throw new BadRequestException('Tipo de archivo no permitido según su contenido');
}
```

---

### BUG-007: Falta de Transacciones en Operaciones Críticas
**Severidad:** ALTA  
**Categoría:** Consistencia de Datos  
**Ubicación:** `backend/src/auth/auth.service.ts:46-75`

**Descripción:**
En el método `register`, se crea un usuario y se envía un email de verificación. Si el envío del email falla, se elimina el usuario, pero no hay transacción que garantice la atomicidad. Si hay un error entre la creación y el envío del email, puede quedar un usuario huérfano.

**Código Problemático:**
```typescript
const createResult = await this.userService.create({...});
const newUser = createResult.user;

try {
  await this.sendVerificationEmail(newUser.email, emailVerificationToken);
} catch (error) {
  await this.userService.remove(newUser.id); // ❌ No es atómico
  throw new BadRequestException(...);
}
```

**Impacto:**
- Posible inconsistencia de datos
- Usuarios creados sin emails de verificación enviados
- Problemas en la integridad de la base de datos

**Solución Recomendada:**
Usar transacciones de base de datos:
```typescript
return await this.dataSource.transaction(async (manager) => {
  const userRepo = manager.getRepository(User);
  const newUser = userRepo.create({...});
  const savedUser = await userRepo.save(newUser);
  
  try {
    await this.sendVerificationEmail(savedUser.email, emailVerificationToken);
    return { message: '...', user: savedUser };
  } catch (error) {
    // La transacción se revierte automáticamente
    throw new BadRequestException(...);
  }
});
```

---

### BUG-008: Uso de console.log/error en Producción
**Severidad:** ALTA  
**Categoría:** Código  
**Ubicación:** Múltiples archivos (60+ ocurrencias)

**Descripción:**
Se usa `console.log`, `console.error`, y `console.warn` en múltiples lugares del código. En producción, esto puede:
1. Exponer información sensible en logs
2. Degradar el rendimiento
3. Hacer difícil el seguimiento de errores

**Archivos Afectados:**
- `backend/src/tickets/tickets.service.ts`
- `backend/src/files/files.controller.ts`
- `backend/src/auth/auth.service.ts`
- Y muchos más...

**Impacto:**
- Exposición de información sensible
- Degradación del rendimiento
- Logs desorganizados

**Solución Recomendada:**
Reemplazar todos los `console.*` con el Logger de NestJS:
```typescript
private readonly logger = new Logger(ClassName.name);

// En lugar de:
console.error('Error:', error);

// Usar:
this.logger.error('Error:', error.stack);
```

---

### BUG-009: Falta de Validación de Límites en Queries
**Severidad:** ALTA  
**Categoría:** Rendimiento  
**Ubicación:** `backend/src/tickets/tickets.service.ts:86-100`

**Descripción:**
El método `findAll()` carga todos los tickets sin paginación, lo que puede causar problemas de rendimiento y memoria con grandes volúmenes de datos.

**Código Problemático:**
```typescript
async findAll() {
  const tickets = await this.ticketRepository.find({
    relations: ['floor', 'type', 'technician', 'file']
  });
  return tickets; // ❌ Sin límite ni paginación
}
```

**Impacto:**
- Timeout en peticiones con muchos tickets
- Alto uso de memoria
- Degradación del rendimiento del servidor

**Solución Recomendada:**
Implementar paginación:
```typescript
async findAll(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  const [tickets, total] = await this.ticketRepository.findAndCount({
    relations: ['floor', 'type', 'technician', 'file'],
    skip,
    take: limit,
    order: { created_at: 'DESC' }
  });
  
  return {
    data: tickets,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}
```

---

## BUGS DE SEVERIDAD MEDIA

### BUG-010: Validación de Base64 Incompleta
**Severidad:** MEDIA  
**Categoría:** Validación  
**Ubicación:** `backend/src/files/files.service.ts:22-27`

**Descripción:**
La validación de base64 solo verifica que se pueda decodificar, pero no valida:
1. Que el string sea realmente base64 válido (caracteres permitidos)
2. Que no esté vacío antes de decodificar
3. El tamaño real del archivo decodificado

**Código Problemático:**
```typescript
try {
  const base64Data = createFileDto.file_data.split(',')[1] || createFileDto.file_data;
  Buffer.from(base64Data, 'base64'); // ❌ Solo verifica que se pueda decodificar
} catch (error) {
  throw new BadRequestException('Datos de archivo base64 inválidos');
}
```

**Solución Recomendada:**
```typescript
// Validar formato base64
const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
if (!base64Regex.test(base64Data)) {
  throw new BadRequestException('Formato base64 inválido');
}

// Validar que no esté vacío
if (!base64Data || base64Data.trim().length === 0) {
  throw new BadRequestException('Datos de archivo vacíos');
}

// Decodificar y validar tamaño
const fileBuffer = Buffer.from(base64Data, 'base64');
if (fileBuffer.length === 0) {
  throw new BadRequestException('Archivo decodificado está vacío');
}
```

---

### BUG-011: Falta de Sanitización en Descripciones HTML
**Severidad:** MEDIA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/tickets/tickets.service.ts:93, 141`

**Descripción:**
Aunque se limpia el HTML de las descripciones, no está claro si se sanitiza antes de guardar en la base de datos. Si el HTML malicioso se guarda, puede ser un vector de XSS cuando se muestre en el frontend.

**Código Problemático:**
```typescript
// Solo se limpia al leer, no al guardar
cleanTicketDescriptions(tickets, (html) => this.ticketUtilsService.cleanDescription(html));
```

**Solución Recomendada:**
Sanitizar antes de guardar:
```typescript
// En el método create/update
if (createTicketDto.description) {
  createTicketDto.description = this.ticketUtilsService.cleanDescription(createTicketDto.description);
}
```

---

### BUG-012: Manejo Inconsistente de Errores
**Severidad:** MEDIA  
**Categoría:** Código  
**Ubicación:** Múltiples servicios

**Descripción:**
Algunos métodos lanzan `BadRequestException` para errores internos, otros lanzan excepciones genéricas. No hay consistencia en el manejo de errores.

**Ejemplo:**
- `tickets.service.ts:98` - `BadRequestException` para error interno
- `files.service.ts:50` - `BadRequestException` para error interno
- `auth.service.ts:82` - `BadRequestException` para error interno

**Solución Recomendada:**
Usar `InternalServerErrorException` para errores internos:
```typescript
catch (error) {
  this.logger.error('Error interno:', error);
  throw new InternalServerErrorException('Error interno del servidor');
}
```

---

### BUG-013: Falta de Validación de Email Verification Token Expiración
**Severidad:** MEDIA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/auth/auth.service.ts:28-44`

**Descripción:**
Los tokens de verificación de email no tienen expiración. Un token puede ser usado indefinidamente, lo que es un riesgo de seguridad.

**Código Problemático:**
```typescript
const emailVerificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
// ❌ No se guarda fecha de expiración
```

**Solución Recomendada:**
Agregar campo de expiración y validarlo:
```typescript
// En la entidad User
@Column({ type: 'datetime', nullable: true })
email_verification_token_expires_at: Date | null;

// Al generar token
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

await this.userService.update(user.id, {
  email_verification_token: emailVerificationToken,
  email_verification_token_expires_at: expiresAt
});

// Al verificar
if (user.email_verification_token_expires_at < new Date()) {
  throw new BadRequestException('Token de verificación expirado');
}
```

---

### BUG-014: Posible Query N+1 en findAllWithViewStatus
**Severidad:** MEDIA  
**Categoría:** Rendimiento  
**Ubicación:** `backend/src/tickets/tickets.service.ts:102-126`

**Descripción:**
Aunque se usa `getRawAndEntities()`, no está claro si todas las relaciones necesarias están siendo cargadas en una sola query. Puede haber queries adicionales para cargar relaciones.

**Solución Recomendada:**
Verificar que todas las relaciones estén en el query builder:
```typescript
let query = this.ticketRepository.createQueryBuilder('ticket')
  .leftJoinAndSelect('ticket.floor', 'floor')
  .leftJoinAndSelect('ticket.type', 'type')
  .leftJoinAndSelect('ticket.technician', 'technician')
  .leftJoinAndSelect('ticket.file', 'file');
```

---

## BUGS DE SEVERIDAD BAJA

### BUG-015: Falta de Validación de Parámetros en Endpoints
**Severidad:** BAJA  
**Categoría:** Validación  
**Ubicación:** `backend/src/auth/auth.controller.ts:115, 122, 133`

**Descripción:**
Los endpoints de 2FA reciben `userId` como parámetro de ruta, pero no validan que sea un número válido o que el usuario tenga permisos para modificar ese usuario específico.

**Solución Recomendada:**
```typescript
@Post('2fa/generate/:id')
@UseGuards(AuthGuard)
generate2FASecret(
  @Param('id', ParseIntPipe) userId: number,
  @Request() req
) {
  // Verificar que el usuario solo pueda modificar su propio 2FA
  if (req.user.id !== userId) {
    throw new ForbiddenException('No puedes modificar el 2FA de otro usuario');
  }
  return this.authService.generate2FASecret(userId);
}
```

---

### BUG-016: Falta de Rate Limiting
**Severidad:** BAJA  
**Categoría:** Seguridad  
**Ubicación:** Global

**Descripción:**
No hay rate limiting implementado en los endpoints, lo que permite ataques de fuerza bruta y DoS.

**Solución Recomendada:**
Implementar rate limiting usando `@nestjs/throttler`:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

---

### BUG-017: Falta de Validación de Tamaño Máximo en Campos de Texto
**Severidad:** BAJA  
**Categoría:** Validación  
**Ubicación:** DTOs

**Descripción:**
Algunos campos de texto no tienen validación de longitud máxima, lo que puede causar problemas de almacenamiento.

**Solución Recomendada:**
Agregar `@MaxLength()` en todos los campos de texto de los DTOs.

---

### BUG-018: Uso de INSERT IGNORE en lugar de Manejo Apropiado
**Severidad:** BAJA  
**Categoría:** Código  
**Ubicación:** `backend/src/tickets/tickets.service.ts:206-209`

**Descripción:**
Se usa `INSERT IGNORE` con raw query en lugar de manejar la duplicación de forma más elegante con TypeORM.

**Solución Recomendada:**
```typescript
// Verificar existencia primero
const existingView = await this.ticketViewRepository.findOne({...});
if (!existingView) {
  const newView = this.ticketViewRepository.create({...});
  await this.ticketViewRepository.save(newView);
}
```

---

### BUG-019: Falta de Headers de Seguridad
**Severidad:** BAJA  
**Categoría:** Seguridad  
**Ubicación:** `backend/src/main.ts`

**Descripción:**
No se configuran headers de seguridad como:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

**Solución Recomendada:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### BUG-020: Falta de Validación de Variables de Entorno Críticas
**Severidad:** MEDIA  
**Categoría:** Configuración  
**Ubicación:** `backend/src/auth/auth.service.ts:523-525, 592-595`

**Descripción:**
Las variables de entorno críticas como `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, y `MICROSOFT_REDIRECT_URI` se usan sin validación previa. Si faltan, el error solo se detecta en tiempo de ejecución cuando se intenta usar.

**Código Problemático:**
```typescript
const clientId = process.env.MICROSOFT_CLIENT_ID;
const redirectUri = process.env.MICROSOFT_REDIRECT_URI;

if (!clientId || !redirectUri) {
  throw new BadRequestException('Variables de entorno de Microsoft no configuradas');
}
// ❌ Se valida solo cuando se usa, no al iniciar la aplicación
```

**Impacto:**
- Errores en tiempo de ejecución en lugar de fallo rápido al iniciar
- Dificulta la detección de problemas de configuración
- Puede causar errores inesperados en producción

**Solución Recomendada:**
Validar al inicio de la aplicación:
```typescript
// En app.module.ts o en un módulo de validación
@Module({})
export class ConfigValidationModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}
  
  onModuleInit() {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'MICROSOFT_CLIENT_ID',
      'MICROSOFT_CLIENT_SECRET',
      'MICROSOFT_REDIRECT_URI',
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'SMTP_HOST'
    ];
    
    const missing = requiredVars.filter(
      varName => !this.configService.get(varName)
    );
    
    if (missing.length > 0) {
      throw new Error(
        `Variables de entorno faltantes: ${missing.join(', ')}`
      );
    }
  }
}
```

---

## RECOMENDACIONES GENERALES

1. **Implementar Tests:** Aumentar la cobertura de tests, especialmente para casos límite y escenarios de error.

2. **Documentación:** Mejorar la documentación de APIs y agregar ejemplos de uso.

3. **Monitoreo:** Implementar logging estructurado y monitoreo de errores (Sentry, etc.).

4. **Validación Consistente:** Estandarizar la validación de datos entre frontend y backend.

5. **Seguridad:** Realizar auditoría de seguridad completa y implementar medidas adicionales.

6. **Performance:** Implementar caché donde sea apropiado y optimizar queries.

---

## PRIORIDAD DE CORRECCIÓN

### Inmediata (Esta Semana)
- BUG-001: JWT_SECRET inseguro
- BUG-002: TLS inseguro
- BUG-003: Autorización en perfil

### Alta Prioridad (Este Mes)
- BUG-004: Race condition en refresh token
- BUG-005: Exposición de información
- BUG-006: Validación de archivos
- BUG-007: Transacciones
- BUG-008: Console.log en producción
- BUG-009: Paginación

### Media Prioridad (Próximo Mes)
- BUG-010 a BUG-014, BUG-020

### Baja Prioridad (Mejoras Continuas)
- BUG-015 a BUG-019

---

**Fin del Reporte**

