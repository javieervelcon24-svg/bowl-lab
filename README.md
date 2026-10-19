# Bowl Lab

Tienda de bowls personalizados. React + TypeScript + Tailwind (Vite) + una función de servidor (Netlify) que te avisa por Telegram de cada pedido.

## Cómo funciona un pedido
El cliente arma su bowl y presiona "Confirmar pedido". La página envía el pedido a `/api/order`; el servidor lo valida, recalcula los precios y te manda un mensaje de Telegram. El cliente ve "pendiente de confirmación" hasta que tú lo aceptes.

## 1. Crear tu bot de Telegram (2 minutos)
1. En Telegram busca **@BotFather** y envíale `/newbot`. Elige un nombre; te dará un **token** (guárdalo en secreto).
2. Abre una conversación con tu bot nuevo y envíale cualquier mensaje ("hola").
3. En el navegador abre `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`. Busca `"chat":{"id":123456789` : ese número es tu **chat id**.

## 2. Publicar (Netlify)
1. Sube esta carpeta a un repositorio de GitHub (sin `node_modules`).
2. En netlify.com: "Add new project" → importa el repositorio (ya incluye `netlify.toml`).
3. En Site configuration → Environment variables agrega:
   - `TELEGRAM_BOT_TOKEN` = el token de BotFather
   - `TELEGRAM_CHAT_ID` = tu chat id
4. Despliega de nuevo. Haz un pedido de prueba desde tu celular: debe llegarte el mensaje.

Para probar en tu computadora: `npm install` y `npx netlify dev` (con las dos variables en un archivo `.env`). `npm run dev` solo no incluye la función.

## 3. Código QR
Con la URL pública de Netlify, genera el QR en cualquier generador gratuito, descarga el PNG y pégalo en tus carteles.

## Pendiente (siguiente etapa)
Panel de administración con login, inventario, costos y estadísticas (propuesta: Supabase). Hoy el catálogo y los horarios viven en `src/lib/catalog.ts`; los horarios de entrega son de ejemplo y hay que cambiarlos.
