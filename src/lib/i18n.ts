/** 中文本地化辅助：优先取中文，缺失时回退原文 */

export const pickZh = (zh?: string | null, en?: string | null): string => {
  const z = (zh || '').trim();
  return z || (en || '').trim();
};

/** 去掉 Markdown 语法符号（用于纯文本展示位：列表/卡片/描述，避免露出 `、**、[x](url)） */
export const stripMd = (s?: string | null): string => {
  const t = (s || '').trim();
  if (!t) return '';
  return t
    .replace(/\[([^\]]+)\]\([^)]*\)?/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`/g, '')
    .trim();
};

/** 描述展示助手：中文优先 + 去 Markdown 符号 */
export const displayDesc = (zh?: string | null, en?: string | null): string => stripMd(pickZh(zh, en));

/** 搜索匹配用：把中英文字段拼一起（中英双语都能搜到） */
export const searchBlob = (...parts: Array<string | null | undefined>): string =>
  parts
    .filter((x): x is string => !!x)
    .join(' ')
    .toLowerCase();