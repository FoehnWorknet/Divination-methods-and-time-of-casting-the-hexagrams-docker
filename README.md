Divination-methods-and-time-of-casting-the-hexagrams-docker / 大衍筮法以及梅花易数占卜系统
🌏 基于《周易》的智能占卜系统 | Yijing-based Intelligent Divination System

目录 | Table of Contents

功能特性
快速开始
配置说明
API集成
部署指南
项目结构

功能特性 | Features
核心功能 | Core Functions

大衍筮法随机起卦 (Dayan Algorithm Divination)
可验证的随机数生成算法 (Verifiable RNG Algorithm)


公历转农历系统 (Gregorian to Lunar Conversion)
天行API黄历数据集成 (TianAPI Lunar Integration)

AI卦象解析系统 (AI Interpretation System)
deepseek-r1模型爻辞解读 (Yao-line Interpretation)
上下文感知对话系统 (Context-aware Dialogue)
思维导图生成 (Mind Map Generation)
deep-seek-v3可视化模型 (Visualization Model)




快速开始 | Quick Start
# 安装依赖 | Install dependencies
npm install

# 开发模式 | Development mode
npm run dev

# 访问 | Access
http://localhost:3000

配置说明 | Configuration
必需配置项 | Required

修改天行API密钥：
// src/utils/lunarCalendar.ts
const params = new URLSearchParams({
  key: 'YOUR_TIANAPI_KEY', // 在此处填写实际key
  date: formattedDate
});

设置硅基流动API：
网页前端自行填写即可调用

API集成 | API Integration
            
服务提供商（天聚数行，硅基流动）

功能范围                
天行数据 (TianAPI)
src/utils/lunarCalendar.ts
黄历数据获取

硅基流动 (API)
src/lib/apiClient.ts
AI交互与可视化生成

部署指南 | Deployment
Docker 部署

# 构建并启动容器
docker-compose up --build -d

# 查看运行状态
docker ps -a

# 访问服务
http://localhost:3000
传统部署

# 生产构建
npm run build

# 启动服务
npm start

项目结构 | Project Structure
  
├── src/
│   ├── app/               # Next.js路由
│   ├── components/        # 可重用组件
│   ├── lib/               # 核心业务逻辑
│   │   ├── divination/    # 占卜算法实现
│   │   └── visualization # 可视化模块
│   ├── utils/
│   │   ├── lunarCalendar.ts # 黄历转换
│   │   └── plumBlossom.ts # 梅花易数配置
├── public/                # 静态资源
├── docker-compose.yml     # Docker配置
└── next.config.js         # Next.js配置


注意事项 | Important Notes


MIT License

Copyright (c) 2025 FoehnWorknet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


MIT许可证

版权所有 (c) 2025 FoehnWorknet

特此授予任何人免费获得本软件及相关文档文件（以下简称“软件”）的副本，允许不受限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或出售本软件的副本，并允许获得本软件的人员在遵守以下条件的前提下这样做：

上述版权声明和本许可声明应包含在本软件的所有副本或重要部分中。

本软件按“原样”提供，不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性。作者或版权持有人不对任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权诉讼或其他诉讼中，由软件或软件的使用或其他处理引起的、由软件引起的或与软件相关的任何索赔、损害或其他责任。
