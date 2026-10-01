import {
  Blocks,
  Brain,
  Cloud,
  Diamond,
  Github,
  MessageCircle,
  MousePointer2,
  Sparkles,
  SquareTerminal,
  Waves,
  Zap,
} from 'lucide-react';

// 平台图标映射（替代 emoji，统一使用 Lucide 线性图标）
const MAP = {
  pointer: MousePointer2,
  waves: Waves,
  github: Github,
  diamond: Diamond,
  message: MessageCircle,
  brain: Brain,
  sparkles: Sparkles,
  zap: Zap,
  cloud: Cloud,
  terminal: SquareTerminal,
} as const;

export type PlatformIconName = keyof typeof MAP;

export default function PlatformIcon({
  name,
  className = 'w-5 h-5',
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name as PlatformIconName] ?? Blocks;
  return <Icon className={className} aria-hidden="true" />;
}