# 🌮 Taquería El Rincón Auténtico

Aplicación web moderna e interactiva para taquerías con pedidos por voz, carrito de compras dinámico y control de ventas / corte de turno en tiempo real.

---

## 🚀 Despliegue en Render

Para desplegar esta aplicación en **[Render.com](https://render.com/)**:

### Opción 1: Automático con Blueprint (`render.yaml`)
1. Inicia sesión en [dashboard.render.com](https://dashboard.render.com/).
2. Haz clic en **New +** y selecciona **Blueprint**.
3. Conecta el repositorio de GitHub: `https://github.com/adriandoct/taqueria`.
4. Render detectará automáticamente el archivo `render.yaml` y configurará el servicio web.
5. Haz clic en **Apply**.

### Opción 2: Configuración Manual como Web Service
1. En [dashboard.render.com](https://dashboard.render.com/), haz clic en **New +** -> **Web Service**.
2. Conecta tu repositorio `adriandoct/taqueria`.
3. Configura los siguientes campos:
   - **Name**: `taqueria`
   - **Environment**: `Node`
   - **Region**: `Oregon` (o tu preferencia)
   - **Branch**: `master` o `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. *(Opcional)* En **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en **Deploy Web Service**.

---

## ✨ Características Principales

1. **🎙️ Pedidos por Voz en Español (es-MX)**:
   - Reconocimiento de voz en tiempo real con Web Speech API.
   - Procesamiento inteligente de tacos, cantidades y especificaciones (ej: *"Quiero 3 tacos al pastor con todo y 2 de birria sin cebolla"*).
   - Acumulación silenciosa en el carrito sin cierres molestos.

2. **💰 Módulo de Corte de Turno (Corte de Caja)**:
   - Contador en vivo de ventas en la barra de navegación (`$X MXN`).
   - Resumen con total de ventas, órdenes, tacos servidos y ticket promedio.
   - Gráfica de desglose de ventas por especialidad (Pastor, Birria, Suadero, etc.).
   - Control de estados de pedidos en cocina (`Pendiente`, `En Cocina`, `Listo`, `Entregado`).
   - Registro rápido de ventas de mostrador en efectivo.
   - Impresión de ticket de corte y cierre de turno.

3. **📱 Menú Interactivo y Carrito**:
   - Tarjetas con fotografías de alta calidad, precios y personalizaciones.
   - Panel de carrito deslizable con edición de cantidades y notas.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Estilos**: Tailwind CSS con Shadcn UI y Framer Motion
- **Estado**: Zustand con persistencia local y fallback offline
- **Base de Datos**: Supabase (PostgreSQL) con fallback seguro
- **Voz**: Web Speech API nativa del navegador
