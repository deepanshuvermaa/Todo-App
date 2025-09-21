import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const LinkManager = () => {
  const { user } = useAppStore();

  const [links, setLinks] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCategory, setNewCategory] = useState('');

  const categories = ['all', 'work', 'personal', 'resources', 'social', 'news', 'entertainment'];

  useEffect(() => {
    // Load saved links from localStorage
    const savedLinks = localStorage.getItem('linkManager_links');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  useEffect(() => {
    // Save links to localStorage whenever links change
    localStorage.setItem('linkManager_links', JSON.stringify(links));
  }, [links]);

  const extractLinkPreview = async (url) => {
    // Simulate link preview extraction (in production, use a service like LinkPreview API)
    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extract domain from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      // Sample link previews based on domain
      const samplePreviews = {
        'github.com': {
          title: 'GitHub Repository',
          description: 'A collaborative platform for version control and code hosting.',
          favicon: '🐙',
          image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        },
        'stackoverflow.com': {
          title: 'Stack Overflow Question',
          description: 'Programming questions and answers from the developer community.',
          favicon: '📚',
          image: null
        },
        'youtube.com': {
          title: 'YouTube Video',
          description: 'Video content on the world\'s largest video sharing platform.',
          favicon: '📺',
          image: null
        },
        'medium.com': {
          title: 'Medium Article',
          description: 'Thoughtful articles and stories from writers and experts.',
          favicon: '📰',
          image: null
        },
        'docs.google.com': {
          title: 'Google Docs',
          description: 'Collaborative document editing and sharing.',
          favicon: '📄',
          image: null
        }
      };

      const preview = samplePreviews[domain] || {
        title: `Website - ${domain}`,
        description: `Content from ${domain}`,
        favicon: '🌐',
        image: null
      };

      return {
        ...preview,
        url,
        domain,
        addedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new Error('Failed to fetch link preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const addLink = async () => {
    if (!urlInput.trim()) return;

    try {
      // Validate URL
      new URL(urlInput);

      // Check if link already exists
      if (links.some(link => link.url === urlInput)) {
        alert('This link has already been saved!');
        return;
      }

      const linkData = await extractLinkPreview(urlInput);

      const newLink = {
        id: Date.now(),
        ...linkData,
        category: newCategory || 'personal',
        tags: [],
        notes: '',
        isBookmarked: false,
        visitCount: 0,
        lastVisited: null
      };

      setLinks(prev => [newLink, ...prev]);
      setUrlInput('');
      setNewCategory('');

    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  const removeLink = (linkId) => {
    setLinks(prev => prev.filter(link => link.id !== linkId));
  };

  const toggleBookmark = (linkId) => {
    setLinks(prev => prev.map(link =>
      link.id === linkId
        ? { ...link, isBookmarked: !link.isBookmarked }
        : link
    ));
  };

  const visitLink = (linkId, url) => {
    setLinks(prev => prev.map(link =>
      link.id === linkId
        ? {
            ...link,
            visitCount: link.visitCount + 1,
            lastVisited: new Date().toISOString()
          }
        : link
    ));
    window.open(url, '_blank');
  };

  const updateLinkNotes = (linkId, notes) => {
    setLinks(prev => prev.map(link =>
      link.id === linkId ? { ...link, notes } : link
    ));
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.domain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const exportLinks = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-links.json';
    link.click();
  };

  const importLinks = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLinks = JSON.parse(e.target.result);
          setLinks(prev => [...prev, ...importedLinks]);
        } catch (error) {
          alert('Error importing links. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="link-manager max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔗 Link Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Save, organize, and manage your important links with previews and notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Add Link Section */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Add New Link */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Add New Link</h2>

            <div className="space-y-4">
              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLink()}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select category...</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addLink}
                  disabled={isProcessing || !urlInput.trim()}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Add Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search links..."
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-4">
            {filteredLinks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold mb-2">No links yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add your first link to get started!
                </p>
              </div>
            ) : (
              filteredLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border"
                >
                  <div className="flex items-start gap-4">
                    {/* Favicon */}
                    <div className="text-2xl">{link.favicon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{link.title}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(link.id)}
                            className={`p-1 rounded ${link.isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
                          >
                            {link.isBookmarked ? '⭐' : '☆'}
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {link.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>{link.domain}</span>
                        <span>Category: {link.category}</span>
                        <span>Visits: {link.visitCount}</span>
                        {link.lastVisited && (
                          <span>Last: {new Date(link.lastVisited).toLocaleDateString()}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => visitLink(link.id, link.url)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Visit
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(link.url)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Links:</span>
                <span className="font-semibold">{links.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Bookmarked:</span>
                <span className="font-semibold">{links.filter(l => l.isBookmarked).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-semibold">{new Set(links.map(l => l.category)).size}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.slice(1).map(category => {
                const count = links.filter(l => l.category === category).length;
                return count > 0 ? (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={exportLinks}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                📤 Export Links
              </button>

              <label className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer block text-center">
                📥 Import Links
                <input
                  type="file"
                  accept=".json"
                  onChange={importLinks}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Bookmark important links with the star</li>
              <li>• Use categories to organize your links</li>
              <li>• Export your links as backup</li>
              <li>• Search works on title and description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkManager;