/** 中文本地化辅助：优先取中文，缺失时回退原文 */

export const pickZh = (zh?: string | null, en?: string | null): string => {
  const z = (zh || '').trim();
  return z || (en || '').trim();
};

/** 搜索匹配用：把中英文字段拼一起（中英双语都能搜到） */
export const searchBlob = (...parts: Array<string | null | undefined>): string =>
  parts
    .filter((x): x is string => !!x)
    .join(' ')
    .toLowerCase();