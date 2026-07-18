import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

// Renders markdown content with GitHub-flavored markdown + KaTeX math support.
// Use $...$ for inline math and $$...$$ for block math.
export default function MarkdownRenderer({ content, id }) {
  return (
    <div id={id} className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content || ''}
      </ReactMarkdown>
    </div>
  )
}
