// src/app/page.tsx - Investor Relations Landing Page
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function InvestorLandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, integrate with email service
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-teal-600 tracking-tight">
            IHEP
          </Link>
          <ul className="hidden md:flex gap-6 text-sm font-medium">
            <li><a href="#overview" className="hover:text-teal-600 transition">Overview</a></li>
            <li><a href="#documents" className="hover:text-teal-600 transition">Documents</a></li>
            <li><a href="#press" className="hover:text-teal-600 transition">Press Kit</a></li>
            <li><a href="#team" className="hover:text-teal-600 transition">Team</a></li>
            <li><a href="#partner" className="hover:text-teal-600 transition">Partner With Us</a></li>
          </ul>
          <a href="#newsletter" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition">
            Subscribe
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-500 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Transforming Healthcare Aftercare Through AI-Powered Digital Twins
          </h1>
          <p className="text-lg mb-8 opacity-95 leading-relaxed">
            The Integrated Health Empowerment Program (IHEP) solves the $290 billion problem of treatment non-adherence by combining patient digital twins, organizational ecosystem mapping, and federated AI learning—built on Google Cloud with compliance-first architecture.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#overview" className="bg-white text-teal-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Learn More
            </a>
            <a href="/docs/ihep-pitch-deck.pdf" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition">
              Download Our Deck
            </a>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">IHEP in 90 Seconds</h2>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">$290B</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Annual Cost of Non-Adherence</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">40%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">HIV Patients Lost in 6 Months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">66%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Current Viral Suppression Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">1.2M</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Americans Living with HIV</div>
            </div>
          </div>

          {/* Problem/Solution/Impact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">The Problem</h3>
              <p className="text-gray-600">
                When patients receive life-altering diagnoses like HIV, cancer, or rare blood diseases, the healthcare system provides excellent acute care but abandons them in the critical months that follow. The result: 40% dropout rates, $290 billion in wasted healthcare costs, and preventable deaths.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">The Solution</h3>
              <p className="text-gray-600">
                <strong className="text-teal-600">Patient Digital Twins</strong> fuse clinical, psychosocial, environmental, and behavioral data to anticipate challenges before they manifest. <strong className="text-teal-600">Organizational Twins</strong> map entire care ecosystems. <strong className="text-teal-600">Federated AI</strong> learns across sites without moving private health information.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">The Impact</h3>
              <p className="text-gray-600">
                Phase I pilot targeting 15% improvement in appointment adherence, 25% reduction in emergency department visits, and 85% viral suppression rate (vs. 66% national average). Built on Google Cloud with NIST SP 800-53r5 compliance-first architecture.
              </p>
            </div>
          </div>

          {/* Funding Box */}
          <div className="bg-gray-100 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3">Raising $3.5M Series Seed</h3>
            <p className="text-gray-600 mb-4">
              To fund Phase I pilot deployment in Miami/Orlando, executive team assembly, compliance validation, and outcome demonstration.
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Investment Terms:</strong> Convertible note, 20% Series A discount, $15M cap, 6% interest, 24-month maturity. Minimum investment $100K.
            </p>
            <p className="text-gray-700">
              <strong>Timeline:</strong> Operations commence March 2026. SBIR Phase I application April 5, 2026 ($300K non-dilutive if successful).
            </p>
          </div>
        </div>
      </section>

      {/* Document Library */}
      <section id="documents" className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Document Library</h2>
          <p className="text-center text-gray-500 mb-12">All materials available for download. Password-protected materials upon request.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <a href="/docs/A%20Recursive%20Blueprint%20for%20a%20Global%20Problem.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[DOC]</div>
              <h3 className="font-semibold mb-2">One-Page Overview</h3>
              <p className="text-sm text-gray-500 mb-3">Quick introduction to IHEP&apos;s problem, solution, market opportunity, and funding ask. Perfect for first impressions.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
            <a href="/docs/ihep-pitch-deck.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[DECK]</div>
              <h3 className="font-semibold mb-2">Investor Deck</h3>
              <p className="text-sm text-gray-500 mb-3">Comprehensive 10-12 slide presentation covering market opportunity, technology differentiation, financial projections, team, and investment terms.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
            <a href="/docs/IHEP%20System%20Architecture%20Document.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[ARCH]</div>
              <h3 className="font-semibold mb-2">Technical Architecture</h3>
              <p className="text-sm text-gray-500 mb-3">Detailed whitepaper covering digital twin technology, federated learning, morphogenetic framework, and NIST compliance architecture.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
            <a href="/docs/IHEP%20Comprehensive%20Financial%20Model.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[FIN]</div>
              <h3 className="font-semibold mb-2">Financial Model</h3>
              <p className="text-sm text-gray-500 mb-3">Phase I budget breakdown, 10-year financial projections, unit economics, and path to profitability. Conservative assumptions detailed.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
            <a href="/docs/IHEP%20Phase%20I%20Detailed%20Project%20Plan.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[PLAN]</div>
              <h3 className="font-semibold mb-2">Pilot Plan and Timeline</h3>
              <p className="text-sm text-gray-500 mb-3">Detailed Phase I implementation roadmap with milestones, success metrics, outcome measurement methodology, and measurable endpoints.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
            <a href="/docs/IHEP%20Complete%20Due%20Diligence%20Package.pdf" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block">
              <div className="text-3xl mb-3 text-teal-600">[DD]</div>
              <h3 className="font-semibold mb-2">Due Diligence Package</h3>
              <p className="text-sm text-gray-500 mb-3">Complete due diligence documentation for investor review including all key materials and supporting documents.</p>
              <div className="text-xs text-gray-400">PDF</div>
            </a>
          </div>

          <p className="text-center text-gray-500 text-sm mt-12">
            Additional materials available upon request: Technical specifications - Security & Compliance Framework - Clinical Study Protocol - Partnership Agreements - Regulatory Strategy
          </p>
        </div>
      </section>

      {/* Press Kit */}
      <section id="press" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Press & Media Kit</h2>

          <div className="bg-gray-100 p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Company Boilerplate</h3>

            <p className="font-semibold mb-2">50-word version:</p>
            <p className="text-gray-600 italic mb-6">
              &quot;The Integrated Health Empowerment Program (IHEP) is an AI-driven digital health platform transforming aftercare for life-altering conditions. Using patient digital twins, organizational ecosystem mapping, and federated learning, IHEP addresses the $290 billion problem of treatment non-adherence while building the data infrastructure for breakthrough treatments. Founded by Jason Jarmacz.&quot;
            </p>

            <p className="font-semibold mb-2">100-word version:</p>
            <p className="text-gray-600 italic mb-8">
              &quot;The Integrated Health Empowerment Program (IHEP) is a morphogenetic digital health ecosystem solving the $290 billion annual crisis of treatment non-adherence in life-altering conditions like HIV, cancer, and rare blood diseases. IHEP combines three layers of innovation: patient digital twins that anticipate challenges before they manifest, organizational twins that optimize entire care ecosystems, and federated AI networks that learn across sites without moving private health information. Built on Google Cloud with compliance-first NIST SP 800-53r5 architecture, IHEP demonstrates measurable outcomes while building the data infrastructure for functional cures. Founded by Jason Jarmacz, Chief Evolution Strategist, IHEP is raising a $3.5M Series Seed to fund Phase I pilot operations.&quot;
            </p>

            <h3 className="text-xl font-bold mb-4">Media Assets</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Logo Files:</strong> SVG, PNG (white, dark, full color versions) available upon request</li>
              <li><strong>Founder Photo:</strong> High-resolution headshot (JPG, 4000x5000px) available upon request</li>
              <li><strong>Key Statistics:</strong> $290B annual cost, 40% dropout rate, 1.2M Americans with HIV, 25.9% digital health CAGR</li>
              <li><strong>Media Contact:</strong> press@ihep.app</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Founding Team & Advisory</h2>

          <div className="mb-12">
            <h3 className="text-xl font-bold mb-3">Jason Jarmacz, Founder & Principal Investigator</h3>
            <p className="text-gray-600">
              15+ years in business development and research analytics; 5+ years in healthcare insights. Jason has persevered through multiple hardships pursuing his life goal of developing an application that changes humanity and provides uplift to community. His evolution strategy framework informed IHEP&apos;s three-layer architecture. Based in Newark, New Jersey.
            </p>
          </div>

          <h3 className="text-xl font-bold mb-6">Positions Now Hiring (Phase I)</h3>

          <div className="space-y-6">
            {[
              { title: 'Chief Technology Officer', reqs: '10+ years software architecture, healthcare tech background, AI/ML expertise, HIPAA-compliant systems at scale', comp: '$200K base + 3% equity + performance bonuses' },
              { title: 'Chief Security & Compliance Officer', reqs: 'CISSP/equivalent, healthcare compliance expertise (HIPAA, NIST), FDA digital health regulations', comp: '$180K base + 2% equity' },
              { title: 'Clinical Director', reqs: 'MD/equivalent, HIV/AIDS clinical expertise, clinical informatics background', comp: '$220K base + 2% equity' },
              { title: 'Community Engagement Director', reqs: '7+ years community health work, HIV/AIDS service org leadership, lived experience preferred', comp: '$140K base + 1.5% equity' },
              { title: 'AI/ML Lead Engineer', reqs: 'PhD in CS/ML or equivalent, healthcare AI experience, federated learning expertise', comp: '$180K base + 2% equity' },
              { title: 'Senior Software Engineer', reqs: '7+ years full-stack development, healthcare systems experience, HIPAA compliance knowledge', comp: '$160K base + 1.5% equity' },
            ].map((job) => (
              <div key={job.title} className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold">{job.title}</h4>
                <p className="text-sm text-gray-600">Requirements: {job.reqs}</p>
                <p className="text-sm text-gray-700">Compensation: {job.comp}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-gray-600">
            <strong>Advisory Board Status:</strong> Building advisory board of healthcare researchers, health equity experts, AI ethicists, and experienced founders. Advisor compensation: 0.25% equity, 2-year vest, quarterly engagement requirements.
          </p>
        </div>
      </section>

      {/* Partnership Section */}
      <section id="partner" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Partner With IHEP</h2>
          <p className="text-center text-lg text-gray-600 mb-12">
            We&apos;re seeking partnerships across three dimensions: investment, clinical collaboration, and technology integration.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">Funding Partnership</h3>
              <p className="text-gray-600 mb-3">
                <strong>Investment Opportunity:</strong> $3.5M Series Seed round at $12M pre-money valuation. Convertible note terms: 20% Series A discount, $15M cap, 6% interest, 24-month maturity.
              </p>
              <p className="text-gray-600">
                <strong>Investor Types:</strong> VCs, impact investors, angels, strategic investors, foundations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">Healthcare System Partnership</h3>
              <p className="text-gray-600">
                <strong>Phase I Pilot Sites:</strong> Seeking 2-4 healthcare systems in Miami/Orlando for 150-300 participant pilot. Pilot partners receive early access to platform, co-publication opportunities, revenue sharing on successful outcomes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
              <h3 className="text-xl font-semibold text-teal-600 mb-3">Research Collaboration</h3>
              <p className="text-gray-600 mb-3">
                <strong>Academic Partners:</strong> Co-PI arrangements, data access agreements, joint publications. Platform offers unprecedented longitudinal dataset for HIV treatment research.
              </p>
              <p className="text-gray-600">
                <strong>Also Seeking:</strong> Regulatory consultants, clinical advisors, AI ethics experts.
              </p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div id="newsletter" className="bg-gradient-to-br from-teal-600 to-teal-500 text-white p-8 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
            <p className="text-lg mb-6 opacity-95">
              Subscribe to IHEP Progress Brief—weekly updates on digital health innovation, clinical outcomes, and fundraising milestones.
            </p>

            {subscribed ? (
              <p className="text-lg font-semibold">Thank you for subscribing! Check your email for a welcome message.</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto flex-wrap justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-lg text-gray-900"
                />
                <button type="submit" className="bg-white text-teal-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-sm mt-4 opacity-90">We&apos;ll never share your email. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About IHEP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#overview" className="hover:text-white transition">Our Mission</a></li>
                <li><a href="#team" className="hover:text-white transition">Leadership</a></li>
                <li><a href="#partner" className="hover:text-white transition">Careers</a></li>
                <li><a href="mailto:press@ihep.app" className="hover:text-white transition">Press Inquiries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#documents" className="hover:text-white transition">Document Library</a></li>
                <li><a href="#documents" className="hover:text-white transition">Investor Deck</a></li>
                <li><a href="#documents" className="hover:text-white transition">Technical Architecture</a></li>
                <li><a href="#documents" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Newsletter</a></li>
                <li><a href="mailto:newsletter@ihep.app" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="https://zenodo.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Publications (DOI)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/legal/compliance" className="hover:text-white transition">Security Framework</Link></li>
                <li><Link href="/legal/compliance" className="hover:text-white transition">HIPAA Notice</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>Copyright 2026 Integrated Health Empowerment Program (IHEP). All rights reserved.</p>
            <p className="mt-2">Building the future of healthcare aftercare through AI-powered digital twins and community partnership.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
