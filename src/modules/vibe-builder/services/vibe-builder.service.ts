import { graphqlClient } from '@/lib/graphql-client';
import {
  DELETE_SITE_MUTATION,
  DELETE_SITE_PAGE_MUTATION,
  INSERT_SITE_MUTATION,
  INSERT_SITE_PAGE_MUTATION,
  INSERT_SITE_PAGE_LAYOUT_MUTATION,
  UPDATE_SITE_MUTATION,
  UPDATE_SITE_PAGE_MUTATION,
  UPDATE_SITE_PAGE_LAYOUT_MUTATION,
} from '../graphql/mutations';
import {
  GET_SITE_PAGE_LAYOUTS_QUERY,
  GET_SITE_PAGES_QUERY,
  GET_SITES_QUERY,
} from '../graphql/queries';
import type {
  AddSitePageParams,
  AddSitePageResponse,
  AddSitePageInput,
  AddSitePageLayoutInput,
  AddSitePageLayoutParams,
  AddSitePageLayoutResponse,
  AddSiteParams,
  AddSiteResponse,
  DeleteSitePageResponse,
  DeleteSiteResponse,
  GetSitePageLayoutsResponse,
  GetSitePagesResponse,
  GetSitesResponse,
  PaginatedItems,
  PaginationParams,
  UpdateSiteInput,
  UpdateSitePageParams,
  UpdateSitePageInput,
  UpdateSitePageResponse,
  UpdateSitePageLayoutInput,
  UpdateSitePageLayoutParams,
  UpdateSitePageLayoutResponse,
  UpdateSiteParams,
  UpdateSiteResponse,
  VibeBuilderSitePageLayout,
  VibeBuilderSite,
  VibeBuilderSitePage,
} from '../types/vibe-builder.types';

type QueryContext = {
  queryKey: readonly [string, PaginationParams];
};

const normalizeInput = ({ pageNo, pageSize, filter = {}, sort = {} }: PaginationParams) => {
  const input: Record<string, unknown> = { pageNo, pageSize };

  if (Object.keys(filter).length > 0) {
    input.filter = JSON.stringify(filter);
  }

  if (Object.keys(sort).length > 0) {
    input.sort = JSON.stringify(sort);
  }

  return input;
};

const getPaginatedResult = <T>(
  response: unknown,
  fieldName: string,
  defaultPageNo: number,
  defaultPageSize: number
): PaginatedItems<T> => {
  const responseData = (response as { data?: unknown })?.data ?? response;
  const paginatedResponse = (responseData as Record<string, PaginatedItems<T>> | undefined)?.[
    fieldName
  ];

  return {
    hasNextPage: paginatedResponse?.hasNextPage ?? false,
    hasPreviousPage: paginatedResponse?.hasPreviousPage ?? false,
    totalCount: paginatedResponse?.totalCount ?? 0,
    totalPages: paginatedResponse?.totalPages ?? 0,
    pageSize: paginatedResponse?.pageSize ?? defaultPageSize,
    pageNo: paginatedResponse?.pageNo ?? defaultPageNo,
    items: Array.isArray(paginatedResponse?.items) ? paginatedResponse.items : [],
  };
};

const pickDefinedFields = <T extends Record<string, unknown>>(
  input: T,
  allowedFields: readonly string[]
) => {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    )
  );
};

const SITE_INSERT_FIELDS = [
  'OwnerUserId',
  'OrganizationIds',
  'Name',
  'Slug',
  'Description',
  'Status',
  'ThemeConfig',
  'HomePageId',
  'PublishedRevisionId',
  'Tags',
] as const;

const SITE_UPDATE_FIELDS = [
  'OwnerUserId',
  'OrganizationIds',
  'Name',
  'Slug',
  'Description',
  'Status',
  'ThemeConfig',
  'HomePageId',
  'PublishedRevisionId',
  'Tags',
] as const;

const SITE_PAGE_INSERT_FIELDS = [
  'SiteId',
  'Name',
  'Slug',
  'Order',
  'IsHomePage',
  'SeoTitle',
  'SeoDescription',
  'DraftLayoutVersion',
  'PublishedLayoutVersion',
  'OrganizationIds',
  'Tags',
] as const;

const SITE_PAGE_UPDATE_FIELDS = [
  'SiteId',
  'Name',
  'Slug',
  'Order',
  'IsHomePage',
  'SeoTitle',
  'SeoDescription',
  'DraftLayoutVersion',
  'PublishedLayoutVersion',
  'OrganizationIds',
  'Tags',
] as const;

const SITE_PAGE_LAYOUT_INSERT_FIELDS = [
  'SiteId',
  'PageId',
  'Version',
  'Status',
  'LayoutJson',
  'SchemaVersion',
  'PreviewImageUrl',
  'OrganizationIds',
  'Tags',
] as const;

const SITE_PAGE_LAYOUT_UPDATE_FIELDS = [
  'SiteId',
  'PageId',
  'Version',
  'Status',
  'LayoutJson',
  'SchemaVersion',
  'PreviewImageUrl',
  'OrganizationIds',
  'Tags',
] as const;

const sanitizeSiteInsertInput = (input: AddSiteParams['input']) => {
  return pickDefinedFields(input, SITE_INSERT_FIELDS);
};

const sanitizeSiteUpdateInput = (input: UpdateSiteInput) => {
  return pickDefinedFields(input, SITE_UPDATE_FIELDS);
};

const sanitizeSitePageInsertInput = (input: AddSitePageInput) => {
  return pickDefinedFields(input, SITE_PAGE_INSERT_FIELDS);
};

const sanitizeSitePageUpdateInput = (input: UpdateSitePageInput) => {
  return pickDefinedFields(input, SITE_PAGE_UPDATE_FIELDS);
};

const sanitizeSitePageLayoutInsertInput = (input: AddSitePageLayoutInput) => {
  return pickDefinedFields(input, SITE_PAGE_LAYOUT_INSERT_FIELDS);
};

const sanitizeSitePageLayoutUpdateInput = (input: UpdateSitePageLayoutInput) => {
  return pickDefinedFields(input, SITE_PAGE_LAYOUT_UPDATE_FIELDS);
};

export const buildItemIdFilter = (itemId: string) => JSON.stringify({ _id: itemId });

export const buildSitesOwnershipFilter = (params: {
  ownerUserId: string;
  organizationId?: string | null;
  additionalFilters?: Record<string, unknown>;
}) => {
  const { ownerUserId, organizationId, additionalFilters = {} } = params;

  return {
    OwnerUserId: ownerUserId,
    ...(organizationId ? { OrganizationIds: { $in: [organizationId] } } : {}),
    ...additionalFilters,
  };
};

export const buildSitePagesFilter = (params: {
  siteId: string;
  organizationId?: string | null;
  additionalFilters?: Record<string, unknown>;
}) => {
  const { siteId, organizationId, additionalFilters = {} } = params;

  return {
    SiteId: siteId,
    ...(organizationId ? { OrganizationIds: { $in: [organizationId] } } : {}),
    ...additionalFilters,
  };
};

export const getSites = async (context: QueryContext): Promise<GetSitesResponse['Sites']> => {
  const [, params] = context.queryKey;
  const response = await graphqlClient.query<GetSitesResponse>({
    query: GET_SITES_QUERY,
    variables: {
      input: normalizeInput(params),
    },
  });

  return getPaginatedResult<VibeBuilderSite>(response, 'getSites', params.pageNo, params.pageSize);
};

export const getSitePages = async (
  context: QueryContext
): Promise<GetSitePagesResponse['SitePages']> => {
  const [, params] = context.queryKey;
  const response = await graphqlClient.query<GetSitePagesResponse>({
    query: GET_SITE_PAGES_QUERY,
    variables: {
      input: normalizeInput(params),
    },
  });

  return getPaginatedResult<VibeBuilderSitePage>(
    response,
    'getSitePages',
    params.pageNo,
    params.pageSize
  );
};

export const getSitePageLayouts = async (
  context: QueryContext
): Promise<GetSitePageLayoutsResponse['SitePageLayouts']> => {
  const [, params] = context.queryKey;
  const response = await graphqlClient.query<GetSitePageLayoutsResponse>({
    query: GET_SITE_PAGE_LAYOUTS_QUERY,
    variables: {
      input: normalizeInput(params),
    },
  });

  return getPaginatedResult<VibeBuilderSitePageLayout>(
    response,
    'getSitePageLayouts',
    params.pageNo,
    params.pageSize
  );
};

export const addSite = async (params: AddSiteParams): Promise<AddSiteResponse> => {
  return graphqlClient.mutate<AddSiteResponse>({
    query: INSERT_SITE_MUTATION,
    variables: {
      input: sanitizeSiteInsertInput(params.input),
    },
  });
};

export const updateSite = async (params: UpdateSiteParams): Promise<UpdateSiteResponse> => {
  return graphqlClient.mutate<UpdateSiteResponse>({
    query: UPDATE_SITE_MUTATION,
    variables: {
      filter: params.filter,
      input: sanitizeSiteUpdateInput(params.input),
    },
  });
};

export const deleteSite = async (
  filter: string,
  input: { isHardDelete: boolean }
): Promise<DeleteSiteResponse> => {
  return graphqlClient.mutate<DeleteSiteResponse>({
    query: DELETE_SITE_MUTATION,
    variables: { filter, input },
  });
};

export const addSitePage = async (params: AddSitePageParams): Promise<AddSitePageResponse> => {
  return graphqlClient.mutate<AddSitePageResponse>({
    query: INSERT_SITE_PAGE_MUTATION,
    variables: {
      input: sanitizeSitePageInsertInput(params.input),
    },
  });
};

export const updateSitePage = async (
  params: UpdateSitePageParams
): Promise<UpdateSitePageResponse> => {
  return graphqlClient.mutate<UpdateSitePageResponse>({
    query: UPDATE_SITE_PAGE_MUTATION,
    variables: {
      filter: params.filter,
      input: sanitizeSitePageUpdateInput(params.input),
    },
  });
};

export const deleteSitePage = async (
  filter: string,
  input: { isHardDelete: boolean }
): Promise<DeleteSitePageResponse> => {
  return graphqlClient.mutate<DeleteSitePageResponse>({
    query: DELETE_SITE_PAGE_MUTATION,
    variables: { filter, input },
  });
};

export const addSitePageLayout = async (
  params: AddSitePageLayoutParams
): Promise<AddSitePageLayoutResponse> => {
  return graphqlClient.mutate<AddSitePageLayoutResponse>({
    query: INSERT_SITE_PAGE_LAYOUT_MUTATION,
    variables: {
      input: sanitizeSitePageLayoutInsertInput(params.input),
    },
  });
};

export const updateSitePageLayout = async (
  params: UpdateSitePageLayoutParams
): Promise<UpdateSitePageLayoutResponse> => {
  return graphqlClient.mutate<UpdateSitePageLayoutResponse>({
    query: UPDATE_SITE_PAGE_LAYOUT_MUTATION,
    variables: {
      filter: params.filter,
      input: sanitizeSitePageLayoutUpdateInput(params.input),
    },
  });
};
