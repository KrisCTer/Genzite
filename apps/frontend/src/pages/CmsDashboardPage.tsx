import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Select, Badge, EmptyState, SearchInput, useToast } from '@genzite/shared-ui';
import { Plus, Clock, Trash2, AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
}

export const CmsDashboardPage: React.FC = () => {
  const { toast } = useToast();

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
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      slug: newPostTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: newPostContent,
      category: newPostCategory
    };
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    toast({
      title: 'Post Published',
      description: `"${newPost.title}" has been successfully published to ${newPost.category}.`,
      variant: 'success'
    });
  };

  const handleDeletePost = (id: string) => {
    const postToDelete = posts.find(p => p.id === id);
    setPosts(posts.filter(post => post.id !== id));
    if (postToDelete) {
      toast({
        title: 'Post Deleted',
        description: `"${postToDelete.title}" has been removed.`,
        variant: 'info'
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Announcements': return 'amber';
      case 'Design': return 'teal';
      case 'Development': return 'blue';
      default: return 'stone';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Form Panel */}
      <div className="h-fit">
        <Card>
          <Card.Header>
            <h2 className="text-base font-semibold text-[var(--gz-text)] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--gz-primary-600)]" />
              Publish New Record
            </h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleAddPost} className="space-y-4 text-left">
              <Input
                label="Title"
                placeholder="Enter record title..."
                value={newPostTitle}
                onChange={(e: any) => setNewPostTitle(e.target.value)}
                required
              />
              <Select
                label="Category"
                value={newPostCategory}
                onValueChange={setNewPostCategory}
                options={[
                  { value: 'General', label: 'General' },
                  { value: 'Announcements', label: 'Announcements' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Development', label: 'Development' },
                ]}
              />
              <Textarea
                label="Content"
                placeholder="Write content body here..."
                value={newPostContent}
                onChange={(e: any) => setNewPostContent(e.target.value)}
                rows={4}
                required
              />
              <Button type="submit" className="w-full" leftIcon={<Plus className="w-4 h-4" />}>
                Publish Record
              </Button>
            </form>
          </Card.Body>
        </Card>
      </div>

      {/* Right Display Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            placeholder="Search posts by title or category..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full"
          />
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="border-dashed">
            <Card.Body>
              <EmptyState
                icon={<AlertCircle className="w-12 h-12 text-[var(--gz-text-muted)]" />}
                title="No CMS records found."
                description="Try checking spelling or creating a new post."
              />
            </Card.Body>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map(post => (
              <Card
                key={post.id}
                hoverable
                className="relative overflow-hidden flex flex-col justify-between"
              >
                <Card.Body className="text-left flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="soft" color={getBadgeColor(post.category)}>
                        {post.category}
                      </Badge>
                      <span className="text-[var(--gz-text-muted)] text-xs font-mono">/posts/{post.slug}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--gz-text)] mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[var(--gz-text-secondary)] text-xs leading-relaxed mb-6">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[var(--gz-border)] mt-auto">
                    <span className="text-xs text-[var(--gz-text-muted)] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Just now
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 h-auto text-[var(--gz-text-muted)] hover:text-[var(--gz-danger-500)]"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
