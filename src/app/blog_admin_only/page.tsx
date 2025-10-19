"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { AnimateInView } from "@/components/AnimateInView"
import { fetchBlogPosts, type BlogPost } from "../api_requests/blog"
import { cn } from "@/lib/utils"
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    pageCount: number;
    total: number;
    page: number;
    pageSize: number;
  }>({ pageCount: 1, total: 0, page: 1, pageSize: 10 })

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const response = await fetchBlogPosts(page, 10, true)
        setPosts(response.data)
        setPagination(response.meta.pagination)
      } catch (err) {
        console.error("Failed to fetch blog posts:", err)
        setError("Failed to load blog posts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [page])
  
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
      window.scrollTo(0, 0)
    }
  }
  
  const handleNextPage = () => {
    if (page < pagination.pageCount) {
      setPage(page + 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-12">
        <AnimateInView>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
              NeoFab Blog
            </h1>
          </div>
        </AnimateInView>

        {/* Blog posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-t-sky-600 border-b-indigo-600 border-l-transparent border-r-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => { setError(null); setPage(1); }} className="neo-btn">
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-zinc-600">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <AnimateInView key={post.id}>
                <BlogPostCard post={post} />
              </AnimateInView>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && posts.length > 0 && (
          <div className="mt-16 flex justify-center items-center gap-3">
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border border-zinc-200 px-4 py-2",
                page === 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-600">
              Page {page} of {pagination.pageCount}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={page >= pagination.pageCount}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border border-zinc-200 px-4 py-2",
                page >= pagination.pageCount && "opacity-50 cursor-not-allowed"
              )}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Blog post card component
function BlogPostCard({ post }: { post: BlogPost }) {
  const { attributes } = post
  const formattedDate = new Date(attributes.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Use first 150 chars of 'post' content as excerpt
  const excerpt = attributes.post
    ? attributes.post.replace(/[#*]/g, '').substring(0, 150) + '...'
    : ''

  return (
    <article className="group flex flex-col h-full rounded-2xl border border-zinc-200/85 bg-white/90 overflow-hidden shadow-lg hover:shadow-xl transition duration-300">

      <div className="flex-1 p-6">
        <div className="text-xs text-sky-600 font-medium mb-2">
          {formattedDate}
        </div>
        <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
          {attributes.title}
        </h2>
        <p className="text-zinc-600 text-sm line-clamp-3 mb-4">
          {excerpt}
        </p>
        <Link
          href={`/post?slug=${post.id}`} // fallback to ID since slug is missing
          className="inline-flex items-center text-sky-600 font-medium hover:text-sky-800"
        >
          Read more
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
