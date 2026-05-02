import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  FilePlus2,
  Home,
  PencilRuler,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui-kit/button';
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
import { Input } from '@/components/ui-kit/input';
import { Textarea } from '@/components/ui-kit/textarea';
import { ConfirmationModal } from '@/components/core';
import { useAuthStore } from '@/state/store/auth';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';
import {
  useAddSitePage,
  useDeleteSite,
  useDeleteSitePage,
  useGetSitePages,
  useGetSites,
  useUpdateSite,
  useUpdateSitePage,
} from '@/modules/vibe-builder';
import {
  buildItemIdFilter,
  buildSitePagesFilter,
  buildSitesOwnershipFilter,
} from '@/modules/vibe-builder/services/vibe-builder.service';

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

const renameSiteSchema = z.object({
  name: z.string().trim().min(2, 'Site name must be at least 2 characters long'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters long')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().trim().max(240, 'Description must be 240 characters or less').optional(),
});

const renamePageSchema = z.object({
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

type RenameSiteFormValues = z.infer<typeof renameSiteSchema>;
type RenamePageFormValues = z.infer<typeof renamePageSchema>;

type MutationErrorShape = {
  errors?: Array<{ message?: string }>;
  message?: string;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as MutationErrorShape;
      if (parsed.errors?.[0]?.message) {
        return parsed.errors[0].message;
      }
      return parsed.message || error.message;
    } catch {
      return error.message;
    }
  }

  return 'Unable to complete the request right now.';
};

export const VibeBuilderSiteSettingsPage = () => {
  const { pathname } = useLocation();
  const { siteId } = useParams();
  const [isCreatePageDialogOpen, setIsCreatePageDialogOpen] = useState(false);
  const [isRenameSiteDialogOpen, setIsRenameSiteDialogOpen] = useState(false);
  const [pageToRename, setPageToRename] = useState<VibeBuilderSitePage | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [renameSiteError, setRenameSiteError] = useState<string | null>(null);
  const [renamePageError, setRenamePageError] = useState<string | null>(null);
  const [isDeleteSiteConfirmOpen, setIsDeleteSiteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; name: string } | null>(null);
  const { user, selectedOrgId, accessToken } = useAuthStore();
  const currentUserId = user?.itemId || decodeJWT(accessToken || '')?.user_id || null;
  const addSitePageMutation = useAddSitePage();
  const deleteSiteMutation = useDeleteSite();
  const deleteSitePageMutation = useDeleteSitePage();
  const updateSiteMutation = useUpdateSite();
  const updateSitePageMutation = useUpdateSitePage();
  const navigate = useNavigate();

  const createPageForm = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      name: '',
      slug: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  const renameSiteForm = useForm<RenameSiteFormValues>({
    resolver: zodResolver(renameSiteSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const renamePageForm = useForm<RenamePageFormValues>({
    resolver: zodResolver(renamePageSchema),
    defaultValues: {
      name: '',
      slug: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  const pageNameValue = createPageForm.watch('name');
  const isSlugDirty = Boolean(createPageForm.formState.dirtyFields.slug);
  const renameSiteNameValue = renameSiteForm.watch('name');
  const isRenameSiteSlugDirty = Boolean(renameSiteForm.formState.dirtyFields.slug);
  const renamePageNameValue = renamePageForm.watch('name');
  const isRenamePageSlugDirty = Boolean(renamePageForm.formState.dirtyFields.slug);

  useEffect(() => {
    if (!pageNameValue || isSlugDirty) {
      return;
    }

    createPageForm.setValue('slug', toSlug(pageNameValue), { shouldValidate: true });
  }, [createPageForm, isSlugDirty, pageNameValue]);

  useEffect(() => {
    if (!renameSiteNameValue || isRenameSiteSlugDirty) {
      return;
    }

    renameSiteForm.setValue('slug', toSlug(renameSiteNameValue), { shouldValidate: true });
  }, [isRenameSiteSlugDirty, renameSiteForm, renameSiteNameValue]);

  useEffect(() => {
    if (!renamePageNameValue || isRenamePageSlugDirty) {
      return;
    }

    renamePageForm.setValue('slug', toSlug(renamePageNameValue), { shouldValidate: true });
  }, [isRenamePageSlugDirty, renamePageForm, renamePageNameValue]);

  useEffect(() => {
    if (!pageToRename) {
      return;
    }

    renamePageForm.reset({
      name: pageToRename.Name,
      slug: pageToRename.Slug,
      seoTitle: pageToRename.SeoTitle || '',
      seoDescription: pageToRename.SeoDescription || '',
    });
  }, [pageToRename, renamePageForm]);

  const siteFilter = useMemo(() => {
    if (!siteId || !currentUserId) {
      return { _id: '__vibebuilder_missing_site__' };
    }

    return buildSitesOwnershipFilter({
      ownerUserId: currentUserId,
      organizationId: selectedOrgId,
      additionalFilters: {
        _id: siteId,
      },
    });
  }, [currentUserId, selectedOrgId, siteId]);

  const pageFilter = useMemo(() => {
    if (!siteId) {
      return { _id: '__vibebuilder_missing_site__' };
    }

    return buildSitePagesFilter({
      siteId,
      organizationId: selectedOrgId,
    });
  }, [selectedOrgId, siteId]);

  const siteQuery = useGetSites({
    pageNo: 1,
    pageSize: 1,
    filter: siteFilter,
  });

  const pagesQuery = useGetSitePages({
    pageNo: 1,
    pageSize: 50,
    filter: pageFilter,
    sort: { Order: 1, CreatedDate: 1 },
  });

  const site = siteQuery.data?.items?.[0];
  const pages = pagesQuery.data?.items ?? [];

  useEffect(() => {
    if (!site) {
      return;
    }

    renameSiteForm.reset({
      name: site.Name,
      slug: site.Slug,
      description: site.Description || '',
    });
  }, [renameSiteForm, site]);

  const onCreatePage = async (values: CreatePageFormValues) => {
    if (!siteId) {
      return;
    }

    setSubmitError(null);

    try {
      const response = await addSitePageMutation.mutateAsync({
        input: {
          SiteId: siteId,
          Name: values.name.trim(),
          Slug: values.slug.trim(),
          Order: pages.length,
          IsHomePage: pages.length === 0,
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
        navigate(`/vibe-builder/${siteId}/editor/${response.insertSitePage.itemId}`);
      }
    } catch (error) {
      const message = getMutationErrorMessage(error);
      setSubmitError(message);
    }
  };

  const onRenameSite = async (values: RenameSiteFormValues) => {
    if (!siteId) {
      return;
    }

    setRenameSiteError(null);

    try {
      await updateSiteMutation.mutateAsync({
        filter: buildItemIdFilter(siteId),
        input: {
          Name: values.name.trim(),
          Slug: values.slug.trim(),
          Description: values.description?.trim() || undefined,
        },
      });

      setIsRenameSiteDialogOpen(false);
    } catch (error) {
      setRenameSiteError(getMutationErrorMessage(error));
    }
  };

  const onRenamePage = async (values: RenamePageFormValues) => {
    if (!pageToRename) {
      return;
    }

    setRenamePageError(null);

    try {
      await updateSitePageMutation.mutateAsync({
        filter: buildItemIdFilter(pageToRename.ItemId),
        input: {
          Name: values.name.trim(),
          Slug: values.slug.trim(),
          SeoTitle: values.seoTitle?.trim() || undefined,
          SeoDescription: values.seoDescription?.trim() || undefined,
        },
      });

      setPageToRename(null);
    } catch (error) {
      setRenamePageError(getMutationErrorMessage(error));
    }
  };

  const onDeleteSite = async () => {
    if (!siteId) {
      return;
    }

    await deleteSiteMutation.mutateAsync({
      filter: buildItemIdFilter(siteId),
      input: { isHardDelete: false },
    });

    navigate('/vibe-builder');
  };

  const onDeletePage = async () => {
    if (!pageToDelete) {
      return;
    }

    await deleteSitePageMutation.mutateAsync({
      filter: buildItemIdFilter(pageToDelete.id),
      input: { isHardDelete: false },
    });

    setPageToDelete(null);
  };

  const updatePageOrder = async (pageIdToMove: string, direction: 'up' | 'down') => {
    const currentIndex = pages.findIndex((page) => page.ItemId === pageIdToMove);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) {
      return;
    }

    const currentPage = pages[currentIndex];
    const targetPage = pages[targetIndex];

    await Promise.all([
      updateSitePageMutation.mutateAsync({
        filter: buildItemIdFilter(currentPage.ItemId),
        input: {
          Order: targetPage.Order,
        },
      }),
      updateSitePageMutation.mutateAsync({
        filter: buildItemIdFilter(targetPage.ItemId),
        input: {
          Order: currentPage.Order,
        },
      }),
    ]);
  };

  const setHomePage = async (nextHomePage: VibeBuilderSitePage) => {
    if (!siteId || !site) {
      return;
    }

    const pageMutations = pages.map((page) =>
      updateSitePageMutation.mutateAsync({
        filter: buildItemIdFilter(page.ItemId),
        input: {
          IsHomePage: page.ItemId === nextHomePage.ItemId,
        },
      })
    );

    await Promise.all([
      updateSiteMutation.mutateAsync({
        filter: buildItemIdFilter(siteId),
        input: {
          HomePageId: nextHomePage.ItemId,
        },
      }),
      ...pageMutations,
    ]);
  };

  return (
    <main className="flex w-full flex-col gap-6" role="main" aria-label="VibeBuilder Site Settings">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Site settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage pages, navigation order, and entry points for this website project.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setIsCreatePageDialogOpen(true)}>
            <FilePlus2 className="h-4 w-4" />
            Create page
          </Button>
          <Button variant="outline" onClick={() => setIsRenameSiteDialogOpen(true)}>
            <SquarePen className="h-4 w-4" />
            Rename site
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteSiteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete site
          </Button>
          <Link to="/vibe-builder" className={buttonVariants({ variant: 'outline' })}>
            <ArrowLeft className="h-4 w-4" />
            Back to sites
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Site overview</CardTitle>
            <CardDescription>Current site context and publishing entry points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {siteQuery.error ? (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-5 text-sm text-muted-foreground">
                Unable to load this site yet. Confirm the `Site` schema exists and this route is
                using a valid record id from the dashboard.
              </div>
            ) : siteQuery.isLoading ? (
              <div className="space-y-3">
                <div className="h-6 w-40 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
              </div>
            ) : site ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{site.Name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">/{site.Slug}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {site.Description || 'No site description has been added yet.'}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border bg-background p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Site status
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">{site.Status ?? 'draft'}</div>
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Current site id
                    </div>
                    <div className="mt-2 break-all text-sm font-medium text-foreground">{siteId}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/site/${site.Slug}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Preview route
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
                No site record was found for this route yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>
              Create and open pages for this site. Page ordering, rename, and delete come next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pagesQuery.error ? (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-5 text-sm text-muted-foreground">
                Unable to load pages yet. Confirm the `SitePage` schema exists and the selected
                site id matches the page records you create.
              </div>
            ) : pagesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border bg-muted/30 p-4">
                    <div className="h-5 w-40 rounded bg-muted" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : pages.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <PencilRuler className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium">No pages yet</h2>
                    <p className="text-sm text-muted-foreground">
                      Create the first page for this site. The first page is marked as the home
                      page automatically.
                    </p>
                    <Button onClick={() => setIsCreatePageDialogOpen(true)} className="mt-2">
                      <FilePlus2 className="h-4 w-4" />
                      Create first page
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pages.map((page, index) => (
                  <div key={page.ItemId} className="rounded-2xl border bg-background p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-medium text-foreground">{page.Name}</h2>
                          {page.IsHomePage && (
                            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              <Home className="h-3 w-3" />
                              Home page
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">/{page.Slug}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Order: {page.Order}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/vibe-builder/${siteId}/editor/${page.ItemId}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Open editor
                        </Link>
                        {site?.Slug ? (
                          <Link
                            to={`/site/${site.Slug}/${page.Slug}?preview=1&returnTo=${encodeURIComponent(pathname)}`}
                            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                          >
                            Preview route
                          </Link>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page.IsHomePage}
                          onClick={() => void setHomePage(page)}
                        >
                          Set home page
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => void updatePageOrder(page.ItemId, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                          Move up
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === pages.length - 1}
                          onClick={() => void updatePageOrder(page.ItemId, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                          Move down
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageToRename(page)}
                        >
                          Rename page
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPageToDelete({ id: page.ItemId, name: page.Name })}
                        >
                          Delete page
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog
        open={isCreatePageDialogOpen}
        onOpenChange={(open) => {
          setIsCreatePageDialogOpen(open);
          if (!open) {
            setSubmitError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create page</DialogTitle>
            <DialogDescription>
              Add a new page to this site. The first page created becomes the home page.
            </DialogDescription>
          </DialogHeader>

          <Form {...createPageForm}>
            <form className="space-y-4" onSubmit={createPageForm.handleSubmit(onCreatePage)}>
              <FormField
                control={createPageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home" {...field} />
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
                      <Input placeholder="home" {...field} />
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
                      <Input placeholder="Acme Studio | Home" {...field} />
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
                      <Textarea placeholder="Short search description for this page" height="96px" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                  {submitError.includes('insertSitePage')
                    ? 'The `SitePage` schema is not available in the backend yet. Import the generated VibeBuilder schema JSON first, then try again.'
                    : submitError.includes('IsDeleted')
                      ? 'The backend `SitePageInsertInput` does not accept `IsDeleted` during create. Refresh and try again with the updated client.'
                    : submitError}
                </div>
              ) : null}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatePageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={addSitePageMutation.isPending}>
                  Create page
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenameSiteDialogOpen}
        onOpenChange={(open) => {
          setIsRenameSiteDialogOpen(open);
          if (!open) {
            setRenameSiteError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename site</DialogTitle>
            <DialogDescription>Update the site name, slug, and description.</DialogDescription>
          </DialogHeader>

          <Form {...renameSiteForm}>
            <form className="space-y-4" onSubmit={renameSiteForm.handleSubmit(onRenameSite)}>
              <FormField
                control={renameSiteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renameSiteForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renameSiteForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea height="96px" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renameSiteError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                  {renameSiteError}
                </div>
              ) : null}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRenameSiteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateSiteMutation.isPending}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pageToRename)}
        onOpenChange={(open) => {
          if (!open) {
            setPageToRename(null);
            setRenamePageError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename page</DialogTitle>
            <DialogDescription>Update the page name, slug, and SEO metadata.</DialogDescription>
          </DialogHeader>

          <Form {...renamePageForm}>
            <form className="space-y-4" onSubmit={renamePageForm.handleSubmit(onRenamePage)}>
              <FormField
                control={renamePageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renamePageForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renamePageForm.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renamePageForm.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO description</FormLabel>
                    <FormControl>
                      <Textarea height="96px" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renamePageError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                  {renamePageError}
                </div>
              ) : null}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setPageToRename(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateSitePageMutation.isPending}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={isDeleteSiteConfirmOpen}
        onOpenChange={setIsDeleteSiteConfirmOpen}
        title="Delete site"
        description={`Delete ${site?.Name ?? 'this site'}? This will remove access to its pages from the VibeBuilder dashboard.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        onConfirm={onDeleteSite}
      />

      <ConfirmationModal
        open={Boolean(pageToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPageToDelete(null);
          }
        }}
        title="Delete page"
        description={`Delete ${pageToDelete?.name ?? 'this page'}? This action removes the page from this site.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        onConfirm={onDeletePage}
      />
    </main>
  );
};
