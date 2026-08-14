import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import CodeBlock from './CodeBlock';

export default function MarkdownRenderer({ content, id, className = '' }) {
  return (
    <div
      id={id}
      className={`markdown-body w-full max-w-none ${className}`}
      style={{
        width: '100%',
        maxWidth: '100%', // Removes narrow squeeze/centering constraints
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // 1. Unwrap <pre> so it does NOT render an extra outer box
          pre({ children }) {
            return <>{children}</>;
          },

          // 2. Custom Code renderer
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            // Multi-line code block with a specified language
            if (!inline && match) {
              return (
                <CodeBlock
                  language={match[1]}
                  codeString={codeString}
                />
              );
            }

            // Multi-line code block without a specified language
            if (!inline && codeString.includes('\n')) {
              return (
                <CodeBlock
                  language="text"
                  codeString={codeString}
                />
              );
            }

            // Inline single backtick code
            return (
              <code
                style={{
                  backgroundColor: 'rgba(26, 115, 232, 0.08)',
                  color: '#1a73e8',
                  padding: '0.18rem 0.4rem',
                  borderRadius: '6px',
                  fontSize: '0.85em',
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                  fontWeight: 600,
                  border: '1px solid rgba(26, 115, 232, 0.2)',
                  whiteSpace: 'break-spaces',
                }}
                className={className}
                {...props}
              >
                {typeof children === 'string'
                  ? children.replace(/^`|`$/g, '')
                  : children}
              </code>
            );
          },

          // 3. Responsive full-width table container
          table({ children }) {
            return (
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  margin: '1.25rem 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}