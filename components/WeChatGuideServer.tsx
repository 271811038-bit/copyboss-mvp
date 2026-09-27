// 微信内置浏览器引导条（服务端渲染版）
// 关键设计：在服务端直接读 User-Agent 判断，输出静态 HTML。
// 即使客户端 JS 完全没启动（iOS 微信 WebView 曾出现此情况），引导条也能显示。
import { headers } from "next/headers";

export default async function WeChatGuideServer() {
  const ua = (await headers()).get("user-agent") || "";
  // 微信内置浏览器 UA 含 MicroMessenger；企业微信（wxwork）环境正常，排除
  if (!/MicroMessenger/i.test(ua) || /wxwork/i.test(ua)) return null;

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #fcd34d",
        background: "#fffbeb",
        fontSize: 14,
        lineHeight: 1.6,
        color: "#92400e",
      }}
    >
      <p style={{ fontWeight: 600, margin: 0 }}>📱 你正在微信内打开本站</p>
      <p style={{ margin: "4px 0 0" }}>
        微信内置浏览器可能导致注册/登录异常。请点击右上角
        <strong>「···」</strong>→ 选择
        <strong>「在浏览器打开」</strong>，即可正常注册登录。
      </p>
    </div>
  );
}
