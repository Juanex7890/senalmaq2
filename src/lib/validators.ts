import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  heroImagePath: z.string().optional(),
  position: z.number().int().min(0),
  active: z.boolean(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  compareAtPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  imagePaths: z.array(z.string()).min(1, 'Al menos una imagen es requerida'),
  specs: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
  })),
  active: z.boolean(),
  isBestseller: z.boolean(),
  isFeatured: z.boolean(),
})

export const siteMediaSchema = z.object({
  heroHeadline: z.string().min(1, 'El título principal es requerido'),
  heroSub: z.string().min(1, 'El subtítulo es requerido'),
  youtubeMainId: z.string().min(1, 'El ID del video principal es requerido'),
  youtubeShortIds: z.array(z.string()),
  instagramUrl: z.string().url('URL de Instagram inválida'),
  youtubeUrl: z.string().url('URL de YouTube inválida'),
  tiktokUrl: z.string().url('URL de TikTok invalida'),
  whatsappUrl: z.string().url('URL de WhatsApp inválida'),
})

export const searchSchema = z.object({
  q: z.string().min(1, 'La búsqueda es requerida'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export const filtersSchema = z.object({
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  sortBy: z.enum(['relevance', 'price-asc', 'price-desc', 'newest']).default('relevance'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})
