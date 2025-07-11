import React, { useState, useEffect } from 'react';

interface DocEntry {
  slug: string;
  data: {
    title: string;
    category?: string;
    order?: number;
  };
  body: string;
}

interface DocSidebarProps {
  categories: Record<string, DocEntry[]>;
  currentSlug?: string;
}

export default function DocSidebar({ categories, currentSlug }: DocSidebarProps) {
  const [activeSlug, setActiveSlug] = useState(currentSlug || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Update active slug when navigating
    const path = window.location.pathname;
    const match = path.match(/\/docs\/(.+)$/);
    if (match) {
      setActiveSlug(match[1]);
    } else if (path === '/docs' || path === '/docs/') {
      setActiveSlug(currentSlug || '');
    }
  }, [currentSlug]);

  // Filter docs based on search query
  const filteredCategories = Object.entries(categories).reduce((acc, [category, docs]) => {
    const filteredDocs = docs.filter(doc => 
      doc.data.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredDocs.length > 0) {
      acc[category] = filteredDocs;
    }
    return acc;
  }, {} as Record<string, DocEntry[]>);

  return (
    <div className="sticky top-24">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-primary-500 focus:bg-white transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-6">
        {Object.entries(filteredCategories).map(([category, docs]) => (
          <div key={category}>
            <h3 className="font-semibold text-neutral-700 mb-2 text-sm uppercase tracking-wider">
              {category}
            </h3>
            <ul className="space-y-1">
              {docs.map((doc) => (
                <li key={doc.slug}>
                  <a
                    href={`/docs/${doc.slug}`}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSlug === doc.slug
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                    }`}
                  >
                    {doc.data.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
        <h4 className="font-semibold text-neutral-700 mb-3 text-sm">Liens rapides</h4>
        <ul className="space-y-2">
          <li>
            <a href="/api" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Documentation API
            </a>
          </li>
          <li>
            <a href="https://github.com/motiv" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </li>
          <li>
            <a href="/contact" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Support
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}