import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Layers3, LayoutTemplate, Plus, Rocket, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui-kit/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useAuthStore } from '@/state/store/auth';
import { useAddSite, useGetSites } from '@/modules/vibe-builder';
import { buildSitesOwnershipFilter } from '@/modules/vibe-builder/services/vibe-builder.service';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';

const createSiteSchema = z.object({
  name: z.string().trim().min(2, 'Site name must be at least 2 characters long'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters long')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().trim().max(240, 'Description must be 240 characters or less').optional(),
});

type CreateSiteFormValues = z.infer<typeof createSiteSchema>;

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

const foundationMilestones = [
  {
    title: 'Project and page management',
    description: 'Create isolated site projects, page trees, slugs, and home page settings.',
    icon: Layers3,
  },
  {
    title: 'Visual editor',
    description: 'Compose pages with drag and drop, live property editing, and autosave.',
    icon: LayoutTemplate,
  },
  {
    title: 'Publishing and live routing',
    description: 'Expose public published pages with page-aware routing and renderer isolation.',
    icon: Rocket,
  },
];

export const VibeBuilderDashboardPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, selectedOrgId, accessToken } = useAuthStore();
  const addSiteMutation = useAddSite();
  const navigate = useNavigate();
  const currentUserId = user?.itemId || decodeJWT(accessToken || '')?.user_id || null;

  const form = useForm<CreateSiteFormValues>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const nameValue = form.watch('name');
  const isSlugDirty = Boolean(form.formState.dirtyFields.slug);

  useEffect(() => {
    if (!nameValue) {
      return;
    }

    if (!isSlugDirty) {
      form.setValue('slug', toSlug(nameValue), { shouldValidate: true });
    }
  }, [form, isSlugDirty, nameValue]);

  const siteFilter = useMemo(() => {
    if (!currentUserId) {
      return { _id: '__vibebuilder_no_user__' };
    }

    return buildSitesOwnershipFilter({
      ownerUserId: currentUserId,
      organizationId: selectedOrgId,
    });
  }, [currentUserId, selectedOrgId]);

  const { data, isLoading, error } = useGetSites({
    pageNo: 1,
    pageSize: 24,
    filter: siteFilter,
    sort: { CreatedDate: -1 },
  });

  const sites = data?.items ?? [];

  const onCreateSite = async (values: CreateSiteFormValues) => {
    if (!currentUserId) {
      return;
    }

    setSubmitError(null);

    try {
      const response = await addSiteMutation.mutateAsync({
        input: {
          OwnerUserId: currentUserId,
          OrganizationIds: selectedOrgId ? [selectedOrgId] : undefined,
          Name: values.name.trim(),
          Slug: values.slug.trim(),
          Description: values.description?.trim() || undefined,
          Status: 'draft',
          ThemeConfig: JSON.stringify({
            palette: 'default',
          }),
          Tags: ['vibebuilder'],
        },
      });

      form.reset();
      setIsCreateDialogOpen(false);
      if (response.insertSite?.itemId) {
        navigate(`/vibe-builder/${response.insertSite.itemId}`);
      }
    } catch (error) {
      const message = getMutationErrorMessage(error);
      setSubmitError(message);
    }
  };

  return (
    <main className="flex w-full flex-col gap-6" role="main" aria-label="VibeBuilder">
      <section className="rounded-3xl border bg-card px-6 py-8 shadow-sm md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              VibeBuilder foundation
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Build and publish multi-page websites without code
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                The VibeBuilder workspace is now wired into the app shell. The next steps are site
                CRUD, page management, and the drag-and-drop editor powered by SELISE Blocks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create site
            </Button>
            <Link to="/site/demo-site/home" className={buttonVariants({ variant: 'outline' })}>
              Preview public route
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your sites</CardTitle>
            <CardDescription>
              The dashboard is now wired to the VibeBuilder site data layer. Create your first site
              or open an existing one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium">Unable to load sites</h2>
                  <p className="text-sm text-muted-foreground">
                    The frontend data layer is wired, but the backend schema may not exist yet or
                    the query may still need Selise-side setup. Once the `Site` schema is available,
                    this page should list your owned sites.
                  </p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border bg-muted/30 p-5">
                    <div className="h-5 w-28 rounded bg-muted" />
                    <div className="mt-3 h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : sites.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <LayoutTemplate className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium">No sites yet</h2>
                    <p className="text-sm text-muted-foreground">
                      Create your first website project to start adding pages, layouts, and publish
                      settings.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-2">
                      <Plus className="h-4 w-4" />
                      Create first site
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sites.map((site) => (
                  <div key={site.ItemId} className="rounded-2xl border bg-background p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-medium text-foreground">{site.Name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">/{site.Slug}</p>
                      </div>
                      <div className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {site.Status ?? 'draft'}
                      </div>
                    </div>
                    <p className="mt-4 min-h-10 text-sm text-muted-foreground">
                      {site.Description || 'No description added yet.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/vibe-builder/${site.ItemId}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Open site
                      </Link>
                      <Link
                        to={`/site/${site.Slug}`}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      >
                        Preview route
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              {foundationMilestones.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-2xl border bg-background p-4">
                  <div className="mb-3 inline-flex rounded-xl bg-muted p-2 text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t">
            <p className="text-sm text-muted-foreground">
              The next step is page CRUD and site detail management inside the selected site view.
            </p>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(true)}>
              Create another site
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available routes</CardTitle>
            <CardDescription>Protected and public entry points are now wired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border bg-background p-4">
              <div className="font-medium text-foreground">Protected</div>
              <div className="mt-2 space-y-1">
                <div>`/vibe-builder`</div>
                <div>`/vibe-builder/:siteId`</div>
                <div>`/vibe-builder/:siteId/editor/:pageId`</div>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="font-medium text-foreground">Public</div>
              <div className="mt-2 space-y-1">
                <div>`/site/:siteSlug`</div>
                <div>`/site/:siteSlug/:pageSlug`</div>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="font-medium text-foreground">Manual checks</div>
              <div className="mt-2 space-y-1">
                <div>Create a site from the dialog</div>
                <div>Confirm owned sites appear in the list</div>
                <div>Open a site settings route</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setSubmitError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create site</DialogTitle>
            <DialogDescription>
              Start a new VibeBuilder project. Pages, editor state, and publishing will attach to
              this site.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onCreateSite)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="acme-studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A marketing site for Acme Studio"
                        height="96px"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                  {submitError.includes('insertSite')
                    ? 'The `Site` schema is not available in the backend yet. Import the generated VibeBuilder schema JSON first, then try again.'
                    : submitError.includes('IsDeleted')
                      ? 'The backend `SiteInsertInput` does not accept `IsDeleted` during create. Refresh and try again with the updated client.'
                      : submitError}
                </div>
              ) : null}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={addSiteMutation.isPending}>
                  Create site
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};
