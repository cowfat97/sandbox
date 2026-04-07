<script setup lang="ts">
import { ref, onMounted } from 'vue'

const lastUpdateTime = ref('')

onMounted(() => {
  lastUpdateTime.value = new Date().toLocaleString('zh-CN')
})

const disclaimerText = '免责声明与合规告知：本项目仅为基于Gemma 4本地部署与Ollama框架的技术实验工具，旨在演示大模型微调与私有权重的数据处理能力。系统展示的所有地理信息及冲突数据均由用户通过自行配置的第三方接口实时检索获取，本程序不内置、不存储、不分发任何敏感地理数据。用户在使用本工具进行数据抓取及可视化时，须确保符合《中华人民共和国测绘法》、《网络安全法》等法律法规，任何因用户私自配置、非法标注或公开发布非标准地图导致的后果由用户自行承担。所有的研判结论由本地AI逻辑生成，受模型权重及语料时效性限制，不代表真实立场，亦不构成任何决策建议。'
</script>

<template>
  <footer class="h-[40px] flex items-center border-t bg-gray-50 text-sm text-gray-500">
    <!-- 左侧：数据更新时间 -->
    <div class="px-6 shrink-0">
      数据更新: {{ lastUpdateTime }}
    </div>

    <!-- 中间：滚动声明 -->
    <div class="flex-1 overflow-hidden px-4">
      <div class="animate-marquee whitespace-nowrap text-xs text-gray-600">
        {{ disclaimerText }} &nbsp;&nbsp;&nbsp; {{ disclaimerText }}
      </div>
    </div>

    <!-- 右侧：版权 -->
    <div class="px-6 shrink-0">
      © 2026 TACO
    </div>
  </footer>
</template>

<style scoped>
.animate-marquee {
  animation: marquee 40s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>