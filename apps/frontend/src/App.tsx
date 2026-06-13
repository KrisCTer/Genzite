import React, { useState } from 'react'

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
}

interface Widget {
  id: string;
  type: 'Header' | 'Hero' | 'Card' | 'Footer';
  content: string;
  color: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cms' | 'builder'>('cms')

  // CMS State
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'Welcome to Genzite CMS',
      slug: 'welcome-to-genzite',
      content: 'This is your first CMS post. You can edit or delete this post dynamically.',
      category: 'Announcements'
    },
    {
      id: '2',
      title: 'Designing with Tailwind v4',
      slug: 'designing-with-tailwind-v4',
      content: 'Learn how to build beautiful, responsive layout components with the newly updated Tailwind CSS engine.',
      category: 'Design'
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('General')

  // Builder State
  const [canvasWidgets, setCanvasWidgets] = useState<Widget[]>([
    { id: 'w1', type: 'Header', content: 'Genzite Portal', color: 'from-purple-600 to-indigo-600' },
    { id: 'w2', type: 'Hero', content: 'Create Next-Gen Visual Interfaces Instantly', color: 'from-slate-800 to-slate-900' }
  ])
  const [canvasBg, setCanvasBg] = useState<'light' | 'dark' | 'grid'>('grid')

  // Handle Add Post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostTitle || !newPostContent) return
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      slug: newPostTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: newPostContent,
      category: newPostCategory
    }
    setPosts([newPost, ...posts])
    setNewPostTitle('')
    setNewPostContent('')
  }

  // Handle Delete Post
  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id))
  }

  // Handle Add Widget
  const addWidget = (type: 'Header' | 'Hero' | 'Card' | 'Footer') => {
    const defaultContents = {
      Header: 'New Navigation Bar',
      Hero: 'Discover Our Brand Value',
      Card: 'Feature Highlight Card',
      Footer: '© 2026 Genzite. All rights reserved.'
    }
    const colors = {
      Header: 'from-pink-600 to-rose-600',
      Hero: 'from-emerald-800 to-teal-900',
      Card: 'from-violet-800 to-purple-900',
      Footer: 'from-zinc-800 to-zinc-900'
    }
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      content: defaultContents[type],
      color: colors[type]
    }
    setCanvasWidgets([...canvasWidgets, newWidget])
  }

  const removeWidget = (id: string) => {
    setCanvasWidgets(canvasWidgets.filter(w => w.id !== id))
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-between p-2 shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">Genzite</h1>
              <span className="text-xs text-slate-500 font-medium">NestJS + React Workspace</span>
            </div>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'cms' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              CMS Dashboard
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'builder' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              App Builder Canvas
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'cms' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Form Panel */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 h-fit backdrop-blur-sm shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Publish New Record
              </h2>
              <form onSubmit={handleAddPost} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter record title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    <option value="General">General</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Write content body here..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Publish Record
                </button>
              </form>
            </div>

            {/* Right Display Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search posts by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-900 rounded-2xl bg-slate-900/10">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400 font-medium">No CMS records found.</p>
                  <span className="text-xs text-slate-500">Try checking spelling or creating a new post.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPosts.map(post => (
                    <article
                      key={post.id}
                      className="group bg-slate-900/20 border border-slate-900/80 hover:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300 pointer-events-none"></div>
                      <div className="text-left">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 text-xs font-semibold text-purple-400 bg-purple-400/10 border border-purple-500/10 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-slate-600 text-xs font-mono">/posts/{post.slug}</span>
                        </div>
                        <h3 className="text-md font-bold text-white group-hover:text-purple-400 transition-colors mb-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-900/60 mt-auto">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Just now
                        </span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* App Builder Canvas */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Controls & Sidebar widgets */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-left">Canvas Canvas Background</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCanvasBg('light')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${canvasBg === 'light' ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setCanvasBg('dark')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${canvasBg === 'dark' ? 'bg-slate-900 text-white border-purple-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setCanvasBg('grid')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${canvasBg === 'grid' ? 'bg-purple-950/20 text-purple-400 border-purple-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Grid
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-left">Widgets Toolbox</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Header', desc: 'Standard Header bar with links', icon: 'M4 6h16M4 12h16m-7 6h7' },
                    { type: 'Hero', desc: 'Hero section with text banner', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
                    { type: 'Card', desc: 'Feature highlight showcase card', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
                    { type: 'Footer', desc: 'Copyright note footer segment', icon: 'M3 8V4m0 0h4M3 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 4v4m0 0h4m-4 0l4-4m8 4v-4m0 0h-4m4 0l-4-4' }
                  ].map(w => (
                    <button
                      key={w.type}
                      onClick={() => addWidget(w.type as any)}
                      className="w-full flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 hover:border-purple-500 hover:bg-slate-900/50 rounded-xl transition-all duration-200 text-left group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-950/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={w.icon} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none mb-1">{w.type}</h4>
                        <span className="text-[10px] text-slate-500">{w.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Canvas Area */}
            <div className="lg:col-span-3">
              <div
                className={`w-full min-h-[500px] border border-slate-900 rounded-2xl p-6 transition-all duration-300 relative ${
                  canvasBg === 'light'
                    ? 'bg-slate-50 text-slate-900'
                    : canvasBg === 'dark'
                    ? 'bg-slate-900/50 text-slate-100'
                    : 'bg-slate-950 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] border border-slate-900'
                }`}
              >
                {canvasWidgets.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                    <svg className="w-16 h-16 text-slate-800 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-slate-600 font-semibold text-sm">Your visual layout is empty.</p>
                    <span className="text-xs text-slate-700 mt-1">Select visual modules from the toolbox on the left to stack elements.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900/30">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Workspace Preview</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-400 font-mono">{canvasWidgets.length} elements</span>
                    </div>
                    {canvasWidgets.map((widget, idx) => (
                      <div
                        key={widget.id}
                        className={`group relative p-6 rounded-xl bg-gradient-to-r ${widget.color} border border-white/5 shadow-md flex items-center justify-between transition-all duration-300 hover:scale-[1.01]`}
                      >
                        <div className="text-left">
                          <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase block mb-1">
                            [{idx + 1}] {widget.type}
                          </span>
                          <span className="text-sm font-semibold text-white">{widget.content}</span>
                        </div>
                        <button
                          onClick={() => removeWidget(widget.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/30 hover:bg-black/50 text-white/80 hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
