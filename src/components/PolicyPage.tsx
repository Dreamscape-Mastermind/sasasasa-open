'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface PolicyPageProps {
  contentPath: string;
}

const PolicyPage: React.FC<PolicyPageProps> = ({ contentPath }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(contentPath)
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error('Error loading markdown:', error);
        setLoading(false);
      });
  }, [contentPath]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="prose mx-auto p-4 dark:prose-invert prose-slate dark:text-gray-300">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default PolicyPage; 