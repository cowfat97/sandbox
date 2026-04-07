/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 事件类型颜色
        'event-military': '#ef4444',    // 红色 - 军事冲突
        'event-terrorist': '#f97316',   // 橙色 - 恐怖袭击
        'event-political': '#eab308',   // 黄色 - 政治动荡
        'event-border': '#a855f7',      // 紫色 - 边境冲突
        'event-other': '#6b7280',       // 灰色 - 其他
      }
    },
  },
  plugins: [],
}