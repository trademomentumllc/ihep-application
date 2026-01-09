'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to Substack or email service
    console.log('Newsletter signup:', email)
    alert('Thank you for subscribing! Check your email for a welcome message.')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-teal-600 tracking-tight">
            IHEP
          </Link>
          <ul className="hidden md:flex gap-6">
            <li>
              <a href="#overview" className="text-slate-900 text-sm font-medium hover:text-teal-600 transition-colors">
                Overview
              </a>
            </li>
            <li>
              <a href="#documents" className="text-slate-900 text-sm font-medium hover:text-teal-600 transition-colors">
                Documents
              </a>
            </li>
            <li>
              <a href="#press" className="text-slate-900 text-sm font-medium hover:text-teal-600 transition-colors">
                Press Kit
              </a>
            </li>
            <li>
              <a href="#team" className="text-slate-900 text-sm font-medium hover:text-teal-600 transition-colors">
                Team
              </a>
            </li>
            <li>
              <a href="#partner" className="text-slate-900 text-sm font-medium hover:text-teal-600 transition-colors">
                Partner With Us
              </a>
            </li>
          </ul>
          <a
            href="#newsletter"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors"
          >
            Subscribe
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-500 text-white py-12 px-4 text-center">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Transforming Healthcare Aftercare Through AI-Powered Digital Twins
          </h1>
          <p className="text-lg mb-6 opacity-95 leading-relaxed">
            The Integrated Health Empowerment Program (IHEP) solves the $290 billion problem of treatment non-adherence
            by combining patient digital twins, organizational ecosystem mapping, and federated AI learning—built on
            Google Cloud with compliance-first architecture.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#overview"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Learn More
            </a>
            <a
              href="#documents"
              className="bg-transparent text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-all"
            >
              Download Our Deck
            </a>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-12 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">IHEP in 90 Seconds</h2>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">$290B</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">Annual Cost of Non-Adherence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">40%</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">HIV Patients Lost in 6 Months</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">66%</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">Current Viral Suppression Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">1.2M</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">Americans Living with HIV</div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold mb-3 text-teal-600">The Problem</h3>
              <p className="text-slate-700 leading-relaxed">
                When patients receive life-altering diagnoses like HIV, cancer, or rare blood diseases, the healthcare
                system provides excellent acute care but abandons them in the critical months that follow. The result:
                40% dropout rates, $290 billion in wasted healthcare costs, and preventable deaths.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold mb-3 text-teal-600">The Solution</h3>
              <p className="text-slate-700 leading-relaxed">
                <span className="text-teal-600 font-semibold">Patient Digital Twins</span> fuse clinical, psychosocial,
                environmental, and behavioral data to anticipate challenges before they manifest.{' '}
                <span className="text-teal-600 font-semibold">Organizational Twins</span> map entire care ecosystems.{' '}
                <span className="text-teal-600 font-semibold">Federated AI</span> learns across sites without moving
                private health information.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold mb-3 text-teal-600">The Impact</h3>
              <p className="text-slate-700 leading-relaxed">
                Phase I pilot targeting 15% improvement in appointment adherence, 25% reduction in emergency department
                visits, and 85% viral suppression rate (vs. 66% national average). Built on Google Cloud with NIST SP
                800-53r5 compliance-first architecture.
              </p>
            </div>
          </div>

          {/* Funding Box */}
          <div className="bg-gray-100 p-6 rounded-xl mt-8">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Raising $3.5M Series Seed</h3>
            <p className="text-slate-700 mb-3">
              To fund Phase I pilot deployment in Miami/Orlando, executive team assembly, compliance validation, and
              outcome demonstration.
            </p>
            <p className="text-slate-700 mb-3">
              <strong>Investment Terms:</strong> Convertible note, 20% Series A discount, $15M cap, 6% interest,
              24-month maturity. Minimum investment $100K.
            </p>
            <p className="text-slate-700">
              <strong>Timeline:</strong> Operations commence March 2026. SBIR Phase I application April 5, 2026 ($300K
              non-dilutive if successful).
            </p>
          </div>
        </div>
      </section>

      {/* Document Library */}
      <section id="documents" className="py-12 px-4 bg-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 text-center">Document Library</h2>
          <p className="text-center mb-8 text-slate-500">
            All materials available for download. Password-protected materials upon request.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">📄</div>
              <div className="font-semibold mb-2">One-Page Overview</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Quick introduction to IHEP&apos;s problem, solution, market opportunity, and funding ask. Perfect for
                first impressions.
              </div>
              <div className="text-xs text-gray-400">PDF - 2 pages</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-semibold mb-2">Investor Deck</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Comprehensive 10-12 slide presentation covering market opportunity, technology differentiation,
                financial projections, team, and investment terms.
              </div>
              <div className="text-xs text-gray-400">PDF - Password Protected</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">🏗️</div>
              <div className="font-semibold mb-2">Technical Architecture</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Detailed whitepaper covering digital twin technology, federated learning, morphogenetic framework, and
                NIST compliance architecture. DOI-published.
              </div>
              <div className="text-xs text-gray-400">PDF - 45 pages - DOI Assigned</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">💰</div>
              <div className="font-semibold mb-2">Budget Summary</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Phase I budget breakdown, 10-year financial projections, unit economics, and path to profitability.
                Conservative assumptions detailed.
              </div>
              <div className="text-xs text-gray-400">PDF - 8 pages</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">🎯</div>
              <div className="font-semibold mb-2">Pilot Plan & Timeline</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Detailed Phase I implementation roadmap with milestones, success metrics, outcome measurement
                methodology, and measurable endpoints.
              </div>
              <div className="text-xs text-gray-400">PDF - 12 pages</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="text-3xl mb-3">❓</div>
              <div className="font-semibold mb-2">FAQ Document</div>
              <div className="text-sm text-slate-500 mb-3 flex-grow">
                Comprehensive answers to investor, partner, and stakeholder questions about technology, regulatory
                approach, market positioning, and team.
              </div>
              <div className="text-xs text-gray-400">PDF - 6 pages</div>
            </div>
          </div>

          <p className="text-center mt-12 text-slate-500 text-sm">
            Additional materials available upon request: Technical specifications - Security & Compliance Framework -
            Clinical Study Protocol - Partnership Agreements - Regulatory Strategy
          </p>
        </div>
      </section>

      {/* Press Kit Section */}
      <section id="press" className="py-12 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">Press & Media Kit</h2>

          <div className="bg-gray-100 p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">Company Boilerplate</h3>

            <p className="mb-4 font-semibold">50-word version:</p>
            <p className="mb-6 italic text-slate-600">
              &quot;The Integrated Health Empowerment Program (IHEP) is an AI-driven digital health platform
              transforming aftercare for life-altering conditions. Using patient digital twins, organizational ecosystem
              mapping, and federated learning, IHEP addresses the $290 billion problem of treatment non-adherence while
              building the data infrastructure for breakthrough treatments. Founded by Jason Jarmacz.&quot;
            </p>

            <p className="mb-4 font-semibold">100-word version:</p>
            <p className="mb-6 italic text-slate-600">
              &quot;The Integrated Health Empowerment Program (IHEP) is a morphogenetic digital health ecosystem solving
              the $290 billion annual crisis of treatment non-adherence in life-altering conditions like HIV, cancer,
              and rare blood diseases. IHEP combines three layers of innovation: patient digital twins that anticipate
              challenges before they manifest, organizational twins that optimize entire care ecosystems, and federated
              AI networks that learn across sites without moving private health information. Built on Google Cloud with
              compliance-first NIST SP 800-53r5 architecture, IHEP demonstrates measurable outcomes while building the
              data infrastructure for functional cures. Founded by Jason Jarmacz, Chief Evolution Strategist, IHEP is
              raising a $3.5M Series Seed to fund Phase I pilot operations.&quot;
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-slate-900">Media Assets</h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <strong>Logo Files:</strong> SVG, PNG (white, dark, full color versions) available upon request
              </li>
              <li>
                <strong>Founder Photo:</strong> High-resolution headshot (JPG, 4000x5000px) available upon request
              </li>
              <li>
                <strong>Key Statistics:</strong> $290B annual cost, 40% dropout rate, 1.2M Americans with HIV, 25.9%
                digital health CAGR
              </li>
              <li>
                <strong>Media Contact:</strong> press@ihep.app
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 px-4 bg-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">Founding Team & Advisory</h2>

          <div className="max-w-[800px] mx-auto">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">
              Jason Jarmacz, Founder & Principal Investigator
            </h3>
            <p className="text-slate-700 mb-8 leading-relaxed">
              15+ years in business development and research analytics; 5+ years in healthcare insights. Jason has
              persevered through multiple hardships pursuing his life goal of developing an application that changes
              humanity and provides uplift to community. His evolution strategy framework informed IHEP&apos;s
              three-layer architecture. Based in Newark, New Jersey.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-slate-900">Positions Now Hiring (Phase I)</h3>

            <div className="space-y-4 text-slate-700">
              <div>
                <p className="font-semibold">Chief Technology Officer</p>
                <p className="text-sm">
                  Requirements: 10+ years software architecture, healthcare tech background, AIML expertise,
                  HIPAA-compliant systems at scale
                </p>
                <p className="text-sm">Compensation: $200K base + 3% equity + performance bonuses</p>
              </div>

              <div>
                <p className="font-semibold">Chief Security & Compliance Officer</p>
                <p className="text-sm">
                  Requirements: CISSP/equivalent, healthcare compliance expertise (HIPAA, NIST), FDA digital health
                  regulations
                </p>
                <p className="text-sm">Compensation: $180K base + 2% equity</p>
              </div>

              <div>
                <p className="font-semibold">Clinical Director</p>
                <p className="text-sm">
                  Requirements: MD/equivalent, HIV/AIDS clinical expertise, clinical informatics background
                </p>
                <p className="text-sm">Compensation: $220K base + 2% equity</p>
              </div>

              <div>
                <p className="font-semibold">Community Engagement Director</p>
                <p className="text-sm">
                  Requirements: 7+ years community health work, HIVAIDS service org leadership, lived experience
                  preferred
                </p>
                <p className="text-sm">Compensation: $140K base + 1.5% equity</p>
              </div>

              <div>
                <p className="font-semibold">AIML Lead Engineer</p>
                <p className="text-sm">
                  Requirements: PhD in CS/ML or equivalent, healthcare AI experience, federated learning expertise
                </p>
                <p className="text-sm">Compensation: $180K base + 2% equity</p>
              </div>

              <div>
                <p className="font-semibold">Senior Software Engineer</p>
                <p className="text-sm">
                  Requirements: 7+ years full-stack development, healthcare systems experience, HIPAA compliance
                  knowledge
                </p>
                <p className="text-sm">Compensation: $160K base + 1.5% equity</p>
              </div>
            </div>

            <p className="mt-6 text-slate-700">
              <strong>Advisory Board Status:</strong> Building advisory board of healthcare researchers, health equity
              experts, AI ethicists, and experienced founders. Advisor compensation: 0.25% equity, 2-year vest,
              quarterly engagement requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section id="partner" className="py-12 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">Partner With IHEP</h2>

          <div className="max-w-[900px] mx-auto">
            <p className="text-lg text-center mb-8 text-slate-700">
              We&apos;re seeking partnerships across three dimensions: investment, clinical collaboration, and
              technology integration.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold mb-3 text-teal-600">💰 Funding Partnership</h3>
                <p className="text-slate-700 mb-3">
                  <strong>Investment Opportunity:</strong> $3.5M Series Seed round at $12M pre-money valuation.
                  Convertible note terms: 20% Series A discount, $15M cap, 6% interest, 24-month maturity.
                </p>
                <p className="text-slate-700">
                  <strong>Investor Types:</strong> VCs, impact investors, angels, strategic investors, foundations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold mb-3 text-teal-600">🏥 Healthcare System Partnership</h3>
                <p className="text-slate-700">
                  <strong>Phase I Pilot Sites:</strong> Seeking 2-4 healthcare systems in Miami/Orlando for 150-300
                  participant pilot. Pilot partners receive early access to platform, co-publication opportunities,
                  revenue sharing on successful outcomes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold mb-3 text-teal-600">🔬 Research Collaboration</h3>
                <p className="text-slate-700 mb-3">
                  <strong>Academic Partners:</strong> Co-PI arrangements, data access agreements, joint publications.
                  Platform offers unprecedented longitudinal dataset for HIV treatment research.
                </p>
                <p className="text-slate-700">
                  <strong>Also Seeking:</strong> Regulatory consultants, clinical advisors, AI ethics experts.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div
            id="newsletter"
            className="bg-gradient-to-br from-teal-600 to-teal-500 text-white p-12 rounded-xl text-center mt-8"
          >
            <h3 className="text-xl font-semibold mb-3">Stay Connected</h3>
            <p className="text-lg mb-6">
              Subscribe to IHEP Progress Brief—weekly updates on digital health innovation, clinical outcomes, and
              fundraising milestones.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-wrap gap-2 max-w-[500px] mx-auto justify-center">
              <input
                type="email"
                placeholder="your.email@example.com"
                required
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-3 rounded-lg text-slate-900 text-base"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm mt-4 opacity-90">We&apos;ll never share your email. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-[1200px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4">About IHEP</h4>
            <ul className="space-y-2">
              <li>
                <a href="#overview" className="text-white/70 text-sm hover:text-white transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#team" className="text-white/70 text-sm hover:text-white transition-colors">
                  Leadership
                </a>
              </li>
              <li>
                <a href="#partner" className="text-white/70 text-sm hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="mailto:press@ihep.app" className="text-white/70 text-sm hover:text-white transition-colors">
                  Press Inquiries
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#documents" className="text-white/70 text-sm hover:text-white transition-colors">
                  Document Library
                </a>
              </li>
              <li>
                <a href="#documents" className="text-white/70 text-sm hover:text-white transition-colors">
                  Investor Deck
                </a>
              </li>
              <li>
                <a href="#documents" className="text-white/70 text-sm hover:text-white transition-colors">
                  Technical Architecture
                </a>
              </li>
              <li>
                <a href="#documents" className="text-white/70 text-sm hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Newsletter
                </a>
              </li>
              <li>
                <a
                  href="mailto:newsletter@ihep.app"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="https://zenodo.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Publications (DOI)
                </a>
              </li>
            </ul>

            <div className="flex gap-4 mt-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                in
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter/X"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                X
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                GH
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Compliance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-white/70 text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-white/70 text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="text-white/70 text-sm hover:text-white transition-colors">
                  Security Framework
                </Link>
              </li>
              <li>
                <Link href="/legal/hipaa" className="text-white/70 text-sm hover:text-white transition-colors">
                  HIPAA Notice
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/60">
            Copyright 2026 Integrated Health Empowerment Program (IHEP). All rights reserved.
          </p>
          <p className="text-sm text-white/60 mt-2">
            Building the future of healthcare aftercare through AI-powered digital twins and community partnership.
          </p>
        </div>
      </footer>
    </div>
  )
}
