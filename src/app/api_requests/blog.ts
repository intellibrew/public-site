// Types for blog posts
export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    post?: string;
    date: string;
    author: string;
    admin_only: boolean;
    id?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }
}

export interface BlogResponse {
  data: BlogPost[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface SingleBlogResponse {
  data: BlogPost;
}

const STRAPI_URL = "https://strapi-270252829556.us-central1.run.app";

// Function to fetch all blog posts
export async function fetchBlogPosts(page = 1, pageSize = 10, adminOnly = false): Promise<BlogResponse> {
  const adminFilter = adminOnly
    ? '&filters[admin_only][$eq]=true'
    : '&filters[admin_only][$eq]=false';
    
  const response = await fetch(
    `${STRAPI_URL}/api/posts?pagination[page]=${page}&pagination[pageSize]=${pageSize}${adminFilter}&populate=cover`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  
  return response.json();
}

// Function to fetch a single blog post by slug
export async function fetchBlogPostBySlug(slug: string): Promise<SingleBlogResponse> {
  const response = await fetch(
    `${STRAPI_URL}/api/posts?filters[id][$eq]=${slug}&populate=cover`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }
  
  const data: BlogResponse = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error('Blog post not found');
  }
  
  return { data: data.data[0] };
}