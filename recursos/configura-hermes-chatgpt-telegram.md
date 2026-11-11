# Configura Hermes con ChatGPT y Telegram

Esta guía te ayuda a instalar Hermes en tu computador, usar un modelo con tu cuenta de ChatGPT y conversar con tu agente desde Telegram. Tú eliges el nombre del agente y autorizas tus propias cuentas.

## Cómo usar este archivo

Adjunta este Markdown a **ChatGPT o Codex** y escribe:

> Usa este archivo para ayudarme a instalar Hermes, conectarlo a mi cuenta de ChatGPT y probarlo desde Telegram. Haz lo que puedas en mi computador y guíame paso a paso cuando deba intervenir. Hazme una pregunta a la vez.

Si usas Codex con acceso a tu equipo, puede comprobar la instalación, preparar el perfil y verificar el servicio. Si estás en un chat sin acceso al equipo, sigue los comandos en tu propia Terminal. En ambos casos, completa tú los inicios de sesión y la autorización desde las pantallas oficiales.

## Instrucciones para el asistente de instalación

Primero detecta mi sistema operativo y verifica si Hermes ya está instalado. Si puedes usar herramientas locales, compruébalo directamente. Si necesitas una respuesta mía, empieza por mi sistema operativo o por el nombre que quiero darle al agente, según lo que aún falte. Reutiliza la instalación compatible que ya exista. Mantén el trabajo dentro del perfil que elijamos y evita importar historiales, cuentas o configuraciones personales.

No me pidas contraseñas, tokens ni códigos de inicio de sesión por el chat. Si una autorización caduca, inicia un enlace nuevo desde el asistente oficial. Si no puedes ejecutar un paso en mi equipo, dame el comando o la ruta de menú para que lo haga y espera el resultado antes de afirmar que funciona.

### 1. Instala Hermes y crea el perfil

1. Comprueba `hermes --version`. Si falta Hermes, usa el método oficial para el sistema detectado. Después, abre una Terminal nueva y verifica que el comando esté disponible. [Instalación oficial de Hermes](https://hermes-agent.nousresearch.com/docs/getting-started/installation)
2. Pregúntame cómo quiero llamar a mi agente. Usa un identificador corto válido para el perfil, como `miagente`, y mi nombre elegido como nombre visible en Telegram y en la presentación del agente. Comprueba primero `hermes profile list` para evitar sobrescribir un perfil existente. En las instrucciones del perfil (`SOUL.md`), agrega el nombre elegido conservando las demás instrucciones. [Perfiles de Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)

En los ejemplos, cambia `miagente` por el identificador de tu perfil:

```sh
hermes --version
hermes profile list
hermes profile create miagente
```

### 2. Conecta tu cuenta de ChatGPT

1. Abre el selector de modelos de ese perfil con `hermes -p miagente model`. Elige **ChatGPT or Codex Subscription** o la opción equivalente de **OpenAI Codex** que use el inicio de sesión por suscripción. Completa la autorización oficial en el navegador con tu cuenta de ChatGPT.
2. Selecciona un modelo disponible para tu cuenta y prueba una respuesta corta desde el perfil. Si el plan o la versión de Hermes no permiten esta conexión, explica el bloqueo. Cualquier cambio a una API de pago por uso requiere que yo elija esa opción.

```sh
hermes -p miagente model
hermes -p miagente chat --oneshot --quiet -q 'Responde solo: modelo listo.'
```

Esta modalidad usa la cuota disponible de un plan elegible de ChatGPT. El inicio de sesión para usar el modelo se hace aparte de la vinculación con Telegram. [Selección del proveedor en Hermes](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) · [Uso de tu plan de ChatGPT en otras aplicaciones](https://learn.chatgpt.com/docs/sign-in-with-chatgpt)

### 3. Conecta Telegram al mismo perfil

**Opción recomendada.** En Hermes Desktop o en su panel local, selecciona tu perfil y abre **Messaging → Telegram → Create with QR**, si está disponible. Desde Terminal, puedes abrir el asistente con `hermes -p miagente gateway setup`, elegir **Telegram** y seleccionar **Automatic**.

1. Escanea el QR con tu celular o abre el enlace que muestre Hermes. En Telegram, confirma **Crear bot** y elige el nombre visible que quieras. Si te pide un nombre de usuario, elige uno disponible que termine en `bot`.
2. Si Hermes detecta tu cuenta de Telegram y te ofrece autorizarla, acepta solo para tu cuenta. Finaliza el asistente de Hermes para guardar la configuración. Deja desactivado el acceso público.
3. Abre el **chat privado del bot recién creado**, toca **Iniciar** y envía `¿Cuál es el nombre de tu agente?`. Comprueba que responde con el nombre que acabas de configurar.

**Si la opción automática no aparece.** Abre [BotFather oficial](https://t.me/BotFather), usa `/newbot` y elige el nombre visible y el nombre de usuario. Introduce el token únicamente en el campo privado de Hermes o en el asistente de Terminal. Configura una lista de usuarios permitidos con tu ID de Telegram, o usa el emparejamiento privado si tu versión lo ofrece. En ese caso, abre el chat del bot y aprueba localmente la solicitud de tu propia cuenta. [Guía de Telegram para Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram) · [Control de acceso y emparejamiento](https://hermes-agent.nousresearch.com/docs/user-guide/security/)

Si reutilizas un bot que funciona en otro equipo, mueve la conexión con una sola instancia activa para ese bot. Para una instalación desde cero, crea un bot propio.

### 4. Verifica que responda desde el celular

1. Comprueba el estado con `hermes -p miagente gateway status`. Si Hermes indica que el perfil usa un gateway compartido, administra el servicio desde el perfil anfitrión que indique Hermes. Si hace falta dejarlo en segundo plano, configura el servicio oficial para tu sistema operativo y vuelve a comprobar su estado. [Servicio de mensajería de Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/)
2. Cierra la Terminal que usaste para configurar el bot y vuelve a escribirle desde el celular. Si deja de responder, comprueba que el gateway esté funcionando como servicio y que cargó la configuración del perfil correcto.
3. Confirma que solo tu cuenta de Telegram esté autorizada y que el acceso público esté desactivado. Si tienes otra cuenta de prueba, verifica que quede bloqueada.

El montaje queda comprobado cuando el modelo responde en Hermes, el gateway está activo y el mismo perfil contesta en el chat privado de Telegram. Para atender mensajes en todo momento, el equipo donde corre Hermes debe permanecer encendido, despierto y conectado a internet. Si quieres usarlo con la tapa cerrada o después de reiniciar el equipo, prueba esas condiciones antes de depender de ellas.

## Para la grabación

Muestra el nombre elegido, la prueba del modelo y la respuesta del bot desde el celular. Oculta las pantallas que muestren cuentas personales, códigos, tokens o enlaces de autorización. Comparte este archivo con tu audiencia para que cada persona repita el proceso con sus propios accesos.
