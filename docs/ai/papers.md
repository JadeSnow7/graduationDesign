# 参考论文列表（Reading List）

> 用途：本列表用于资料整理与选题调研，不等同于论文正文“参考文献”。写论文时请按需要挑选并补齐 BibTeX/页码/出版社信息。  
> 说明：以下条目主要作为“阅读线索”；引用时请以论文原文（题名/作者/年份/出版信息）为准。  
> 更新时间：2026-02-04（建议按主题持续补充）

## 1. 与本项目最相关（优先阅读）

- **LLM 基础**：Vaswani et al., *Attention Is All You Need* (2017)
- **大模型规模化**：Brown et al., *Language Models are Few-Shot Learners* (2020)
- **推理范式（CoT）**：Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (2022)
- **RAG**：Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (2020)
- **知识图谱综述**：Hogan et al., *Knowledge Graphs* (2020)
- **指令对齐/RLHF**：Ouyang et al., *Training language models to follow instructions with human feedback* (2022)
- **对齐与安全**：Bai et al., *Constitutional AI: Harmlessness from AI Feedback* (2022)
- **Tool Use / Agent**：Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models* (2023)
- **自监督工具学习**：Schick et al., *Toolformer: Language Models Can Teach Themselves to Use Tools* (2023)
- **参数高效微调**：Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models* (2021)
- **量化微调**：Dettmers et al., *QLoRA: Efficient Finetuning of Quantized LLMs* (2023)
- **长程记忆/外部记忆（Agent）**：Packer et al., *MemGPT: Towards LLMs as Operating Systems* (2023)

## 2. 检索增强生成（RAG）与检索模型

- Karpukhin et al., *Dense Passage Retrieval for Open-Domain Question Answering* (2020)
- Guu et al., *REALM: Retrieval-Augmented Language Model Pre-Training* (2020)
- Izacard \& Grave, *Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering* (2021)（Fusion-in-Decoder, FiD）
- Thakur et al., *BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models* (2021)
- Khattab \& Zaharia, *ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT* (2020)

## 3. 知识图谱 / 图推理与 LLM 结合

- Hogan et al., *Knowledge Graphs* (2020)（图谱建模、融合、查询与应用综述）
- Yasunaga et al., *QA-GNN: Reasoning with Language Models and Knowledge Graphs for Question Answering* (2021)
- Microsoft Research, *From Local to Global: A GraphRAG Approach to Query-Focused Summarization* (2024)（GraphRAG 思路：图结构检索与扩展）

## 4. 工具调用（Tool Calling）与 Agent 框架

- Nakano et al., *WebGPT: Browser-assisted question-answering with human feedback* (2021)
- Press et al., *Measuring and Narrowing the Compositionality Gap in Language Models* (2022)（Self-Ask with Search）
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models* (2023)
- Schick et al., *Toolformer: Language Models Can Teach Themselves to Use Tools* (2023)
- Patil et al., *Gorilla: Large Language Model Connected with Massive APIs* (2023)
- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning* (2023)
- Park et al., *Generative Agents: Interactive Simulacra of Human Behavior* (2023)（长期记忆与行为模拟，选读）

## 5. 长上下文、记忆与长期个性化

- Dai et al., *Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context* (2019)
- Beltagy et al., *Longformer: The Long-Document Transformer* (2020)
- *LongLoRA: Efficient Fine-tuning of Long-Context Large Language Models* (2023)
- Packer et al., *MemGPT: Towards LLMs as Operating Systems* (2023)

## 6. 蒸馏、压缩与参数高效训练

- Hinton et al., *Distilling the Knowledge in a Neural Network* (2015)
- Sanh et al., *DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter* (2019)
- Jiao et al., *TinyBERT: Distilling BERT for Natural Language Understanding* (2020)
- Lester et al., *The Power of Scale for Parameter-Efficient Prompt Tuning* (2021)
- Li \& Liang, *Prefix-Tuning: Optimizing Continuous Prompts for Generation* (2021)
- Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models* (2021)
- Dettmers et al., *QLoRA: Efficient Finetuning of Quantized LLMs* (2023)

## 7. 评测与可信性（幻觉、对齐、可解释性）

- Lin et al., *TruthfulQA: Measuring How Models Mimic Human Falsehoods* (2021)
- Liang et al., *HELM: Holistic Evaluation of Language Models* (2022)
- Wang et al., *Self-Consistency Improves Chain of Thought Reasoning in Language Models* (2022)
- Rafailov et al., *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* (2023)

## 8. 教育与写作评测（与写作课示例相关，选读）

- Flower \& Hayes, *A Cognitive Process Theory of Writing* (1981)
- Shermis \& Burstein (eds.), *Handbook of Automated Essay Evaluation* (2013)
- Hyland, *Teaching and Researching Writing* (2015)
