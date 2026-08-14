import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useCodeThemeStore, CODE_THEMES } from '../store/useCodeThemeStore';

export default function CodeBlock({ language, codeString }) {
  const [copied, setCopied] = useState(false);
  const { currentThemeKey, setThemeKey } = useCodeThemeStore();

  const activeThemeConfig =
    CODE_THEMES[currentThemeKey] || CODE_THEMES.vscDarkPlus;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div
      style={{
        margin: '1.25rem 0',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: activeThemeConfig.bg,
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.8rem',
          color: '#9ca3af',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            textTransform: 'lowercase',
            fontWeight: 500,
            letterSpacing: '0.03em',
            color: '#e5e7eb',
            fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
          }}
        >
          {language || 'code'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Theme Selector */}
          <select
            value={currentThemeKey}
            onChange={(e) => setThemeKey(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              color: '#d1d5db',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(CODE_THEMES).map(([key, config]) => (
              <option
                key={key}
                value={key}
                style={{ background: '#18181b', color: '#f3f4f6' }}
              >
                {config.label}
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: copied ? '#4ade80' : '#d1d5db',
              border: copied
                ? '1px solid rgba(34, 197, 94, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with Gemini Font & Anti-Aliasing */}
      <SyntaxHighlighter
        style={activeThemeConfig.theme}
        language={language}
        PreTag="div"
        showLineNumbers={true}
        wrapLines={false}
        useInlineStyles={true}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', 'Roboto Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            fontSize: '14.5px', // Crisp, slightly larger size
            lineHeight: '1.7',
            fontWeight: 400, // Explicitly prevents muddy bold text
            textShadow: 'none', // Removes blurry glow/shadows
            background: 'transparent', // Strips the patchy block backgrounds
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        }}
        customStyle={{
          margin: 0,
          padding: '1.1rem 1rem',
          fontSize: '14.5px',
          lineHeight: '1.7',
          backgroundColor: 'transparent',
          overflowX: 'auto',
        }}
        lineNumberStyle={{
          minWidth: '2.5rem',
          paddingRight: '1.1rem',
          color: 'rgba(255, 255, 255, 0.22)',
          userSelect: 'none',
          fontSize: '13px',
          fontWeight: 400,
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}