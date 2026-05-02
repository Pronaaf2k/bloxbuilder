import { useQueryClient } from '@tanstack/react-query';
import { useGlobalMutation, useGlobalQuery } from '@/state/query-client/hooks';
import {
  addSite,
  addSitePage,
  addSitePageLayout,
  deleteSite,
  deleteSitePage,
  getSitePageLayouts,
  getSitePages,
  getSites,
  updateSite,
  updateSitePage,
  updateSitePageLayout,
} from '../services/vibe-builder.service';
import type {
  AddSitePageParams,
  AddSitePageLayoutParams,
  AddSiteParams,
  PaginationParams,
  UpdateSitePageParams,
  UpdateSitePageLayoutParams,
  UpdateSiteParams,
} from '../types/vibe-builder.types';

export const VIBE_BUILDER_QUERY_KEYS = {
  sites: 'vibe-builder-sites',
  sitePages: 'vibe-builder-site-pages',
  sitePageLayouts: 'vibe-builder-site-page-layouts',
} as const;

export const useGetSites = (params: PaginationParams) => {
  return useGlobalQuery({
    suppressAuthRedirect: true,
    queryKey: [VIBE_BUILDER_QUERY_KEYS.sites, params] as const,
    queryFn: getSites,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetSitePages = (params: PaginationParams) => {
  return useGlobalQuery({
    suppressAuthRedirect: true,
    queryKey: [VIBE_BUILDER_QUERY_KEYS.sitePages, params] as const,
    queryFn: getSitePages,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetSitePageLayouts = (params: PaginationParams) => {
  return useGlobalQuery({
    suppressAuthRedirect: true,
    queryKey: [VIBE_BUILDER_QUERY_KEYS.sitePageLayouts, params] as const,
    queryFn: getSitePageLayouts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAddSite = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: AddSiteParams) => addSite(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sites,
      });
    },
  });
};

export const useUpdateSite = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: UpdateSiteParams) => updateSite(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sites,
      });
    },
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: ({ filter, input }: { filter: string; input: { isHardDelete: boolean } }) =>
      deleteSite(filter, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sites,
      });
    },
  });
};

export const useAddSitePage = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: AddSitePageParams) => addSitePage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sitePages,
      });
    },
  });
};

export const useUpdateSitePage = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: UpdateSitePageParams) => updateSitePage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sitePages,
      });
    },
  });
};

export const useDeleteSitePage = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: ({ filter, input }: { filter: string; input: { isHardDelete: boolean } }) =>
      deleteSitePage(filter, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sitePages,
      });
    },
  });
};

export const useAddSitePageLayout = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: AddSitePageLayoutParams) => addSitePageLayout(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sitePageLayouts,
      });
    },
  });
};

export const useUpdateSitePageLayout = () => {
  const queryClient = useQueryClient();

  return useGlobalMutation({
    suppressToast: true,
    suppressAuthRedirect: true,
    mutationFn: (params: UpdateSitePageLayoutParams) => updateSitePageLayout(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === VIBE_BUILDER_QUERY_KEYS.sitePageLayouts,
      });
    },
  });
};
