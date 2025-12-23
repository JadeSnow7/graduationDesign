# 仿真服务 (Simulation Service)

基于 Python 的电磁场仿真服务，提供数值计算和可视化功能。

## 技术栈

- Python 3.9+
- FastAPI (Web框架)
- NumPy (数值计算)
- SciPy (科学计算)
- Matplotlib (可视化)
- FEniCS (有限元分析)

## 开发环境

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --port 8002
```

## 项目结构

```
app/
├── main.py           # 应用入口
├── routes/           # API路由
├── solvers/          # 求解器实现
│   ├── electrostatics.py    # 静电场求解
│   ├── magnetostatics.py    # 静磁场求解
│   ├── wave.py              # 波动方程求解
│   ├── laplace.py           # 拉普拉斯方程求解
│   └── numerical.py         # 数值计算工具
└── utils/            # 工具函数
```

## 主要功能

- 静电场数值仿真
- 静磁场数值仿真
- 电磁波传播仿真
- 拉普拉斯方程求解
- 数值积分和微分

## 仿真算法

- 有限差分法 (FDM)
- 有限元法 (FEM)
- 边界元法 (BEM)
- 蒙特卡罗方法

## 相关文档

- [仿真算法说明](../../docs/architecture/simulation.md)
- [API文档](../../docs/api/simulation.md)