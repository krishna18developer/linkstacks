'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BoardCreator from '@/components/BoardCreator';
import SupabaseTest from '@/components/SupabaseTest';
import { Link, BookOpen, Users, Zap } from 'lucide-react';

export default function HomePage() {
  const [showCreator, setShowCreator] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const router = useRouter();

  const handleBoardCreated = (slugPath: string) => {
    router.push(`/${slugPath}`);
  };

  if (showCreator) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowCreator(false)}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to home
          </button>
          <BoardCreator onSuccess={handleBoardCreated} />
        </div>
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowTest(false)}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to home
          </button>
          <SupabaseTest />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Link className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LinkStacks</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreator(true)}
                className="btn-primary"
              >
                Create Board
              </button>
              <button
                onClick={() => setShowTest(true)}
                className="btn-secondary"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Organize Links with
            <span className="text-blue-600"> Hierarchical Tags</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A collaborative link curator that lets you organize links with hierarchical tags, 
            multi-segment board paths, and drag-and-drop reordering. Perfect for teams, 
            personal projects, and knowledge management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowCreator(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="btn-secondary text-lg px-8 py-3"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hierarchical Organization
            </h3>
            <p className="text-gray-600">
              Organize links with nested tags like &quot;Tech/AI/Agents&quot; for intuitive categorization.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Collaborative Editing
            </h3>
            <p className="text-gray-600">
              Share boards with teams using multi-segment paths like &quot;teams/alpha/ai&quot;.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Features
            </h3>
            <p className="text-gray-600">
              Automatic metadata fetching, drag-and-drop reordering, and global search.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Board
              </h3>
              <p className="text-gray-600 text-sm">
                Choose a path like &quot;my-project&quot; or &quot;@team/ai&quot;
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add Links
              </h3>
              <p className="text-gray-600 text-sm">
                Paste URLs and assign hierarchical tags
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Organize
              </h3>
              <p className="text-gray-600 text-sm">
                Drag and drop to reorder, edit titles inline
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Collaborate
              </h3>
              <p className="text-gray-600 text-sm">
                Share boards and work together seamlessly
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Organize Your Links?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start creating your first board and experience the power of hierarchical organization.
          </p>
          <button
            onClick={() => setShowCreator(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            Create Your First Board
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LinkStacks. Built with Next.js, Supabase, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}