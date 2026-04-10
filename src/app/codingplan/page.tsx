'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { codingPlans, platforms, CodingPlan } from '@/data/codingplan';

type SortField = 'platform' | 'plan' | 'monthlyPrice' | 'yearlyPrice' | 'fiveHourRequests' | 'weeklyRequests' | 'monthlyRequests';
type SortDirection = 'asc' | 'desc';

const platformColors: Record<string, string> = {
  '智谱AI': 'bg-blue-100 text-blue-700',
  'MiniMax': 'bg-purple-100 text-purple-700',
  '字节·方舟': 'bg-orange-100 text-orange-700',
  '阿里·百炼': 'bg-red-100 text-red-700',
  '小米·MiMo': 'bg-green-100 text-green-700',
  '腾讯云': 'bg-cyan-100 text-cyan-700',
  '腾讯·Token': 'bg-cyan-50 text-cyan-600',
  '百度·千帆': 'bg-yellow-100 text-yellow-700',
  '京东云': 'bg-pink-100 text-pink-700',
  'Kimi': 'bg-indigo-100 text-indigo-700',
};

function parsePrice(price: string): number {
  if (price === '-' || price === '无限制' || price === '未公开') return 0;
  const match = price.replace(/[^0-9.]/g, '');
  return parseFloat(match) || 0;
}

function parseNumber(val: string): number {
  if (val === '无限制' || val === '未公开' || val === '-') return 0;
  return parseInt(val.replace(/,/g, '')) || 0;
}

export default function CodingPlanPage() {
  const [sortField, setSortField] = useState<SortField>('monthlyPrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [platformFilter, setPlatformFilter] = useState<string>('全部');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPlans = useMemo(() => {
    let filtered = platformFilter === '全部'
      ? codingPlans
      : codingPlans.filter(p => p.platform === platformFilter);

    return [...filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'monthlyPrice':
          aVal = parsePrice(a.monthlyPrice);
          bVal = parsePrice(b.monthlyPrice);
          break;
        case 'yearlyPrice':
          aVal = parsePrice(a.yearlyPrice);
          bVal = parsePrice(b.yearlyPrice);
          break;
        case 'fiveHourRequests':
          aVal = parseNumber(a.fiveHourRequests);
          bVal = parseNumber(b.fiveHourRequests);
          break;
        case 'weeklyRequests':
          aVal = parseNumber(a.weeklyRequests);
          bVal = parseNumber(b.weeklyRequests);
          break;
        case 'monthlyRequests':
          aVal = parseNumber(a.monthlyRequests);
          bVal = parseNumber(a.monthlyRequests);
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [sortField, sortDirection, platformFilter]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">AI Coding Plan 对比</h1>
        <p className="text-sm text-gray-500">
          九大平台智谱AI、Kimi、MiniMax、字节·方舟、阿里·百炼、百度·千帆、腾讯云、京东云、小米·MiMo 全面对比
        </p>
      </div>

      {/* 平台筛选 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setPlatformFilter('全部')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            platformFilter === '全部'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部平台
        </button>
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              platformFilter === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="text-sm text-gray-500 mb-4">
        共 {sortedPlans.length} 个套餐
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort('platform')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  平台
                  <SortIcon field="platform" />
                </button>
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort('plan')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  套餐
                  <SortIcon field="plan" />
                </button>
              </th>
              <th className="px-3 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort('monthlyPrice')}
                  className="flex items-center gap-1 ml-auto hover:text-blue-600"
                >
                  月费
                  <SortIcon field="monthlyPrice" />
                </button>
              </th>
              <th className="px-3 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort('yearlyPrice')}
                  className="flex items-center gap-1 ml-auto hover:text-blue-600"
                >
                  年费
                  <SortIcon field="yearlyPrice" />
                </button>
              </th>
              <th className="px-3 py-3 text-center font-medium text-gray-600 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('fiveHourRequests')}
                  className="flex items-center gap-1 mx-auto hover:text-blue-600"
                >
                  5小时/请求
                  <SortIcon field="fiveHourRequests" />
                </button>
              </th>
              <th className="px-3 py-3 text-center font-medium text-gray-600 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('weeklyRequests')}
                  className="flex items-center gap-1 mx-auto hover:text-blue-600"
                >
                  每周/请求
                  <SortIcon field="weeklyRequests" />
                </button>
              </th>
              <th className="px-3 py-3 text-center font-medium text-gray-600 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('monthlyRequests')}
                  className="flex items-center gap-1 mx-auto hover:text-blue-600"
                >
                  每月/请求
                  <SortIcon field="monthlyRequests" />
                </button>
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 hidden xl:table-cell">支持模型</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 hidden xl:table-cell">其他权益</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPlans.map((plan, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-3">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${platformColors[plan.platform] || 'bg-gray-100 text-gray-700'}`}>
                    {plan.platform}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {plan.plan}
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  {plan.monthlyPrice === '-' ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <span className="font-medium text-orange-600">{plan.monthlyPrice}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  {plan.yearlyPrice === '-' ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <span className="font-medium text-green-600">{plan.yearlyPrice}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap hidden lg:table-cell">
                  <span className={plan.fiveHourRequests === '无限制' ? 'text-green-600 font-medium' : ''}>
                    {plan.fiveHourRequests}
                  </span>
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap hidden lg:table-cell">
                  <span className={plan.weeklyRequests === '无限制' ? 'text-green-600 font-medium' : ''}>
                    {plan.weeklyRequests}
                  </span>
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap hidden lg:table-cell">
                  <span className={plan.monthlyRequests === '无限制' ? 'text-green-600 font-medium' : ''}>
                    {plan.monthlyRequests}
                  </span>
                </td>
                <td className="px-3 py-3 hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {plan.models.map((m, i) => (
                      <span key={i} className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-500 text-xs hidden xl:table-cell max-w-xs truncate">
                  {plan.otherBenefits === '-' ? '-' : plan.otherBenefits}
                </td>
                <td className="px-3 py-3 text-center">
                  <a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    跳转
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 备注 */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-sm font-medium text-amber-800 mb-2">说明</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• 包季/包年价格中的划线数字表示原始价格（包月×3 或 包月×12），未划线的为实际优惠价格</li>
          <li>• 使用表格邀请链接，部分平台可享优惠</li>
          <li>• 本页面数据仅供参考，价格及权益最终以平台官方公布为准</li>
          <li>• 数据来源：<a href="https://github.com/wmpeng/codingplan" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">wmpeng/codingplan</a></li>
        </ul>
      </div>
    </div>
  );
}
