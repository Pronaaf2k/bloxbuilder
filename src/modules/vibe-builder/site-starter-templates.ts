import type {
  VibeBuilderBlockStyle,
  VibeBuilderLayoutBlock,
  VibeBuilderSitePage,
} from './types/vibe-builder.types';

export const ACNESTUDIO_STARTER_TAG = 'starter-site-generated-acnestudio-v1';
export const ACNESTUDIO_THEME_PRESET_ID = 'vision';

type StarterPageTemplate = {
  key: string;
  name: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  isHomePage?: boolean;
  blocks: VibeBuilderLayoutBlock[];
};

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const createBlock = <TProps,>(
  type: VibeBuilderLayoutBlock['type'],
  props: TProps,
  style?: VibeBuilderBlockStyle
): VibeBuilderLayoutBlock => ({
  id: createBlockId(),
  type,
  props: JSON.parse(JSON.stringify(props)) as TProps,
  style,
});

export const buildAcneStudioStarterPages = (existingHomePage?: VibeBuilderSitePage) => {
  const homeName = existingHomePage?.Name || 'Home';
  const homeSlug = existingHomePage?.Slug || 'home';

  const pages: StarterPageTemplate[] = [
    {
      key: 'home',
      name: homeName,
      slug: homeSlug,
      seoTitle: 'AcneStudio | Creative growth partner',
      seoDescription:
        'AcneStudio helps brands turn clear positioning, strong creative, and conversion-ready websites into measurable growth.',
      isHomePage: true,
      blocks: [
        createBlock('navbar', {
          logoText: 'AcneStudio',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Services', href: '/services' },
            { label: 'Work', href: '/work' },
            { label: 'Journal', href: '/journal' },
            { label: 'Contact', href: '/contact' },
          ],
          ctaLabel: 'Book a strategy call',
          ctaHref: '/contact',
        }),
        createBlock(
          'hero',
          {
            headline: 'Build a sharper brand presence with AcneStudio',
            subheading:
              'We combine strategy, design, content, and launch support to help ambitious brands look credible and grow faster online.',
            ctaLabel: 'Start your project',
            ctaHref: '/contact',
          },
          { backgroundColor: '#1d4ed8', textAlign: 'center' }
        ),
        createBlock('heading', {
          text: 'Why teams choose AcneStudio',
          level: 'h2',
          subtext:
            'Professional websites are not only about aesthetics. They need message clarity, structure, and a path to action.',
        }),
        createBlock('columns', {
          heading: 'What you get from the engagement',
          columns: [
            {
              title: 'Positioning clarity',
              body: 'We help shape a sharper story so visitors understand your value in seconds.',
            },
            {
              title: 'Design that feels credible',
              body: 'Pages are structured to feel polished, modern, and easy to navigate on any screen.',
            },
            {
              title: 'Content that moves people',
              body: 'Every page is designed to guide visitors from interest to trust to action.',
            },
          ],
        }),
        createBlock('stats', {
          heading: 'Results we care about',
          stats: [
            { label: 'Brand launches supported', value: '120+' },
            { label: 'Average project timeline', value: '3-5 weeks' },
            { label: 'Client satisfaction', value: '98%' },
            { label: 'Countries served', value: '14' },
          ],
        }),
        createBlock('services', {
          heading: 'Core services',
          services: [
            {
              title: 'Brand positioning',
              description: 'Clarify your offer, audience, and competitive angle before you scale.',
            },
            {
              title: 'Website design systems',
              description: 'Build clean, reusable page structures that stay consistent as your site grows.',
            },
            {
              title: 'Launch support',
              description: 'Move from concept to a published, conversion-ready site with fewer bottlenecks.',
            },
          ],
        }),
        createBlock('testimonials', {
          heading: 'What clients say after launch',
          testimonials: [
            {
              quote:
                'AcneStudio helped us finally explain our value clearly. The site now feels premium and easy to update.',
              name: 'Nora Leung',
              role: 'Founder, Auralab',
            },
            {
              quote:
                'The process was structured, collaborative, and fast. We launched with far less friction than expected.',
              name: 'Jonas Frei',
              role: 'Managing Partner, Meridiem',
            },
            {
              quote:
                'The new site gave our team a much stronger digital presence without needing a full engineering cycle.',
              name: 'Sami Rahman',
              role: 'Marketing Lead, Northline',
            },
          ],
        }),
        createBlock('gallery', {
          heading: 'Selected visual directions',
          images: [
            {
              imageUrl:
                'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
              altText: 'Workspace concept',
              caption: 'Clear editorial workspace visual',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
              altText: 'Creative collaboration',
              caption: 'Fast-moving collaborative team energy',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80',
              altText: 'Modern presentation',
              caption: 'Polished presentation-first layouts',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
              altText: 'Team meeting',
              caption: 'Strategic sessions that align content and design',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
              altText: 'Analytics visual',
              caption: 'Data-aware decisions for growth',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80',
              altText: 'Studio process',
              caption: 'A studio process built for speed and polish',
            },
          ],
        }),
        createBlock(
          'cta-section',
          {
            heading: 'Need a site that feels sharper and sells better?',
            body: 'Let’s build a website that matches the quality of the business behind it.',
            buttonLabel: 'Talk to AcneStudio',
            buttonHref: '/contact',
          },
          { backgroundColor: '#111827', textAlign: 'center' }
        ),
        createBlock(
          'footer',
          {
            logoText: 'AcneStudio',
            blurb:
              'AcneStudio is a creative growth partner for brands that need sharper positioning and cleaner digital execution.',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Services', href: '/services' },
              { label: 'Work', href: '/work' },
              { label: 'Contact', href: '/contact' },
            ],
            socialLinks: [
              { label: 'Instagram', href: 'https://instagram.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ],
            copyright: '© 2026 AcneStudio. All rights reserved.',
          },
          { backgroundColor: '#0f172a', textAlign: 'left' }
        ),
      ],
    },
    {
      key: 'about',
      name: 'About',
      slug: 'about',
      seoTitle: 'About AcneStudio',
      seoDescription:
        'Learn how AcneStudio approaches positioning, design, and launch planning for modern brands.',
      blocks: [
        createBlock('heading', {
          text: 'A creative studio built around strategic clarity',
          level: 'h1',
          subtext:
            'We believe better websites start with sharper thinking, not just prettier layouts.',
        }),
        createBlock('section', {
          title: 'How we work',
          body:
            'AcneStudio helps teams simplify their message, shape a confident visual system, and launch websites that feel credible from the first scroll to the final CTA.',
        }),
        createBlock('image', {
          imageUrl:
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
          altText: 'AcneStudio team session',
          caption: 'Strategy, systems, and launch planning all happen in one streamlined process.',
        }),
        createBlock('timeline', {
          heading: 'Our process from kickoff to launch',
          events: [
            {
              year: '01',
              title: 'Clarity',
              description: 'We clarify positioning, audience, and what the website needs to accomplish.',
            },
            {
              year: '02',
              title: 'Structure',
              description: 'We build the page flow, message hierarchy, and layout system.',
            },
            {
              year: '03',
              title: 'Refinement',
              description: 'We refine content, visuals, and interactions until the experience feels tight.',
            },
            {
              year: '04',
              title: 'Launch',
              description: 'We publish a site that is polished enough to represent the business properly.',
            },
          ],
        }),
        createBlock('team', {
          heading: 'The people behind the work',
          members: [
            {
              name: 'Amina Solberg',
              role: 'Founder & Strategy Lead',
              bio: 'Shapes positioning, brand messaging, and high-level website direction.',
              imageUrl:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
            },
            {
              name: 'Luca Hartmann',
              role: 'Design Director',
              bio: 'Builds visual systems and page structures that feel modern and persuasive.',
              imageUrl:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
            },
            {
              name: 'Maya Karim',
              role: 'Client Success Lead',
              bio: 'Keeps projects moving and helps teams maintain momentum after launch.',
              imageUrl:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=80',
            },
          ],
        }),
        createBlock('icon', {
          icon: '✦',
          title: 'Small team, senior thinking',
          body: 'We stay intentionally focused so strategy, design, and decision-making stay close together.',
        }),
      ],
    },
    {
      key: 'services',
      name: 'Services',
      slug: 'services',
      seoTitle: 'Services | AcneStudio',
      seoDescription:
        'Explore AcneStudio services for positioning, digital design systems, launch strategy, and conversion-ready websites.',
      blocks: [
        createBlock('hero', {
          headline: 'Services designed for real business momentum',
          subheading:
            'Every engagement is shaped to help brands look stronger, communicate faster, and move visitors toward action.',
          ctaLabel: 'Request a proposal',
          ctaHref: '/contact',
        }, { backgroundColor: '#0f172a', textAlign: 'left' }),
        createBlock('services', {
          heading: 'Where we create the most value',
          services: [
            {
              title: 'Messaging & positioning',
              description: 'Define what you say, who you say it to, and how to make it land quickly.',
            },
            {
              title: 'Website systems',
              description: 'Build a modular page system that is easier to expand without losing consistency.',
            },
            {
              title: 'Campaign landing pages',
              description: 'Launch focused pages for offers, launches, or product pushes with stronger structure.',
            },
          ],
        }),
        createBlock('columns', {
          heading: 'Three outcomes we optimize for',
          columns: [
            { title: 'Credibility', body: 'A site that feels sharper, more organized, and more trustworthy.' },
            { title: 'Clarity', body: 'Copy and hierarchy that make your value obvious sooner.' },
            { title: 'Conversion', body: 'A clearer path from interest to contact, booking, or sale.' },
          ],
        }),
        createBlock('card', {
          title: 'Need a custom engagement?',
          body: 'We can combine strategy, design, content, and launch support into a package that matches your stage.',
          ctaLabel: 'Talk through scope',
          ctaHref: '/contact',
        }),
        createBlock('divider', {
          label: 'Featured deliverables',
        }),
        createBlock('text', {
          title: 'What typically gets delivered',
          body:
            'Projects often include page architecture, narrative direction, reusable sections, content structure, launch-ready layouts, and internal editing guidance.',
        }),
        createBlock('button', {
          label: 'View pricing',
          href: '/pricing',
        }, { textAlign: 'center' }),
      ],
    },
    {
      key: 'work',
      name: 'Work',
      slug: 'work',
      seoTitle: 'Work | AcneStudio',
      seoDescription:
        'See AcneStudio visual directions, content systems, and launch-ready website examples for modern brands.',
      blocks: [
        createBlock('heading', {
          text: 'Work built to feel sharp and easy to trust',
          level: 'h1',
          subtext:
            'A few examples of the visual language, storytelling systems, and launch polish we bring into projects.',
        }),
        createBlock('gallery', {
          heading: 'Recent visual directions',
          images: [
            {
              imageUrl:
                'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image one',
              caption: 'Editorial landing page direction',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image two',
              caption: 'High-clarity messaging layouts',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image three',
              caption: 'Data-aware product visuals',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image four',
              caption: 'Strategic studio process snapshots',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image five',
              caption: 'Premium presentation systems',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
              altText: 'Project image six',
              caption: 'Collaborative working sessions',
            },
          ],
        }),
        createBlock('carousel', {
          slides: [
            {
              title: 'Brand relaunch concept',
              description: 'A cleaner visual system for a premium B2B service company.',
              imageUrl:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
            },
            {
              title: 'Product page direction',
              description: 'A structured product story built for clarity and stronger CTAs.',
              imageUrl:
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80',
            },
            {
              title: 'Campaign microsite',
              description: 'A fast-moving page system for launches and promotional pushes.',
              imageUrl:
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
            },
          ],
        }),
        createBlock('video', {
          title: 'A short walkthrough of our visual thinking',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          caption: 'Replace this with a real case study walkthrough, studio reel, or founder message.',
        }),
        createBlock('social-links', {
          heading: 'Follow ongoing work',
          links: [
            { label: 'Instagram', href: 'https://instagram.com' },
            { label: 'Behance', href: 'https://behance.net' },
            { label: 'LinkedIn', href: 'https://linkedin.com' },
          ],
        }, { textAlign: 'center' }),
      ],
    },
    {
      key: 'pricing',
      name: 'Pricing',
      slug: 'pricing',
      seoTitle: 'Pricing | AcneStudio',
      seoDescription:
        'Review AcneStudio engagement tiers for strategic websites, landing pages, and premium design systems.',
      blocks: [
        createBlock('heading', {
          text: 'Simple packages with room to tailor',
          level: 'h1',
          subtext:
            'Choose a starting point that fits your stage, then shape the final scope together.',
        }),
        createBlock('pricing-table', {
          heading: 'Engagement options',
          plans: [
            {
              name: 'Starter Site',
              price: '$2,500',
              description: 'Best for founders who need a sharper first professional website.',
              features: ['1-3 pages', 'Basic positioning help', 'Launch-ready layouts'],
              ctaLabel: 'Choose Starter',
            },
            {
              name: 'Growth Site',
              price: '$5,500',
              description: 'For teams that need multiple pages, stronger messaging, and conversion structure.',
              features: ['5-8 pages', 'Messaging direction', 'Reusable section system'],
              ctaLabel: 'Choose Growth',
            },
            {
              name: 'Signature Build',
              price: '$9,000+',
              description: 'For brands that need a full digital presence with more depth and polish.',
              features: ['Multi-page build', 'Strategic workshops', 'Launch support'],
              ctaLabel: 'Choose Signature',
            },
          ],
        }),
        createBlock('table', {
          caption: 'Package comparison',
          columns: ['Package', 'Pages', 'Strategy', 'Launch support'],
          rows: [
            ['Starter Site', '1-3', 'Light', 'Included'],
            ['Growth Site', '5-8', 'Moderate', 'Included'],
            ['Signature Build', 'Custom', 'Deep', 'Included'],
          ],
        }),
        createBlock('cta-section', {
          heading: 'Not sure which package fits?',
          body: 'We can recommend the best starting point after a short discovery conversation.',
          buttonLabel: 'Get a recommendation',
          buttonHref: '/contact',
        }, { backgroundColor: '#1e293b', textAlign: 'center' }),
      ],
    },
    {
      key: 'journal',
      name: 'Journal',
      slug: 'journal',
      seoTitle: 'Journal | AcneStudio',
      seoDescription:
        'Browse AcneStudio insights on messaging clarity, digital credibility, and content systems for growing brands.',
      blocks: [
        createBlock('heading', {
          text: 'Ideas, notes, and practical guidance',
          level: 'h1',
          subtext:
            'A journal page for featured thinking, strategic notes, and launch lessons that help teams make better website decisions.',
        }),
        createBlock('blog-article', {
          title: 'Why most business websites feel unclear in the first ten seconds',
          author: 'Amina Solberg',
          date: 'May 2026',
          excerpt:
            'Many websites fail not because they look bad, but because the story, hierarchy, and next step are all competing at once.',
          buttonLabel: 'Read the article',
          buttonHref: '/journal',
        }),
        createBlock('tabs', {
          tabs: [
            {
              label: 'Messaging',
              content: 'How to sharpen positioning and reduce friction in your top-level website story.',
            },
            {
              label: 'Structure',
              content: 'How page flow and section hierarchy shape credibility and conversion.',
            },
            {
              label: 'Launch',
              content: 'What to prepare before a site goes live so the rollout feels coordinated.',
            },
          ],
        }),
        createBlock('code-embed', {
          title: 'Embedded newsletter or signup widget',
          embedHtml:
            '<div style="padding:24px;border:1px solid #dbeafe;border-radius:20px;background:#eff6ff;text-align:center;font-family:system-ui,sans-serif;">Embed a newsletter form, social feed, or external widget here.</div>',
          codeSnippet:
            '<script>/* Replace with your analytics, scheduling, or newsletter embed code. */</script>',
        }),
        createBlock('product', {
          title: 'Website messaging audit',
          price: '$450',
          description:
            'A focused review of your homepage story, structure, and CTA flow with written recommendations.',
          imageUrl:
            'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80',
          buttonLabel: 'Request the audit',
          buttonHref: '/contact',
        }),
      ],
    },
    {
      key: 'faq',
      name: 'FAQ',
      slug: 'faq',
      seoTitle: 'FAQ | AcneStudio',
      seoDescription:
        'Read common questions about AcneStudio projects, timelines, pricing, and collaboration process.',
      blocks: [
        createBlock('heading', {
          text: 'Common questions before we start',
          level: 'h1',
          subtext:
            'A transparent overview of how we scope projects, collaborate, and move from first conversation to launch.',
        }),
        createBlock('faq', {
          heading: 'Frequently asked questions',
          items: [
            {
              question: 'How long does a project usually take?',
              answer: 'Most projects land between three and five weeks depending on scope and feedback speed.',
            },
            {
              question: 'Can we start from an existing brand?',
              answer: 'Yes. We can strengthen an existing identity and structure the site around it.',
            },
            {
              question: 'Do you help with content?',
              answer: 'Yes. We can guide structure, refine messaging, and help shape page-by-page copy direction.',
            },
            {
              question: 'Can our team update the site later?',
              answer: 'Yes. The builder is designed so non-technical teams can adjust content after launch.',
            },
          ],
        }),
        createBlock('tabs', {
          tabs: [
            { label: 'Process', content: 'Kickoff, page strategy, design refinement, then launch.' },
            { label: 'Pricing', content: 'You can start from a package or tailor scope together.' },
            { label: 'Support', content: 'Post-launch support can be arranged depending on the engagement.' },
          ],
        }),
      ],
    },
    {
      key: 'contact',
      name: 'Contact',
      slug: 'contact',
      seoTitle: 'Contact | AcneStudio',
      seoDescription:
        'Contact AcneStudio to discuss a new website, messaging refresh, landing page, or digital growth initiative.',
      blocks: [
        createBlock('heading', {
          text: 'Let’s talk about the next version of your website',
          level: 'h1',
          subtext:
            'Tell us where your current site feels weak, what you are launching, or what kind of digital presence you need next.',
        }),
        createBlock('form', {
          title: 'Start the conversation',
          description:
            'Share a little context and we will follow up with the right next step.',
          buttonLabel: 'Send inquiry',
          fields: [
            { label: 'Name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Message', type: 'textarea', placeholder: 'Tell us about your project' },
          ],
        }),
        createBlock('spacer', {
          height: 24,
        }),
        createBlock('map', {
          title: 'Where we work from',
          embedUrl: 'https://www.google.com/maps?q=Zurich&output=embed',
          address: 'AcneStudio collaborates remotely and from Zurich, Switzerland.',
        }),
      ],
    },
  ];

  return pages;
};
