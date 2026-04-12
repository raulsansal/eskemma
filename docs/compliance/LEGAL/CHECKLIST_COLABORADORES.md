# CHECKLIST_COLABORADORES.md | Eskemma
## Lista de Verificación para Nuevos Colaboradores

**Propósito:** Garantizar que cualquier colaborador humano que contribuya código
a Eskemma firme una cesión de derechos antes de iniciar.  
**Versión:** 1.0  
**Fecha:** 2026-04-10

---

> **Instrucción:** Completar este checklist antes de que cualquier colaborador
> externo (freelancer, contratista, socio técnico) contribuya código al repositorio
> de Eskemma.

---

## Estado Actual de Colaboradores

| Colaborador | Tipo | Contrato firmado | Observaciones |
|-------------|------|-----------------|---------------|
| Raúl Sánchez Salgado | Autor principal | — (titular) | Propietario único |
| Claude Code (Anthropic) | Herramienta IA | — | Ver TEMPLATE_CONTRATO.md |

*Sin colaboradores humanos externos a la fecha de creación de este documento.*

---

## Checklist para Colaboradores Humanos

Antes de que un colaborador externo contribuya código:

### Documentación previa

- [ ] **Acuerdo de Confidencialidad (NDA)** firmado y entregado
- [ ] **Cesión de Derechos Patrimoniales** firmada — todo código desarrollado para
      Eskemma pasa a ser propiedad de Raúl Sánchez Salgado / Eskemma
- [ ] **Contrato de prestación de servicios** con cláusula de propiedad intelectual
- [ ] Confirmación de que el colaborador no usará código propietario de terceros
      sin autorización (no copiar de proyectos con restricciones de licencia)

### Acceso al repositorio

- [ ] Cuenta GitHub del colaborador identificada
- [ ] Acceso al repositorio privado concedido con permisos mínimos necesarios
- [ ] Rama de trabajo separada (nunca commit directo a `main`)
- [ ] Pull Request obligatorio con revisión de Raúl antes de merge

### Uso de IA por colaboradores

- [ ] Si el colaborador usa herramientas de IA (GitHub Copilot, Cursor, etc.),
      verificar que los términos de la herramienta sean compatibles con la
      asignación de propiedad a Eskemma
- [ ] Documentar en `02_REGISTRO_INTERVENCIONES.md` cualquier contribución
      significativa, indicando quién diseñó y quién implementó

### Cierre de colaboración

- [ ] Revocar acceso al repositorio al terminar la colaboración
- [ ] Confirmar que el colaborador no retiene copias del código
- [ ] Archivar contratos firmados

---

## Cláusula Modelo de Cesión de Derechos

Incluir en todos los contratos con colaboradores externos:

> **Cláusula de Propiedad Intelectual:**
>
> El Prestador de Servicios reconoce y acepta que todos los desarrollos, código
> fuente, diseños, documentación y demás creaciones intelectuales producidas en
> el marco de la presente relación contractual, así como los derechos patrimoniales
> de autor que de ellos deriven, serán propiedad exclusiva de Raúl Sánchez Salgado
> ("El Cliente") desde el momento de su creación.
>
> El Prestador de Servicios cede desde ahora, con carácter irrevocable, todos los
> derechos patrimoniales derivados de las obras creadas en virtud del presente
> contrato, incluyendo los derechos de reproducción, distribución, transformación
> y comunicación pública.
>
> Esta cesión se realiza con carácter exclusivo, a título gratuito y sin limitación
> temporal o territorial.

---

## Herramientas de IA Permitidas para Colaboradores

Si se contratan colaboradores que usan IA como asistente de codificación:

| Herramienta | ¿Permitida? | Condición |
|-------------|-------------|-----------|
| Claude Code (Anthropic) | ✅ Sí | Ver términos Anthropic — asigna output al usuario |
| GitHub Copilot (Microsoft) | ⚠️ Verificar | Revisar terms para uso comercial |
| Cursor | ⚠️ Verificar | Revisar terms para uso comercial |
| ChatGPT / OpenAI | ✅ Sí | OpenAI asigna output al usuario por sus términos |

**Regla:** Antes de aprobar el uso de cualquier herramienta de IA por un colaborador,
verificar que los términos del servicio asignen los outputs al usuario (no a la IA ni
a la empresa proveedora).

---

*Documento bajo supervisión de Raúl Sánchez Salgado — 2026-04-10*
