# Senalmaq E-commerce

Una plataforma de comercio electrónico completa para Senalmaq, especializada en máquinas de coser industriales y para hogar. Construida con Next.js 14, TypeScript, Firebase y TailwindCSS.

## 🚀 Características

### Públicas
- **Homepage**: Hero banner, productos más vendidos, videos de YouTube, enlaces sociales
- **Catálogo**: Navegación por categorías con filtros avanzados
- **Productos**: Páginas detalladas con galería, especificaciones y botones de compra
- **Búsqueda**: Búsqueda en tiempo real con filtros y paginación
- **Carrito**: Gestión de carrito de compras (localStorage)
- **SEO**: Metadatos dinámicos, sitemap, robots.txt, datos estructurados

### Administrativas
- **Autenticación**: Login seguro con Firebase Auth
- **Dashboard**: Panel de administración completo
- **CRUD**: Gestión de categorías y productos
- **Medios**: Configuración de videos y enlaces sociales
- **Imágenes**: Subida masiva con reordenamiento por drag & drop

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Firebase (Firestore, Storage, Auth)
- **UI**: Framer Motion, Lucide Icons, React Hook Form
- **Validación**: Zod
- **SEO**: next-sitemap, metadatos dinámicos

## 📦 Instalación

### 1. Clonar el repositorio

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Iniciar sesion
firebase login

# Ejecutar el script de configuracion
node scripts/setup-admin.js
```

### 6. Poblar la base de datos

```bash
# Ejecutar el script de seed
npm run seed
```

```bash
# Establecer consultRequired = false en productos existentes
npm run backfill-consult
```

### 7. Ejecutar en desarrollo

```bash
npm run dev

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🚀 Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Construir el proyecto
npm run build

# Verificar que no hay errores
npm run lint

### 2. Conectar con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importa tu proyecto desde GitHub
 3. Configura las variables de entorno en Vercel
     - `NEXT_PUBLIC_BOLD_API_KEY`
     - `BOLD_SECRET_KEY` (variable privada)
     - `NEXT_PUBLIC_SITE_URL`
    - `NEXT_PUBLIC_WHATSAPP_NUMBER`
     - Las variables existentes de Firebase
4. Despliega

### 3. Configurar dominio personalizado

1. En Vercel Dashboard, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 📁 Estructura del proyecto

src/
├── app/                    # App Router de Next.js
│   ├── (catalog)/         # Páginas públicas del catálogo
│   ├── (cart)/            # Páginas del carrito
│   ├── admin/             # Páginas administrativas
│   ├── api/               # API routes
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Homepage
│   ├── robots.ts          # Robots.txt
│   └── sitemap.ts         # Sitemap
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de UI
│   ├── catalog/          # Componentes del catálogo
│   ├── product/          # Componentes de productos
│   ├── admin/            # Componentes administrativos
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuración
│   ├── actions/          # Server Actions
│   ├── firebase/         # Configuración de Firebase
│   ├── types.ts          # Tipos TypeScript
│   ├── utils.ts          # Utilidades
│   ├── validators.ts     # Validaciones Zod
│   └── seo.ts            # Utilidades SEO
└── middleware.ts         # Middleware de Next.js

## 🔧 Scripts disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Inicio en producción
npm run start

# Linting
npm run lint

# Poblar base de datos
npm run seed

# Generar sitemap
npm run postbuild

## 🗄️ Modelo de datos

### Categorías
```typescript
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  heroImagePath?: string
  position: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

### Productos
```typescript
interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  brand?: string
  sku?: string
  categoryId: string
  imagePaths: string[]
  specs: { key: string; value: string }[]
  active: boolean
  isBestseller: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  search?: string
}

### Medios del sitio
```typescript
interface SiteMedia {
  heroHeadline: string
  heroSub: string
  youtubeMainId: string
  youtubeShortIds: string[]
  instagramUrl: string
  youtubeUrl: string
  whatsappUrl: string
}

## 🔒 Seguridad

### Firestore Security Rules
- Lectura pública para productos y categorías activas
- Escritura solo para usuarios con rol de administrador
- Validación de datos en Server Actions

### Storage Rules
- Lectura pública para imágenes
- Escritura solo para administradores

### Middleware
- Protección de rutas administrativas
- Validación de tokens JWT

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes adaptativos**: Navegación, filtros, galerías

## 🎨 Personalización

### Colores
- **Primario**: Verde #1B5E20
- **Grises**: Escala completa de grises
- **Acentos**: Verde claro para elementos destacados

### Tipografía
- **Fuente**: Inter (Google Fonts)
- **Tamaños**: Escala tipográfica consistente

## 🔍 SEO

### Metadatos
- Títulos dinámicos por página
- Descripciones optimizadas
- Open Graph y Twitter Cards
- URLs canónicas

### Datos estructurados
- JSON-LD para productos
- BreadcrumbList
- Información de organización

### Performance
- Optimización de imágenes con next/image
- Lazy loading
- Caching estratégico

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage

## 📊 Analytics

La aplicación está preparada para integrar:
- Google Analytics 4
- Google Tag Manager
- Facebook Pixel
- Hotjar

## 🚨 Troubleshooting

### Problemas comunes

1. **Error de autenticación Firebase**
   - Verifica las variables de entorno
   - Asegúrate de que el proyecto Firebase esté configurado correctamente

2. **Error de permisos Firestore**
   - Aplica las reglas de seguridad correctas
   - Verifica que el usuario tenga el rol de administrador

3. **Imágenes no se cargan**
   - Verifica la configuración de Storage
   - Asegúrate de que las reglas de Storage permitan lectura pública

4. **Error de build en Vercel**
   - Verifica que todas las variables de entorno estén configuradas
   - Revisa los logs de build en Vercel Dashboard

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@senalmaq.com
- WhatsApp: +34 123 456 789

## 📄 Licencia

Este proyecto es propiedad de Senalmaq. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Senalmaq**
