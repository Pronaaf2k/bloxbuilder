import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  FileStack,
  FilePlus2,
  GripVertical,
  LayoutTemplate,
  PanelLeft,
  PanelRight,
  Plus,
  Rocket,
  Save,
  SquareDashedMousePointer,
  Trash2,
  Type,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useParams } from 'react-router-dom';
import { z } from 'zod';
import { buttonVariants } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Textarea } from '@/components/ui-kit/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-kit/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-kit/tabs';
import { useGetPreSignedUrlForUpload } from '@/lib/api/hooks/use-storage';
import { ModuleName } from '@/constant/modules.constants';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui-kit/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui-kit/form';
import { useAuthStore } from '@/state/store/auth';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';
import {
  useAddSitePage,
  useAddSitePageLayout,
  useGetSitePageLayouts,
  useGetSitePages,
  useGetSites,
  useUpdateSite,
  useUpdateSitePage,
  useUpdateSitePageLayout,
} from '@/modules/vibe-builder';
import {
  buildItemIdFilter,
  buildSitePagesFilter,
  buildSitesOwnershipFilter,
} from '@/modules/vibe-builder/services/vibe-builder.service';
import type {
  VibeBuilderBlogArticleBlockProps,
  VibeBuilderBlockStyle,
  VibeBuilderButtonBlockProps,
  VibeBuilderCardBlockProps,
  VibeBuilderCarouselBlockProps,
  VibeBuilderCodeEmbedBlockProps,
  VibeBuilderColumnsBlockProps,
  VibeBuilderCtaSectionBlockProps,
  VibeBuilderDividerBlockProps,
  VibeBuilderFaqBlockProps,
  VibeBuilderFooterBlockProps,
  VibeBuilderFormBlockProps,
  VibeBuilderGalleryBlockProps,
  VibeBuilderHeadingBlockProps,
  VibeBuilderHeroBlockProps,
  VibeBuilderIconBlockProps,
  VibeBuilderImageBlockProps,
  VibeBuilderLayoutBlock,
  VibeBuilderMapBlockProps,
  VibeBuilderNavbarBlockProps,
  VibeBuilderPageLayoutDocument,
  VibeBuilderPricingTableBlockProps,
  VibeBuilderProductBlockProps,
  VibeBuilderSectionBlockProps,
  VibeBuilderServicesBlockProps,
  VibeBuilderSocialLinksBlockProps,
  VibeBuilderSpacerBlockProps,
  VibeBuilderStatsBlockProps,
  VibeBuilderTableBlockProps,
  VibeBuilderTabsBlockProps,
  VibeBuilderTeamBlockProps,
  VibeBuilderTestimonialsBlockProps,
  VibeBuilderSitePage,
  VibeBuilderTextBlockProps,
  VibeBuilderTimelineBlockProps,
  VibeBuilderVideoBlockProps,
} from '@/modules/vibe-builder';
import {
  buildThemeConfigPayload,
  parseRawThemeConfig,
  parseThemeConfig,
  vibeBuilderTypographyOptions,
  vibeBuilderTypographyScales,
  vibeBuilderThemePresets,
} from '@/modules/vibe-builder/theme-presets';
import {
  createDefaultBlock,
  getBlockTitle,
  vibeBuilderBlockCategories,
  vibeBuilderBlockDefinitions,
} from '@/modules/vibe-builder/block-definitions';
import {
  ACNESTUDIO_STARTER_TAG,
  ACNESTUDIO_THEME_PRESET_ID,
  buildAcneStudioStarterPages,
} from '@/modules/vibe-builder/site-starter-templates';

const EDITOR_SCHEMA_VERSION = 1;
const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';

const createPageSchema = z.object({
  name: z.string().trim().min(2, 'Page name must be at least 2 characters long'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters long')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  seoTitle: z.string().trim().max(120, 'SEO title must be 120 characters or less').optional(),
  seoDescription: z
    .string()
    .trim()
    .max(240, 'SEO description must be 240 characters or less')
    .optional(),
});

type CreatePageFormValues = z.infer<typeof createPageSchema>;

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { errors?: Array<{ message?: string }> };
      return parsed.errors?.[0]?.message || error.message;
    } catch {
      return error.message;
    }
  }

  return 'Unable to save the editor state right now.';
};

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createEmptyLayoutDocument = (page?: VibeBuilderSitePage): VibeBuilderPageLayoutDocument => ({
  schemaVersion: EDITOR_SCHEMA_VERSION,
  page: {
    id: page?.ItemId ?? 'unknown-page',
    title: page?.Name ?? 'Untitled page',
    slug: page?.Slug ?? 'untitled-page',
  },
  blocks: [],
});

const createThemeTemplateDocument = (
  page: VibeBuilderSitePage | undefined,
  presetId: string
): VibeBuilderPageLayoutDocument => {
  const pageTitle = page?.Name ?? 'Welcome';
  const pageSlug = page?.Slug ?? 'home';

  const templateContent = {
    simple: {
      headline: `Launch ${pageTitle} with clarity`,
      subheading: 'Introduce the site in one sentence, highlight the main offer, and point visitors toward the next step.',
      textTitle: 'What makes this page useful',
      textBody: 'Use this section to explain your offer, your process, or the main benefit visitors should understand before they scroll further.',
      buttonLabel: 'Start here',
      imageCaption: 'Swap this image with your own hero visual, product shot, or studio photo.',
    },
    aristotle: {
      headline: `${pageTitle}, refined for a timeless first impression`,
      subheading: 'Pair elegant typography with a calm introduction that explains your craft, service, or philosophy.',
      textTitle: 'A thoughtful introduction',
      textBody: 'This area works well for a founder note, editorial summary, or a more premium explanation of what guests should expect from your brand.',
      buttonLabel: 'Read more',
      imageCaption: 'Replace this with a brand image, portrait, or editorial-style photograph.',
    },
    diplomat: {
      headline: `${pageTitle} with a polished company profile`,
      subheading: 'Use a strong headline, a short company summary, and a clear call to action for clients or partners.',
      textTitle: 'Built for trust',
      textBody: 'Summarize the value your organization provides, the industries you serve, and the reason visitors should continue into the rest of the site.',
      buttonLabel: 'Book a call',
      imageCaption: 'Ideal for office, team, or presentation imagery.',
    },
    vision: {
      headline: `${pageTitle} with a bright modern layout`,
      subheading: 'Set up a fast, optimistic landing page with direct messaging and a clear path into your main content.',
      textTitle: 'Designed to convert',
      textBody: 'Keep the copy short and helpful. Use it for an app intro, product summary, or feature overview that quickly gets visitors oriented.',
      buttonLabel: 'See the details',
      imageCaption: 'Use a modern product, workspace, or lifestyle image here.',
    },
    level: {
      headline: `${pageTitle} with a bold dark-mode presence`,
      subheading: 'Perfect for creative studios, portfolios, or brands that want stronger contrast and a more dramatic presentation.',
      textTitle: 'Stand out immediately',
      textBody: 'Use this supporting section to explain your positioning, showcase a key result, or point visitors to the strongest part of your story.',
      buttonLabel: 'View the work',
      imageCaption: 'Swap in a high-contrast image, campaign visual, or portfolio preview.',
    },
    impression: {
      headline: `${pageTitle} with a clean promotional layout`,
      subheading: 'Lead with a bold statement and keep the rest of the page airy, visual, and easy to scan.',
      textTitle: 'Keep the message simple',
      textBody: 'Use this space for one concise supporting paragraph that reinforces the main idea and helps the page feel complete without becoming dense.',
      buttonLabel: 'Get in touch',
      imageCaption: 'A clean photo or campaign visual works best here.',
    },
  }[presetId] || {
    headline: `Launch ${pageTitle} with clarity`,
    subheading: 'Introduce the site in one sentence, highlight the main offer, and point visitors toward the next step.',
    textTitle: 'What makes this page useful',
    textBody: 'Use this section to explain your offer, your process, or the main benefit visitors should understand before they scroll further.',
    buttonLabel: 'Start here',
    imageCaption: 'Swap this image with your own hero visual, product shot, or studio photo.',
  };

  return {
    schemaVersion: EDITOR_SCHEMA_VERSION,
    page: {
      id: page?.ItemId ?? 'unknown-page',
      title: pageTitle,
      slug: pageSlug,
    },
    blocks: [
      {
        id: createBlockId(),
        type: 'hero',
        props: {
          headline: templateContent.headline,
          subheading: templateContent.subheading,
          ctaLabel: templateContent.buttonLabel,
          ctaHref: '/contact',
        },
        style: {
          backgroundColor: vibeBuilderThemePresets.find((preset) => preset.id === presetId)?.heroBackground || '#111827',
          textAlign: 'center',
        },
      },
      {
        id: createBlockId(),
        type: 'text',
        props: {
          title: templateContent.textTitle,
          body: templateContent.textBody,
        },
        style: {
          backgroundColor: '#ffffff',
          textAlign: 'center',
        },
      },
      {
        id: createBlockId(),
        type: 'image',
        props: {
          imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
          altText: `${pageTitle} feature image`,
          caption: templateContent.imageCaption,
        },
        style: {
          textAlign: 'center',
        },
      },
      {
        id: createBlockId(),
        type: 'button',
        props: {
          label: templateContent.buttonLabel,
          href: '/contact',
        },
        style: {
          textAlign: 'center',
        },
      },
      {
        id: createBlockId(),
        type: 'social-links',
        props: {
          heading: 'Stay connected',
          links: [
            { label: 'Instagram', href: 'https://instagram.com' },
            { label: 'LinkedIn', href: 'https://linkedin.com' },
            { label: 'YouTube', href: 'https://youtube.com' },
          ],
        },
        style: {
          backgroundColor: '#ffffff',
          textAlign: 'center',
        },
      },
    ],
  };
};

const parseLayoutDocument = (
  layoutJson: string | undefined,
  page?: VibeBuilderSitePage
): VibeBuilderPageLayoutDocument => {
  if (!layoutJson) {
    return createEmptyLayoutDocument(page);
  }

  try {
    const parsed = JSON.parse(layoutJson) as VibeBuilderPageLayoutDocument;
    return {
      ...parsed,
      schemaVersion: parsed.schemaVersion ?? EDITOR_SCHEMA_VERSION,
      page: {
        id: page?.ItemId ?? parsed.page?.id ?? 'unknown-page',
        title: page?.Name ?? parsed.page?.title ?? 'Untitled page',
        slug: page?.Slug ?? parsed.page?.slug ?? 'untitled-page',
      },
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
    };
  } catch {
    return createEmptyLayoutDocument(page);
  }
};

const getDraftStorageKey = (siteId?: string, pageId?: string) =>
  siteId && pageId ? `vibebuilder-draft:${siteId}:${pageId}` : null;

const getContentAlignmentClassName = (textAlign?: VibeBuilderBlockStyle['textAlign']) => {
  if (textAlign === 'center') return 'mx-auto';
  if (textAlign === 'right') return 'ml-auto';
  return '';
};

const scaleFontSize = (baseSize: number, scale = 1) => `${Math.round(baseSize * scale)}px`;

const SortableBlockCard = ({
  block,
  theme,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: VibeBuilderLayoutBlock;
  theme: ReturnType<typeof parseThemeConfig>;
  isSelected: boolean;
  onSelect: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-background ${isSelected ? 'border-primary ring-1 ring-primary/30' : ''}`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button className="text-left" onClick={() => onSelect(block.id)}>
          <div className="text-sm font-medium text-foreground">{getBlockTitle(block)}</div>
          <div className="text-xs text-muted-foreground">Type: {block.type}</div>
        </button>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md p-2 text-muted-foreground hover:bg-muted"
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <button className="w-full px-4 py-4 text-left" onClick={() => onSelect(block.id)}>
        {block.type === 'hero' ? (
          <div
            className="rounded-xl px-5 py-10 text-white"
            style={{
              backgroundColor: block.style?.backgroundColor || '#111827',
              textAlign: block.style?.textAlign || 'left',
            }}
          >
            <div
                className={`max-w-2xl ${getContentAlignmentClassName(block.style?.textAlign)}`}
              >
              <div
                className="text-2xl font-semibold"
                style={{
                  fontFamily: theme.headingFont,
                  fontSize: scaleFontSize(24, theme.headingScale),
                }}
              >
                {(block.props as VibeBuilderHeroBlockProps).headline}
              </div>
              <div
                className="mt-3 text-sm text-white/80"
                style={{
                  fontFamily: theme.bodyFont,
                  fontSize: scaleFontSize(14, theme.bodyScale),
                }}
              >
                {(block.props as VibeBuilderHeroBlockProps).subheading}
              </div>
            </div>
          </div>
        ) : null}

        {block.type === 'text' ? (
          <div
            className="rounded-xl px-5 py-8"
            style={{
              backgroundColor: block.style?.backgroundColor || '#ffffff',
              textAlign: block.style?.textAlign || 'left',
            }}
          >
            <div
              className="text-xl font-semibold text-foreground"
              style={{
                fontFamily: theme.headingFont,
                fontSize: scaleFontSize(20, theme.headingScale),
              }}
            >
              {(block.props as VibeBuilderTextBlockProps).title}
            </div>
            <div
              className="mt-3 text-sm text-muted-foreground"
              style={{
                fontFamily: theme.bodyFont,
                fontSize: scaleFontSize(14, theme.bodyScale),
              }}
            >
              {(block.props as VibeBuilderTextBlockProps).body}
            </div>
          </div>
        ) : null}

        {block.type === 'image' ? (
          <div
            className="rounded-xl px-5 py-5"
            style={{
              backgroundColor: block.style?.backgroundColor || '#ffffff',
              textAlign: block.style?.textAlign || 'center',
            }}
          >
            <img
              src={(block.props as VibeBuilderImageBlockProps).imageUrl}
              alt={(block.props as VibeBuilderImageBlockProps).altText}
              className="h-56 w-full rounded-xl object-cover"
            />
            <div
              className="mt-3 text-sm text-muted-foreground"
              style={{
                fontFamily: theme.bodyFont,
                fontSize: scaleFontSize(14, theme.bodyScale),
              }}
            >
              {(block.props as VibeBuilderImageBlockProps).caption}
            </div>
          </div>
        ) : null}

        {block.type === 'button' ? (
          <div
            className="rounded-xl px-5 py-8"
            style={{
              backgroundColor: block.style?.backgroundColor || '#ffffff',
              textAlign: block.style?.textAlign || 'left',
            }}
          >
            <a
              href={(block.props as VibeBuilderButtonBlockProps).href}
              className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white"
              style={{
                fontFamily: theme.bodyFont,
                fontSize: scaleFontSize(14, theme.bodyScale),
              }}
            >
              {(block.props as VibeBuilderButtonBlockProps).label}
            </a>
          </div>
        ) : null}

        {block.type === 'divider' ? (
          <div className="rounded-xl px-5 py-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span
                className="text-xs uppercase tracking-wide"
                style={{
                  fontFamily: theme.bodyFont,
                  fontSize: scaleFontSize(12, theme.bodyScale),
                }}
              >
                {(block.props as VibeBuilderDividerBlockProps).label}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
        ) : null}

        {block.type === 'spacer' ? (
          <div className="rounded-xl border border-dashed bg-muted/20" style={{ height: `${(block.props as VibeBuilderSpacerBlockProps).height}px` }} />
        ) : null}

        {block.type === 'social-links' ? (
          <div
            className="rounded-xl px-5 py-8"
            style={{
              backgroundColor: block.style?.backgroundColor || '#ffffff',
              textAlign: block.style?.textAlign || 'left',
            }}
          >
            <div
              className="text-lg font-semibold text-foreground"
              style={{
                fontFamily: theme.headingFont,
                fontSize: scaleFontSize(18, theme.headingScale),
              }}
            >
              {(block.props as VibeBuilderSocialLinksBlockProps).heading}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(block.props as VibeBuilderSocialLinksBlockProps).links.map((link) => (
                <a
                  key={`${block.id}-${link.label}`}
                  href={link.href}
                  className="inline-flex rounded-full border px-3 py-2 text-sm text-foreground"
                  style={{
                    fontFamily: theme.bodyFont,
                    fontSize: scaleFontSize(14, theme.bodyScale),
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'heading' ? (
          <div className="rounded-xl px-5 py-8" style={{ textAlign: block.style?.textAlign || 'left' }}>
            <div className="text-2xl font-semibold" style={{ fontFamily: theme.headingFont }}>
              {(block.props as VibeBuilderHeadingBlockProps).text}
            </div>
            <div className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>
              {(block.props as VibeBuilderHeadingBlockProps).subtext}
            </div>
          </div>
        ) : null}

        {block.type === 'icon' ? (
          <div className="rounded-xl border bg-muted/10 px-5 py-6 text-center">
            <div className="text-3xl">{(block.props as VibeBuilderIconBlockProps).icon}</div>
            <div className="mt-3 text-lg font-semibold">{(block.props as VibeBuilderIconBlockProps).title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{(block.props as VibeBuilderIconBlockProps).body}</div>
          </div>
        ) : null}

        {block.type === 'section' ? (
          <div className="rounded-2xl border bg-muted/10 px-5 py-8">
            <div className="text-xl font-semibold">{(block.props as VibeBuilderSectionBlockProps).title}</div>
            <div className="mt-3 text-sm text-muted-foreground">{(block.props as VibeBuilderSectionBlockProps).body}</div>
          </div>
        ) : null}

        {block.type === 'columns' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderColumnsBlockProps).heading}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderColumnsBlockProps).columns.map((column, index) => (
                <div key={`${block.id}-column-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">{column.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{column.body}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'card' ? (
          <div className="rounded-2xl border bg-background px-5 py-6 shadow-sm">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderCardBlockProps).title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{(block.props as VibeBuilderCardBlockProps).body}</div>
            <div className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              {(block.props as VibeBuilderCardBlockProps).ctaLabel}
            </div>
          </div>
        ) : null}

        {block.type === 'gallery' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderGalleryBlockProps).heading}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderGalleryBlockProps).images.slice(0, 6).map((image, index) => (
                <div key={`${block.id}-gallery-${index}`} className="overflow-hidden rounded-xl border bg-background">
                  <img src={image.imageUrl} alt={image.altText} className="h-24 w-full object-cover" />
                  <div className="p-2 text-xs text-muted-foreground">{image.caption}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'video' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderVideoBlockProps).title}</div>
            <div className="mt-4 rounded-2xl border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Embedded video preview
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{(block.props as VibeBuilderVideoBlockProps).caption}</div>
          </div>
        ) : null}

        {block.type === 'map' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderMapBlockProps).title}</div>
            <div className="mt-4 rounded-2xl border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Map embed preview
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{(block.props as VibeBuilderMapBlockProps).address}</div>
          </div>
        ) : null}

        {block.type === 'form' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderFormBlockProps).title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{(block.props as VibeBuilderFormBlockProps).description}</div>
            <div className="mt-4 space-y-3">
              {(block.props as VibeBuilderFormBlockProps).fields.map((field, index) => (
                <div key={`${block.id}-form-${index}`} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                  {field.label}
                </div>
              ))}
              <div className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                {(block.props as VibeBuilderFormBlockProps).buttonLabel}
              </div>
            </div>
          </div>
        ) : null}

        {block.type === 'pricing-table' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderPricingTableBlockProps).heading}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderPricingTableBlockProps).plans.map((plan, index) => (
                <div key={`${block.id}-plan-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">{plan.name}</div>
                  <div className="mt-2 text-xl font-bold">{plan.price}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{plan.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'testimonials' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderTestimonialsBlockProps).heading}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderTestimonialsBlockProps).testimonials.map((item, index) => (
                <div key={`${block.id}-testimonial-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-sm italic text-muted-foreground">&ldquo;{item.quote}&rdquo;</div>
                  <div className="mt-3 text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.role}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'faq' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderFaqBlockProps).heading}</div>
            <div className="mt-4 space-y-3">
              {(block.props as VibeBuilderFaqBlockProps).items.map((item, index) => (
                <div key={`${block.id}-faq-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">{item.question}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'team' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderTeamBlockProps).heading}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderTeamBlockProps).members.map((member, index) => (
                <div key={`${block.id}-member-${index}`} className="rounded-xl border bg-background p-4">
                  <img src={member.imageUrl} alt={member.name} className="h-28 w-full rounded-lg object-cover" />
                  <div className="mt-3 text-sm font-semibold">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'services' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderServicesBlockProps).heading}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(block.props as VibeBuilderServicesBlockProps).services.map((service, index) => (
                <div key={`${block.id}-service-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">{service.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{service.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'stats' ? (
          <div className="rounded-2xl px-5 py-8 text-center">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderStatsBlockProps).heading}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {(block.props as VibeBuilderStatsBlockProps).stats.map((item, index) => (
                <div key={`${block.id}-stat-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-xl font-bold">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'cta-section' ? (
          <div className="rounded-2xl bg-slate-900 px-5 py-10 text-center text-white">
            <div className="text-2xl font-semibold">{(block.props as VibeBuilderCtaSectionBlockProps).heading}</div>
            <div className="mt-3 text-sm text-white/80">{(block.props as VibeBuilderCtaSectionBlockProps).body}</div>
            <div className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">
              {(block.props as VibeBuilderCtaSectionBlockProps).buttonLabel}
            </div>
          </div>
        ) : null}

        {block.type === 'product' ? (
          <div className="rounded-2xl border bg-background px-5 py-6">
            <img src={(block.props as VibeBuilderProductBlockProps).imageUrl} alt={(block.props as VibeBuilderProductBlockProps).title} className="h-40 w-full rounded-xl object-cover" />
            <div className="mt-4 text-lg font-semibold">{(block.props as VibeBuilderProductBlockProps).title}</div>
            <div className="mt-1 text-primary">{(block.props as VibeBuilderProductBlockProps).price}</div>
            <div className="mt-2 text-sm text-muted-foreground">{(block.props as VibeBuilderProductBlockProps).description}</div>
          </div>
        ) : null}

        {block.type === 'navbar' ? (
          <div className="rounded-2xl border bg-background px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold">{(block.props as VibeBuilderNavbarBlockProps).logoText}</div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {(block.props as VibeBuilderNavbarBlockProps).links.map((link) => (
                  <span key={`${block.id}-nav-${link.label}`} className="rounded-full border px-3 py-1">{link.label}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {block.type === 'footer' ? (
          <div className="rounded-2xl bg-slate-950 px-5 py-8 text-white">
            <div className="text-sm font-semibold">{(block.props as VibeBuilderFooterBlockProps).logoText}</div>
            <div className="mt-2 text-xs text-white/70">{(block.props as VibeBuilderFooterBlockProps).blurb}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
              {(block.props as VibeBuilderFooterBlockProps).links.map((link) => (
                <span key={`${block.id}-footer-${link.label}`} className="rounded-full border border-white/20 px-3 py-1">{link.label}</span>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'tabs' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <div className="flex flex-wrap gap-2">
              {(block.props as VibeBuilderTabsBlockProps).tabs.map((tab, index) => (
                <span key={`${block.id}-tab-${index}`} className={`rounded-full border px-3 py-1 text-xs ${index === 0 ? 'border-primary bg-primary/10 text-primary' : ''}`}>
                  {tab.label}
                </span>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{(block.props as VibeBuilderTabsBlockProps).tabs[0]?.content}</div>
          </div>
        ) : null}

        {block.type === 'carousel' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <img src={(block.props as VibeBuilderCarouselBlockProps).slides[0]?.imageUrl} alt={(block.props as VibeBuilderCarouselBlockProps).slides[0]?.title} className="h-40 w-full rounded-xl object-cover" />
            <div className="mt-4 text-lg font-semibold">{(block.props as VibeBuilderCarouselBlockProps).slides[0]?.title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{(block.props as VibeBuilderCarouselBlockProps).slides[0]?.description}</div>
          </div>
        ) : null}

        {block.type === 'timeline' ? (
          <div className="rounded-2xl px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderTimelineBlockProps).heading}</div>
            <div className="mt-4 space-y-3">
              {(block.props as VibeBuilderTimelineBlockProps).events.map((event, index) => (
                <div key={`${block.id}-event-${index}`} className="rounded-xl border bg-background p-4">
                  <div className="text-xs font-semibold uppercase text-primary">{event.year}</div>
                  <div className="mt-1 text-sm font-semibold">{event.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.type === 'table' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <div className="text-sm font-semibold">{(block.props as VibeBuilderTableBlockProps).caption}</div>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${(block.props as VibeBuilderTableBlockProps).columns.length}, minmax(0, 1fr))` }}>
                {(block.props as VibeBuilderTableBlockProps).columns.map((column, index) => (
                  <div key={`${block.id}-column-head-${index}`} className="border-b bg-muted/20 px-3 py-2 text-xs font-semibold">{column}</div>
                ))}
                {(block.props as VibeBuilderTableBlockProps).rows.flat().map((cell, index) => (
                  <div key={`${block.id}-cell-${index}`} className="border-b px-3 py-2 text-xs text-muted-foreground">{cell}</div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {block.type === 'code-embed' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <div className="text-lg font-semibold">{(block.props as VibeBuilderCodeEmbedBlockProps).title}</div>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-white/80">{(block.props as VibeBuilderCodeEmbedBlockProps).codeSnippet}</pre>
          </div>
        ) : null}

        {block.type === 'blog-article' ? (
          <div className="rounded-2xl border bg-background px-5 py-8">
            <div className="text-xs uppercase text-muted-foreground">{(block.props as VibeBuilderBlogArticleBlockProps).date}</div>
            <div className="mt-2 text-xl font-semibold">{(block.props as VibeBuilderBlogArticleBlockProps).title}</div>
            <div className="mt-2 text-xs text-muted-foreground">By {(block.props as VibeBuilderBlogArticleBlockProps).author}</div>
            <div className="mt-3 text-sm text-muted-foreground">{(block.props as VibeBuilderBlogArticleBlockProps).excerpt}</div>
          </div>
        ) : null}
      </button>

      <div className="flex justify-end border-t px-4 py-3">
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete section
        </button>
      </div>
    </div>
  );
};

export const VibeBuilderEditorPage = () => {
  const { siteId, pageId } = useParams();
  const { pathname } = useLocation();
  const { user, selectedOrgId, accessToken } = useAuthStore();
  const currentUserId = user?.itemId || decodeJWT(accessToken || '')?.user_id || null;
  const navigate = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [layoutDocument, setLayoutDocument] = useState<VibeBuilderPageLayoutDocument | null>(null);
  const [layoutRecordId, setLayoutRecordId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreatePageDialogOpen, setIsCreatePageDialogOpen] = useState(false);
  const [createPageError, setCreatePageError] = useState<string | null>(null);
  const [siteGenerationMessage, setSiteGenerationMessage] = useState<string | null>(null);
  const [isGeneratingStarterSite, setIsGeneratingStarterSite] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const layoutRecordIdRef = useRef<string | null>(null);
  const layoutVersionRef = useRef(1);
  const queryClient = useQueryClient();
  const addSitePageMutation = useAddSitePage();
  const addLayoutMutation = useAddSitePageLayout();
  const updateLayoutMutation = useUpdateSitePageLayout();
  const updateSiteMutation = useUpdateSite();
  const updateSitePageMutation = useUpdateSitePage();
  const { mutateAsync: getPreSignedUrlAsync } = useGetPreSignedUrlForUpload();

  const createPageForm = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      name: '',
      slug: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  const pageNameValue = createPageForm.watch('name');
  const isSlugDirty = Boolean(createPageForm.formState.dirtyFields.slug);

  useEffect(() => {
    if (!pageNameValue || isSlugDirty) {
      return;
    }

    createPageForm.setValue('slug', toSlug(pageNameValue), { shouldValidate: true });
  }, [createPageForm, isSlugDirty, pageNameValue]);

  const siteFilter = useMemo(() => {
    if (!siteId || !currentUserId) {
      return { _id: '__vibebuilder_missing_site__' };
    }

    return buildSitesOwnershipFilter({
      ownerUserId: currentUserId,
      organizationId: selectedOrgId,
      additionalFilters: { _id: siteId },
    });
  }, [currentUserId, selectedOrgId, siteId]);

  const pageFilter = useMemo(() => {
    if (!siteId || !pageId) {
      return { _id: '__vibebuilder_missing_page__' };
    }

    return buildSitePagesFilter({
      siteId,
      organizationId: selectedOrgId,
      additionalFilters: { _id: pageId },
    });
  }, [pageId, selectedOrgId, siteId]);

  const sitePagesFilter = useMemo(() => {
    if (!siteId) {
      return { _id: '__vibebuilder_missing_site__' };
    }

    return buildSitePagesFilter({
      siteId,
      organizationId: selectedOrgId,
    });
  }, [selectedOrgId, siteId]);

  const layoutFilter = useMemo(() => {
    if (!siteId || !pageId) {
      return { _id: '__vibebuilder_missing_layout__' };
    }

    return {
      SiteId: siteId,
      PageId: pageId,
      Status: 'draft',
    };
  }, [pageId, siteId]);

  const siteQuery = useGetSites({ pageNo: 1, pageSize: 1, filter: siteFilter });
  const pageQuery = useGetSitePages({ pageNo: 1, pageSize: 1, filter: pageFilter });
  const sitePagesQuery = useGetSitePages({
    pageNo: 1,
    pageSize: 50,
    filter: sitePagesFilter,
    sort: { Order: 1, CreatedDate: 1 },
  });
  const layoutQuery = useGetSitePageLayouts({
    pageNo: 1,
    pageSize: 5,
    filter: layoutFilter,
    sort: { LastUpdatedDate: -1, CreatedDate: -1 },
  });

  const publishedLayoutQuery = useGetSitePageLayouts({
    pageNo: 1,
    pageSize: 5,
    filter:
      siteId && pageId
        ? {
            SiteId: siteId,
            PageId: pageId,
            Status: 'published',
          }
        : { _id: '__vibebuilder_missing_layout__' },
    sort: { LastUpdatedDate: -1, CreatedDate: -1 },
  });

  const allLayoutsQuery = useGetSitePageLayouts({
    pageNo: 1,
    pageSize: 200,
    filter: siteId ? { SiteId: siteId } : { _id: '__vibebuilder_missing_layouts__' },
    sort: { CreatedDate: 1 },
  });

  const site = siteQuery.data?.items?.[0];
  const page = pageQuery.data?.items?.[0];
  const sitePages = sitePagesQuery.data?.items ?? [];
  const activeThemeConfig = parseRawThemeConfig(site?.ThemeConfig ?? null);
  const activeTheme = parseThemeConfig(site?.ThemeConfig ?? null);
  const activeTypographyPresetId =
    vibeBuilderTypographyOptions.find(
      (option) =>
        option.headingValue === (activeThemeConfig.fontHeading || '') &&
        option.bodyValue === (activeThemeConfig.fontBody || '')
    )?.id || 'preset';
  const activeTypographyScaleId =
    vibeBuilderTypographyScales.find(
      (scale) =>
        scale.headingScale === (activeThemeConfig.headingScale ?? 1) &&
        scale.bodyScale === (activeThemeConfig.bodyScale ?? 1)
    )?.id || 'comfortable';
  const activeAppearanceMode = activeThemeConfig.appearanceMode === 'dark' ? 'dark' : 'light';
  const latestLayout = layoutQuery.data?.items?.[0];
  const draftStorageKey = getDraftStorageKey(siteId, pageId);
  const blockIds = layoutDocument?.blocks.map((block) => block.id) ?? [];
  const selectedBlock = layoutDocument?.blocks.find((block) => block.id === selectedBlockId) ?? null;

  useEffect(() => {
    setHasHydrated(false);
    setLayoutDocument(null);
    setSelectedBlockId(null);
    setLayoutRecordId(null);
    setSaveState('idle');
    setSaveError(null);
    setPublishError(null);
    layoutRecordIdRef.current = null;
    layoutVersionRef.current = 1;
  }, [pageId, siteId]);

  useEffect(() => {
    if (!page || layoutQuery.isLoading || hasHydrated) {
      return;
    }

    const localDraft = draftStorageKey ? window.localStorage.getItem(draftStorageKey) : null;
    const layoutSource = latestLayout?.LayoutJson || localDraft || undefined;
    const parsedLayout = parseLayoutDocument(layoutSource, page);
    setLayoutDocument(parsedLayout);
    setSelectedBlockId(parsedLayout.blocks[0]?.id ?? null);
    setLayoutRecordId(latestLayout?.ItemId ?? null);
    layoutRecordIdRef.current = latestLayout?.ItemId ?? null;
    layoutVersionRef.current = latestLayout?.Version ?? page.DraftLayoutVersion ?? 1;
    setHasHydrated(true);
  }, [
    hasHydrated,
    latestLayout?.ItemId,
    latestLayout?.LayoutJson,
    latestLayout?.Version,
    draftStorageKey,
    layoutQuery.isLoading,
    page,
  ]);

  useEffect(() => {
    if (!hasHydrated || !layoutDocument || !draftStorageKey) {
      return;
    }

    window.localStorage.setItem(draftStorageKey, JSON.stringify(layoutDocument));
  }, [draftStorageKey, hasHydrated, layoutDocument]);

  useEffect(() => {
    if (!hasHydrated || !layoutDocument || !siteId || !pageId || !page) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSaveState('saving');
      setSaveError(null);
      const nextVersion = layoutRecordIdRef.current ? layoutVersionRef.current : 1;
      const serializedLayout = JSON.stringify(layoutDocument);

      try {
        if (!layoutRecordIdRef.current) {
          const response = await addLayoutMutation.mutateAsync({
            input: {
              SiteId: siteId,
              PageId: pageId,
              Version: nextVersion,
              Status: 'draft',
              LayoutJson: serializedLayout,
              SchemaVersion: EDITOR_SCHEMA_VERSION,
              OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
              Tags: ['vibebuilder-layout'],
            },
          });

          setLayoutRecordId(response.insertSitePageLayout.itemId);
          layoutRecordIdRef.current = response.insertSitePageLayout.itemId;
        } else {
          await updateLayoutMutation.mutateAsync({
            filter: buildItemIdFilter(layoutRecordIdRef.current),
            input: {
              Version: nextVersion,
              Status: 'draft',
              LayoutJson: serializedLayout,
              SchemaVersion: EDITOR_SCHEMA_VERSION,
              OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
              Tags: ['vibebuilder-layout'],
            },
          });
        }

        layoutVersionRef.current = nextVersion + 1;
        setSaveState('saved');
        if (draftStorageKey) {
          window.localStorage.setItem(draftStorageKey, serializedLayout);
        }
      } catch (error) {
        setSaveState('error');
        setSaveError(getMutationErrorMessage(error));
      }
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    addLayoutMutation,
    hasHydrated,
    layoutDocument,
    layoutRecordId,
    page,
    pageId,
    draftStorageKey,
    selectedOrgId,
    siteId,
    updateLayoutMutation,
  ]);

  const handleAddBlock = (type: VibeBuilderLayoutBlock['type']) => {
    setLayoutDocument((current) => {
      const next = current ?? createEmptyLayoutDocument(page);
      const newBlock = createDefaultBlock(type);
      setSelectedBlockId(newBlock.id);
      return {
        ...next,
        blocks: [...next.blocks, newBlock],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!layoutDocument || !over || active.id === over.id) {
      return;
    }

    const oldIndex = layoutDocument.blocks.findIndex((block) => block.id === active.id);
    const newIndex = layoutDocument.blocks.findIndex((block) => block.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    setLayoutDocument({
      ...layoutDocument,
      blocks: arrayMove(layoutDocument.blocks, oldIndex, newIndex),
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setLayoutDocument((current) => {
      if (!current) {
        return current;
      }

      const nextBlocks = current.blocks.filter((block) => block.id !== blockId);
      if (selectedBlockId === blockId) {
        setSelectedBlockId(nextBlocks[0]?.id ?? null);
      }

      return {
        ...current,
        blocks: nextBlocks,
      };
    });
  };

  const updateSelectedBlock = (
    updater: (block: VibeBuilderLayoutBlock) => VibeBuilderLayoutBlock
  ) => {
    if (!selectedBlockId) {
      return;
    }

    setLayoutDocument((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === selectedBlockId ? updater(block) : block
        ),
      };
    });
  };

  const updateSelectedBlockArray = (key: string, updater: (items: any[]) => any[]) => {
    updateSelectedBlock((block) => ({
      ...block,
      props: {
        ...(block.props as Record<string, unknown>),
        [key]: updater((((block.props as Record<string, unknown>)[key] as any[]) || []).slice()),
      },
    }));
  };

  const addSelectedBlockArrayItem = (key: string, item: any) => {
    updateSelectedBlockArray(key, (items) => [...items, item]);
  };

  const removeSelectedBlockArrayItem = (key: string, index: number, minimum = 1) => {
    updateSelectedBlockArray(key, (items) =>
      items.length <= minimum ? items : items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const uploadFileToStorage = async (url: string, file: File) => {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'x-ms-blob-type': 'BlockBlob',
      },
    });

    if (!response.ok) {
      throw new Error('Image upload failed.');
    }

    return url.split('?')[0];
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedBlock || selectedBlock.type !== 'image') {
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const response = await getPreSignedUrlAsync({
        name: file.name,
        projectKey,
        itemId: '',
        metaData: '',
        accessModifier: 'Public',
        configurationName: 'Default',
        parentDirectoryId: '',
        tags: '',
        moduleName: ModuleName.DefaultConstruct,
      });

      if (!response.isSuccess || !response.uploadUrl) {
        throw new Error('Could not get an upload URL for this image.');
      }

      const uploadedUrl = await uploadFileToStorage(response.uploadUrl, file);
      updateSelectedBlock((block) => ({
        ...block,
        props: {
          ...(block.props as VibeBuilderImageBlockProps),
          imageUrl: uploadedUrl,
        },
      }));
    } catch (error) {
      setImageUploadError(getMutationErrorMessage(error));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!siteId || !pageId || !page || !layoutDocument) {
      return;
    }

    setPublishError(null);
    setIsPublishing(true);

    try {
      const existingPublishedLayout = publishedLayoutQuery.data?.items?.[0];
      const serializedLayout = JSON.stringify(layoutDocument);
      const publishVersion = layoutVersionRef.current;
      let publishedLayoutId = existingPublishedLayout?.ItemId || null;

      if (!publishedLayoutId) {
        const response = await addLayoutMutation.mutateAsync({
          input: {
            SiteId: siteId,
            PageId: pageId,
            Version: publishVersion,
            Status: 'published',
            LayoutJson: serializedLayout,
            SchemaVersion: EDITOR_SCHEMA_VERSION,
            OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
            Tags: ['vibebuilder-layout', 'published'],
          },
        });

        publishedLayoutId = response.insertSitePageLayout.itemId;
      } else {
        await updateLayoutMutation.mutateAsync({
          filter: buildItemIdFilter(publishedLayoutId),
          input: {
            Version: publishVersion,
            Status: 'published',
            LayoutJson: serializedLayout,
            SchemaVersion: EDITOR_SCHEMA_VERSION,
            OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
            Tags: ['vibebuilder-layout', 'published'],
          },
        });
      }

      await Promise.all([
        updateSitePageMutation.mutateAsync({
          filter: buildItemIdFilter(pageId),
          input: {
            PublishedLayoutVersion: publishVersion,
          },
        }),
        updateSiteMutation.mutateAsync({
          filter: buildItemIdFilter(siteId),
          input: {
            PublishedRevisionId: publishedLayoutId || undefined,
            Status: 'published',
          },
        }),
      ]);

      setIsPublishing(false);
    } catch (error) {
      setPublishError(getMutationErrorMessage(error));
      setIsPublishing(false);
    }
  };

  const handleCreatePage = async (values: CreatePageFormValues) => {
    if (!siteId) {
      return;
    }

    setCreatePageError(null);

    try {
      const response = await addSitePageMutation.mutateAsync({
        input: {
          SiteId: siteId,
          Name: values.name.trim(),
          Slug: values.slug.trim(),
          Order: sitePages.length,
          IsHomePage: sitePages.length === 0,
          SeoTitle: values.seoTitle?.trim() || undefined,
          SeoDescription: values.seoDescription?.trim() || undefined,
          DraftLayoutVersion: 1,
          PublishedLayoutVersion: 0,
          OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
          Tags: ['vibebuilder-page'],
        },
      });

      createPageForm.reset();
      setIsCreatePageDialogOpen(false);
      if (response.insertSitePage?.itemId) {
        window.location.assign(`/vibe-builder/${siteId}/editor/${response.insertSitePage.itemId}`);
      }
    } catch (error) {
      setCreatePageError(getMutationErrorMessage(error));
    }
  };

  const handleThemeConfigUpdate = async (nextConfig: Record<string, unknown>) => {
    if (!siteId) {
      return;
    }

    try {
      await updateSiteMutation.mutateAsync({
        filter: buildItemIdFilter(siteId),
        input: {
          ThemeConfig: buildThemeConfigPayload(nextConfig),
        },
      });
    } catch {
      // Shared mutation handler already surfaces this if needed.
    }
  };

  const handleThemeSelect = async (presetId: string) => {
    const nextTemplate = createThemeTemplateDocument(page, presetId);

    setLayoutDocument(nextTemplate);
    setSelectedBlockId(nextTemplate.blocks[0]?.id ?? null);

    await handleThemeConfigUpdate({
      ...activeThemeConfig,
      presetId,
      templateId: presetId,
    });
  };

  const handleTypographyPresetChange = async (presetId: string) => {
    const selectedTypography = vibeBuilderTypographyOptions.find((option) => option.id === presetId);

    if (!selectedTypography) {
      return;
    }

    await handleThemeConfigUpdate({
      ...activeThemeConfig,
      fontHeading: selectedTypography.headingValue || undefined,
      fontBody: selectedTypography.bodyValue || undefined,
    });
  };

  const handleTypographyScaleChange = async (scaleId: string) => {
    const selectedScale = vibeBuilderTypographyScales.find((scale) => scale.id === scaleId);

    if (!selectedScale) {
      return;
    }

    await handleThemeConfigUpdate({
      ...activeThemeConfig,
      headingScale: selectedScale.headingScale,
      bodyScale: selectedScale.bodyScale,
    });
  };

  const handleAppearanceModeChange = async (mode: 'light' | 'dark') => {
    await handleThemeConfigUpdate({
      ...activeThemeConfig,
      appearanceMode: mode,
    });
  };

  const handleApplyAcneStudioStarterSite = async () => {
    if (
      !siteId ||
      !site ||
      site.Slug !== 'acnestudio' ||
      sitePagesQuery.isLoading ||
      allLayoutsQuery.isLoading ||
      isGeneratingStarterSite
    ) {
      return;
    }

    try {
      setIsGeneratingStarterSite(true);
      setSiteGenerationMessage('Applying the AcneStudio starter site and syncing draft + published layouts...');

      const existingHomePage =
        sitePages.find((sitePage) => sitePage.IsHomePage) ||
        sitePages.find((sitePage) => /home/i.test(sitePage.Slug)) ||
        sitePages[0];

      const templates = buildAcneStudioStarterPages(existingHomePage);
      const layoutRecords = new Map(
        (allLayoutsQuery.data?.items || []).map((record) => [`${record.PageId}:${record.Status}`, record])
      );

      const pagesBySlug = new Map(sitePages.map((sitePage) => [sitePage.Slug, sitePage]));
      const nextPages = [...sitePages];
      let nextOrder = nextPages.length;
      let publishedHomeLayoutId: string | null = null;
      let currentPageDocument: VibeBuilderPageLayoutDocument | null = null;

      for (const template of templates) {
        let currentPage = pagesBySlug.get(template.slug);

        if (!currentPage) {
          const createPageResponse = await addSitePageMutation.mutateAsync({
            input: {
              SiteId: siteId,
              Name: template.name,
              Slug: template.slug,
              Order: nextOrder,
              IsHomePage: Boolean(template.isHomePage),
              SeoTitle: template.seoTitle,
              SeoDescription: template.seoDescription,
              DraftLayoutVersion: 1,
              PublishedLayoutVersion: 1,
              OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
              Tags: ['vibebuilder-page', 'starter-generated'],
            },
          });

          currentPage = {
            ItemId: createPageResponse.insertSitePage.itemId,
            SiteId: siteId,
            Name: template.name,
            Slug: template.slug,
            Order: nextOrder,
            IsHomePage: Boolean(template.isHomePage),
            SeoTitle: template.seoTitle,
            SeoDescription: template.seoDescription,
            DraftLayoutVersion: 1,
            PublishedLayoutVersion: 1,
            OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
            Tags: ['vibebuilder-page', 'starter-generated'],
          };

          pagesBySlug.set(template.slug, currentPage);
          nextPages.push(currentPage);
          nextOrder += 1;
        } else {
          await updateSitePageMutation.mutateAsync({
            filter: buildItemIdFilter(currentPage.ItemId),
            input: {
              Name: template.name,
              Slug: template.slug,
              Order: currentPage.Order,
              IsHomePage: Boolean(template.isHomePage),
              SeoTitle: template.seoTitle,
              SeoDescription: template.seoDescription,
              DraftLayoutVersion: 1,
              PublishedLayoutVersion: 1,
              OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
              Tags: Array.from(new Set([...(currentPage.Tags || []), 'starter-generated'])),
            },
          });
        }

        const layoutDocument: VibeBuilderPageLayoutDocument = {
          schemaVersion: EDITOR_SCHEMA_VERSION,
          page: {
            id: currentPage.ItemId,
            title: template.name,
            slug: template.slug,
          },
          blocks: template.blocks,
        };

        if (currentPage.ItemId === pageId || template.slug === page?.Slug) {
          currentPageDocument = layoutDocument;
        }

        const serializedLayout = JSON.stringify(layoutDocument);

        for (const status of ['draft', 'published'] as const) {
          const existingLayout = layoutRecords.get(`${currentPage.ItemId}:${status}`);

          if (existingLayout) {
            await updateLayoutMutation.mutateAsync({
              filter: buildItemIdFilter(existingLayout.ItemId),
              input: {
                SiteId: siteId,
                PageId: currentPage.ItemId,
                Version: 1,
                Status: status,
                LayoutJson: serializedLayout,
                SchemaVersion: EDITOR_SCHEMA_VERSION,
                OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
                Tags: ['vibebuilder-layout', status, 'starter-generated'],
              },
            });

            if (template.isHomePage && status === 'published') {
              publishedHomeLayoutId = existingLayout.ItemId;
            }
          } else {
            const createLayoutResponse = await addLayoutMutation.mutateAsync({
              input: {
                SiteId: siteId,
                PageId: currentPage.ItemId,
                Version: 1,
                Status: status,
                LayoutJson: serializedLayout,
                SchemaVersion: EDITOR_SCHEMA_VERSION,
                OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
                Tags: ['vibebuilder-layout', status, 'starter-generated'],
              },
            });

            layoutRecords.set(`${currentPage.ItemId}:${status}`, {
              ItemId: createLayoutResponse.insertSitePageLayout.itemId,
              SiteId: siteId,
              PageId: currentPage.ItemId,
              Version: 1,
              Status: status,
              LayoutJson: serializedLayout,
            });

            if (template.isHomePage && status === 'published') {
              publishedHomeLayoutId = createLayoutResponse.insertSitePageLayout.itemId;
            }
          }
        }
      }

      const resolvedHomeTemplate = templates.find((template) => template.isHomePage) || templates[0];
      const resolvedHomePage = pagesBySlug.get(resolvedHomeTemplate.slug);

      await updateSiteMutation.mutateAsync({
        filter: buildItemIdFilter(siteId),
        input: {
          HomePageId: resolvedHomePage?.ItemId,
          PublishedRevisionId: publishedHomeLayoutId || undefined,
          Status: 'published',
          ThemeConfig: buildThemeConfigPayload({
            ...activeThemeConfig,
            presetId: ACNESTUDIO_THEME_PRESET_ID,
            templateId: ACNESTUDIO_THEME_PRESET_ID,
          }),
          Tags: Array.from(new Set([...(site.Tags || []), ACNESTUDIO_STARTER_TAG])),
        },
      });

      if (currentPageDocument && draftStorageKey) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(currentPageDocument));
        setLayoutDocument(currentPageDocument);
        setSelectedBlockId(currentPageDocument.blocks[0]?.id ?? null);
        setHasHydrated(true);
      }

      await Promise.all([
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'vibe-builder-sites' }),
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'vibe-builder-site-pages' }),
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'vibe-builder-site-page-layouts' }),
      ]);

      setSiteGenerationMessage('AcneStudio starter site applied. The current editor page and public website are now aligned from the same generated content set.');
    } catch (error) {
      setSiteGenerationMessage(getMutationErrorMessage(error));
    } finally {
      setIsGeneratingStarterSite(false);
    }
  };

  if (siteQuery.isLoading || pageQuery.isLoading || layoutQuery.isLoading || !layoutDocument || !page) {
    return (
      <main className="flex w-full flex-col gap-6" role="main" aria-label="VibeBuilder Editor">
        <div className="space-y-3">
          <div className="h-8 w-52 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[380px_1fr_320px]">
          <div className="flex flex-col gap-5">
            <div className="h-[180px] rounded-2xl border bg-muted/20" />
            <div className="h-[320px] rounded-2xl border bg-muted/20" />
          </div>
          <div className="h-[520px] rounded-2xl border bg-muted/20" />
          <div className="h-[520px] rounded-2xl border bg-muted/20" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-6" role="main" aria-label="VibeBuilder Editor">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visual editor</h1>
          <p className="text-sm text-muted-foreground">
            Editing {page.Name} for {site?.Name ?? 'this site'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {site?.Slug === 'acnestudio' ? (
            <button
              type="button"
              onClick={() => void handleApplyAcneStudioStarterSite()}
              disabled={isGeneratingStarterSite}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
            >
              <LayoutTemplate className="h-4 w-4" />
              {isGeneratingStarterSite ? 'Applying starter site...' : 'Apply AcneStudio starter site'}
            </button>
          ) : null}
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Save className="h-3.5 w-3.5" />
            {saveState === 'saving' ? 'Saving draft...' : saveState === 'saved' ? 'Draft saved' : saveState === 'error' ? 'Save failed' : 'Ready'}
          </div>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={isPublishing || saveState === 'saving'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Rocket className="h-4 w-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
          {site?.Slug && page?.Slug ? (
            <a
              href={`/site/${site.Slug}/${page.Slug}?preview=1&returnTo=${encodeURIComponent(pathname)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Preview
            </a>
          ) : null}
          <Link to={`/vibe-builder/${siteId}`} className={buttonVariants({ variant: 'outline' })}>
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-muted-foreground">
          {saveError}
        </div>
      ) : null}

      {publishError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-muted-foreground">
          {publishError}
        </div>
      ) : null}

      {siteGenerationMessage ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          {siteGenerationMessage}
        </div>
      ) : null}

      <section className="items-start grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)_320px]">
        <div className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <Card className="h-full overflow-hidden">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <PanelLeft className="h-4 w-4" />
                Editor sidebar
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Switch between site setup and the block library without scrolling through both at once.
              </CardDescription>
              <Tabs defaultValue="site" className="w-full min-w-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="site">Site</TabsTrigger>
                  <TabsTrigger value="blocks">Blocks</TabsTrigger>
                </TabsList>
                <TabsContent value="site" className="mt-4 h-[calc(100vh-15rem)] overflow-y-auto pr-1 lg:h-[calc(100vh-19rem)]">
                  <div className="space-y-5">
                    <Card className="min-w-0">
                      <CardHeader className="space-y-2 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileStack className="h-4 w-4" />
                          Pages
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          Switch to another page in this site without leaving the editor.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <button
                          type="button"
                          onClick={() => setIsCreatePageDialogOpen(true)}
                          className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-left hover:bg-muted"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">Create page</div>
                            <div className="text-xs leading-relaxed text-muted-foreground">Add another page to this site</div>
                          </div>
                          <FilePlus2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {sitePages.map((sitePage) => (
                          <Link
                            key={sitePage.ItemId}
                            to={`/vibe-builder/${siteId}/editor/${sitePage.ItemId}`}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${sitePage.ItemId === pageId ? 'border-primary bg-primary/10 text-primary' : 'bg-background hover:bg-muted'}`}
                          >
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{sitePage.Name}</div>
                              <div className="text-xs leading-relaxed text-muted-foreground">/{sitePage.Slug}</div>
                            </div>
                            {sitePage.IsHomePage ? (
                              <span className="rounded-full border px-2 py-1 text-[10px] font-medium text-muted-foreground">Home</span>
                            ) : null}
                          </Link>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="min-w-0">
                      <CardHeader className="space-y-2 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <LayoutTemplate className="h-4 w-4" />
                          Themes
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          Choose a site-wide visual preset. Selecting one also replaces the current page with an editable starter layout.
                        </CardDescription>
                      </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        <div className="space-y-2">
                          <Label>Appearance</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['light', 'dark'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => void handleAppearanceModeChange(mode)}
                                className={`rounded-lg border px-3 py-2 text-sm ${activeAppearanceMode === mode ? 'border-primary bg-primary/10 text-primary' : 'bg-background text-foreground'}`}
                              >
                                {mode === 'light' ? 'Light mode' : 'Dark mode'}
                              </button>
                            ))}
                          </div>
                        </div>
                        {vibeBuilderThemePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => void handleThemeSelect(preset.id)}
                            className={`w-full rounded-2xl border text-left ${activeTheme.id === preset.id ? 'border-primary ring-1 ring-primary/30' : ''}`}
                          >
                            <div
                              className="rounded-t-2xl px-4 py-6 text-lg font-semibold"
                              style={{
                                backgroundColor: preset.heroBackground,
                                color: preset.id === 'level' ? '#f8fafc' : preset.id === 'simple' ? '#ffffff' : preset.textColor,
                                fontFamily: preset.headingFont,
                              }}
                            >
                              {preset.name}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3">
                              <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: preset.accentColor }} />
                              <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: preset.pageBackground }} />
                              <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: preset.surfaceBackground }} />
                              <span className="ml-auto text-xs text-muted-foreground">
                                {activeTheme.id === preset.id ? 'Active template' : 'Apply template'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="space-y-2 px-5 pb-3 pt-4 md:px-5 md:pb-3 md:pt-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Type className="h-4 w-4" />
                          Typography
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          Adjust the site-wide font pair and reading scale.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 px-5 pb-4 pt-1 md:px-5 md:pb-4 md:pt-1">
                        <div className="space-y-1.5">
                          <Label>Font pair</Label>
                          <Select value={activeTypographyPresetId} onValueChange={(value) => void handleTypographyPresetChange(value)}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choose a font pair" />
                            </SelectTrigger>
                            <SelectContent>
                              {vibeBuilderTypographyOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Text scale</Label>
                          <div className="flex flex-col gap-2">
                            {vibeBuilderTypographyScales.map((scale) => (
                              <button
                                key={scale.id}
                                type="button"
                                onClick={() => void handleTypographyScaleChange(scale.id)}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${activeTypographyScaleId === scale.id ? 'border-primary bg-primary/10 text-primary' : 'bg-background text-foreground'}`}
                              >
                                {scale.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="blocks" className="mt-4 h-[calc(100vh-15rem)] overflow-y-auto pr-1 lg:h-[calc(100vh-19rem)]">
                  <div className="space-y-5">
                    <Card>
                      <CardHeader className="space-y-2 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <PanelLeft className="h-4 w-4" />
                          Component library
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          Add beginner-friendly blocks grouped by what they help you build.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        {vibeBuilderBlockCategories.map((category) => {
                          const categoryBlocks = vibeBuilderBlockDefinitions.filter(
                            (definition) => definition.category === category
                          );

                          return (
                            <div key={category} className="space-y-3">
                              <div className="px-1">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {category}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {categoryBlocks.map(({ type, label, description, icon: Icon }) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleAddBlock(type)}
                                    className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-left hover:bg-muted"
                                  >
                                    <div className="space-y-1 pr-3">
                                      <div className="text-sm font-medium text-foreground">{label}</div>
                                      <div className="text-xs leading-relaxed text-muted-foreground">
                                        {description}
                                      </div>
                                    </div>
                                    <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SquareDashedMousePointer className="h-4 w-4" />
              Canvas
            </CardTitle>
            <CardDescription>Reorder blocks with drag handles and click a block to edit it.</CardDescription>
          </CardHeader>
          <CardContent>
            {layoutDocument.blocks.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Add your first block from the library to start composing this page.
              </div>
            ) : (
              <DndContext sensors={navigate} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {layoutDocument.blocks.map((block) => (
                      <SortableBlockCard
                        key={block.id}
                        block={block}
                        theme={activeTheme}
                        isSelected={selectedBlockId === block.id}
                        onSelect={setSelectedBlockId}
                        onDelete={handleDeleteBlock}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PanelRight className="h-4 w-4" />
              Properties
            </CardTitle>
            <CardDescription>
              {selectedBlock ? `Editing ${getBlockTitle(selectedBlock)}` : 'Select a block to edit its properties.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto pr-1 lg:h-[calc(100vh-14rem)]">
            {!selectedBlock ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                No block selected yet.
              </div>
            ) : null}

            {selectedBlock?.type === 'hero' ? (
              <>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderHeroBlockProps).headline}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderHeroBlockProps),
                          headline: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Textarea
                    height="110px"
                    value={(selectedBlock.props as VibeBuilderHeroBlockProps).subheading}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderHeroBlockProps),
                          subheading: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'text' ? (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderTextBlockProps).title}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderTextBlockProps),
                          title: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    height="140px"
                    value={(selectedBlock.props as VibeBuilderTextBlockProps).body}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderTextBlockProps),
                          body: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'image' ? (
              <>
                <div className="space-y-2">
                  <Label>Upload image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleImageUpload(file);
                      }
                      event.currentTarget.value = '';
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {isUploadingImage
                      ? 'Uploading image...'
                      : 'Upload an image file to replace the current image URL.'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderImageBlockProps).imageUrl}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderImageBlockProps),
                          imageUrl: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                {imageUploadError ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                    {imageUploadError}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label>Alt text</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderImageBlockProps).altText}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderImageBlockProps),
                          altText: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Textarea
                    height="100px"
                    value={(selectedBlock.props as VibeBuilderImageBlockProps).caption}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderImageBlockProps),
                          caption: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'button' ? (
              <>
                <div className="space-y-2">
                  <Label>Button label</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderButtonBlockProps).label}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderButtonBlockProps),
                          label: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button link</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderButtonBlockProps).href}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderButtonBlockProps),
                          href: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'divider' ? (
              <div className="space-y-2">
                <Label>Divider label</Label>
                <Input
                  value={(selectedBlock.props as VibeBuilderDividerBlockProps).label}
                  onChange={(event) =>
                    updateSelectedBlock((block) => ({
                      ...block,
                      props: {
                        ...(block.props as VibeBuilderDividerBlockProps),
                        label: event.target.value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}

            {selectedBlock?.type === 'spacer' ? (
              <div className="space-y-2">
                <Label>Spacer height (px)</Label>
                <Input
                  type="number"
                  min="16"
                  max="240"
                  value={(selectedBlock.props as VibeBuilderSpacerBlockProps).height}
                  onChange={(event) =>
                    updateSelectedBlock((block) => ({
                      ...block,
                      props: {
                        ...(block.props as VibeBuilderSpacerBlockProps),
                        height: Number(event.target.value) || 16,
                      },
                    }))
                  }
                />
              </div>
            ) : null}

            {selectedBlock?.type === 'social-links' ? (
              <>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderSocialLinksBlockProps).heading}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderSocialLinksBlockProps),
                          heading: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                {(selectedBlock.props as VibeBuilderSocialLinksBlockProps).links.map((link, index) => (
                  <div key={`${selectedBlock.id}-social-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Link {index + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeSelectedBlockArrayItem('links', index)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <Label>Link {index + 1} label</Label>
                    <Input
                      value={link.label}
                      onChange={(event) =>
                        updateSelectedBlock((block) => {
                          const nextLinks = [...(block.props as VibeBuilderSocialLinksBlockProps).links];
                          nextLinks[index] = { ...nextLinks[index], label: event.target.value };
                          return {
                            ...block,
                            props: {
                              ...(block.props as VibeBuilderSocialLinksBlockProps),
                              links: nextLinks,
                            },
                          };
                        })
                      }
                    />
                    <Label>Link {index + 1} URL</Label>
                    <Input
                      value={link.href}
                      onChange={(event) =>
                        updateSelectedBlock((block) => {
                          const nextLinks = [...(block.props as VibeBuilderSocialLinksBlockProps).links];
                          nextLinks[index] = { ...nextLinks[index], href: event.target.value };
                          return {
                            ...block,
                            props: {
                              ...(block.props as VibeBuilderSocialLinksBlockProps),
                              links: nextLinks,
                            },
                          };
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSelectedBlockArrayItem('links', { label: 'New link', href: '/new-link' })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add social link
                </button>
              </>
            ) : null}

            {selectedBlock?.type === 'heading' ? (
              <>
                <div className="space-y-2">
                  <Label>Heading text</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderHeadingBlockProps).text}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderHeadingBlockProps),
                          text: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtext</Label>
                  <Textarea
                    height="96px"
                    value={(selectedBlock.props as VibeBuilderHeadingBlockProps).subtext}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderHeadingBlockProps),
                          subtext: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'icon' ? (
              <>
                <div className="space-y-2">
                  <Label>Icon symbol</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderIconBlockProps).icon}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderIconBlockProps),
                          icon: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(selectedBlock.props as VibeBuilderIconBlockProps).title}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderIconBlockProps),
                          title: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    height="96px"
                    value={(selectedBlock.props as VibeBuilderIconBlockProps).body}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        props: {
                          ...(block.props as VibeBuilderIconBlockProps),
                          body: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'section' ? (
              <>
                <div className="space-y-2">
                  <Label>Section title</Label>
                  <Input value={(selectedBlock.props as VibeBuilderSectionBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderSectionBlockProps), title: event.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Section body</Label>
                  <Textarea height="110px" value={(selectedBlock.props as VibeBuilderSectionBlockProps).body} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderSectionBlockProps), body: event.target.value } }))} />
                </div>
              </>
            ) : null}

            {selectedBlock?.type === 'columns' ? (
              <>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={(selectedBlock.props as VibeBuilderColumnsBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderColumnsBlockProps), heading: event.target.value } }))} />
                </div>
                {(selectedBlock.props as VibeBuilderColumnsBlockProps).columns.map((column, index) => (
                  <div key={`${selectedBlock.id}-column-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <Label>Column {index + 1} title</Label>
                    <Input value={column.title} onChange={(event) => updateSelectedBlock((block) => { const columns = [...(block.props as VibeBuilderColumnsBlockProps).columns]; columns[index] = { ...columns[index], title: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderColumnsBlockProps), columns } }; })} />
                    <Label>Column {index + 1} body</Label>
                    <Textarea height="90px" value={column.body} onChange={(event) => updateSelectedBlock((block) => { const columns = [...(block.props as VibeBuilderColumnsBlockProps).columns]; columns[index] = { ...columns[index], body: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderColumnsBlockProps), columns } }; })} />
                  </div>
                ))}
              </>
            ) : null}

            {selectedBlock?.type === 'card' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderCardBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCardBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Body</Label><Textarea height="96px" value={(selectedBlock.props as VibeBuilderCardBlockProps).body} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCardBlockProps), body: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderCardBlockProps).ctaLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCardBlockProps), ctaLabel: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button link</Label><Input value={(selectedBlock.props as VibeBuilderCardBlockProps).ctaHref} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCardBlockProps), ctaHref: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'gallery' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderGalleryBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderGalleryBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderGalleryBlockProps).images.slice(0, 6).map((image, index) => (
                  <div key={`${selectedBlock.id}-gallery-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Image {index + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeSelectedBlockArrayItem('images', index)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <Label>Image {index + 1} URL</Label>
                    <Input value={image.imageUrl} onChange={(event) => updateSelectedBlock((block) => { const images = [...(block.props as VibeBuilderGalleryBlockProps).images]; images[index] = { ...images[index], imageUrl: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderGalleryBlockProps), images } }; })} />
                    <Label>Caption</Label>
                    <Input value={image.caption} onChange={(event) => updateSelectedBlock((block) => { const images = [...(block.props as VibeBuilderGalleryBlockProps).images]; images[index] = { ...images[index], caption: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderGalleryBlockProps), images } }; })} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSelectedBlockArrayItem('images', { imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80', altText: 'New gallery image', caption: 'New gallery item' })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add gallery image
                </button>
              </>
            ) : null}

            {selectedBlock?.type === 'video' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderVideoBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderVideoBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Embed URL</Label><Input value={(selectedBlock.props as VibeBuilderVideoBlockProps).videoUrl} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderVideoBlockProps), videoUrl: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Caption</Label><Textarea height="80px" value={(selectedBlock.props as VibeBuilderVideoBlockProps).caption} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderVideoBlockProps), caption: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'map' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderMapBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderMapBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Map URL</Label><Input value={(selectedBlock.props as VibeBuilderMapBlockProps).embedUrl} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderMapBlockProps), embedUrl: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Address</Label><Textarea height="80px" value={(selectedBlock.props as VibeBuilderMapBlockProps).address} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderMapBlockProps), address: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'form' ? (
              <>
                <div className="space-y-2"><Label>Form title</Label><Input value={(selectedBlock.props as VibeBuilderFormBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFormBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea height="90px" value={(selectedBlock.props as VibeBuilderFormBlockProps).description} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFormBlockProps), description: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderFormBlockProps).buttonLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFormBlockProps), buttonLabel: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderFormBlockProps).fields.map((field, index) => (
                  <div key={`${selectedBlock.id}-field-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Field {index + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeSelectedBlockArrayItem('fields', index)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <Label>Field {index + 1} label</Label>
                    <Input value={field.label} onChange={(event) => updateSelectedBlock((block) => { const fields = [...(block.props as VibeBuilderFormBlockProps).fields]; fields[index] = { ...fields[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFormBlockProps), fields } }; })} />
                    <Label>Field type</Label>
                    <Select value={field.type} onValueChange={(value) => updateSelectedBlock((block) => { const fields = [...(block.props as VibeBuilderFormBlockProps).fields]; fields[index] = { ...fields[index], type: value as 'text' | 'email' | 'textarea' }; return { ...block, props: { ...(block.props as VibeBuilderFormBlockProps), fields } }; })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label>Placeholder</Label>
                    <Input value={field.placeholder} onChange={(event) => updateSelectedBlock((block) => { const fields = [...(block.props as VibeBuilderFormBlockProps).fields]; fields[index] = { ...fields[index], placeholder: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFormBlockProps), fields } }; })} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSelectedBlockArrayItem('fields', { label: 'Phone', type: 'text', placeholder: 'Your phone number' })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add form field
                </button>
              </>
            ) : null}

            {selectedBlock?.type === 'pricing-table' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderPricingTableBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderPricingTableBlockProps).plans.map((plan, index) => (
                  <div key={`${selectedBlock.id}-plan-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Plan {index + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeSelectedBlockArrayItem('plans', index)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <Label>Plan {index + 1} name</Label><Input value={plan.name} onChange={(event) => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; plans[index] = { ...plans[index], name: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} />
                    <Label>Price</Label><Input value={plan.price} onChange={(event) => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; plans[index] = { ...plans[index], price: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} />
                    <Label>Description</Label><Textarea height="80px" value={plan.description} onChange={(event) => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; plans[index] = { ...plans[index], description: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} />
                    <div className="space-y-2">
                      <Label>Features</Label>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={`${selectedBlock.id}-plan-${index}-feature-${featureIndex}`} className="flex items-center gap-2">
                          <Input value={feature} onChange={(event) => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; const features = [...plans[index].features]; features[featureIndex] = event.target.value; plans[index] = { ...plans[index], features }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} />
                          <button type="button" onClick={() => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; const features = plans[index].features.length <= 1 ? plans[index].features : plans[index].features.filter((_, currentIndex) => currentIndex !== featureIndex); plans[index] = { ...plans[index], features }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} className="inline-flex items-center rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => updateSelectedBlock((block) => { const plans = [...(block.props as VibeBuilderPricingTableBlockProps).plans]; plans[index] = { ...plans[index], features: [...plans[index].features, 'New feature'] }; return { ...block, props: { ...(block.props as VibeBuilderPricingTableBlockProps), plans } }; })} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><Plus className="h-4 w-4" />Add feature</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('plans', { name: 'New plan', price: '$99/mo', description: 'Add a short plan description.', features: ['New feature'], ctaLabel: 'Choose plan' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add pricing plan</button>
              </>
            ) : null}

            {selectedBlock?.type === 'testimonials' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderTestimonialsBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTestimonialsBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderTestimonialsBlockProps).testimonials.map((item, index) => (
                  <div key={`${selectedBlock.id}-testimonial-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Testimonial {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('testimonials', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Quote</Label><Textarea height="90px" value={item.quote} onChange={(event) => updateSelectedBlock((block) => { const testimonials = [...(block.props as VibeBuilderTestimonialsBlockProps).testimonials]; testimonials[index] = { ...testimonials[index], quote: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTestimonialsBlockProps), testimonials } }; })} />
                    <Label>Name</Label><Input value={item.name} onChange={(event) => updateSelectedBlock((block) => { const testimonials = [...(block.props as VibeBuilderTestimonialsBlockProps).testimonials]; testimonials[index] = { ...testimonials[index], name: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTestimonialsBlockProps), testimonials } }; })} />
                    <Label>Role</Label><Input value={item.role} onChange={(event) => updateSelectedBlock((block) => { const testimonials = [...(block.props as VibeBuilderTestimonialsBlockProps).testimonials]; testimonials[index] = { ...testimonials[index], role: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTestimonialsBlockProps), testimonials } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('testimonials', { quote: 'Add a customer quote here.', name: 'New customer', role: 'Customer role' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add testimonial</button>
              </>
            ) : null}

            {selectedBlock?.type === 'faq' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderFaqBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFaqBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderFaqBlockProps).items.map((item, index) => (
                  <div key={`${selectedBlock.id}-faq-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Question {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('items', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Question</Label><Input value={item.question} onChange={(event) => updateSelectedBlock((block) => { const items = [...(block.props as VibeBuilderFaqBlockProps).items]; items[index] = { ...items[index], question: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFaqBlockProps), items } }; })} />
                    <Label>Answer</Label><Textarea height="90px" value={item.answer} onChange={(event) => updateSelectedBlock((block) => { const items = [...(block.props as VibeBuilderFaqBlockProps).items]; items[index] = { ...items[index], answer: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFaqBlockProps), items } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('items', { question: 'New question', answer: 'Add the answer here.' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add FAQ item</button>
              </>
            ) : null}

            {selectedBlock?.type === 'team' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderTeamBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTeamBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderTeamBlockProps).members.map((member, index) => (
                  <div key={`${selectedBlock.id}-team-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Member {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('members', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Name</Label><Input value={member.name} onChange={(event) => updateSelectedBlock((block) => { const members = [...(block.props as VibeBuilderTeamBlockProps).members]; members[index] = { ...members[index], name: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTeamBlockProps), members } }; })} />
                    <Label>Role</Label><Input value={member.role} onChange={(event) => updateSelectedBlock((block) => { const members = [...(block.props as VibeBuilderTeamBlockProps).members]; members[index] = { ...members[index], role: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTeamBlockProps), members } }; })} />
                    <Label>Bio</Label><Textarea height="90px" value={member.bio} onChange={(event) => updateSelectedBlock((block) => { const members = [...(block.props as VibeBuilderTeamBlockProps).members]; members[index] = { ...members[index], bio: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTeamBlockProps), members } }; })} />
                    <Label>Image URL</Label><Input value={member.imageUrl} onChange={(event) => updateSelectedBlock((block) => { const members = [...(block.props as VibeBuilderTeamBlockProps).members]; members[index] = { ...members[index], imageUrl: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTeamBlockProps), members } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('members', { name: 'New team member', role: 'Role', bio: 'Add a short bio.', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add team member</button>
              </>
            ) : null}

            {selectedBlock?.type === 'services' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderServicesBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderServicesBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderServicesBlockProps).services.map((service, index) => (
                  <div key={`${selectedBlock.id}-service-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Service {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('services', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Service title</Label><Input value={service.title} onChange={(event) => updateSelectedBlock((block) => { const services = [...(block.props as VibeBuilderServicesBlockProps).services]; services[index] = { ...services[index], title: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderServicesBlockProps), services } }; })} />
                    <Label>Description</Label><Textarea height="90px" value={service.description} onChange={(event) => updateSelectedBlock((block) => { const services = [...(block.props as VibeBuilderServicesBlockProps).services]; services[index] = { ...services[index], description: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderServicesBlockProps), services } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('services', { title: 'New service', description: 'Describe this service.' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add service</button>
              </>
            ) : null}

            {selectedBlock?.type === 'stats' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderStatsBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderStatsBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderStatsBlockProps).stats.map((item, index) => (
                  <div key={`${selectedBlock.id}-stat-prop-${index}`} className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Stat {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('stats', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <div className="space-y-2"><Label>Value</Label><Input value={item.value} onChange={(event) => updateSelectedBlock((block) => { const stats = [...(block.props as VibeBuilderStatsBlockProps).stats]; stats[index] = { ...stats[index], value: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderStatsBlockProps), stats } }; })} /></div>
                    <div className="space-y-2"><Label>Label</Label><Input value={item.label} onChange={(event) => updateSelectedBlock((block) => { const stats = [...(block.props as VibeBuilderStatsBlockProps).stats]; stats[index] = { ...stats[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderStatsBlockProps), stats } }; })} /></div>
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('stats', { label: 'New stat', value: '0' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add stat</button>
              </>
            ) : null}

            {selectedBlock?.type === 'cta-section' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderCtaSectionBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCtaSectionBlockProps), heading: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Body</Label><Textarea height="90px" value={(selectedBlock.props as VibeBuilderCtaSectionBlockProps).body} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCtaSectionBlockProps), body: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderCtaSectionBlockProps).buttonLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCtaSectionBlockProps), buttonLabel: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button link</Label><Input value={(selectedBlock.props as VibeBuilderCtaSectionBlockProps).buttonHref} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCtaSectionBlockProps), buttonHref: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'product' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderProductBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderProductBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Price</Label><Input value={(selectedBlock.props as VibeBuilderProductBlockProps).price} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderProductBlockProps), price: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea height="90px" value={(selectedBlock.props as VibeBuilderProductBlockProps).description} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderProductBlockProps), description: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Image URL</Label><Input value={(selectedBlock.props as VibeBuilderProductBlockProps).imageUrl} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderProductBlockProps), imageUrl: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderProductBlockProps).buttonLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderProductBlockProps), buttonLabel: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'navbar' ? (
              <>
                <div className="space-y-2"><Label>Logo text</Label><Input value={(selectedBlock.props as VibeBuilderNavbarBlockProps).logoText} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderNavbarBlockProps), logoText: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderNavbarBlockProps).ctaLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderNavbarBlockProps), ctaLabel: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderNavbarBlockProps).links.map((link, index) => (
                  <div key={`${selectedBlock.id}-navbar-link-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Navigation link {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('links', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Link {index + 1} label</Label><Input value={link.label} onChange={(event) => updateSelectedBlock((block) => { const links = [...(block.props as VibeBuilderNavbarBlockProps).links]; links[index] = { ...links[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderNavbarBlockProps), links } }; })} />
                    <Label>Link {index + 1} URL</Label><Input value={link.href} onChange={(event) => updateSelectedBlock((block) => { const links = [...(block.props as VibeBuilderNavbarBlockProps).links]; links[index] = { ...links[index], href: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderNavbarBlockProps), links } }; })} />
                  </div>
                ))}
                <div className="space-y-2"><Label>Button link</Label><Input value={(selectedBlock.props as VibeBuilderNavbarBlockProps).ctaHref} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderNavbarBlockProps), ctaHref: event.target.value } }))} /></div>
                <button type="button" onClick={() => addSelectedBlockArrayItem('links', { label: 'New page', href: '/new-page' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add nav link</button>
              </>
            ) : null}

            {selectedBlock?.type === 'footer' ? (
              <>
                <div className="space-y-2"><Label>Logo text</Label><Input value={(selectedBlock.props as VibeBuilderFooterBlockProps).logoText} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), logoText: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Blurb</Label><Textarea height="90px" value={(selectedBlock.props as VibeBuilderFooterBlockProps).blurb} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), blurb: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Copyright</Label><Input value={(selectedBlock.props as VibeBuilderFooterBlockProps).copyright} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), copyright: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderFooterBlockProps).links.map((link, index) => (
                  <div key={`${selectedBlock.id}-footer-link-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Footer link {index + 1}</div>
                      <button type="button" onClick={() => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), links: (block.props as VibeBuilderFooterBlockProps).links.length <= 1 ? (block.props as VibeBuilderFooterBlockProps).links : (block.props as VibeBuilderFooterBlockProps).links.filter((_, currentIndex) => currentIndex !== index) } }))} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Label</Label><Input value={link.label} onChange={(event) => updateSelectedBlock((block) => { const links = [...(block.props as VibeBuilderFooterBlockProps).links]; links[index] = { ...links[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), links } }; })} />
                    <Label>URL</Label><Input value={link.href} onChange={(event) => updateSelectedBlock((block) => { const links = [...(block.props as VibeBuilderFooterBlockProps).links]; links[index] = { ...links[index], href: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), links } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), links: [...(block.props as VibeBuilderFooterBlockProps).links, { label: 'New link', href: '/new-link' }] } }))} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add footer link</button>
                {(selectedBlock.props as VibeBuilderFooterBlockProps).socialLinks.map((link, index) => (
                  <div key={`${selectedBlock.id}-footer-social-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Social link {index + 1}</div>
                      <button type="button" onClick={() => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), socialLinks: (block.props as VibeBuilderFooterBlockProps).socialLinks.length <= 1 ? (block.props as VibeBuilderFooterBlockProps).socialLinks : (block.props as VibeBuilderFooterBlockProps).socialLinks.filter((_, currentIndex) => currentIndex !== index) } }))} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Label</Label><Input value={link.label} onChange={(event) => updateSelectedBlock((block) => { const socialLinks = [...(block.props as VibeBuilderFooterBlockProps).socialLinks]; socialLinks[index] = { ...socialLinks[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), socialLinks } }; })} />
                    <Label>URL</Label><Input value={link.href} onChange={(event) => updateSelectedBlock((block) => { const socialLinks = [...(block.props as VibeBuilderFooterBlockProps).socialLinks]; socialLinks[index] = { ...socialLinks[index], href: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), socialLinks } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderFooterBlockProps), socialLinks: [...(block.props as VibeBuilderFooterBlockProps).socialLinks, { label: 'New social', href: 'https://example.com' }] } }))} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add social link</button>
              </>
            ) : null}

            {selectedBlock?.type === 'tabs' ? (
              <>
                {(selectedBlock.props as VibeBuilderTabsBlockProps).tabs.map((tab, index) => (
                  <div key={`${selectedBlock.id}-tab-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Tab {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('tabs', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Tab {index + 1} label</Label><Input value={tab.label} onChange={(event) => updateSelectedBlock((block) => { const tabs = [...(block.props as VibeBuilderTabsBlockProps).tabs]; tabs[index] = { ...tabs[index], label: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTabsBlockProps), tabs } }; })} />
                    <Label>Content</Label><Textarea height="90px" value={tab.content} onChange={(event) => updateSelectedBlock((block) => { const tabs = [...(block.props as VibeBuilderTabsBlockProps).tabs]; tabs[index] = { ...tabs[index], content: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTabsBlockProps), tabs } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('tabs', { label: 'New tab', content: 'Add tab content here.' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add tab</button>
              </>
            ) : null}

            {selectedBlock?.type === 'carousel' ? (
              <>
                {(selectedBlock.props as VibeBuilderCarouselBlockProps).slides.map((slide, index) => (
                  <div key={`${selectedBlock.id}-slide-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Slide {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('slides', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Slide title</Label><Input value={slide.title} onChange={(event) => updateSelectedBlock((block) => { const slides = [...(block.props as VibeBuilderCarouselBlockProps).slides]; slides[index] = { ...slides[index], title: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderCarouselBlockProps), slides } }; })} />
                    <Label>Slide description</Label><Textarea height="80px" value={slide.description} onChange={(event) => updateSelectedBlock((block) => { const slides = [...(block.props as VibeBuilderCarouselBlockProps).slides]; slides[index] = { ...slides[index], description: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderCarouselBlockProps), slides } }; })} />
                    <Label>Image URL</Label><Input value={slide.imageUrl} onChange={(event) => updateSelectedBlock((block) => { const slides = [...(block.props as VibeBuilderCarouselBlockProps).slides]; slides[index] = { ...slides[index], imageUrl: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderCarouselBlockProps), slides } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('slides', { title: 'New slide', description: 'Add slide copy here.', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add slide</button>
              </>
            ) : null}

            {selectedBlock?.type === 'timeline' ? (
              <>
                <div className="space-y-2"><Label>Heading</Label><Input value={(selectedBlock.props as VibeBuilderTimelineBlockProps).heading} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTimelineBlockProps), heading: event.target.value } }))} /></div>
                {(selectedBlock.props as VibeBuilderTimelineBlockProps).events.map((item, index) => (
                  <div key={`${selectedBlock.id}-timeline-prop-${index}`} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Timeline item {index + 1}</div>
                      <button type="button" onClick={() => removeSelectedBlockArrayItem('events', index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                    </div>
                    <Label>Step label</Label><Input value={item.year} onChange={(event) => updateSelectedBlock((block) => { const events = [...(block.props as VibeBuilderTimelineBlockProps).events]; events[index] = { ...events[index], year: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTimelineBlockProps), events } }; })} />
                    <Label>Title</Label><Input value={item.title} onChange={(event) => updateSelectedBlock((block) => { const events = [...(block.props as VibeBuilderTimelineBlockProps).events]; events[index] = { ...events[index], title: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTimelineBlockProps), events } }; })} />
                    <Label>Description</Label><Textarea height="80px" value={item.description} onChange={(event) => updateSelectedBlock((block) => { const events = [...(block.props as VibeBuilderTimelineBlockProps).events]; events[index] = { ...events[index], description: event.target.value }; return { ...block, props: { ...(block.props as VibeBuilderTimelineBlockProps), events } }; })} />
                  </div>
                ))}
                <button type="button" onClick={() => addSelectedBlockArrayItem('events', { year: 'Step', title: 'New milestone', description: 'Add a short milestone description.' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add timeline item</button>
              </>
            ) : null}

            {selectedBlock?.type === 'table' ? (
              <>
                <div className="space-y-2"><Label>Caption</Label><Input value={(selectedBlock.props as VibeBuilderTableBlockProps).caption} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTableBlockProps), caption: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Columns</Label><Input value={(selectedBlock.props as VibeBuilderTableBlockProps).columns.join(', ')} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTableBlockProps), columns: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) } }))} /></div>
                <div className="space-y-2"><Label>Rows</Label><Textarea height="120px" value={(selectedBlock.props as VibeBuilderTableBlockProps).rows.map((row) => row.join(' | ')).join('\n')} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderTableBlockProps), rows: event.target.value.split('\n').map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean)).filter((row) => row.length > 0) } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'code-embed' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderCodeEmbedBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCodeEmbedBlockProps), title: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Embed HTML</Label><Textarea height="120px" value={(selectedBlock.props as VibeBuilderCodeEmbedBlockProps).embedHtml} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCodeEmbedBlockProps), embedHtml: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Code snippet</Label><Textarea height="120px" value={(selectedBlock.props as VibeBuilderCodeEmbedBlockProps).codeSnippet} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderCodeEmbedBlockProps), codeSnippet: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock?.type === 'blog-article' ? (
              <>
                <div className="space-y-2"><Label>Title</Label><Input value={(selectedBlock.props as VibeBuilderBlogArticleBlockProps).title} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderBlogArticleBlockProps), title: event.target.value } }))} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2"><Label>Author</Label><Input value={(selectedBlock.props as VibeBuilderBlogArticleBlockProps).author} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderBlogArticleBlockProps), author: event.target.value } }))} /></div>
                  <div className="space-y-2"><Label>Date</Label><Input value={(selectedBlock.props as VibeBuilderBlogArticleBlockProps).date} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderBlogArticleBlockProps), date: event.target.value } }))} /></div>
                </div>
                <div className="space-y-2"><Label>Excerpt</Label><Textarea height="100px" value={(selectedBlock.props as VibeBuilderBlogArticleBlockProps).excerpt} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderBlogArticleBlockProps), excerpt: event.target.value } }))} /></div>
                <div className="space-y-2"><Label>Button label</Label><Input value={(selectedBlock.props as VibeBuilderBlogArticleBlockProps).buttonLabel} onChange={(event) => updateSelectedBlock((block) => ({ ...block, props: { ...(block.props as VibeBuilderBlogArticleBlockProps), buttonLabel: event.target.value } }))} /></div>
              </>
            ) : null}

            {selectedBlock ? (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete section
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Background color</Label>
                  <Input
                    value={selectedBlock.style?.backgroundColor || ''}
                    onChange={(event) =>
                      updateSelectedBlock((block) => ({
                        ...block,
                        style: {
                          ...(block.style as VibeBuilderBlockStyle),
                          backgroundColor: event.target.value,
                        },
                      }))
                    }
                    placeholder="#ffffff"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text align</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() =>
                          updateSelectedBlock((block) => ({
                            ...block,
                            style: {
                              ...(block.style as VibeBuilderBlockStyle),
                              textAlign: align,
                            },
                          }))
                        }
                        className={`rounded-lg border px-3 py-2 text-sm ${selectedBlock.style?.textAlign === align ? 'border-primary bg-primary/10 text-primary' : 'bg-background text-foreground'}`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Dialog
        open={isCreatePageDialogOpen}
        onOpenChange={(open) => {
          setIsCreatePageDialogOpen(open);
          if (!open) {
            setCreatePageError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create page</DialogTitle>
            <DialogDescription>Add a new page without leaving the editor.</DialogDescription>
          </DialogHeader>

          <Form {...createPageForm}>
            <form className="space-y-4" onSubmit={createPageForm.handleSubmit(handleCreatePage)}>
              <FormField
                control={createPageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page name</FormLabel>
                    <FormControl>
                      <Input placeholder="About" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createPageForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="about" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createPageForm.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO title</FormLabel>
                    <FormControl>
                      <Input placeholder="AcmeStudio | About" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createPageForm.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe this page for search engines" height="96px" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createPageError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                  {createPageError}
                </div>
              ) : null}

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePageDialogOpen(false)}
                  className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSitePageMutation.isPending}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {addSitePageMutation.isPending ? 'Creating...' : 'Create page'}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};
