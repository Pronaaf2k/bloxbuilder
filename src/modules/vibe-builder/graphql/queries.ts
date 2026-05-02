export const GET_SITES_QUERY = `
  query GetSites($input: DynamicQueryInput) {
    getSites(input: $input) {
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      pageSize
      pageNo
      items {
        ItemId
        OwnerUserId
        OrganizationIds
        Name
        Slug
        Description
        Status
        ThemeConfig
        HomePageId
        PublishedRevisionId
        CreatedBy
        CreatedDate
        LastUpdatedBy
        LastUpdatedDate
        IsDeleted
        Language
        Tags
      }
    }
  }
`;

export const GET_SITE_PAGES_QUERY = `
  query GetSitePages($input: DynamicQueryInput) {
    getSitePages(input: $input) {
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      pageSize
      pageNo
      items {
        ItemId
        SiteId
        Name
        Slug
        Order
        IsHomePage
        SeoTitle
        SeoDescription
        DraftLayoutVersion
        PublishedLayoutVersion
        CreatedBy
        CreatedDate
        LastUpdatedBy
        LastUpdatedDate
        IsDeleted
        Language
        OrganizationIds
        Tags
      }
    }
  }
`;

export const GET_SITE_PAGE_LAYOUTS_QUERY = `
  query GetSitePageLayouts($input: DynamicQueryInput) {
    getSitePageLayouts(input: $input) {
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      pageSize
      pageNo
      items {
        ItemId
        SiteId
        PageId
        Version
        Status
        LayoutJson
        SchemaVersion
        PreviewImageUrl
        CreatedBy
        CreatedDate
        LastUpdatedBy
        LastUpdatedDate
        IsDeleted
        Language
        OrganizationIds
        Tags
      }
    }
  }
`;
