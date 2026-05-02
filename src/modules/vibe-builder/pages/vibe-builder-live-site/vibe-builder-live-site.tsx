import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { VibeBuilderPageRenderer } from '@/modules/vibe-builder/components/vibe-builder-page-renderer';
import { useGetSitePageLayouts, useGetSitePages, useGetSites } from '@/modules/vibe-builder';
import { buildSitePagesFilter } from '@/modules/vibe-builder/services/vibe-builder.service';

const parseLayoutDocument = (layoutJson: string | undefined, pageId: string, pageName: string, pageSlug: string) => {
  if (!layoutJson) {
    return {
      schemaVersion: 1,
      page: {
        id: pageId,
        title: pageName,
        slug: pageSlug,
      },
      blocks: [],
    };
  }

  try {
    return JSON.parse(layoutJson);
  } catch {
    return {
      schemaVersion: 1,
      page: {
        id: pageId,
        title: pageName,
        slug: pageSlug,
      },
      blocks: [],
    };
  }
};

export const VibeBuilderLiveSitePage = () => {
  const { siteSlug, pageSlug } = useParams();
  const resolvedPageSlug = pageSlug ?? 'home';

  const siteQuery = useGetSites({
    pageNo: 1,
    pageSize: 1,
    filter: {
      Slug: siteSlug,
    },
  });

  const site = siteQuery.data?.items?.[0];

  const pagesQuery = useGetSitePages({
    pageNo: 1,
    pageSize: 50,
    filter: site?.ItemId
      ? buildSitePagesFilter({
          siteId: site.ItemId,
        })
      : { _id: '__vibebuilder_missing_site__' },
    sort: { Order: 1, CreatedDate: 1 },
  });

  const pages = useMemo(() => pagesQuery.data?.items ?? [], [pagesQuery.data?.items]);
  const activePage = useMemo(() => {
    if (!pages.length) {
      return null;
    }

    return (
      pages.find((page) => page.Slug === resolvedPageSlug) ||
      pages.find((page) => page.IsHomePage) ||
      pages[0]
    );
  }, [pages, resolvedPageSlug]);

  const layoutQuery = useGetSitePageLayouts({
    pageNo: 1,
    pageSize: 5,
    filter:
      site?.ItemId && activePage?.ItemId
        ? {
            SiteId: site.ItemId,
            PageId: activePage.ItemId,
            Status: 'published',
          }
        : { _id: '__vibebuilder_missing_layout__' },
    sort: { LastUpdatedDate: -1, CreatedDate: -1 },
  });

  const latestPublishedLayout = layoutQuery.data?.items?.[0];

  if (siteQuery.isLoading || pagesQuery.isLoading || layoutQuery.isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="mt-4 h-6 w-72 rounded bg-muted" />
          <div className="mt-3 h-4 w-96 rounded bg-muted" />
        </section>
      </main>
    );
  }

  if (!site || !activePage) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Page not found</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            The requested site or page could not be found.
          </p>
        </section>
      </main>
    );
  }

  const layoutDocument = parseLayoutDocument(
    latestPublishedLayout?.LayoutJson,
    activePage.ItemId,
    activePage.Name,
    activePage.Slug
  );

  return <VibeBuilderPageRenderer site={site} page={activePage} pages={pages} layout={layoutDocument} />;
};
