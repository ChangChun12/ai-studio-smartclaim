
import { ResearchMetric } from './types';

export const RESEARCH_METRICS: ResearchMetric[] = [
  {
    label: "檢索準確率",
    value: "85%+",
    description: "結合 RAG 技術的目標精確度"
  },
  {
    label: "節省時間",
    value: "50%",
    description: "大幅降低跨保單比對與查找時間"
  },
  {
    label: "滿意度目標",
    value: "80%",
    description: "使用者對理賠指引清晰度的滿意度"
  }
];

export const SAMPLE_QUERIES = [
  "我發生車禍骨折了，有哪些保單可以理賠？",
  "我因為手術住院住了3天，可以申請多少理賠金？",
  "申請車禍理賠需要準備哪些文件？"
];
