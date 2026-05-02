export const INSERT_SITE_MUTATION = `
  mutation InsertSite($input: SiteInsertInput!) {
    insertSite(input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const UPDATE_SITE_MUTATION = `
  mutation UpdateSite($filter: String!, $input: SiteUpdateInput!) {
    updateSite(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const DELETE_SITE_MUTATION = `
  mutation DeleteSite($filter: String!, $input: SiteDeleteInput!) {
    deleteSite(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const INSERT_SITE_PAGE_MUTATION = `
  mutation InsertSitePage($input: SitePageInsertInput!) {
    insertSitePage(input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const UPDATE_SITE_PAGE_MUTATION = `
  mutation UpdateSitePage($filter: String!, $input: SitePageUpdateInput!) {
    updateSitePage(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const DELETE_SITE_PAGE_MUTATION = `
  mutation DeleteSitePage($filter: String!, $input: SitePageDeleteInput!) {
    deleteSitePage(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const INSERT_SITE_PAGE_LAYOUT_MUTATION = `
  mutation InsertSitePageLayout($input: SitePageLayoutInsertInput!) {
    insertSitePageLayout(input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const UPDATE_SITE_PAGE_LAYOUT_MUTATION = `
  mutation UpdateSitePageLayout($filter: String!, $input: SitePageLayoutUpdateInput!) {
    updateSitePageLayout(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;
