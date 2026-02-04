"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimateInView } from "@/components/AnimateInView";
import { ArrowRight } from "lucide-react";
import { fetchBlogPosts, type BlogPost } from "../api_requests/blog";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pageCount: 1,
    total: 0,
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchBlogPosts(page);
        setPosts(response.data ?? []);
        setPagination(response.meta?.pagination ?? { pageCount: 1, total: 0, page: 1, pageSize: 10 });
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        setError(err instanceof Error ? err.message : "Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.pageCount) {
      setPage(page + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      <Header />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 50%)",
        }}
      />

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
        <AnimateInView className="pb-1">
          <div className="text-center mb-10 md:mb-12">
            <span className="shiny-badge">Blog</span>
            <h1 className="font-orbitron text-[28px] md:text-[40px] leading-tight text-white mt-4 md:mt-5 mb-2">
              NeoFab Blog
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Insights and updates from the team.
            </p>
          </div>
        </AnimateInView>

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-400 border-r-blue-400/50 animate-spin"
              aria-hidden
            />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(1);
              }}
              className="nav-demo-btn"
            >
              Try again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-2">No blog posts yet.</p>
            <p className="text-slate-500 text-sm">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <AnimateInView key={post.id}>
                <BlogPostCard post={post} />
              </AnimateInView>
            ))}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="mt-16 flex justify-center items-center gap-3">
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={cn(
                "rounded-xl border border-blue-500/20 bg-slate-900/50 text-white hover:bg-slate-800/50 hover:border-blue-500/40 px-4 py-2 transition-colors",
                page === 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {page} of {pagination.pageCount}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={page >= pagination.pageCount}
              className={cn(
                "rounded-xl border border-blue-500/20 bg-slate-900/50 text-white hover:bg-slate-800/50 hover:border-blue-500/40 px-4 py-2 transition-colors",
                page >= pagination.pageCount && "opacity-50 cursor-not-allowed"
              )}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  const { attributes } = post;
  const formattedDate = new Date(attributes.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const excerpt = attributes.post
    ? attributes.post.replace(/[#*]/g, "").substring(0, 150) + "..."
    : "";

  return (
    <article className="group flex flex-col h-full rounded-xl border border-blue-500/20 bg-slate-900/30 overflow-hidden hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-300">
      <div className="flex-1 p-6">
        <div className="text-xs text-blue-400 font-medium mb-2">{formattedDate}</div>
        <h2 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors font-orbitron">
          {attributes.title}
        </h2>
        <p className="text-slate-400 text-sm line-clamp-3 mb-4">{excerpt}</p>
        <Link
          href={`/post?slug=${post.id}`}
          className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors"
        >
          Read more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
