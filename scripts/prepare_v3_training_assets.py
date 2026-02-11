#!/usr/bin/env python3
"""Generate V3 training assets and gap analysis artifacts."""

from __future__ import annotations

import json
import subprocess
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RUN_ID = "run_20260209_132531"
RUN_DIR = ROOT / "outputs" / "training_sync" / RUN_ID
GAP_DIR = ROOT / "outputs" / "training_sync" / "2026-02-10-gap-analysis"

STYLE_FILE = ROOT / "data" / "training" / "processed" / "style_sft.jsonl"
WRITING_FILE = ROOT / "data" / "training" / "processed" / "writing_sft.jsonl"
STYLE_SAMPLE_FILE = ROOT / "data" / "training" / "processed" / "style_sft_sample.jsonl"
STYLE_BENCH = ROOT / "data" / "training" / "eval" / "style_benchmark.jsonl"
WRITING_BENCH = ROOT / "data" / "training" / "eval" / "writing_benchmark.jsonl"

STYLE_V3_FILE = ROOT / "data" / "training" / "processed" / "style_sft_v3.jsonl"
WRITING_V3_FILE = ROOT / "data" / "training" / "processed" / "writing_sft_v3.jsonl"
ALL_V3_FILE = ROOT / "data" / "training" / "processed" / "all_sft_v3.jsonl"
SHADOW_EVAL_FILE = ROOT / "data" / "training" / "eval" / "shadow_template_benchmark_v3.jsonl"
ALL_BENCH_FILE = ROOT / "data" / "training" / "eval" / "all_benchmark_legacy.jsonl"

PROCESSED_V3_DIR = ROOT / "data" / "training" / "processed_v3"

STYLE_SYSTEM = "你是高校课程助教。请按以下结构回答：\n### 结论\n### 推导\n### 检查（单位/边界条件/极限情况）"
WRITING_SYSTEM = "你是学术写作课程助教。请按以下结构回答：\n### 问题诊断\n### 改进建议\n### 规范说明"

STYLE_TOPICS: list[dict[str, str]] = [
    {
        "chapter": "ch1",
        "difficulty": "medium",
        "question": "静电屏蔽为什么可以保护敏感电路？",
        "conclusion": "静电屏蔽通过导体自由电荷重分布使内部电场接近零，从而抑制外部静电干扰。",
        "derivation": "在静电平衡下导体内部电场必须为零，否则自由电荷会持续运动；由高斯定律可知净通量受包围自由电荷决定，因此外部静电场主要终止于屏蔽外表面。",
        "unit": "电场强度单位为 V/m。",
        "boundary": "仅适用于静电或低频准静态条件。",
        "limit": "当屏蔽壳体存在缝隙且尺寸接近波长时，屏蔽效果显著下降。",
    },
    {
        "chapter": "ch1",
        "difficulty": "easy",
        "question": "电势差和电压是同一个概念吗？",
        "conclusion": "在静电与电路语境中电势差与电压通常等价，均表示单位电荷的能量变化。",
        "derivation": "电势差定义为两点电势之差，电压定义为两点间单位电荷做功；两者都可写为 U=phi_A-phi_B。",
        "unit": "单位均为伏特 V。",
        "boundary": "需指定参考点与测量方向。",
        "limit": "在时变电磁场中路径相关效应出现时，需结合感应电动势讨论。",
    },
    {
        "chapter": "ch1",
        "difficulty": "medium",
        "question": "均匀介质中点电荷电场如何随介电常数变化？",
        "conclusion": "介电常数越大，点电荷在介质中的电场强度越小。",
        "derivation": "由库仑定律 E=Q/(4*pi*epsilon*r^2) 可知 E 与 epsilon 成反比；相对介电常数上升意味着极化增强，对外电场产生削弱。",
        "unit": "电场单位为 N/C 或 V/m。",
        "boundary": "公式适用于各向同性线性介质。",
        "limit": "当介质非线性或高场强下，epsilon 可能随场变化。",
    },
    {
        "chapter": "ch1",
        "difficulty": "hard",
        "question": "为什么说电容本质上是储能能力而非储电量本身？",
        "conclusion": "电容描述的是电压变化下可存储电荷与能量的能力，核心是系统几何与介质属性。",
        "derivation": "由 C=Q/U 得知 Q 随 U 改变而变；储能公式 W=1/2*CU^2 表明固定 C 时电压决定瞬时能量，C 反映结构对能量存储的系数。",
        "unit": "电容单位 F，能量单位 J。",
        "boundary": "需在线性介质且温度稳定条件下近似常数。",
        "limit": "高频与损耗介质下应采用复电容与等效电路描述。",
    },
    {
        "chapter": "ch2",
        "difficulty": "medium",
        "question": "安培环路定律在同轴线缆中的应用步骤是什么？",
        "conclusion": "选取与轴同心的圆形回路并分区分析包围电流，可快速得到各区域磁场表达式。",
        "derivation": "对半径 r 的圆回路应用 \u222eHdl=I_enc；内导体区域 I_enc 随 r 变化，介质层区域 I_enc 为全内导体电流，外导体外侧净包围电流趋近零。",
        "unit": "H 单位 A/m，B 单位 T。",
        "boundary": "依赖轴对称与准静态近似。",
        "limit": "高频下表皮效应导致电流分布不再均匀。",
    },
    {
        "chapter": "ch2",
        "difficulty": "easy",
        "question": "位移电流为什么能修复电容充电时的安培定律矛盾？",
        "conclusion": "位移电流项补足了时变电场对应的等效电流，使电荷守恒与环路定律一致。",
        "derivation": "连续性方程要求散度约束成立；引入 Jd=partial D/partial t 后，修正方程 nabla cross H=J+partial D/partial t 与高斯定律共同满足守恒。",
        "unit": "电流密度单位 A/m^2。",
        "boundary": "在时变场中必须保留位移电流项。",
        "limit": "静态场下该项退化为零。",
    },
    {
        "chapter": "ch2",
        "difficulty": "medium",
        "question": "理想导体边界上切向电场为何为零？",
        "conclusion": "理想导体中自由电荷可瞬时重排，任何非零切向电场都会被抵消，因此边界切向电场为零。",
        "derivation": "若 Et 不为零会驱动无穷大电导中的电荷持续运动，与静态平衡矛盾；由边界连续条件得外侧切向分量也趋于零。",
        "unit": "电场单位 V/m。",
        "boundary": "假设导体电导率趋于无穷大。",
        "limit": "真实导体在高频下存在有限表面阻抗。",
    },
    {
        "chapter": "ch2",
        "difficulty": "hard",
        "question": "为什么 TEM 模式在双导体传输线中可成立，而单导体波导中通常不可成立？",
        "conclusion": "TEM 需要横向电位差参考，双导体提供回路与边界条件，单导体空腔难以满足纯横向场解。",
        "derivation": "TEM 要求 Ez=Hz=0 且横向场满足二维静场方程；双导体截面可定义唯一势函数边值问题，单导体闭腔通常仅支持 TE/TM 本征模。",
        "unit": "特性阻抗单位 ohm。",
        "boundary": "依赖理想导体边界和均匀介质近似。",
        "limit": "高阶模式激发时 TEM 近似失效。",
    },
    {
        "chapter": "ch2",
        "difficulty": "medium",
        "question": "互感系数和耦合系数有什么关系？",
        "conclusion": "耦合系数 k 由互感与自感决定，k=M/sqrt(L1*L2)，范围通常在 0 到 1。",
        "derivation": "由能量正定性可得 M^2<=L1*L2；将互感归一化后定义 k，便于比较不同结构耦合强弱。",
        "unit": "M 与 L 单位均为 H，k 无量纲。",
        "boundary": "要求线性磁路近似成立。",
        "limit": "铁磁饱和或强漏磁会降低 k 并使其随电流变化。",
    },
    {
        "chapter": "ch2",
        "difficulty": "easy",
        "question": "为什么楞次定律一定是“阻碍原变化”？",
        "conclusion": "楞次定律体现能量守恒，感应过程若不阻碍原变化将导致无源能量增益悖论。",
        "derivation": "法拉第定律中的负号确保感应电流产生磁场与原磁通变化方向相反，外界必须做功维持变化。",
        "unit": "感应电动势单位 V。",
        "boundary": "适用于电磁感应的一般闭合回路。",
        "limit": "开路情况下可有电压但无持续电流。",
    },
    {
        "chapter": "ch3",
        "difficulty": "medium",
        "question": "平面波中 E、H 与传播方向三者有什么几何关系？",
        "conclusion": "在均匀无源介质中，E、H 与传播方向 k 两两正交并构成右手系。",
        "derivation": "由麦克斯韦旋度方程可得 k cross E 与 H 同向，k cross H 与 E 反向，故场分量互相垂直。",
        "unit": "E 单位 V/m，H 单位 A/m。",
        "boundary": "适用于远场平面波近似。",
        "limit": "近场区或各向异性介质中关系可偏离简单正交。",
    },
    {
        "chapter": "ch3",
        "difficulty": "hard",
        "question": "为何介质色散会导致群速度与相速度不同？",
        "conclusion": "色散使 omega-k 关系非线性，导致 vg=d omega/dk 与 vp=omega/k 不再相等。",
        "derivation": "多频分量叠加形成包络，包络传播取决于频散曲线斜率；当折射率随频率变化时，两种速度自然分离。",
        "unit": "速度单位 m/s。",
        "boundary": "需在窄带近似下定义群速度。",
        "limit": "异常色散区需谨慎解释群速度物理含义。",
    },
    {
        "chapter": "ch3",
        "difficulty": "medium",
        "question": "坡印廷矢量如何解释天线辐射功率？",
        "conclusion": "坡印廷矢量给出单位面积能流密度，对包围天线的闭合面积分即可得到辐射功率。",
        "derivation": "S=E cross H；在远场 E 与 H 同相且近似与半径方向一致，P=surface integral(S dot dA) 可得总辐射功率。",
        "unit": "S 单位 W/m^2，功率单位 W。",
        "boundary": "积分面需包围全部辐射源。",
        "limit": "近场储能项不应直接当作净辐射功率。",
    },
    {
        "chapter": "ch3",
        "difficulty": "medium",
        "question": "什么决定了电磁波在介质界面的反射系数大小？",
        "conclusion": "反射系数主要由两侧波阻抗失配程度决定。",
        "derivation": "法向入射时 Gamma=(Z2-Z1)/(Z2+Z1)；阻抗越匹配，反射越小，功率透射越高。",
        "unit": "反射系数无量纲。",
        "boundary": "公式对应法向入射与线性介质。",
        "limit": "斜入射需区分 TE/TM 极化并使用菲涅耳公式。",
    },
    {
        "chapter": "ch3",
        "difficulty": "easy",
        "question": "为什么说自由空间阻抗约为 377 欧姆？",
        "conclusion": "自由空间阻抗由真空磁导率与介电常数决定，数值约等于 377 ohm。",
        "derivation": "Z0=sqrt(mu0/epsilon0)，代入常数可得约 376.73 ohm，工程上常取 377 ohm。",
        "unit": "单位 ohm。",
        "boundary": "仅适用于自由空间近似。",
        "limit": "介质中波阻抗随 mu 与 epsilon 改变。",
    },
    {
        "chapter": "ch3",
        "difficulty": "hard",
        "question": "波导截止频率为何会限制低频传输？",
        "conclusion": "低于截止频率时纵向传播常数变为虚数，模式沿传输方向指数衰减。",
        "derivation": "由边界条件求得本征横向波数 kc，传播常数 beta=sqrt(k^2-kc^2)；当 k<kc 时 beta 为虚数，无法形成远距离传播。",
        "unit": "截止频率单位 Hz。",
        "boundary": "取决于波导截面尺寸与模式阶次。",
        "limit": "接近截止时色散和损耗显著增强。",
    },
    {
        "chapter": "ch3",
        "difficulty": "medium",
        "question": "为什么高损耗介质中电磁波衰减很快？",
        "conclusion": "损耗介质中的导电电流与介质损耗把电磁能持续转化为热能，导致振幅快速衰减。",
        "derivation": "复传播常数 gamma=alpha+jbeta 中 alpha 受导电率与损耗角正切影响；alpha 增大时 e^{-alpha z} 衰减更快。",
        "unit": "alpha 单位 Np/m。",
        "boundary": "适用于线性均匀有损介质。",
        "limit": "在极低损耗情况下可近似无衰减传播。",
    },
    {
        "chapter": "ch1",
        "difficulty": "medium",
        "question": "电场线与等势面为什么总是正交？",
        "conclusion": "电场方向是电势下降最快方向，等势面切向电势不变，因此两者正交。",
        "derivation": "由 E=-grad(phi) 可知 E 与等势面法向一致；若有切向分量将导致沿等势面电势变化，矛盾。",
        "unit": "E 单位 V/m。",
        "boundary": "要求电势函数可微且场为保守场。",
        "limit": "时变涡旋电场中全局标量势描述受限。",
    },
    {
        "chapter": "ch1",
        "difficulty": "hard",
        "question": "镜像法求解接地平面点电荷问题的物理依据是什么？",
        "conclusion": "镜像法利用唯一性定理，用等效虚拟电荷构造满足同边界条件的解。",
        "derivation": "在接地边界 phi=0 条件下，原问题与镜像电荷系统在求解区域满足同泊松方程和边界条件，因此解唯一且相同。",
        "unit": "电势单位 V，电荷单位 C。",
        "boundary": "边界必须是理想导体并给定明确电势条件。",
        "limit": "复杂几何边界下镜像法可能不可构造。",
    },
    {
        "chapter": "ch2",
        "difficulty": "medium",
        "question": "法拉第电磁感应中“磁通变化”包含哪些来源？",
        "conclusion": "磁通变化既可来自磁场随时间变化，也可来自回路面积/姿态变化。",
        "derivation": "Phi=integral(B dot dS)，其时间导数包含 partial B/partial t 与边界运动项；动生电动势和感生电动势是统一表达的两种体现。",
        "unit": "磁通单位 Wb。",
        "boundary": "需明确回路方向与法向约定。",
        "limit": "离散采样测量时会引入数值微分噪声。",
    },
    {
        "chapter": "ch2",
        "difficulty": "easy",
        "question": "螺线管内部磁场为何近似均匀？",
        "conclusion": "长螺线管中轴向磁场由大量匝线叠加，中心区域边缘效应小，因此近似均匀。",
        "derivation": "利用安培环路定律可得 B 约等于 mu*n*I；当长度远大于直径时端部畸变对中间区域影响可忽略。",
        "unit": "B 单位 T。",
        "boundary": "要求长细比足够大。",
        "limit": "端部附近磁场不均匀。",
    },
    {
        "chapter": "ch3",
        "difficulty": "medium",
        "question": "天线近场与远场在工程上最关键的区别是什么？",
        "conclusion": "远场以辐射功率传输为主，近场以储能耦合为主，测量与建模方法不同。",
        "derivation": "近场项随 1/r^2 或 1/r^3 衰减且 E/H 比值非定值；远场项随 1/r 衰减且接近平面波关系。",
        "unit": "距离单位 m。",
        "boundary": "分界常用 r 约大于 2D^2/lambda。",
        "limit": "过渡区需全波仿真而非简单近远场近似。",
    },
    {
        "chapter": "ch3",
        "difficulty": "hard",
        "question": "为什么阻抗匹配能提升功率传输效率？",
        "conclusion": "匹配可降低反射，增加负载吸收功率，从而提升链路效率与稳定性。",
        "derivation": "传输线理论中反射系数由负载与特性阻抗差决定；当 ZL=Z0 时 Gamma=0，驻波比最小，净前向功率最大。",
        "unit": "阻抗单位 ohm，功率单位 W。",
        "boundary": "需在目标频段内满足匹配而非单频点。",
        "limit": "宽带场景常需多级或有损匹配网络折中。",
    },
    {
        "chapter": "ch1",
        "difficulty": "easy",
        "question": "为什么电通量本身不等于电场强度？",
        "conclusion": "电通量是电场穿过面积的积分量，电场强度是局部点量，二者物理维度不同。",
        "derivation": "Phi_E=integral(E dot dS) 与面积及方向相关；同一通量可由不同场分布实现，不能唯一反推某点电场。",
        "unit": "通量单位 V*m 或 N*m^2/C，电场单位 V/m。",
        "boundary": "比较时需固定积分面。",
        "limit": "仅在高对称条件下可由通量反推场强。",
    },
]

WRITING_TOPICS: list[dict[str, Any]] = [
    {
        "topic": "abstract",
        "difficulty": "medium",
        "question": "我的摘要像小结一样写了很多背景和实现细节，怎么精简？",
        "diagnosis": "摘要信息密度低、结构松散，背景与实现细节占比过高，导致核心贡献不突出。",
        "advice": "按“问题-方法-结果-贡献”四句骨架重写：先一句定义研究问题，再一句描述方法，随后给出关键量化结果，最后一句说明意义。每句控制在 25-40 字。",
        "rules": [
            "摘要应可独立阅读，不依赖正文图表。",
            "避免堆叠实现细节与过程描述。",
            "结果必须包含至少一个可核验指标。",
        ],
    },
    {
        "topic": "introduction",
        "difficulty": "medium",
        "question": "绪论里我列了很多文献，但导师说没有“问题意识”，怎么改？",
        "diagnosis": "现有绪论偏文献罗列，缺少“研究缺口 -> 研究问题 -> 研究目标”的闭环。",
        "advice": "先明确缺口句，再定义研究问题，随后给出本文目标与贡献列表；文献只保留与缺口直接相关的代表性工作。",
        "rules": [
            "每段必须服务于一个清晰论点。",
            "贡献点应可与后文实验逐一对应。",
            "避免把相关工作段写成时间流水账。",
        ],
    },
    {
        "topic": "objectivity",
        "difficulty": "easy",
        "question": "我常写“我认为方法很好”，怎么改成学术表达？",
        "diagnosis": "主观评价词过多，缺乏证据与量化支撑。",
        "advice": "改为“实验结果表明”并补充对比数据，例如提升幅度、显著性检验或误差区间。",
        "rules": [
            "主张后必须接证据。",
            "避免“非常、显著”这类空泛形容词。",
            "优先使用第三人称或“本文”表述。",
        ],
    },
    {
        "topic": "citation",
        "difficulty": "medium",
        "question": "我引用了网页资料，只有链接没有作者和日期，会有问题吗？",
        "diagnosis": "引用元数据不完整，无法满足可追溯性要求。",
        "advice": "补齐作者、标题、发布日期、访问日期与 URL，并统一到同一引用格式模板。",
        "rules": [
            "引用格式全篇一致。",
            "直接引用需引号与页码。",
            "网络来源优先选机构主页或正式报告。",
        ],
    },
    {
        "topic": "paragraph",
        "difficulty": "easy",
        "question": "我一个段落经常写 400 多字，读起来很乱，怎么办？",
        "diagnosis": "段落包含多个论点，主题句不明确，导致逻辑断裂。",
        "advice": "按“一段一议”拆分，先写主题句，再写证据句与过渡句；每段控制在 120-220 字更易阅读。",
        "rules": [
            "段首句应可单独概括本段。",
            "证据与论点必须同向。",
            "段间用因果/递进连接词衔接。",
        ],
    },
    {
        "topic": "related_work",
        "difficulty": "hard",
        "question": "相关工作是不是把文献按年份排一下就可以？",
        "diagnosis": "仅按年份排列会掩盖方法学差异，难以支撑研究定位。",
        "advice": "按方法范式或任务场景分组，每组给出代表工作、优缺点与未解决问题，再引出本文位置。",
        "rules": [
            "每组文献都要有比较维度。",
            "结尾需形成研究缺口结论。",
            "避免无评价的“文献清单式”写法。",
        ],
    },
    {
        "topic": "method",
        "difficulty": "medium",
        "question": "方法章节我写了流程图，但读者还是看不懂核心创新点。",
        "diagnosis": "图文映射不足，创新点没有被显式标注。",
        "advice": "新增“创新点定位”小节，把每个创新点对应到流程图步骤和公式编号，并给出与基线的差异说明。",
        "rules": [
            "图中模块命名要与正文术语一致。",
            "关键符号首次出现必须定义。",
            "创新点数量不宜过多，确保可验证。",
        ],
    },
    {
        "topic": "experiment",
        "difficulty": "hard",
        "question": "实验只有一个总表，没有消融和误差分析，会不会太弱？",
        "diagnosis": "实验维度不足，无法支撑“方法为何有效”的因果解释。",
        "advice": "补充消融实验、稳健性实验和误差案例分析；至少展示一个失败案例并解释原因。",
        "rules": [
            "指标选择需覆盖效果与成本。",
            "对比方法要有代表性与可复现配置。",
            "实验结论应回扣研究问题。",
        ],
    },
    {
        "topic": "result_discussion",
        "difficulty": "medium",
        "question": "结果章节只写“优于基线”，老师说解释不够，怎么加强？",
        "diagnosis": "结果描述停留在现象层，缺少机制解释与边界条件。",
        "advice": "围绕“在哪些场景提升、为什么提升、在哪些场景失效”三问展开，并关联到方法设计假设。",
        "rules": [
            "避免只报平均值，补充分组结果。",
            "结论需与统计显著性一致。",
            "明确方法适用边界。",
        ],
    },
    {
        "topic": "conclusion",
        "difficulty": "easy",
        "question": "结论里我又写了很多新想法，这样可以吗？",
        "diagnosis": "结论引入新内容会破坏论文闭环，读者难以区分已验证与未验证内容。",
        "advice": "结论只总结已完成工作与证据；新想法应移动到“未来工作”，并明确其前提与风险。",
        "rules": [
            "结论不新增实验结论外信息。",
            "未来工作需可执行且与局限对应。",
            "避免口号式表述。",
        ],
    },
    {
        "topic": "figure",
        "difficulty": "medium",
        "question": "图表字体和配色每张都不一样，会影响论文质量吗？",
        "diagnosis": "视觉规范不一致会削弱专业感，也影响读者对信息层次的理解。",
        "advice": "统一图表模板：字体、字号、线宽、配色和图例位置保持一致，并建立图表样式清单。",
        "rules": [
            "图题和表题位置遵循学校规范。",
            "图轴需标注单位。",
            "颜色应兼顾灰度打印可读性。",
        ],
    },
    {
        "topic": "formula",
        "difficulty": "medium",
        "question": "公式后我没解释变量，导师直接打回，应该怎么补？",
        "diagnosis": "符号未定义导致公式不可复核，影响学术表达完整性。",
        "advice": "每个关键公式后追加“其中”说明，按出现顺序定义变量、范围与单位，并说明适用条件。",
        "rules": [
            "公式编号连续且可引用。",
            "变量命名前后一致。",
            "符号定义避免循环解释。",
        ],
    },
    {
        "topic": "ethics",
        "difficulty": "easy",
        "question": "我用了公开数据集，但没写数据授权说明，会有风险吗？",
        "diagnosis": "缺少数据合规说明，可能触发伦理审查与复现实验障碍。",
        "advice": "补充数据来源、许可协议、预处理规则与隐私保护措施，必要时增加伦理声明段落。",
        "rules": [
            "注明数据许可证类型。",
            "涉及个人数据需去标识化说明。",
            "实验脚本与数据版本需可追踪。",
        ],
    },
    {
        "topic": "reproducibility",
        "difficulty": "hard",
        "question": "别人复现不了我的实验，我该在论文里补什么？",
        "diagnosis": "可复现关键信息缺失，如随机种子、硬件环境和依赖版本。",
        "advice": "在附录或实验设置中补齐环境指纹、超参数表、运行命令和仓库提交哈希。",
        "rules": [
            "关键实验应给出固定随机种子。",
            "依赖版本需精确到小版本。",
            "提交哈希与结果报告一一对应。",
        ],
    },
    {
        "topic": "logic",
        "difficulty": "medium",
        "question": "我的章节衔接很生硬，读起来像拼接稿，怎么改善？",
        "diagnosis": "章节目标与过渡句不足，导致读者无法建立全局叙事。",
        "advice": "在每章开头写“本章目标”，结尾写“本章结论与下一章接口”，形成章节间桥接。",
        "rules": [
            "章节标题应体现功能而非口号。",
            "跨章术语保持一致。",
            "每章至少一个显式过渡段。",
        ],
    },
    {
        "topic": "language",
        "difficulty": "easy",
        "question": "我总写“然后、其实、非常”，老师说太口语，怎么改？",
        "diagnosis": "口语连接词与情绪化副词过多，降低学术文本的精确性。",
        "advice": "建立替换表：然后->随后/进一步，其实->事实上，非常->显著/明显（需证据）。",
        "rules": [
            "优先使用逻辑连接词。",
            "避免情绪化形容词。",
            "每段至少一次自检口语词。",
        ],
    },
    {
        "topic": "appendix",
        "difficulty": "medium",
        "question": "附录应该放哪些内容？我担心正文太长。",
        "diagnosis": "正文与附录边界不清，可能导致主线信息被稀释。",
        "advice": "正文保留结论必需信息，附录放长证明、补充表格、完整参数和额外案例。",
        "rules": [
            "附录内容必须在正文有引用。",
            "附录不能承载核心结论。",
            "编号与正文体系保持一致。",
        ],
    },
    {
        "topic": "response_format",
        "difficulty": "easy",
        "question": "我回复评审意见时写得很随意，应该怎么规范？",
        "diagnosis": "评审回复缺少“问题-修改-证据”结构，难以让评审快速核验。",
        "advice": "逐条响应：先引用评审意见，再说明修改位置，最后给出修改后文本或结果截图。",
        "rules": [
            "回复编号与评审编号一一对应。",
            "每条回复都给出页码或段落定位。",
            "语气保持客观和礼貌。",
        ],
    },
]


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def build_style_sample(i: int, topic: dict[str, str]) -> dict[str, Any]:
    return {
        "id": f"style-v3-{i:04d}",
        "mode": "tutor",
        "messages": [
            {"role": "system", "content": STYLE_SYSTEM},
            {"role": "user", "content": topic["question"]},
            {
                "role": "assistant",
                "content": (
                    "### 结论\n"
                    f"{topic['conclusion']}\n\n"
                    "### 推导\n"
                    f"{topic['derivation']}\n\n"
                    "### 检查（单位/边界条件/极限情况）\n"
                    f"- 单位：{topic['unit']}\n"
                    f"- 边界条件：{topic['boundary']}\n"
                    f"- 极限情况：{topic['limit']}"
                ),
            },
        ],
        "meta": {
            "source": "v3_augmented",
            "chapter": topic["chapter"],
            "difficulty": topic["difficulty"],
            "lane": "style",
        },
    }


def build_writing_sample(i: int, topic: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": f"writing-v3-{i:04d}",
        "mode": "tutor",
        "messages": [
            {"role": "system", "content": WRITING_SYSTEM},
            {"role": "user", "content": topic["question"]},
            {
                "role": "assistant",
                "content": (
                    "### 问题诊断\n"
                    f"{topic['diagnosis']}\n\n"
                    "### 改进建议\n"
                    f"{topic['advice']}\n\n"
                    "### 规范说明\n"
                    f"- {topic['rules'][0]}\n"
                    f"- {topic['rules'][1]}\n"
                    f"- {topic['rules'][2]}"
                ),
            },
        ],
        "meta": {
            "source": "v3_augmented",
            "topic": topic["topic"],
            "difficulty": topic["difficulty"],
            "lane": "writing",
        },
    }


def validate_samples(rows: list[dict[str, Any]], lane: str) -> dict[str, Any]:
    required_top = ["id", "mode", "messages", "meta"]
    miss_fields: list[str] = []
    format_fail: list[str] = []

    style_need = ["### 结论", "### 推导", "### 检查（单位/边界条件/极限情况）"]
    writing_need = ["### 问题诊断", "### 改进建议", "### 规范说明"]

    for row in rows:
        sid = row.get("id", "unknown")
        for field in required_top:
            if field not in row:
                miss_fields.append(f"{sid}:{field}")
        msgs = row.get("messages", [])
        if len(msgs) < 3:
            miss_fields.append(f"{sid}:messages_len")
            continue
        roles = [m.get("role") for m in msgs[:3]]
        if roles != ["system", "user", "assistant"]:
            miss_fields.append(f"{sid}:roles")
        answer = msgs[2].get("content", "")
        need = style_need if lane == "style" else writing_need
        if not all(tag in answer for tag in need):
            format_fail.append(sid)

    total = len(rows)
    parse_ok = True
    field_ok = len(miss_fields) == 0
    template_hit = total - len(format_fail)
    return {
        "total": total,
        "parse_ok": parse_ok,
        "field_complete": field_ok,
        "missing_fields": miss_fields,
        "template_hit_count": template_hit,
        "template_hit_rate": 0.0 if total == 0 else template_hit / total,
        "template_fail_ids": format_fail,
    }


def analyze_eval_failures() -> tuple[dict[str, Any], str]:
    all_report = json.loads((RUN_DIR / "eval_report_all.json").read_text(encoding="utf-8"))
    style_report = json.loads((RUN_DIR / "eval_report_style.json").read_text(encoding="utf-8"))

    buckets = defaultdict(list)
    for d in all_report.get("details", []):
        sid = d.get("id", "unknown")
        res = d.get("result", {})
        if res.get("key_points_total", 0) > 0 and res.get("key_points_hit", 0) < res.get("key_points_total", 0):
            buckets["key_points_miss"].append(sid)
        if not bool(res.get("response_format", False)):
            buckets["template_format_fail"].append(sid)
        if (res.get("refused_pred") is not None and res.get("refused_expected") is not None and res.get("refused_pred") != res.get("refused_expected")):
            buckets["refusal_mismatch"].append(sid)

    style_format_fail = []
    for d in style_report.get("details", []):
        sid = d.get("id", "unknown")
        if not bool(d.get("result", {}).get("response_format", False)):
            style_format_fail.append(sid)

    all_ids = sorted({sid for arr in buckets.values() for sid in arr})
    payload = {
        "run_id": RUN_ID,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "all": {
            "key_points_miss": buckets["key_points_miss"],
            "template_format_fail": buckets["template_format_fail"],
            "refusal_mismatch": buckets["refusal_mismatch"],
            "failed_unique_count": len(all_ids),
            "failed_unique_ids": all_ids,
        },
        "style": {
            "template_format_fail": style_format_fail,
        },
    }

    matrix = [
        "# V3 Gap Analysis (run_20260209_132531)",
        "",
        "## All 阶段失败分桶",
        f"- key_points_miss: {len(buckets['key_points_miss'])}",
        f"- template_format_fail: {len(buckets['template_format_fail'])}",
        f"- refusal_mismatch: {len(buckets['refusal_mismatch'])}",
        f"- unique_failed_samples: {len(all_ids)}",
        "",
        "### key_points_miss IDs",
        ", ".join(buckets["key_points_miss"]) or "(none)",
        "",
        "### template_format_fail IDs",
        ", ".join(buckets["template_format_fail"]) or "(none)",
        "",
        "### refusal_mismatch IDs",
        ", ".join(buckets["refusal_mismatch"]) or "(none)",
        "",
        "## Style 阶段格式失败复核",
        f"- style_template_format_fail: {len(style_format_fail)}",
        "",
        "### style format fail IDs",
        ", ".join(style_format_fail) or "(none)",
    ]
    return payload, "\n".join(matrix) + "\n"


def git_value(args: list[str]) -> str:
    return subprocess.check_output(args, text=True, cwd=ROOT).strip()


def make_baseline_manifest() -> str:
    root_branch = git_value(["git", "branch", "--show-current"])
    root_commit = git_value(["git", "rev-parse", "HEAD"])
    code_branch = subprocess.check_output(["git", "branch", "--show-current"], text=True, cwd=ROOT / "code").strip()
    code_commit = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, cwd=ROOT / "code").strip()

    lines = [
        "# V3 Baseline Manifest",
        "",
        f"- generated_at: {datetime.utcnow().isoformat()}Z",
        f"- baseline_run_id: {RUN_ID}",
        f"- root_branch: {root_branch}",
        f"- root_commit: {root_commit}",
        f"- code_branch: {code_branch}",
        f"- code_commit: {code_commit}",
        "",
        "## Fixed Inputs",
        f"- {STYLE_FILE}",
        f"- {WRITING_FILE}",
        f"- {STYLE_BENCH}",
        f"- {WRITING_BENCH}",
        "",
        "## Target Outputs",
        f"- {STYLE_V3_FILE}",
        f"- {WRITING_V3_FILE}",
        f"- {ALL_V3_FILE}",
        f"- {SHADOW_EVAL_FILE}",
        f"- {GAP_DIR / 'all_failure_matrix.md'}",
        f"- {GAP_DIR / 'all_failure_ids.json'}",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    GAP_DIR.mkdir(parents=True, exist_ok=True)

    style_base = load_jsonl(STYLE_FILE)
    writing_base = load_jsonl(WRITING_FILE)

    style_new = [build_style_sample(i + 1, t) for i, t in enumerate(STYLE_TOPICS)]
    writing_new = [build_writing_sample(i + 1, t) for i, t in enumerate(WRITING_TOPICS)]

    if len(style_new) != 24 or len(writing_new) != 18:
        raise RuntimeError("augmentation counts mismatch")

    style_v3 = style_base + style_new
    writing_v3 = writing_base + writing_new
    all_v3 = style_v3 + writing_v3

    write_jsonl(STYLE_V3_FILE, style_v3)
    write_jsonl(WRITING_V3_FILE, writing_v3)
    write_jsonl(ALL_V3_FILE, all_v3)

    # Build a non-gating shadow eval set (5 style + 5 writing).
    shadow_eval: list[dict[str, Any]] = []
    for i, row in enumerate(style_new[:5], 1):
        copied = json.loads(json.dumps(row, ensure_ascii=False))
        copied["id"] = f"shadow-style-{i:03d}"
        copied["meta"]["purpose"] = "shadow_eval"
        shadow_eval.append(copied)
    for i, row in enumerate(writing_new[:5], 1):
        copied = json.loads(json.dumps(row, ensure_ascii=False))
        copied["id"] = f"shadow-writing-{i:03d}"
        copied["meta"]["purpose"] = "shadow_eval"
        shadow_eval.append(copied)
    write_jsonl(SHADOW_EVAL_FILE, shadow_eval)

    # Keep an explicit merged benchmark for all-stage post-eval.
    merged_bench = load_jsonl(STYLE_BENCH) + load_jsonl(WRITING_BENCH)
    write_jsonl(ALL_BENCH_FILE, merged_bench)

    # Create processed_v3 directory for run_train DATA_BASE override.
    PROCESSED_V3_DIR.mkdir(parents=True, exist_ok=True)
    write_jsonl(PROCESSED_V3_DIR / "style_sft.jsonl", style_v3)
    write_jsonl(PROCESSED_V3_DIR / "writing_sft.jsonl", writing_v3)
    write_jsonl(PROCESSED_V3_DIR / "all_sft.jsonl", all_v3)
    style_sample = load_jsonl(STYLE_SAMPLE_FILE)
    write_jsonl(PROCESSED_V3_DIR / "style_sft_sample.jsonl", style_sample)

    # Gap analysis outputs.
    failure_ids, matrix_md = analyze_eval_failures()
    (GAP_DIR / "all_failure_ids.json").write_text(json.dumps(failure_ids, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (GAP_DIR / "all_failure_matrix.md").write_text(matrix_md, encoding="utf-8")

    # Data quality gate report.
    val_style = validate_samples(style_v3, lane="style")
    val_writing = validate_samples(writing_v3, lane="writing")
    val_shadow_style = validate_samples(shadow_eval[:5], lane="style")
    val_shadow_writing = validate_samples(shadow_eval[5:], lane="writing")

    quality = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "style_sft_v3": val_style,
        "writing_sft_v3": val_writing,
        "shadow_eval_style": val_shadow_style,
        "shadow_eval_writing": val_shadow_writing,
        "all_sft_v3_count": len(all_v3),
        "targets": {
            "style_added": 24,
            "writing_added": 18,
            "style_total": len(style_v3),
            "writing_total": len(writing_v3),
            "all_total": len(all_v3),
            "shadow_eval_total": len(shadow_eval),
        },
    }
    (GAP_DIR / "data_v3_validation.json").write_text(json.dumps(quality, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    quality_md = [
        "# V3 Data Validation",
        "",
        f"- style_sft_v3: {len(style_v3)} samples",
        f"- writing_sft_v3: {len(writing_v3)} samples",
        f"- all_sft_v3: {len(all_v3)} samples",
        f"- shadow_eval: {len(shadow_eval)} samples",
        "",
        "## Gate Results",
        f"- style parse_ok: {val_style['parse_ok']}",
        f"- style field_complete: {val_style['field_complete']}",
        f"- style template_hit_rate: {val_style['template_hit_rate']:.2%}",
        f"- writing parse_ok: {val_writing['parse_ok']}",
        f"- writing field_complete: {val_writing['field_complete']}",
        f"- writing template_hit_rate: {val_writing['template_hit_rate']:.2%}",
        f"- shadow_style template_hit_rate: {val_shadow_style['template_hit_rate']:.2%}",
        f"- shadow_writing template_hit_rate: {val_shadow_writing['template_hit_rate']:.2%}",
    ]
    (GAP_DIR / "data_v3_validation.md").write_text("\n".join(quality_md) + "\n", encoding="utf-8")

    (GAP_DIR / "baseline_manifest.md").write_text(make_baseline_manifest(), encoding="utf-8")

    print("[OK] generated V3 assets")
    print(STYLE_V3_FILE)
    print(WRITING_V3_FILE)
    print(ALL_V3_FILE)
    print(SHADOW_EVAL_FILE)
    print(GAP_DIR / "all_failure_matrix.md")
    print(GAP_DIR / "all_failure_ids.json")
    print(GAP_DIR / "data_v3_validation.json")
    print(PROCESSED_V3_DIR)


if __name__ == "__main__":
    main()
