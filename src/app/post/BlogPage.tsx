"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { fetchBlogPostBySlug, type BlogPost } from "../api_requests/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogPage() {


  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    // Use the browser's URL API to get query parameters
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get("slug");
    setSlug(slugParam);
  }, []);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        if (slug) {
          const response = await fetchBlogPostBySlug(slug);
          setPost(response.data);
          setError(null);
        } else {
          setPost(null);
          setError("Post not found.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  if (!post) return null;

  const { attributes } = post;
  const formattedDate = new Date(attributes.date || attributes.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const markdownComponents = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-4xl font-bold my-4" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-3xl font-bold my-4" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-2xl font-semibold my-3" {...props} />
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className="text-xl font-semibold my-2" {...props} />
    ),
    h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h5 className="text-lg font-medium my-2" {...props} />
    ),
    h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h6 className="text-base font-medium my-1" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-zinc-700 mb-3" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className="text-sky-600 hover:underline" {...props} />
    ),
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li className="ml-6 list-disc mb-2" {...props} />
    ),
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />
      <div className="min-h-screen bg-white text-zinc-900 px-4 py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{attributes.title}</h1>
        <div className="text-sm text-zinc-500 mb-6">{formattedDate}</div>

        <div className="prose max-w-full mb-8">
          <ReactMarkdown components={markdownComponents}>
            {attributes.post || "No content available."}
          </ReactMarkdown>
        </div>

        <Link href="/blog">
          <Button>← Back to Blog</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}