# Rodrigo Cutsss — Arquitectura Comercial & Persistencia en la Nube (Firebase Firestore)

Este plan transforma **Rodrigo Cutsss** de un prototipo con almacenamiento temporal a un **sistema comercial llave en mano con base de datos en la nube (Firebase Firestore)**, compresión inteligente de fotografías desde celulares, sincronización en tiempo real entre todos los dispositivos y seguridad administrativa reforzada.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas para dejar el sistema listo para vender:**
> - **Base de Datos Persistente en la Nube**: Conexión oficial a **Firebase Firestore** (Google Cloud) con respaldo híbrido en servidor Express para que ningún turno, cambio de precio, foto de galería o caso de *Antes y Después* se pierda jamás aunque el servidor se reinicie.
> - **Sincronización Global de Transformaciones y CRM**: Los casos de *Antes y Después* y las fichas técnicas de clientes dejan de vivir solo en el teléfono donde se crearon y pasan a sincronizarse en la base de datos central.
> - **Compresión Automática de Fotos de Cámara**: Redimensionamiento y compresión automática en cliente (`Canvas WebP/JPEG` a ~120–180 KB) al subir fotos desde un iPhone o Android, respetando el límite de 1 MB por documento de Firestore y garantizando carga instantánea.
> - **Seguridad Administrativa (Google Auth + PIN Personalizado)**: Vinculación del administrador verificando correo de Google (`hz.mdiego@gmail.com` / cuenta del barbero) en Firestore Rules junto con bloqueo por PIN personalizado y sesión protegida por token.
> - **Circuito de Cobro Sin Comisiones**: Se mantiene la confirmación directa por WhatsApp y seña por Alias bancario/Mercado Pago con copia en 1 clic, evitando costos de pasarela para el barbero.

---

## 1. Overview & Core Concept

- **Qué resuelve este cambio**: Elimina las tres barreras que impedían comercializar el sistema como software de gestión real:
  1. Evita que los turnos o precios se borren cuando el servidor entra en reposo.
  2. Permite que cualquier foto o caso de *Antes y Después* subido por el barbero desde su celular sea visible al instante en los teléfonos de todos sus clientes.
  3. Protege la base de datos contra escrituras no autorizadas y evita que fotos pesadas de cámara (5–12 MB) bloqueen el sistema.
- **Público Objetivo**: Barberías y peluquerías de autor (comenzando por **Rodrigo Cutsss** en Vuelta de Obligado 931, Venado Tuerto) que buscan una plataforma propia sin pagar comisiones mensuales por turno.
- **Valor Comercial**: Podés entregarle al dueño de la barbería un enlace único (instalable como App PWA) donde administra desde su propio teléfono precios, horarios, galería, transformaciones y agenda en tiempo real.

---

## 2. User Experience & Visual Design

- **Flujo del Cliente (Reserva y Consulta 24/7)**:
  1. El cliente ingresa desde Instagram o Google, navega con las animaciones de telón (*La Banda*) y explora precios, fotos y comparativas *Antes y Después* sincronizadas desde la nube.
  2. Elige servicio(s), día hábil y horario libre consultado en vivo contra la base de datos.
  3. Descarga su **Ticket Digital PNG**, agenda en Google/Apple Calendar y envía su confirmación por WhatsApp con el Alias copiado.
- **Flujo del Barbero / Administrador (Desde su Celular o PC)**:
  1. Ingresa al panel oculto (`Ctrl + Shift + A`, triple clic en el escudo `RC` o `/#/admin`) mediante su PIN personalizado y sesión autenticada con Google para escritura segura en Firestore.
  2. Saca una foto del corte o del *Antes y Después* directamente con la cámara de su celular: el sistema la optimiza automáticamente en milisegundos, muestra el peso ahorrado y la publica para todos los visitantes.
  3. Administra turnos del día, bloquea horarios por feriado o almuerzo, ajusta precios (individuales o porcentuales) y guarda la fórmula de corte de cada cliente en el fichero CRM.
- **Identidad Visual & Tema ("Executive Heritage Ledger & Sastrería Retro")**:
  - *Dirección Estética*: Papel antiguo cálido, tipografía editorial clásica combinada con datos técnicos monoespaciados y el detalle sutil de la banda diagonal carmín inspirada en la historia de River Plate.
  - *Paleta de Colores*:
    - `--background`: `#F5EFE4` (Papel Antiguo Cálido en sitio público) y `#EFE8DA` (Piedra Cálida en escritorio Admin).
    - `--card`: `#FAF6EE` (Cartulina Marfil con bordes `#C8BBA4`).
    - `--primary`: `#181512` (Tinta Carbón Profunda).
    - `--accent`: `#9E2A2B` (Carmín Histórico *La Banda*) y `#B89146` (Bronce Sastrero).
  - *Tipografía & Jerarquía*: Títulos con carácter editorial (`Space Grotesk` + `Cormorant Garamond` en cursiva para acentos clásicos) y cifras tabulares (`JetBrains Mono`) para precios, horarios y métricas de caja.
- **Feedback Interactivo**:
  - Indicador de estado de sincronización en la nube dentro del Panel Admin (`Sincronizado en Nube Firestore`).
  - Indicador visual de optimización al subir imágenes (mostrando resolución optimizada y velocidad de carga).

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Persistencia Dual (Firebase Firestore + API Backend Resiliente)**
  - *Enfoque Elegido*: Usar **Firebase Firestore** como fuente de verdad en la nube en tiempo real, manteniendo sincronizado el estado con el backend para validaciones de colisión de turnos y exportación de backups JSON.
  - *Por qué*: Garantiza que los datos persistan 24/7 en la infraestructura de Google Cloud sin depender de la memoria RAM temporal del contenedor, y permite que múltiples dispositivos vean los mismos turnos y fotos al instante.
- **Decisión 2: Compresión Automática de Imágenes en el Navegador antes de Guardar**
  - *Enfoque Elegido*: Procesar toda imagen subida desde celular o PC mediante un motor `HTML5 Canvas` que redimensiona a un máximo de `1200px` y comprime en calidad optimizada (`~120 KB`), antes de enviarla a Firestore y al servidor.
  - *Por qué*: Firestore tiene un límite estricto de `1 MB` por documento. Una foto cruda de iPhone pesa entre `4 MB` y `10 MB` y fallaría sin este motor de compresión.
- **Decisión 3: Reglas de Seguridad Zero-Trust en Firestore (`firestore.rules`)**
  - *Enfoque Elegido*: Lectura pública para el catálogo, galería, transformaciones y disponibilidad de agenda; creación validada de turnos con esquemas estrictos; y escritura exclusiva de administrador verificada para precios, configuración, galería y CRM.
  - *Por qué*: Protege el negocio para que ningún visitante malintencionado pueda alterar precios, borrar turnos de otros clientes ni leer notas privadas del CRM.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     RODRIGO CUTSSS — CLIENTE & ADMIN                       │
│                                                                            │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │  Sitio Público & Turnos │  │ Panel Admin Ejecutivo   │                  │
│  │  • Telón Framer Motion  │  │ • Agenda & Bloqueos     │                  │
│  │  • Antes/Después (2V)   │  │ • Gestor Antes/Después  │                  │
│  │  • Ticket PNG + ICS     │  │ • CRM + Caja + Precios  │                  │
│  └───────────┬─────────────┘  └───────────┬─────────────┘                  │
│              │                            │                                │
│              ▼                            ▼                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │           Motor de Compresión de Imágenes (Canvas Optimizer)         │  │
│  │     Convierte fotos de cámara (5-10MB) -> JPEG/WebP (< 180KB)        │  │
│  └───────────────────────────────────┬──────────────────────────────────┘  │
│                                      │                                     │
│                                      ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              StudioContext (Sincronización en Tiempo Real)           │  │
│  └───────────────┬──────────────────────────────────────┬───────────────┘  │
└──────────────────┼──────────────────────────────────────┼──────────────────┘
                   │                                      │
                   ▼ (Lectura/Escritura Cloud)            ▼ (Validación & API)
┌─────────────────────────────────────┐  ┌───────────────────────────────────┐
│   GOOGLE FIREBASE (Cloud Persistence)│  │   SERVIDOR EXPRESS (/api/*)       │
│  • Firebase Auth (Google + Admin)   │  │  • Control Anti-Solapamiento 409  │
│  • Colección: studio_settings       │  │  • Sincronización de Transformac. │
│  • Colección: studio_services       │  │  • Sincronización de CRM Clientes │
│  • Colección: studio_appointments   │  │  • Rate Limiting & Token PIN Auth │
│  • Colección: studio_gallery        │  └───────────────────────────────────┘
│  • Colección: studio_transformations│
│  • Colección: studio_crm_notes      │
└─────────────────────────────────────┘
```

### Data Model & Collections
1. **`studio_settings/main`**: Configuración general del estudio, textos, redes sociales, horarios de apertura, alias de pago, visibilidad y orden de secciones.
2. **`studio_services/{serviceId}`**: Catálogo de servicios con precios en ARS, duración en minutos, insumos y visibilidad.
3. **`studio_appointments/{appointmentId}`**: Turnos reservados con fecha, hora de inicio, duración, estado (`confirmed` / `completed`) y modalidad de seña.
4. **`studio_blocked_slots/{slotId}`**: Bloqueos manuales de agenda por feriados, descansos o eventos.
5. **`studio_gallery/{itemId}`**: Fotografías de trabajos, local y equipamiento optimizadas para carga rápida.
6. **`studio_transformations/{caseId}`**: Casos comparativos de *Antes y Después* con ambas fotos comprimidas, diagnóstico, resultado, perfil ideal y servicio vinculado.
7. **`studio_crm_notes/{noteId}`**: Fichas técnicas privadas de clientes (fórmula de corte, alzadas, remolinos, WhatsApp y fecha de última visita), accesibles únicamente por el administrador.

### Interactive Component & State Mapping
- **Aprovisionamiento Firebase**: Al aprobar el plan, se abrirá el asistente oficial de Firebase de AI Studio para vincular el proyecto y desplegar las reglas de seguridad (`firestore.rules`).
- **Compresor Automático en Formularios de Imagen**: Tanto en el modal de **Subir Foto a Galería**, como en **Configuración de Imagen de Portada** y en **Agregar Caso Antes y Después**, el selector de archivos pasará cada foto por el compresor antes de guardarla en Firestore y en el backend.
- **Sincronización Completa de `transformations` y `clientNotes`**: Se agregarán los endpoints correspondientes en el backend y las colecciones en Firestore para que todo cambio impacte en todos los dispositivos al instante.
