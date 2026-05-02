import type {
  VibeBuilderBlogArticleBlockProps,
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
  VibeBuilderSite,
  VibeBuilderSitePage,
  VibeBuilderSocialLinksBlockProps,
  VibeBuilderSpacerBlockProps,
  VibeBuilderStatsBlockProps,
  VibeBuilderTableBlockProps,
  VibeBuilderTabsBlockProps,
  VibeBuilderTeamBlockProps,
  VibeBuilderTestimonialsBlockProps,
  VibeBuilderTextBlockProps,
  VibeBuilderTimelineBlockProps,
  VibeBuilderVideoBlockProps,
} from '@/modules/vibe-builder';
import { parseThemeConfig } from '@/modules/vibe-builder/theme-presets';

const scaleFontSize = (baseSize: number, scale = 1) => `${Math.round(baseSize * scale)}px`;

const resolveSiteHref = (siteSlug: string, href: string) => {
  if (!href) {
    return '#';
  }

  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  if (href.startsWith(`/site/${siteSlug}/`)) {
    return href;
  }

  if (href.startsWith('/')) {
    return `/site/${siteSlug}${href}`;
  }

  return `/site/${siteSlug}/${href}`;
};

const renderBlock = (
  siteSlug: string,
  block: VibeBuilderLayoutBlock,
  theme: ReturnType<typeof parseThemeConfig>
) => {
  const commonStyle = {
    backgroundColor: block.style?.backgroundColor || undefined,
    textAlign: block.style?.textAlign || 'left',
  } as const;

  if (block.type === 'hero') {
    const props = block.props as VibeBuilderHeroBlockProps;
    return (
      <section key={block.id} className="w-full rounded-3xl px-8 py-16 text-white" style={{ ...commonStyle, backgroundColor: block.style?.backgroundColor || '#111827' }}>
        <div className="mx-auto max-w-4xl">
          <h1
            className="text-4xl font-semibold tracking-tight md:text-5xl"
            style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(42, theme.headingScale) }}
          >
            {props.headline}
          </h1>
          <p
            className="mt-4 text-lg text-white/80"
            style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(18, theme.bodyScale) }}
          >
            {props.subheading}
          </p>
          {props.ctaLabel ? (
            <a
              href={resolveSiteHref(siteSlug, props.ctaHref || '#')}
              className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900"
              style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(14, theme.bodyScale) }}
            >
              {props.ctaLabel}
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  if (block.type === 'text') {
    const props = block.props as VibeBuilderTextBlockProps;
    return (
      <section key={block.id} className="w-full rounded-3xl px-8 py-12" style={commonStyle}>
        <div className="mx-auto max-w-4xl">
          <h2
            className="text-3xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(30, theme.headingScale) }}
          >
            {props.title}
          </h2>
          <p
            className="mt-4 whitespace-pre-wrap text-base leading-7 text-muted-foreground"
            style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(16, theme.bodyScale) }}
          >
            {props.body}
          </p>
        </div>
      </section>
    );
  }

  if (block.type === 'image') {
    const props = block.props as VibeBuilderImageBlockProps;
    return (
      <section key={block.id} className="w-full rounded-3xl px-8 py-10" style={commonStyle}>
        <div className="mx-auto max-w-5xl">
          <img src={props.imageUrl} alt={props.altText} className="w-full rounded-3xl object-cover" />
          {props.caption ? (
            <p
              className="mt-4 text-sm text-muted-foreground"
              style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(14, theme.bodyScale) }}
            >
              {props.caption}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (block.type === 'button') {
    const props = block.props as VibeBuilderButtonBlockProps;
    return (
      <section key={block.id} className="w-full px-8 py-6" style={commonStyle}>
        <div className="mx-auto max-w-4xl">
          <a
            href={resolveSiteHref(siteSlug, props.href || '#')}
            className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white"
            style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(14, theme.bodyScale) }}
          >
            {props.label}
          </a>
        </div>
      </section>
    );
  }

  if (block.type === 'divider') {
    const props = block.props as VibeBuilderDividerBlockProps;
    return (
      <section key={block.id} className="w-full px-8 py-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4 text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span
            className="text-xs uppercase tracking-[0.2em]"
            style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(12, theme.bodyScale) }}
          >
            {props.label}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </section>
    );
  }

  if (block.type === 'spacer') {
    const props = block.props as VibeBuilderSpacerBlockProps;
    return <div key={block.id} style={{ height: `${props.height}px` }} />;
  }

  if (block.type === 'social-links') {
    const props = block.props as VibeBuilderSocialLinksBlockProps;
    return (
      <section key={block.id} className="w-full rounded-3xl px-8 py-12" style={commonStyle}>
        <div className="mx-auto max-w-4xl">
          <h2
            className="text-2xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(24, theme.headingScale) }}
          >
            {props.heading}
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {props.links.map((link) => (
              <a
                key={`${block.id}-${link.label}`}
                href={resolveSiteHref(siteSlug, link.href)}
                className="inline-flex rounded-full border px-4 py-2 text-sm text-foreground"
                style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(14, theme.bodyScale) }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === 'heading') {
    const props = block.props as VibeBuilderHeadingBlockProps;
    const HeadingTag = props.level || 'h2';
    return (
      <section key={block.id} className="w-full px-8 py-8" style={commonStyle}>
        <div className="mx-auto max-w-4xl">
          <HeadingTag className="font-semibold tracking-tight" style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(props.level === 'h1' ? 40 : props.level === 'h3' ? 24 : 32, theme.headingScale) }}>
            {props.text}
          </HeadingTag>
          {props.subtext ? <p className="mt-3 text-sm text-muted-foreground" style={{ fontFamily: theme.bodyFont, fontSize: scaleFontSize(14, theme.bodyScale) }}>{props.subtext}</p> : null}
        </div>
      </section>
    );
  }

  if (block.type === 'icon') {
    const props = block.props as VibeBuilderIconBlockProps;
    return <section key={block.id} className="w-full px-8 py-8" style={commonStyle}><div className="mx-auto max-w-3xl rounded-3xl border bg-white px-8 py-10 text-center"><div className="text-4xl">{props.icon}</div><h3 className="mt-4 text-2xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h3><p className="mt-3 text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>{props.body}</p></div></section>;
  }

  if (block.type === 'section') {
    const props = block.props as VibeBuilderSectionBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-4xl rounded-3xl border px-8 py-10"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><p className="mt-4 text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>{props.body}</p></div></section>;
  }

  if (block.type === 'columns') {
    const props = block.props as VibeBuilderColumnsBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{props.columns.map((column, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><h3 className="text-xl font-semibold" style={{ fontFamily: theme.headingFont }}>{column.title}</h3><p className="mt-3 text-sm text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>{column.body}</p></div>)}</div></div></section>;
  }

  if (block.type === 'card') {
    const props = block.props as VibeBuilderCardBlockProps;
    return <section key={block.id} className="w-full px-8 py-8" style={commonStyle}><div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm"><h3 className="text-2xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h3><p className="mt-3 text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>{props.body}</p><a href={resolveSiteHref(siteSlug, props.ctaHref || '#')} className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white">{props.ctaLabel}</a></div></section>;
  }

  if (block.type === 'gallery') {
    const props = block.props as VibeBuilderGalleryBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">{props.images.map((image, index) => <figure key={`${block.id}-${index}`} className="overflow-hidden rounded-3xl border bg-white"><img src={image.imageUrl} alt={image.altText} className="h-48 w-full object-cover" />{image.caption ? <figcaption className="px-4 py-3 text-sm text-muted-foreground">{image.caption}</figcaption> : null}</figure>)}</div></div></section>;
  }

  if (block.type === 'video') {
    const props = block.props as VibeBuilderVideoBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><div className="mt-6 aspect-video overflow-hidden rounded-3xl border bg-black"><iframe src={props.videoUrl} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={props.title} /></div>{props.caption ? <p className="mt-4 text-sm text-muted-foreground">{props.caption}</p> : null}</div></section>;
  }

  if (block.type === 'map') {
    const props = block.props as VibeBuilderMapBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><div className="mt-6 aspect-[16/8] overflow-hidden rounded-3xl border bg-white"><iframe src={props.embedUrl} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={props.title} /></div><p className="mt-4 text-sm text-muted-foreground">{props.address}</p></div></section>;
  }

  if (block.type === 'form') {
    const props = block.props as VibeBuilderFormBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><p className="mt-3 text-muted-foreground" style={{ fontFamily: theme.bodyFont }}>{props.description}</p><div className="mt-6 space-y-4">{props.fields.map((field, index) => field.type === 'textarea' ? <textarea key={`${block.id}-${index}`} className="min-h-32 w-full rounded-2xl border px-4 py-3 text-sm" placeholder={field.placeholder} /> : <input key={`${block.id}-${index}`} className="w-full rounded-2xl border px-4 py-3 text-sm" type={field.type} placeholder={field.placeholder} />)}<button className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white">{props.buttonLabel}</button></div></div></section>;
  }

  if (block.type === 'pricing-table') {
    const props = block.props as VibeBuilderPricingTableBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{props.plans.map((plan, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><h3 className="text-xl font-semibold">{plan.name}</h3><div className="mt-3 text-3xl font-bold">{plan.price}</div><p className="mt-3 text-sm text-muted-foreground">{plan.description}</p><ul className="mt-4 space-y-2 text-sm text-muted-foreground">{plan.features.map((feature, featureIndex) => <li key={`${block.id}-${index}-${featureIndex}`}>• {feature}</li>)}</ul><button className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white">{plan.ctaLabel}</button></div>)}</div></div></section>;
  }

  if (block.type === 'testimonials') {
    const props = block.props as VibeBuilderTestimonialsBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{props.testimonials.map((item, index) => <blockquote key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><p className="text-sm italic text-muted-foreground">&ldquo;{item.quote}&rdquo;</p><footer className="mt-4"><div className="font-semibold">{item.name}</div><div className="text-sm text-muted-foreground">{item.role}</div></footer></blockquote>)}</div></div></section>;
  }

  if (block.type === 'faq') {
    const props = block.props as VibeBuilderFaqBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-4xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 space-y-3">{props.items.map((item, index) => <details key={`${block.id}-${index}`} className="rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 text-sm text-muted-foreground">{item.answer}</p></details>)}</div></div></section>;
  }

  if (block.type === 'team') {
    const props = block.props as VibeBuilderTeamBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{props.members.map((member, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><img src={member.imageUrl} alt={member.name} className="h-56 w-full rounded-2xl object-cover" /><div className="mt-4 text-xl font-semibold">{member.name}</div><div className="mt-1 text-sm text-primary">{member.role}</div><p className="mt-3 text-sm text-muted-foreground">{member.bio}</p></div>)}</div></div></section>;
  }

  if (block.type === 'services') {
    const props = block.props as VibeBuilderServicesBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{props.services.map((service, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><h3 className="text-xl font-semibold">{service.title}</h3><p className="mt-3 text-sm text-muted-foreground">{service.description}</p></div>)}</div></div></section>;
  }

  if (block.type === 'stats') {
    const props = block.props as VibeBuilderStatsBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl text-center"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{props.stats.map((item, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><div className="text-3xl font-bold">{item.value}</div><div className="mt-2 text-sm text-muted-foreground">{item.label}</div></div>)}</div></div></section>;
  }

  if (block.type === 'cta-section') {
    const props = block.props as VibeBuilderCtaSectionBlockProps;
    return <section key={block.id} className="w-full px-8 py-10"><div className="mx-auto max-w-5xl rounded-[2rem] px-8 py-14 text-center text-white" style={{ backgroundColor: block.style?.backgroundColor || '#111827' }}><h2 className="text-4xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><p className="mx-auto mt-4 max-w-2xl text-white/80">{props.body}</p><a href={resolveSiteHref(siteSlug, props.buttonHref || '#')} className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900">{props.buttonLabel}</a></div></section>;
  }

  if (block.type === 'product') {
    const props = block.props as VibeBuilderProductBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto grid max-w-5xl gap-6 rounded-3xl border bg-white p-6 md:grid-cols-[1.1fr_0.9fr]"><img src={props.imageUrl} alt={props.title} className="h-full min-h-72 w-full rounded-2xl object-cover" /><div className="flex flex-col justify-center"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><div className="mt-3 text-2xl font-bold text-primary">{props.price}</div><p className="mt-4 text-muted-foreground">{props.description}</p><a href={resolveSiteHref(siteSlug, props.buttonHref || '#')} className="mt-6 inline-flex w-fit rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white">{props.buttonLabel}</a></div></div></section>;
  }

  if (block.type === 'navbar') {
    const props = block.props as VibeBuilderNavbarBlockProps;
    return <section key={block.id} className="w-full border-b bg-white/90 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><div className="text-lg font-semibold" style={{ fontFamily: theme.headingFont }}>{props.logoText}</div><nav className="flex flex-wrap items-center gap-3 text-sm">{props.links.map((link) => <a key={`${block.id}-${link.label}`} href={resolveSiteHref(siteSlug, link.href)} className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground">{link.label}</a>)}{props.ctaLabel ? <a href={resolveSiteHref(siteSlug, props.ctaHref || '#')} className="inline-flex rounded-full bg-primary px-4 py-2 text-white">{props.ctaLabel}</a> : null}</nav></div></section>;
  }

  if (block.type === 'footer') {
    const props = block.props as VibeBuilderFooterBlockProps;
    return <section key={block.id} className="w-full px-8 py-10 text-white" style={{ backgroundColor: block.style?.backgroundColor || '#0f172a' }}><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1fr_auto]"><div><div className="text-xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.logoText}</div><p className="mt-3 max-w-xl text-sm text-white/70">{props.blurb}</p></div><div className="flex flex-col gap-3 text-sm text-white/70">{props.links.map((link) => <a key={`${block.id}-${link.label}`} href={resolveSiteHref(siteSlug, link.href)}>{link.label}</a>)}</div></div><div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60"><div>{props.copyright}</div><div className="flex gap-3">{props.socialLinks.map((link) => <a key={`${block.id}-${link.label}`} href={link.href}>{link.label}</a>)}</div></div></section>;
  }

  if (block.type === 'tabs') {
    const props = block.props as VibeBuilderTabsBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-4xl rounded-3xl border bg-white p-6"><div className="flex flex-wrap gap-2">{props.tabs.map((tab, index) => <div key={`${block.id}-${index}`} className={`rounded-full px-4 py-2 text-sm ${index === 0 ? 'bg-primary text-white' : 'border text-muted-foreground'}`}>{tab.label}</div>)}</div><div className="mt-6 text-muted-foreground">{props.tabs[0]?.content}</div></div></section>;
  }

  if (block.type === 'carousel') {
    const props = block.props as VibeBuilderCarouselBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-2">{props.slides.map((slide, index) => <div key={`${block.id}-${index}`} className="min-w-[320px] flex-1 overflow-hidden rounded-3xl border bg-white"><img src={slide.imageUrl} alt={slide.title} className="h-56 w-full object-cover" /><div className="p-6"><h3 className="text-xl font-semibold">{slide.title}</h3><p className="mt-3 text-sm text-muted-foreground">{slide.description}</p></div></div>)}</div></section>;
  }

  if (block.type === 'timeline') {
    const props = block.props as VibeBuilderTimelineBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-4xl"><h2 className="text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.heading}</h2><div className="mt-8 space-y-4">{props.events.map((event, index) => <div key={`${block.id}-${index}`} className="rounded-3xl border bg-white p-6"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{event.year}</div><h3 className="mt-2 text-xl font-semibold">{event.title}</h3><p className="mt-3 text-sm text-muted-foreground">{event.description}</p></div>)}</div></div></section>;
  }

  if (block.type === 'table') {
    const props = block.props as VibeBuilderTableBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-white"><div className="border-b px-6 py-4 text-sm font-semibold">{props.caption}</div><div className="overflow-x-auto"><table className="w-full min-w-[520px] border-collapse"><thead><tr>{props.columns.map((column, index) => <th key={`${block.id}-${index}`} className="border-b px-4 py-3 text-left text-sm font-semibold">{column}</th>)}</tr></thead><tbody>{props.rows.map((row, rowIndex) => <tr key={`${block.id}-row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${block.id}-${rowIndex}-${cellIndex}`} className="border-b px-4 py-3 text-sm text-muted-foreground">{cell}</td>)}</tr>)}</tbody></table></div></div></section>;
  }

  if (block.type === 'code-embed') {
    const props = block.props as VibeBuilderCodeEmbedBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><div className="mx-auto max-w-5xl rounded-3xl border bg-white p-6"><h2 className="text-2xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><div className="mt-5 rounded-2xl border p-4" dangerouslySetInnerHTML={{ __html: props.embedHtml }} /><pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-white/80">{props.codeSnippet}</pre></div></section>;
  }

  if (block.type === 'blog-article') {
    const props = block.props as VibeBuilderBlogArticleBlockProps;
    return <section key={block.id} className="w-full px-8 py-10" style={commonStyle}><article className="mx-auto max-w-4xl rounded-3xl border bg-white p-8"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{props.date}</div><h2 className="mt-3 text-3xl font-semibold" style={{ fontFamily: theme.headingFont }}>{props.title}</h2><div className="mt-2 text-sm text-muted-foreground">By {props.author}</div><p className="mt-5 text-muted-foreground">{props.excerpt}</p><a href={resolveSiteHref(siteSlug, props.buttonHref || '#')} className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white">{props.buttonLabel}</a></article></section>;
  }

  return null;
};

export const VibeBuilderPageRenderer = ({
  site,
  page,
  pages,
  layout,
}: {
  site: VibeBuilderSite;
  page: VibeBuilderSitePage;
  pages: VibeBuilderSitePage[];
  layout: VibeBuilderPageLayoutDocument;
}) => {
  const theme = parseThemeConfig(site.ThemeConfig);
  const hasNavbarBlock = layout.blocks.some((block) => block.type === 'navbar');
  const hasFooterBlock = layout.blocks.some((block) => block.type === 'footer');

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundColor: theme.pageBackground,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
      }}
    >
      {!hasNavbarBlock ? <header
        className="sticky top-0 z-20 w-full border-b backdrop-blur"
        style={{ backgroundColor: `${theme.surfaceBackground}f2` }}
      >
        <div
          className="flex w-full items-center justify-between px-6 py-4"
          style={{ maxWidth: '1100px', marginInline: 'auto' }}
        >
          <div>
            <div
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(18, theme.headingScale) }}
            >
              {site.Name}
            </div>
            <div
              className="text-xs"
              style={{ color: theme.mutedTextColor, fontSize: scaleFontSize(12, theme.bodyScale) }}
            >
              /{site.Slug}
            </div>
          </div>
          <nav
            className="flex flex-wrap items-center justify-end gap-3 text-sm"
            style={{ fontSize: scaleFontSize(14, theme.bodyScale) }}
          >
            {pages.map((sitePage) => (
              <a
                key={sitePage.ItemId}
                href={`/site/${site.Slug}/${sitePage.Slug}`}
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: sitePage.ItemId === page.ItemId ? `${theme.accentColor}1a` : 'transparent',
                  color: sitePage.ItemId === page.ItemId ? theme.accentColor : theme.mutedTextColor,
                }}
              >
                {sitePage.Name}
              </a>
            ))}
          </nav>
        </div>
      </header> : null}

      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="flex w-full flex-col gap-6"
          style={{ maxWidth: '1100px', marginInline: 'auto' }}
        >
          {layout.blocks.map((block) => renderBlock(site.Slug, block, theme))}
        </div>
      </div>

      {!hasFooterBlock ? <footer className="w-full border-t" style={{ backgroundColor: theme.surfaceBackground }}>
        <div
          className="flex w-full flex-col gap-4 px-6 py-10 md:flex-row md:items-start md:justify-between"
          style={{ maxWidth: '1100px', marginInline: 'auto' }}
        >
          <div>
            <div
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: theme.headingFont, fontSize: scaleFontSize(18, theme.headingScale) }}
            >
              {site.Name}
            </div>
            <p
              className="mt-2 max-w-xl text-sm"
              style={{ color: theme.mutedTextColor, fontSize: scaleFontSize(14, theme.bodyScale) }}
            >
              {site.Description || 'Contact us to learn more about this site and the services behind it.'}
            </p>
          </div>
          <div
            className="text-sm"
            style={{ color: theme.mutedTextColor, fontSize: scaleFontSize(14, theme.bodyScale) }}
          >
            <div
              className="font-medium"
              style={{
                color: theme.textColor,
                fontFamily: theme.headingFont,
                fontSize: scaleFontSize(16, theme.headingScale),
              }}
            >
              Contact us
            </div>
            <div className="mt-2">Email: hello@{site.Slug}.site</div>
            <div className="mt-1">Page: {page.Name}</div>
          </div>
        </div>
      </footer> : null}
    </main>
  );
};
