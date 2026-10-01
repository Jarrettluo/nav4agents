// 微信「分享给朋友 / 分享到朋友圈」缩略图（无公众号 JS-SDK 时的通用做法）：
// 在页面顶部放置一个 300x300 尺寸的图片节点，微信抓取页面时会读取它作为分享缩略图。
// 注意：不要对 img 本身使用 display:none；这里用「绝对定位移出可视区域」的方式隐藏。
export default function HiddenShareImage({ src }: { src: string }) {
  return (
    <div
      id="wx_pic"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '300px',
        height: '300px',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={300} height={300} alt="" />
    </div>
  );
}