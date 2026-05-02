export type VibeBuilderStatus = 'draft' | 'published' | 'archived';

export type VibeBuilderBlockCategory = 'Basic' | 'Layout' | 'Media' | 'Business' | 'Advanced';

export interface VibeBuilderThemeConfig {
  presetId?: string;
  templateId?: string;
  appearanceMode?: 'light' | 'dark';
  palette?: string;
  fontHeading?: string;
  fontBody?: string;
  headingScale?: number;
  bodyScale?: number;
}

export interface VibeBuilderSite {
  ItemId: string;
  OwnerUserId: string;
  OrganizationIds?: string[];
  Name: string;
  Slug: string;
  Description?: string;
  Status?: VibeBuilderStatus;
  ThemeConfig?: VibeBuilderThemeConfig | string | null;
  HomePageId?: string;
  PublishedRevisionId?: string;
  CreatedBy?: string;
  CreatedDate?: string;
  LastUpdatedBy?: string;
  LastUpdatedDate?: string;
  IsDeleted?: boolean;
  Language?: string;
  Tags?: string[];
}

export interface VibeBuilderSitePage {
  ItemId: string;
  SiteId: string;
  Name: string;
  Slug: string;
  Order: number;
  IsHomePage?: boolean;
  SeoTitle?: string;
  SeoDescription?: string;
  DraftLayoutVersion?: number;
  PublishedLayoutVersion?: number;
  CreatedBy?: string;
  CreatedDate?: string;
  LastUpdatedBy?: string;
  LastUpdatedDate?: string;
  IsDeleted?: boolean;
  Language?: string;
  OrganizationIds?: string[];
  Tags?: string[];
}

export interface VibeBuilderSitePageLayout {
  ItemId: string;
  SiteId: string;
  PageId: string;
  Version: number;
  Status: 'draft' | 'published';
  LayoutJson: string;
  SchemaVersion?: number;
  PreviewImageUrl?: string;
  CreatedBy?: string;
  CreatedDate?: string;
  LastUpdatedBy?: string;
  LastUpdatedDate?: string;
  IsDeleted?: boolean;
  Language?: string;
  OrganizationIds?: string[];
  Tags?: string[];
}

export type VibeBuilderBlockType =
  | 'hero'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'icon'
  | 'social-links'
  | 'section'
  | 'columns'
  | 'card'
  | 'gallery'
  | 'video'
  | 'form'
  | 'map'
  | 'navbar'
  | 'footer'
  | 'pricing-table'
  | 'testimonials'
  | 'faq'
  | 'team'
  | 'services'
  | 'stats'
  | 'cta-section'
  | 'tabs'
  | 'carousel'
  | 'timeline'
  | 'table'
  | 'code-embed'
  | 'product'
  | 'blog-article';

export interface VibeBuilderHeroBlockProps {
  headline: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface VibeBuilderTextBlockProps {
  title: string;
  body: string;
}

export interface VibeBuilderHeadingBlockProps {
  text: string;
  level: 'h1' | 'h2' | 'h3';
  subtext: string;
}

export interface VibeBuilderImageBlockProps {
  imageUrl: string;
  altText: string;
  caption: string;
}

export interface VibeBuilderButtonBlockProps {
  label: string;
  href: string;
}

export interface VibeBuilderDividerBlockProps {
  label: string;
}

export interface VibeBuilderSpacerBlockProps {
  height: number;
}

export interface VibeBuilderSocialLinksBlockProps {
  heading: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface VibeBuilderIconBlockProps {
  icon: string;
  title: string;
  body: string;
}

export interface VibeBuilderSectionBlockProps {
  title: string;
  body: string;
}

export interface VibeBuilderColumnsBlockProps {
  heading: string;
  columns: Array<{
    title: string;
    body: string;
  }>;
}

export interface VibeBuilderCardBlockProps {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface VibeBuilderGalleryBlockProps {
  heading: string;
  images: Array<{
    imageUrl: string;
    altText: string;
    caption: string;
  }>;
}

export interface VibeBuilderVideoBlockProps {
  title: string;
  videoUrl: string;
  caption: string;
}

export interface VibeBuilderFormBlockProps {
  title: string;
  description: string;
  buttonLabel: string;
  fields: Array<{
    label: string;
    type: 'text' | 'email' | 'textarea';
    placeholder: string;
  }>;
}

export interface VibeBuilderMapBlockProps {
  title: string;
  embedUrl: string;
  address: string;
}

export interface VibeBuilderNavbarBlockProps {
  logoText: string;
  links: Array<{
    label: string;
    href: string;
  }>;
  ctaLabel: string;
  ctaHref: string;
}

export interface VibeBuilderFooterBlockProps {
  logoText: string;
  blurb: string;
  links: Array<{
    label: string;
    href: string;
  }>;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
  copyright: string;
}

export interface VibeBuilderPricingTableBlockProps {
  heading: string;
  plans: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    ctaLabel: string;
  }>;
}

export interface VibeBuilderTestimonialsBlockProps {
  heading: string;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
  }>;
}

export interface VibeBuilderFaqBlockProps {
  heading: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface VibeBuilderTeamBlockProps {
  heading: string;
  members: Array<{
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
  }>;
}

export interface VibeBuilderServicesBlockProps {
  heading: string;
  services: Array<{
    title: string;
    description: string;
  }>;
}

export interface VibeBuilderStatsBlockProps {
  heading: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export interface VibeBuilderCtaSectionBlockProps {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface VibeBuilderTabsBlockProps {
  tabs: Array<{
    label: string;
    content: string;
  }>;
}

export interface VibeBuilderCarouselBlockProps {
  slides: Array<{
    title: string;
    description: string;
    imageUrl: string;
  }>;
}

export interface VibeBuilderTimelineBlockProps {
  heading: string;
  events: Array<{
    year: string;
    title: string;
    description: string;
  }>;
}

export interface VibeBuilderTableBlockProps {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface VibeBuilderCodeEmbedBlockProps {
  title: string;
  embedHtml: string;
  codeSnippet: string;
}

export interface VibeBuilderProductBlockProps {
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface VibeBuilderBlogArticleBlockProps {
  title: string;
  author: string;
  date: string;
  excerpt: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface VibeBuilderBlockStyle {
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface VibeBuilderLayoutBlock {
  id: string;
  type: VibeBuilderBlockType;
  props:
    | VibeBuilderHeroBlockProps
    | VibeBuilderHeadingBlockProps
    | VibeBuilderTextBlockProps
    | VibeBuilderImageBlockProps
    | VibeBuilderButtonBlockProps
    | VibeBuilderDividerBlockProps
    | VibeBuilderSpacerBlockProps
    | VibeBuilderIconBlockProps
    | VibeBuilderSocialLinksBlockProps
    | VibeBuilderSectionBlockProps
    | VibeBuilderColumnsBlockProps
    | VibeBuilderCardBlockProps
    | VibeBuilderGalleryBlockProps
    | VibeBuilderVideoBlockProps
    | VibeBuilderFormBlockProps
    | VibeBuilderMapBlockProps
    | VibeBuilderNavbarBlockProps
    | VibeBuilderFooterBlockProps
    | VibeBuilderPricingTableBlockProps
    | VibeBuilderTestimonialsBlockProps
    | VibeBuilderFaqBlockProps
    | VibeBuilderTeamBlockProps
    | VibeBuilderServicesBlockProps
    | VibeBuilderStatsBlockProps
    | VibeBuilderCtaSectionBlockProps
    | VibeBuilderTabsBlockProps
    | VibeBuilderCarouselBlockProps
    | VibeBuilderTimelineBlockProps
    | VibeBuilderTableBlockProps
    | VibeBuilderCodeEmbedBlockProps
    | VibeBuilderProductBlockProps
    | VibeBuilderBlogArticleBlockProps;
  style?: VibeBuilderBlockStyle;
}

export interface VibeBuilderBlockDefinition {
  type: VibeBuilderBlockType;
  category: VibeBuilderBlockCategory;
  label: string;
  description: string;
  icon: any;
  create: () => VibeBuilderLayoutBlock;
}

export interface VibeBuilderPageLayoutDocument {
  schemaVersion: number;
  page: {
    id: string;
    title: string;
    slug: string;
  };
  blocks: VibeBuilderLayoutBlock[];
}

export interface PaginationParams {
  pageNo: number;
  pageSize: number;
  filter?: Record<string, unknown>;
  sort?: Record<string, unknown>;
}

export interface PaginatedItems<T> {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  totalPages: number;
  pageSize: number;
  pageNo: number;
  items: T[];
}

export interface GetSitesResponse {
  Sites: PaginatedItems<VibeBuilderSite>;
}

export interface GetSitePagesResponse {
  SitePages: PaginatedItems<VibeBuilderSitePage>;
}

export interface GetSitePageLayoutsResponse {
  SitePageLayouts: PaginatedItems<VibeBuilderSitePageLayout>;
}

export interface BaseMutationResponse {
  itemId: string;
  totalImpactedData: number;
  acknowledged: boolean;
}

export interface AddSiteInput {
  OwnerUserId: string;
  OrganizationIds?: string[];
  Name: string;
  Slug: string;
  Description?: string;
  Status?: VibeBuilderStatus;
  ThemeConfig?: VibeBuilderThemeConfig | string | null;
  HomePageId?: string;
  PublishedRevisionId?: string;
  Tags?: string[];
}

export type UpdateSiteInput = Partial<AddSiteInput>;

export interface AddSiteParams {
  input: AddSiteInput;
}

export interface UpdateSiteParams {
  filter: string;
  input: UpdateSiteInput;
}

export interface AddSiteResponse {
  insertSite: BaseMutationResponse;
}

export interface UpdateSiteResponse {
  updateSite: BaseMutationResponse;
}

export interface DeleteSiteResponse {
  deleteSite: BaseMutationResponse;
}

export interface AddSitePageInput {
  SiteId: string;
  Name: string;
  Slug: string;
  Order: number;
  IsHomePage?: boolean;
  SeoTitle?: string;
  SeoDescription?: string;
  DraftLayoutVersion?: number;
  PublishedLayoutVersion?: number;
  OrganizationIds?: string[];
  Tags?: string[];
}

export type UpdateSitePageInput = Partial<AddSitePageInput>;

export interface AddSitePageParams {
  input: AddSitePageInput;
}

export interface UpdateSitePageParams {
  filter: string;
  input: UpdateSitePageInput;
}

export interface AddSitePageResponse {
  insertSitePage: BaseMutationResponse;
}

export interface UpdateSitePageResponse {
  updateSitePage: BaseMutationResponse;
}

export interface DeleteSitePageResponse {
  deleteSitePage: BaseMutationResponse;
}

export interface AddSitePageLayoutInput {
  SiteId: string;
  PageId: string;
  Version: number;
  Status: 'draft' | 'published';
  LayoutJson: string;
  SchemaVersion?: number;
  PreviewImageUrl?: string;
  OrganizationIds?: string[];
  Tags?: string[];
}

export type UpdateSitePageLayoutInput = Partial<AddSitePageLayoutInput>;

export interface AddSitePageLayoutParams {
  input: AddSitePageLayoutInput;
}

export interface UpdateSitePageLayoutParams {
  filter: string;
  input: UpdateSitePageLayoutInput;
}

export interface AddSitePageLayoutResponse {
  insertSitePageLayout: BaseMutationResponse;
}

export interface UpdateSitePageLayoutResponse {
  updateSitePageLayout: BaseMutationResponse;
}
