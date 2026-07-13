# Auditoría general — martinbaumann

Fecha: 2026-07-12

## Veredicto

El sitio tiene una identidad visual clara, una propuesta entendible y un buen activo de captación (la guía). Sin embargo, hoy no está listo para invertir tráfico: la waitlist confirma éxito aunque Supabase no está configurado, la navegación móvil se recorta y la oferta cambia de nombre y formato entre páginas. La prioridad es recuperar datos de forma real, unificar la promesa y medir el embudo.

## Recorrido y salud

1. Home — Regular. Hero fuerte y CTA visible; falta prueba verificable, claridad del entregable y medición.
2. Guía gratuita — Buena con riesgos. Aporta valor y permite guardar respuestas; la descarga no captura email y su analítica remota también queda inactiva sin Supabase.
3. Waitlist — Crítica. El formulario muestra confirmación aunque la configuración remota está vacía; los registros quedan solo en localStorage del visitante.
4. Portfolio — Regular. Aporta credibilidad, pero no muestra resultados, testimonios ni una vía directa de contacto/contratación.
5. Mobile — Crítica. La barra superior desborda y recorta “Portfolio” y “Preventa”; varios objetivos táctiles miden cerca de 33 px de alto.

## Prioridades

### P0 — antes de enviar tráfico

- Configurar Supabase o cambiar el formulario para fallar de forma explícita. Nunca confirmar registro si el backend se omitió.
- Probar el alta de punta a punta y añadir protección anti-spam, consentimiento y política de privacidad.
- Corregir la navegación móvil: menú compacto o prioridad de 2–3 acciones, objetivos de al menos 44×44 px y estado activo.
- Unificar el producto: “De Idea a MVP” vs “De Idea a App”; “3 clases en vivo” vs “curso grabado por etapas”; “preventa” vs “lista de espera”.

### P1 — conversión y marketing

- Reescribir el hero hacia resultado + plazo + quién: qué sale del taller y para qué perfil.
- Añadir prueba con fuente: enlaces a perfiles, casos, métricas de producto, capturas, testimonios o resultados concretos.
- Explicar fechas, duración, cupos, modalidad, soporte, garantía y qué recibe exactamente quien paga CLP 49.990.
- Convertir la guía en lead magnet: captura de email opcional pero atractiva, entrega por correo y secuencia de 4–6 mensajes.
- Reducir la fricción de waitlist: email + etapa primero; pedir red social/proyecto después o hacerlos opcionales.
- Añadir eventos del embudo: vista de oferta, clic en guía, descarga, inicio de formulario, alta exitosa y clic a redes/casos.

### P2 — SEO, accesibilidad y confianza

- Añadir canonical, `og:image`, URL de Open Graph/Twitter y sitemap/robots cuando exista dominio final.
- Incluir política de privacidad, términos y explicación del uso de datos.
- Revisar contraste del texto gris y del titular outline; probar teclado, foco, zoom 200% y lector de pantalla.
- Evitar que las métricas comiencen en “0” si JavaScript no corre; usar el valor final en HTML y animar solo como mejora.
- Reemplazar anglicismos inconsistentes (“waitlist”, “templates”, “founder”) o usarlos de forma deliberada y uniforme.

## Hipótesis de posicionamiento

Posicionamiento recomendado: “Taller práctico para emprendedores no técnicos que quieren validar y lanzar un MVP pequeño con IA, con acompañamiento en vivo y un caso real chileno”.

Hero sugerido: “Lanza un MVP validable con IA, aunque no programes”. Subtítulo: “En 3 clases en vivo defines el problema, diseñas el flujo y sales con un roadmap, prompts y checklist para probar tu idea con usuarios reales”. CTA principal: “Reservar precio fundador”. CTA secundario: “Probar la guía gratis”.

## Plan de 30 días

- Semana 1: backend real, prueba E2E, privacidad, navegación móvil y consistencia de oferta.
- Semana 2: contenido de conversión, casos/prueba, FAQ y analítica.
- Semana 3: automatización de email y campaña orgánica hacia la guía.
- Semana 4: test A/B de hero/CTA y revisión de conversiones por fuente.

## Límites

La auditoría cubre el código local y el recorrido visual en desktop y móvil. No confirma WCAG completa, rendimiento de producción, entregabilidad de correo, analítica real ni comportamiento del dominio publicado.
