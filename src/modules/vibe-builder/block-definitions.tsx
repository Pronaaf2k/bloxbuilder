import type { LucideIcon } from 'lucide-react';
import {
  BadgeHelp,
  Blocks,
  BookOpen,
  Briefcase,
  Camera,
  Captions,
  Code2,
  Columns2,
  CreditCard,
  FolderKanban,
  Footprints,
  GalleryVertical,
  Heading1,
  Image as ImageIcon,
  LineChart,
  Link2,
  MapPinned,
  Minus,
  MonitorPlay,
  Package,
  PanelTop,
  PanelsTopLeft,
  Quote,
  RectangleHorizontal,
  Share2,
  Sparkles,
  StretchHorizontal,
  Table2,
  Text,
  Timer,
  Users,
} from 'lucide-react';
import type {
  VibeBuilderBlockCategory,
  VibeBuilderBlockDefinition,
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
  VibeBuilderTextBlockProps,
  VibeBuilderTimelineBlockProps,
  VibeBuilderVideoBlockProps,
} from './types/vibe-builder.types';

const galleryPlaceholderImages = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80',
];

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const buildBlock = <TProps,>(
  type: VibeBuilderLayoutBlock['type'],
  category: VibeBuilderBlockCategory,
  label: string,
  description: string,
  icon: LucideIcon,
  props: TProps,
  style?: VibeBuilderLayoutBlock['style']
): VibeBuilderBlockDefinition => ({
  type,
  category,
  label,
  description,
  icon,
  create: () => ({
    id: createBlockId(),
    type,
    props: JSON.parse(JSON.stringify(props)) as TProps,
    style: style ? ({ ...style }) : undefined,
  }),
});

export const vibeBuilderBlockDefinitions: VibeBuilderBlockDefinition[] = [
  buildBlock<VibeBuilderHeroBlockProps>(
    'hero',
    'Basic',
    'Hero',
    'A bold opening section with headline, copy, and action.',
    Sparkles,
    {
      headline: 'A bold headline for your homepage',
      subheading: 'Use this hero section to explain the value of your website in one glance.',
      ctaLabel: 'Get started',
      ctaHref: '/contact',
    },
    { backgroundColor: '#111827', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderHeadingBlockProps>(
    'heading',
    'Basic',
    'Heading',
    'A simple heading and subheading pair for section introductions.',
    Heading1,
    {
      text: 'Your heading here',
      level: 'h2',
      subtext: 'Add a short supporting line underneath the heading.',
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTextBlockProps>(
    'text',
    'Basic',
    'Text',
    'A section title with body copy for explanations or descriptions.',
    Text,
    {
      title: 'Section title',
      body: 'Add a short paragraph that explains this section in a clear, useful way.',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderImageBlockProps>(
    'image',
    'Basic',
    'Image',
    'A single responsive image with caption support.',
    ImageIcon,
    {
      imageUrl:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      altText: 'Workspace image',
      caption: 'Replace this with an uploaded image later.',
    },
    { textAlign: 'center' }
  ),
  buildBlock<VibeBuilderButtonBlockProps>(
    'button',
    'Basic',
    'Button',
    'A simple call-to-action button.',
    Link2,
    {
      label: 'Primary action',
      href: '/contact',
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderDividerBlockProps>(
    'divider',
    'Basic',
    'Divider',
    'A visual divider to separate sections.',
    Minus,
    {
      label: 'Section divider',
    },
    { textAlign: 'center' }
  ),
  buildBlock<VibeBuilderSpacerBlockProps>(
    'spacer',
    'Basic',
    'Spacer',
    'Adds vertical breathing room between sections.',
    StretchHorizontal,
    {
      height: 64,
    }
  ),
  buildBlock<VibeBuilderIconBlockProps>(
    'icon',
    'Basic',
    'Icon',
    'A compact icon with title and description.',
    Captions,
    {
      icon: '★',
      title: 'Feature highlight',
      body: 'Use this block to call out one strong benefit or detail.',
    },
    { backgroundColor: '#ffffff', textAlign: 'center' }
  ),
  buildBlock<VibeBuilderSocialLinksBlockProps>(
    'social-links',
    'Basic',
    'Social links',
    'A set of social profile links for community or contact.',
    Share2,
    {
      heading: 'Follow us',
      links: [
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'YouTube', href: 'https://youtube.com' },
      ],
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderSectionBlockProps>(
    'section',
    'Layout',
    'Section',
    'A framed content section with heading and paragraph.',
    RectangleHorizontal,
    {
      title: 'Section heading',
      body: 'Use this as a clean content container for grouped information.',
    },
    { backgroundColor: '#f8fafc', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderColumnsBlockProps>(
    'columns',
    'Layout',
    'Columns',
    'Two or three content columns for features or comparisons.',
    Columns2,
    {
      heading: 'Show information side by side',
      columns: [
        { title: 'Column one', body: 'Explain the first point, feature, or service here.' },
        { title: 'Column two', body: 'Use this second column for another related detail.' },
        { title: 'Column three', body: 'Add a third column when you need a fuller layout.' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderCardBlockProps>(
    'card',
    'Layout',
    'Card',
    'A focused content card with short copy and action.',
    CreditCard,
    {
      title: 'Professional card title',
      body: 'Summarize one service, offer, announcement, or key page section.',
      ctaLabel: 'Learn more',
      ctaHref: '/learn-more',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderGalleryBlockProps>(
    'gallery',
    'Media',
    'Gallery',
    'A responsive image gallery for portfolio or product visuals.',
    GalleryVertical,
    {
      heading: 'Project gallery',
      images: galleryPlaceholderImages.map((imageUrl, index) => ({
        imageUrl,
        altText: `Gallery image ${index + 1}`,
        caption: `Gallery item ${index + 1}`,
      })),
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderVideoBlockProps>(
    'video',
    'Media',
    'Video',
    'An embedded video section for explainers or demos.',
    MonitorPlay,
    {
      title: 'Watch the overview',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      caption: 'Replace this with your YouTube or embed URL.',
    },
    { backgroundColor: '#ffffff', textAlign: 'center' }
  ),
  buildBlock<VibeBuilderMapBlockProps>(
    'map',
    'Media',
    'Map',
    'A location section with embedded map and address details.',
    MapPinned,
    {
      title: 'Find us',
      embedUrl:
        'https://www.google.com/maps?q=Zurich&output=embed',
      address: 'Add your business address here.',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderFormBlockProps>(
    'form',
    'Business',
    'Form',
    'A contact form layout with editable fields and button.',
    Blocks,
    {
      title: 'Send us a message',
      description: 'Collect inquiries, project requests, or support questions.',
      buttonLabel: 'Send message',
      fields: [
        { label: 'Name', type: 'text', placeholder: 'Your name' },
        { label: 'Email', type: 'email', placeholder: 'name@example.com' },
        { label: 'Message', type: 'textarea', placeholder: 'Tell us what you need' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderPricingTableBlockProps>(
    'pricing-table',
    'Business',
    'Pricing table',
    'Three pricing plans with features and call-to-action buttons.',
    BadgeHelp,
    {
      heading: 'Simple pricing for every stage',
      plans: [
        {
          name: 'Starter',
          price: '$29/mo',
          description: 'For small teams starting out.',
          features: ['1 project', 'Email support', 'Basic analytics'],
          ctaLabel: 'Choose Starter',
        },
        {
          name: 'Growth',
          price: '$79/mo',
          description: 'For growing teams with more traffic.',
          features: ['5 projects', 'Priority support', 'Advanced analytics'],
          ctaLabel: 'Choose Growth',
        },
        {
          name: 'Scale',
          price: '$149/mo',
          description: 'For businesses running multiple campaigns.',
          features: ['Unlimited projects', 'Dedicated success manager', 'Custom reporting'],
          ctaLabel: 'Choose Scale',
        },
      ],
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTestimonialsBlockProps>(
    'testimonials',
    'Business',
    'Testimonials',
    'Customer quotes to build trust and social proof.',
    Quote,
    {
      heading: 'What clients are saying',
      testimonials: [
        { quote: 'The team made the process smooth and professional from start to finish.', name: 'Maya Chen', role: 'Founder' },
        { quote: 'We launched faster than expected and the site finally reflects our brand.', name: 'Jonas Weber', role: 'Creative Director' },
        { quote: 'The structure is simple enough for our team to update without developers.', name: 'Aisha Rahman', role: 'Operations Lead' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderFaqBlockProps>(
    'faq',
    'Business',
    'FAQ',
    'Collapsible answers for common customer questions.',
    BadgeHelp,
    {
      heading: 'Frequently asked questions',
      items: [
        { question: 'How long does setup take?', answer: 'Most sites can be drafted in a single session and refined over time.' },
        { question: 'Can I update the content myself?', answer: 'Yes. All text, links, and media are editable from the builder.' },
        { question: 'Does this work on mobile?', answer: 'The default layouts are responsive and adapt across screen sizes.' },
        { question: 'Can I publish multiple pages?', answer: 'Yes. You can create and publish multiple pages inside the same site.' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTeamBlockProps>(
    'team',
    'Business',
    'Team',
    'Profile cards for introducing founders or team members.',
    Users,
    {
      heading: 'Meet the team',
      members: [
        {
          name: 'Amelia Stone',
          role: 'Founder & Strategist',
          bio: 'Leads strategy, positioning, and growth planning for clients.',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
        },
        {
          name: 'Daniel Kim',
          role: 'Design Lead',
          bio: 'Shapes the visual system and UX for polished digital experiences.',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
        },
        {
          name: 'Sofia Martin',
          role: 'Client Success',
          bio: 'Keeps projects moving and helps teams get value after launch.',
          imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=80',
        },
      ],
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderServicesBlockProps>(
    'services',
    'Business',
    'Services',
    'A simple services grid for offers or capabilities.',
    Briefcase,
    {
      heading: 'What we do',
      services: [
        { title: 'Strategy', description: 'Clarify messaging, audience, and business goals.' },
        { title: 'Design', description: 'Create a clean visual direction that feels credible and modern.' },
        { title: 'Launch support', description: 'Get the site live and ready for real visitors.' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderStatsBlockProps>(
    'stats',
    'Business',
    'Stats',
    'Highlight key numbers, milestones, or business metrics.',
    LineChart,
    {
      heading: 'Results at a glance',
      stats: [
        { label: 'Projects launched', value: '120+' },
        { label: 'Countries served', value: '14' },
        { label: 'Client satisfaction', value: '98%' },
        { label: 'Years of experience', value: '10' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'center' }
  ),
  buildBlock<VibeBuilderCtaSectionBlockProps>(
    'cta-section',
    'Business',
    'CTA section',
    'A polished call-to-action strip for conversions.',
    PanelsTopLeft,
    {
      heading: 'Ready to move forward?',
      body: 'Use this section to guide visitors into a call, signup, or next step.',
      buttonLabel: 'Book a consultation',
      buttonHref: '/contact',
    },
    { backgroundColor: '#111827', textAlign: 'center' }
  ),
  buildBlock<VibeBuilderProductBlockProps>(
    'product',
    'Business',
    'Product block',
    'A single product or offer card with image, pricing, and action.',
    Package,
    {
      title: 'Featured product',
      price: '$149',
      description: 'Describe the product, service package, or featured offer in a few short lines.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      buttonLabel: 'Buy now',
      buttonHref: '/shop',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderNavbarBlockProps>(
    'navbar',
    'Advanced',
    'Navbar',
    'A page navigation bar with links and optional action button.',
    PanelTop,
    {
      logoText: 'Brand name',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
      ],
      ctaLabel: 'Get started',
      ctaHref: '/contact',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderFooterBlockProps>(
    'footer',
    'Advanced',
    'Footer',
    'A full footer with brand, links, social links, and copyright.',
    Footprints,
    {
      logoText: 'Brand name',
      blurb: 'A short brand summary or contact statement for the bottom of the page.',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Contact', href: '/contact' },
      ],
      socialLinks: [
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
      ],
      copyright: '© 2026 Brand name. All rights reserved.',
    },
    { backgroundColor: '#0f172a', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTabsBlockProps>(
    'tabs',
    'Advanced',
    'Tabs',
    'Tabbed content for organizing grouped information.',
    FolderKanban,
    {
      tabs: [
        { label: 'Overview', content: 'Use this tab for an overview or summary.' },
        { label: 'Details', content: 'Use this tab for more detail, specs, or process notes.' },
        { label: 'FAQ', content: 'Use this tab for support or quick answers.' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderCarouselBlockProps>(
    'carousel',
    'Advanced',
    'Carousel',
    'A slide-based showcase for featured content or campaigns.',
    Camera,
    {
      slides: [
        {
          title: 'First slide',
          description: 'Highlight one campaign, offer, or project.',
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
        },
        {
          title: 'Second slide',
          description: 'Use another slide for a related feature or story.',
          imageUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80',
        },
        {
          title: 'Third slide',
          description: 'A final slide can reinforce the main message or CTA.',
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
        },
      ],
    },
    { textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTimelineBlockProps>(
    'timeline',
    'Advanced',
    'Timeline',
    'A chronological timeline for milestones, process, or company story.',
    Timer,
    {
      heading: 'Project timeline',
      events: [
        { year: 'Step 1', title: 'Discovery', description: 'Define goals, audience, and direction.' },
        { year: 'Step 2', title: 'Design', description: 'Shape the structure, visuals, and content hierarchy.' },
        { year: 'Step 3', title: 'Launch', description: 'Review final content, publish, and go live.' },
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderTableBlockProps>(
    'table',
    'Advanced',
    'Table',
    'A simple comparison or information table.',
    Table2,
    {
      caption: 'Feature comparison',
      columns: ['Plan', 'Users', 'Support'],
      rows: [
        ['Starter', '3', 'Email'],
        ['Growth', '10', 'Priority'],
        ['Scale', 'Unlimited', 'Dedicated'],
      ],
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderCodeEmbedBlockProps>(
    'code-embed',
    'Advanced',
    'Code / Embed',
    'Embed custom HTML or show code snippets.',
    Code2,
    {
      title: 'Embed section',
      embedHtml: '<div style="padding:24px;border:1px solid #e2e8f0;border-radius:16px;text-align:center;">Paste custom embed HTML here</div>',
      codeSnippet: '<script>/* Add custom widget code here */</script>',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
  buildBlock<VibeBuilderBlogArticleBlockProps>(
    'blog-article',
    'Advanced',
    'Blog / Article',
    'A blog feature block with excerpt and read-more action.',
    BookOpen,
    {
      title: 'Article title goes here',
      author: 'Author name',
      date: 'May 2026',
      excerpt: 'Use this block for a featured blog post, insight article, or newsroom highlight.',
      buttonLabel: 'Read more',
      buttonHref: '/blog/article',
    },
    { backgroundColor: '#ffffff', textAlign: 'left' }
  ),
];

export const vibeBuilderBlockCategories: VibeBuilderBlockCategory[] = [
  'Basic',
  'Layout',
  'Media',
  'Business',
  'Advanced',
];

export const vibeBuilderBlockDefinitionsByType = Object.fromEntries(
  vibeBuilderBlockDefinitions.map((definition) => [definition.type, definition])
) as Record<VibeBuilderLayoutBlock['type'], VibeBuilderBlockDefinition>;

export const createDefaultBlock = (type: VibeBuilderLayoutBlock['type']) =>
  vibeBuilderBlockDefinitionsByType[type].create();

export const getBlockTitle = (block: VibeBuilderLayoutBlock) =>
  vibeBuilderBlockDefinitionsByType[block.type]?.label || 'Block';
