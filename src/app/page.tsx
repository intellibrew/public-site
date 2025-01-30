import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Check } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 py-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full max-w-screen-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#CCFF66] rounded flex items-center justify-center">
              <span className="text-black font-bold text-xl">L</span>
            </div>
            <span className="font-semibold text-xl">Leen</span>
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
              <Button className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 font-medium">Schedule a demo</Button>
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
          {/* SOC 2 Banner */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#F4F0FF] text-[#6E56CF] px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Leen is now SOC 2 Type 2 Compliant!</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              The Unified API for
              <br />
              Security Data
            </h1>
            <p className="text-gray-600 text-lg md:text-xl">
              Unlock security data from hundreds of tools with a single API
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 px-8">Request access</Button>
              <Button variant="outline" className="px-8">
                View Integrations
              </Button>
            </div>
          </div>

          {/* Logo Cloud */}
          <div className="mt-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-4xl mx-auto">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <Image
                      src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oOaii2SCuT5Sulz5eFSndMfsKyRRxB.png`}
                      alt={`Partner Logo ${i + 1}`}
                      width={120}
                      height={40}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">One API for all your security data</h2>
              <p className="text-gray-600 text-lg">
                Stop writing custom integrations. Access all your security tools through a single, unified API.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <div className="h-12 w-12 bg-[#F4F0FF] rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Integrate with your existing tools</h2>
              <p className="text-gray-600 text-lg">
                Connect with hundreds of security tools and services through our unified API
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-white border rounded-lg p-6 flex items-center justify-center">
                    <Image
                      src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oOaii2SCuT5Sulz5eFSndMfsKyRRxB.png`}
                      alt={`Integration ${i + 1}`}
                      width={120}
                      height={40}
                    />
                  </div>
                ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" className="px-8">
                View all integrations <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Why developers choose Leen</h2>

              <div className="space-y-8">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-6 w-6 bg-[#CCFF66] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-gray-600 text-lg mb-8">
                Join leading security teams using Leen to streamline their security operations
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="bg-[#CCFF66] text-black hover:bg-[#CCFF66]/90 px-8">Request access</Button>
                <Button variant="outline" className="px-8">
                  View documentation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-[#CCFF66] rounded flex items-center justify-center">
                  <span className="text-black font-bold text-xl">L</span>
                </div>
                <span className="font-medium text-xl">Leen</span>
              </Link>
              <p className="text-gray-600 text-sm">The unified API for security data</p>
            </div>

            {footerLinks.map((column, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">© {new Date().getFullYear()} Leen. All rights reserved.</p>
              <div className="flex items-center space-x-6">
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

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

