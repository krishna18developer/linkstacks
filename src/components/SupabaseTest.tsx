'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');
  const [envCheck, setEnvCheck] = useState<{
    url: string;
    key: string;
  }>({ url: '', key: '' });

  useEffect(() => {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET';
    
    setEnvCheck({ url, key });

    // Test Supabase connection
    const testConnection = async () => {
      try {
        setStatus('testing');
        setMessage('Testing Supabase connection...');

        // Test basic connection
        const { error } = await supabase
          .from('boards')
          .select('*')
          .limit(1);

        if (error) {
          setStatus('error');
          setMessage(`Connection failed: ${error.message}`);
          return;
        }

        // Test creating a board
        setMessage('Testing board creation...');
        const testBoardPath = `test-${Date.now()}`;
        const { data: board, error: boardError } = await supabase
          .from('boards')
          .insert({
            slug_path: testBoardPath,
            slug_segments: [testBoardPath],
            title: 'Test Board'
          })
          .select()
          .single();

        if (boardError) {
          setStatus('error');
          setMessage(`Board creation failed: ${boardError.message}`);
          return;
        }

        // Test creating a link
        setMessage('Testing link creation...');
        const { data: link, error: linkError } = await supabase
          .from('links')
          .insert({
            board_id: board.id,
            url: 'https://example.com',
            title: 'Test Link',
            client_id: 'test-client'
          })
          .select()
          .single();

        if (linkError) {
          setStatus('error');
          setMessage(`Link creation failed: ${linkError.message}`);
          return;
        }

        // Test creating link tags
        setMessage('Testing tag creation...');
        const { error: tagError } = await supabase
          .from('link_tags')
          .insert({
            link_id: link.id,
            tag_path: 'Test/Tag',
            position: 0
          });

        if (tagError) {
          setStatus('error');
          setMessage(`Tag creation failed: ${tagError.message}`);
          return;
        }

        // Clean up test data
        await supabase.from('link_tags').delete().eq('link_id', link.id);
        await supabase.from('links').delete().eq('id', link.id);
        await supabase.from('boards').delete().eq('id', board.id);

        setStatus('success');
        setMessage('All tests passed! Supabase is working correctly.');
      } catch (err) {
        setStatus('error');
        setMessage(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'testing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Supabase Connection Test
      </h2>
      
      <div className="space-y-4">
        {/* Environment Variables Check */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Environment Variables:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">URL:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {envCheck.url === 'NOT_SET' ? '❌ NOT SET' : '✅ Set'}
              </code>
            </div>
            <div>
              <span className="font-medium">Anon Key:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {envCheck.key === 'NOT_SET' ? '❌ NOT SET' : '✅ Set'}
              </code>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Connection Status:</h3>
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            <span className="text-lg">{getStatusIcon()}</span>
            <span className="text-sm">{message}</span>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Check your <code>.env.local</code> file exists in the project root</li>
              <li>• Verify your Supabase URL and anon key are correct</li>
              <li>• Make sure you&apos;ve run the SQL schema in Supabase</li>
              <li>• Restart your development server after adding environment variables</li>
              <li>• Check that your Supabase project is active (not paused)</li>
            </ul>
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              🎉 Great! Your Supabase connection is working. You can now create boards and add links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
