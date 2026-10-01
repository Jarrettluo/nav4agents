import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText, User, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllSkills } from '@/lib/data/skills';
import { buildSkillMetadata, ogImage } from '@/lib/seo';
import { pickZh, displayDesc } from '@/lib/i18n';
import CopyButton from '@/components/CopyButton';
import FavoriteButton from '@/components/FavoriteButton';
import HiddenShareImage from '@/components/HiddenShareImage';

// 静态生成全部详情页（SSG）：原始 HTML 即含完整内容 + OG 标签，微信/搜索爬虫可读
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSkills().map((s) => ({ slug: s.slug }));
}

function getSkillSync(slug: string) {
  return getAllSkills().find((x) => x.slug === slug) || null;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const skill = getSkillSync(params.slug);
  if (!skill) return { title: 'Skill 不存在' };
  return buildSkillMetadata(skill);
}

export default function SkillDetailPage({ params }: { params: { slug: string } }) {
  const skill = getSkillSync(params.slug);
  if (!skill) notFound();

  const githubUrl = skill.githubUrl || null;
  // 优先展示中文版本说明
  const markdownContent = pickZh(skill.changelogZh, skill.changelog);

  return (
    <div>
      <HiddenShareImage src={ogImage.sqSkill(skill.slug)} />
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
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 font-outfit break-words">{skill.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag tag-primary text-xs whitespace-nowrap">{skill.category}</span>
              <span className="tag text-xs bg-blue-100 text-blue-700 whitespace-nowrap">
                {skill.source}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                <User className="w-3.5 h-3.5" /> {skill.usage.toLocaleString()} 次使用
              </span>
            </div>
            {skill.topics && skill.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skill.topics.slice(0, 10).map((t: string) => (
                  <span key={t} className="text-xs text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 whitespace-nowrap">#{t}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm text-gray-700 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                GitHub
              </a>
            )}
            <FavoriteButton type="skill" itemId={skill.id} size="md" />
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{displayDesc(skill.descriptionZh, skill.description)}</p>
      </div>

      {/* 操作按钮 */}
      {skill.url && (
        <div className="flex flex-wrap gap-3 mb-6">
          <a
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            在 ClawHub 查看
          </a>
        </div>
      )}

      {/* 安装命令展示（与 MCP 详情页样式一致） */}
      {skill.installCmd && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">安装命令</h3>
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <code className="text-green-400 font-mono text-xs sm:text-sm break-all">
              {skill.installCmd}
            </code>
            <CopyButton text={skill.installCmd} dark />
          </div>
        </div>
      )}

      {/* 版本说明 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          版本说明{skill.version ? ` (v${skill.version})` : ''}
        </h2>

        {!markdownContent && (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-2">暂无版本说明</p>
            {skill.url && (
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
              >
                在 ClawHub 上查看详情 <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {markdownContent && (
          <div className="card markdown-content">
            <Markdown
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt} className="max-w-full h-auto rounded-lg mb-4" />
                ),
              }}
            >
              {markdownContent}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
}