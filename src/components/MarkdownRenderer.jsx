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
        maxWidth: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // 1. Unwrap <pre> to prevent duplicate container boxes
          pre({ children }) {
            return <>{children}</>;
          },

          // 2. Custom Code Block & Inline Code renderer
          code({ node, inline, className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
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
                className={codeClassName}
                {...props}
              >
                {typeof children === 'string'
                  ? children.replace(/^`|`$/g, '')
                  : children}
              </code>
            );
          },

          // 3. Fully Slidable & Responsive Table Container
          table({ children, ...props }) {
            return (
              <div
                className="table-scroll-wrapper"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch', // Smooth momentum scrolling on iOS/Mobile
                  margin: '1.5rem 0',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    minWidth: 'max-content', // Forces horizontal expansion and enables sliding
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                  }}
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },

          // 4. Formatted Table Header
          thead({ children, ...props }) {
            return (
              <thead
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
                }}
                {...props}
              >
                {children}
              </thead>
            );
          },

          // 5. Header Cell Styling
          th({ children, ...props }) {
            return (
              <th
                style={{
                  padding: '0.75rem 1.1rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                }}
                {...props}
              >
                {children}
              </th>
            );
          },

          // 6. Data Row Styling
          tr({ children, ...props }) {
            return (
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'background-color 0.15s ease',
                }}
                {...props}
              >
                {children}
              </tr>
            );
          },

          // 7. Data Cell Styling
          td({ children, ...props }) {
            return (
              <td
                style={{
                  padding: '0.75rem 1.1rem',
                  verticalAlign: 'top',
                  minWidth: '130px', // Keeps text readable without excessive squishing
                }}
                {...props}
              >
                {children}
              </td>
            );
          },
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}