"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"
import { AnimateInView } from "@/components/AnimateInView"
import { useEffect, useState } from "react"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (window.scrollY / windowHeight) * 100
      setScrollProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-[#CCFF66] transition-all duration-300" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 py-4 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/95">
        <div className="flex items-center justify-between w-full max-w-screen-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              whileHover={{ rotate: 15 }} 
              className="h-8 w-8 bg-[#CCFF66] rounded flex items-center justify-center"
            >
              <span className="text-black font-bold text-xl">N</span>
            </motion.div>
            <span className="font-semibold text-xl">NeoFab</span>
          </Link>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Navigation - Centered */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <nav className="bg-[#F7F5F5] rounded-full px-2">
                {["Product", "Integrations", "Blog", "About", "Changelog", "Docs"].map((item) => (
                  <Link
                    key={item}
                    href="https://app.neofab.ai"
                    className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Button className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 font-medium transform transition-all hover:scale-105">
                Schedule a demo
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-32">
          <AnimateInView delay={100}>
            <div className="flex justify-center mb-12">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center space-x-2 bg-[#F4F0FF] text-[#6E56CF] px-4 py-2 rounded-full"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">NeoFab is now SOC 2 Type 2 Compliant!</span>
              </motion.div>
            </div>
          </AnimateInView>

          <div className="text-center max-w-4xl mx-auto space-y-6">
            <AnimateInView delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                The Unified API for
                <br />
                Security Data
              </h1>
            </AnimateInView>

            <AnimateInView delay={300}>
              <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                Unlock security data from hundreds of tools with a single API
              </p>
            </AnimateInView>

            <AnimateInView delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 px-8 transform transition-all hover:scale-105"
                  size="lg"
                >
                  Request access
                </Button>
                <Button 
                  variant="outline" 
                  className="px-8 transform transition-all hover:scale-105"
                  size="lg"
                >
                  View Integrations
                </Button>
              </div>
            </AnimateInView>
          </div>

          {/* Logo Cloud */}
          <AnimateInView delay={500}>
            <div className="mt-24">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-4xl mx-auto">
                {Array(8).fill(0).map((_, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={`https://i.ibb.co/NdjGYH4h/logo512.png`}
                      alt={`Partner Logo ${i + 1}`}
                      width={120}
                      height={40}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimateInView>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimateInView>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  One API for all your security data
                </h2>
                <p className="text-gray-600 text-lg">
                  Stop writing custom integrations. Access all your security tools through a single, unified API.
                </p>
              </div>
            </AnimateInView>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <AnimateInView key={i} delay={i * 100}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="h-12 w-12 bg-[#F4F0FF] rounded-lg flex items-center justify-center mb-4 transition-colors group-hover:bg-[#e6dfff]">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                </AnimateInView>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <AnimateInView>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Integrate with your existing tools
                </h2>
                <p className="text-gray-600 text-lg">
                  Connect with hundreds of security tools and services through our unified API
                </p>
              </div>
            </AnimateInView>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array(12).fill(0).map((_, i) => (
                <AnimateInView key={i} delay={i * 50}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white border rounded-lg p-6 flex items-center justify-center hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={`https://i.ibb.co/NdjGYH4h/logo512.png`}
                      alt={`Integration ${i + 1}`}
                      width={120}
                      height={40}
                    />
                  </motion.div>
                </AnimateInView>
              ))}
            </div>

            <AnimateInView>
              <div className="text-center mt-12">
                <Button 
                  variant="outline" 
                  className="px-8 transform transition-all hover:scale-105"
                >
                  View all integrations <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </AnimateInView>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimateInView>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Why developers choose NeoFab
                </h2>

                <div className="space-y-8">
                  {benefits.map((benefit, i) => (
                    <AnimateInView key={i} delay={i * 100}>
                      <motion.div 
                        whileHover={{ x: 10 }}
                        className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="h-6 w-6 bg-[#CCFF66] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                          <p className="text-gray-600">{benefit.description}</p>
                        </div>
                      </motion.div>
                    </AnimateInView>
                  ))}
                </div>
              </div>
            </AnimateInView>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <AnimateInView>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Ready to get started?
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Join leading security teams using NeoFab to streamline their security operations
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 px-8 transform transition-all hover:scale-105"
                    size="lg"
                  >
                    Request access
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-8 transform transition-all hover:scale-105"
                    size="lg"
                  >
                    View documentation
                  </Button>
                </div>
              </div>
            </AnimateInView>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <motion.div 
                  whileHover={{ rotate: 15 }} 
                  className="h-8 w-8 bg-[#CCFF66] rounded flex items-center justify-center"
                >
                  <span className="text-black font-bold text-xl">N</span>
                </motion.div>
                <span className="font-medium text-xl">NeoFab</span>
              </Link>
              <p className="text-gray-600 text-sm">The unified API for security data</p>
            </div>

            {footerLinks.map((column, i) => (
              <AnimateInView key={i} delay={i * 50}>
                <div>
                  <h4 className="font-semibold mb-4">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link, j) => (
                      <li key={j}>
                        <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateInView>
            ))}
          </div>

          <AnimateInView>
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">© {new Date().getFullYear()} NeoFab. All rights reserved.</p>
                <div className="flex items-center space-x-6">
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </AnimateInView>
        </div>
      </footer>
    </div>
  )
}

// Rest of the constants (features, benefits, footerLinks) remain the same as original

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Unified Data Model",
    description: "Access security data from different tools through a standardized schema",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Real-time Updates",
    description: "Get instant notifications about security events across your stack",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Easy Integration",
    description: "Connect new tools in minutes with our simple API and SDKs",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Secure by Design",
    description: "Enterprise-grade security with SOC 2 Type 2 compliance",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Developer First",
    description: "Built for developers with comprehensive documentation and support",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#6E56CF]" />,
    title: "Scalable Platform",
    description: "Handle millions of events with our robust infrastructure",
  },
]

const benefits = [
  {
    title: "Single Integration",
    description: "Connect once to access data from all your security tools. No more maintaining multiple integrations.",
  },
  {
    title: "Standardized Data",
    description:
      "Get security data in a consistent format, regardless of the source. Save time on data transformation.",
  },
  {
    title: "Rapid Development",
    description: "Build security features faster with our simple API and comprehensive SDKs.",
  },
  {
    title: "Enterprise Ready",
    description: "SOC 2 Type 2 compliant platform with enterprise-grade security and support.",
  },
]

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Subprocessors", href: "#" },
    ],
  },
]

