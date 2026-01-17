import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code({ className: codeClassName, children, ...props }) {
                        const match = /language-(\w+)/.exec(codeClassName || '');
                        const language = match ? match[1] : '';
                        const codeString = String(children).replace(/\n$/, '');

                        // Check if it's inline code (no language specified and short content)
                        const isInline = !match && !codeString.includes('\n');

                        if (!isInline && language) {
                            return (
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={language}
                                    PreTag="div"
                                    customStyle={{
                                        margin: '1em 0',
                                        borderRadius: '8px',
                                        fontSize: '0.9em',
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            );
                        }

                        // Inline code or code block without language
                        return (
                            <code className={`inline-code ${codeClassName || ''}`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Custom link rendering
                    a({ children, href, ...props }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="markdown-link"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    // Custom table rendering
                    table({ children, ...props }) {
                        return (
                            <div className="table-wrapper">
                                <table {...props}>{children}</table>
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default MarkdownRenderer;
