import { pushToDataLayer } from './tracking';

export const trackBlogClick = (title: string, slug: string, category: string) => {
  pushToDataLayer({
    event: 'select_content',
    content_type: 'blog_post',
    item_id: slug,
    item_name: title,
    item_category: category,
  });
};

export const trackCtaClick = (ctaLocation: string) => {
  pushToDataLayer({
    event: 'cta_click',
    cta_location: ctaLocation,
    destination: 'app_download_landing',
  });
};

export const trackImageUpload = (success: boolean, fileName?: string) => {
  pushToDataLayer({
    event: 'upload_blog_image',
    upload_status: success ? 'success' : 'error',
    file_name: fileName || '',
  });
};

export const trackEditorOpen = () => {
  pushToDataLayer({
    event: 'open_blog_editor'
  });
};

export const trackPostCreation = (title: string, authorId: string) => {
  pushToDataLayer({
    event: 'blog_post_created',
    post_title: title,
    author_id: authorId,
  });
};
