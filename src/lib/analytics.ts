export const trackBlogClick = (title: string, slug: string, category: string) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'select_content',
      content_type: 'blog_post',
      item_id: slug,
      item_name: title,
      item_category: category,
    });
  }
};

export const trackCtaClick = (ctaLocation: string) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'cta_click',
      cta_location: ctaLocation,
      destination: 'app_download_landing',
    });
  }
};

export const trackImageUpload = (success: boolean, fileName?: string) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'upload_blog_image',
      upload_status: success ? 'success' : 'error',
      file_name: fileName || '',
    });
  }
};

export const trackEditorOpen = () => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'open_blog_editor'
    });
  }
};

export const trackPostCreation = (title: string, authorId: string) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'blog_post_created',
      post_title: title,
      author_id: authorId,
    });
  }
};

