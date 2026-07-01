import { z } from 'zod';

const geometrySchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
}).optional();

export const HeaderSchema = z.object({
  title: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

export const HeroSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  geometry: geometrySchema,
}).passthrough();

export const TextSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  geometry: geometrySchema,
}).passthrough();

export const FeatureListSchema = z.object({
  title: z.string().optional(),
  features: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

export const ImageGallerySchema = z.object({
  title: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string().url().or(z.literal('')),
      alt: z.string().optional(),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

export const TestimonialSchema = z.object({
  title: z.string().optional(),
  testimonials: z.array(
    z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      avatar: z.string().url().optional().or(z.literal('')),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

export const StatsSchema = z.object({
  title: z.string().optional(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

export const CTASchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  geometry: geometrySchema,
}).passthrough();

export const FooterSchema = z.object({
  text: z.string().optional(),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ).optional(),
  geometry: geometrySchema,
}).passthrough();

// Map of all schemas
export const WidgetSchemas: Record<string, z.ZodTypeAny> = {
  HEADER: HeaderSchema,
  HERO: HeroSchema,
  TEXT: TextSchema,
  TEXTCONTENT: TextSchema,
  FEATURELIST: FeatureListSchema,
  IMAGEGALLERY: ImageGallerySchema,
  TESTIMONIAL: TestimonialSchema,
  STATS: StatsSchema,
  CTA: CTASchema,
  FOOTER: FooterSchema,
};

export const validateWidgetConfig = (type: string, config: unknown) => {
  const schema = WidgetSchemas[type.toUpperCase()];
  if (!schema) {
    // If we don't have a strict schema for this type yet, we at least enforce it's an object
    // and let passthrough handle the rest.
    return z.object({ geometry: geometrySchema }).passthrough().parse(config);
  }
  return schema.parse(config);
};
