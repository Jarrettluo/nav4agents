'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Copy, Download, ExternalLink, Check, FileText, User } from 'lucide-react';
import { skills } from '@/data/skills';

export default function SkillDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const skill = skills.find(s => s.slug === slug);

  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contentError, setContentError] = useState(false);

  const getGithubUrl = () => skill?.githubUrl || null;

  const getRawContentUrl = () => {
    if (!skill?.githubUrl) return null;
    return skill.githubUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  };

  useEffect(() => {
    if (!skill?.githubUrl) {
      setContentError(true);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setContentError(false);
      try {
        const rawUrl = getRawContentUrl();
        if (!rawUrl) throw new Error('No raw URL');
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();
        setMarkdownContent(text);
      } catch (error) {
        console.error('Failed to fetch SKILL.md:', error);
        setContentError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [skill?.githubUrl]);

  const handleCopyInstallCmd = async () => {
    if (!skill?.installCmd) return;
    try {
      await navigator.clipboard.writeText(skill.installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill?.slug || 'skill'}-SKILL.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!skill) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Skill 不存在</h1>
        <Link href="/skills" className="text-blue-600 hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const githubUrl = getGithubUrl();

  return (
    <div>
      {/* 返回链接 */}
      <Link
        href="/skills"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回 AI Skills
      </Link>

      {/* 头部信息 */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 font-outfit">{skill.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="tag tag-primary text-xs sm:text-sm">{skill.category}</span>
              <span className={`tag text-xs sm:text-sm ${skill.source === '自研' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {skill.source}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <User className="w-3 h-3 sm:w-4 sm:h-4" /> {skill.usage} 次使用
              </span>
            </div>
          </div>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm text-gray-700 transition-colors self-start"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              GitHub
            </a>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{skill.description}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        {skill.installCmd && (
          <button
            onClick={handleCopyInstallCmd}
            className="btn btn-primary flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制安装命令
              </>
            )}
          </button>
        )}

        {markdownContent && (
          <button
            onClick={handleDownload}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载 SKILL.md
          </button>
        )}
      </div>

      {/* 安装命令展示 */}
      {skill.installCmd && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">安装命令</h3>
          <div className="bg-gray-100 rounded-lg px-3 py-2 sm:px-4 sm:py-3 font-mono text-xs sm:text-sm text-gray-800 break-all">
            {skill.installCmd}
          </div>
        </div>
      )}

      {/* SKILL.md 内容 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          文件详情
        </h3>

        {loading && (
          <div className="card text-center py-12">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="text-gray-500 mt-4">正在加载 SKILL.md...</p>
          </div>
        )}

        {contentError && (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-2">无法加载 SKILL.md 内容</p>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                在 GitHub 上查看 →
              </a>
            )}
          </div>
        )}

        {!loading && !contentError && markdownContent && (
          <div className="card markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-6 first:mt-0 font-outfit">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-semibold text-gray-800 mb-2 mt-4">{children}</h4>,
                p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {children}
                  </a>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={`${className} block bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono mb-4`} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-600 border-b">{children}</td>,
                hr: () => <hr className="border-gray-200 my-6" />,
                strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="max-w-full h-auto rounded-lg mb-4" />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <style jsx global>{`
        .markdown-content pre {
          margin: 0;
        }
        .markdown-content pre code {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
