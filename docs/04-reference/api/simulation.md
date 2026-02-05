# 仿真服务接口（课程专属模块示例）

## 概述

仿真服务属于课程专属模块，提供数值计算与可视化能力。当前文档以物理仿真模型作为示例实现。

## 权限要求

- `sim:use` - 使用仿真服务

## 仿真模型分类

### 静电场仿真
- Laplace 2D 求解
- 点电荷电场计算
- 高斯定理验证

### 静磁场仿真  
- 导线磁场计算
- 螺线管磁场分析
- 安培环路定律验证

### 电磁波仿真
- 一维波动方程求解
- 菲涅尔系数计算
- 波的传播与反射

## 接口列表

### 1. Laplace 2D 求解

求解二维拉普拉斯方程，适用于静电场边值问题。

**接口地址**: `POST /api/v1/sim/laplace2d`

**权限要求**: `sim:use`

**请求参数**:
```json
{
  "nx": 60,
  "ny": 40,
  "v_top": 1.0,
  "v_bottom": 0.0,
  "v_left": 0.0,
  "v_right": 0.0,
  "max_iterations": 1000,
  "tolerance": 1e-6,
  "visualization": {
    "show_contour": true,
    "show_field": true,
    "colormap": "viridis"
  }
}
```

**参数说明**:
- `nx`, `ny`: 网格点数
- `v_top`, `v_bottom`, `v_left`, `v_right`: 边界电位
- `max_iterations`: 最大迭代次数
- `tolerance`: 收敛容差
- `visualization`: 可视化选项

**响应示例**:
```json
{
  "success": true,
  "data": {
    "potential": [[0.0, 0.1, 0.2], [0.1, 0.2, 0.3]],
    "electric_field": {
      "Ex": [[-0.1, -0.1], [-0.1, -0.1]],
      "Ey": [[-0.1, -0.1], [-0.1, -0.1]]
    },
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "iterations": 245,
      "convergence_error": 9.8e-7,
      "computation_time": 0.15,
      "grid_size": [60, 40]
    }
  }
}
```

### 2. 点电荷电场计算

计算多个点电荷产生的电场分布。

**接口地址**: `POST /api/v1/sim/point_charges`

**请求参数**:
```json
{
  "charges": [
    {"x": 0.3, "y": 0.0, "q": 1e-9},
    {"x": -0.3, "y": 0.0, "q": -1e-9}
  ],
  "x_min": -1.0,
  "x_max": 1.0,
  "y_min": -1.0,
  "y_max": 1.0,
  "grid_size": 50,
  "show_potential": true,
  "show_field_lines": true,
  "show_equipotentials": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "electric_field": {
      "Ex": "二维数组",
      "Ey": "二维数组",
      "magnitude": "二维数组"
    },
    "potential": "二维数组",
    "field_lines": [
      {"x": [0.3, 0.31, 0.32], "y": [0.0, 0.01, 0.02]}
    ],
    "equipotentials": [
      {"level": 1.0, "x": [0.25, 0.26], "y": [0.1, 0.11]}
    ],
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "total_charge": 0.0,
      "max_field_strength": 1.2e6,
      "computation_time": 0.08
    }
  }
}
```

### 3. 高斯定理验证

验证高斯定理，计算通过闭合面的电通量。

**接口地址**: `POST /api/v1/sim/gauss_flux`

**请求参数**:
```json
{
  "charges": [
    {"x": 0.0, "y": 0.0, "q": 1e-9}
  ],
  "surface": {
    "type": "circle",
    "center_x": 0.0,
    "center_y": 0.0,
    "radius": 0.5
  },
  "grid_resolution": 100
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "enclosed_charge": 1e-9,
    "electric_flux": 1.129e-7,
    "theoretical_flux": 1.129e-7,
    "relative_error": 0.001,
    "verification_passed": true,
    "surface_points": {
      "x": "数组",
      "y": "数组",
      "flux_density": "数组"
    },
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "epsilon_0": 8.854e-12,
      "computation_time": 0.05
    }
  }
}
```

### 4. 导线磁场计算

计算载流导线产生的磁场分布。

**接口地址**: `POST /api/v1/sim/wire_field`

**请求参数**:
```json
{
  "wires": [
    {
      "type": "infinite_straight",
      "x": 0.0,
      "y": 0.0,
      "current": 1.0,
      "direction": "z"
    }
  ],
  "x_min": -0.1,
  "x_max": 0.1,
  "y_min": -0.1,
  "y_max": 0.1,
  "grid_size": 50,
  "show_field_lines": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "magnetic_field": {
      "Bx": "二维数组",
      "By": "二维数组", 
      "Bz": "二维数组",
      "magnitude": "二维数组"
    },
    "field_lines": [
      {"x": "数组", "y": "数组"}
    ],
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "max_field_strength": 2e-5,
      "mu_0": 4e-7,
      "computation_time": 0.12
    }
  }
}
```

### 5. 螺线管磁场分析

计算螺线管内外的磁场分布。

**接口地址**: `POST /api/v1/sim/solenoid`

**请求参数**:
```json
{
  "n_turns": 100,
  "length": 0.1,
  "radius": 0.02,
  "current": 1.0,
  "analysis_points": {
    "axial_range": [-0.15, 0.15],
    "radial_range": [0.0, 0.05],
    "n_points": 100
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "axial_field": {
      "positions": "数组",
      "field_strength": "数组"
    },
    "radial_field": {
      "positions": "数组", 
      "field_strength": "数组"
    },
    "field_inside": 1.257e-3,
    "field_outside": 0.0,
    "theoretical_field": 1.257e-3,
    "uniformity": 0.95,
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "turns_per_meter": 1000,
      "inductance": 2.5e-6,
      "computation_time": 0.18
    }
  }
}
```

### 6. 安培环路定律验证

验证安培环路定律，计算磁场沿闭合路径的环流。

**接口地址**: `POST /api/v1/sim/ampere_loop`

**请求参数**:
```json
{
  "current_sources": [
    {
      "type": "wire",
      "x": 0.0,
      "y": 0.0,
      "current": 2.0
    }
  ],
  "loop": {
    "type": "circle",
    "center_x": 0.0,
    "center_y": 0.0,
    "radius": 0.05
  },
  "n_points": 100
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "enclosed_current": 2.0,
    "magnetic_circulation": 2.513e-6,
    "theoretical_circulation": 2.513e-6,
    "relative_error": 0.0005,
    "verification_passed": true,
    "loop_points": {
      "x": "数组",
      "y": "数组",
      "field_tangential": "数组"
    },
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "mu_0": 4e-7,
      "computation_time": 0.06
    }
  }
}
```

### 7. 一维波动方程求解

求解一维电磁波传播方程。

**接口地址**: `POST /api/v1/sim/wave_1d`

**请求参数**:
```json
{
  "length": 1.0,
  "nx": 200,
  "total_time": 1e-8,
  "nt": 1000,
  "source": {
    "type": "gaussian",
    "position": 0.2,
    "amplitude": 1.0,
    "width": 0.05,
    "frequency": 1e9
  },
  "boundary_condition": "absorbing",
  "medium": {
    "epsilon_r": 1.0,
    "mu_r": 1.0,
    "sigma": 0.0
  },
  "output_type": "animation"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "wave_data": {
      "x": "位置数组",
      "t": "时间数组",
      "E": "电场二维数组",
      "H": "磁场二维数组"
    },
    "wave_speed": 2.998e8,
    "wavelength": 0.2998,
    "frequency": 1e9,
    "animation_frames": [
      {"time": 0.0, "png_base64": "..."},
      {"time": 1e-10, "png_base64": "..."}
    ],
    "png_base64": "最终状态图像",
    "metadata": {
      "dx": 0.005,
      "dt": 1e-11,
      "cfl_number": 0.5,
      "computation_time": 0.45
    }
  }
}
```

### 8. 菲涅尔系数计算

计算电磁波在介质界面的反射和透射系数。

**接口地址**: `POST /api/v1/sim/fresnel`

**请求参数**:
```json
{
  "n1": 1.0,
  "n2": 1.5,
  "theta_i": 30.0,
  "polarization": "s",
  "angle_range": {
    "min": 0.0,
    "max": 90.0,
    "points": 91
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "single_angle": {
      "theta_i": 30.0,
      "theta_t": 19.47,
      "r_coefficient": 0.118,
      "t_coefficient": 0.882,
      "reflectance": 0.014,
      "transmittance": 0.986
    },
    "angle_sweep": {
      "angles": "角度数组",
      "reflectance": "反射率数组",
      "transmittance": "透射率数组"
    },
    "critical_angle": 41.81,
    "brewster_angle": 56.31,
    "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "metadata": {
      "polarization": "s",
      "total_internal_reflection": false,
      "computation_time": 0.03
    }
  }
}
```

## 仿真任务管理

### 9. 获取仿真历史

获取用户的仿真计算历史记录。

**接口地址**: `GET /api/v1/sim/history`

**请求参数**:
- `page` (query): 页码
- `limit` (query): 每页数量
- `type` (query): 仿真类型过滤
- `course_id` (query): 课程过滤

**响应示例**:
```json
{
  "success": true,
  "data": {
    "simulations": [
      {
        "id": "sim_123",
        "type": "laplace2d",
        "title": "平行板电容器电场分布",
        "parameters": {"nx": 60, "ny": 40},
        "status": "completed",
        "course_id": "1",
        "created_at": "2025-12-23T10:00:00Z",
        "computation_time": 0.15
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

### 10. 获取仿真详情

获取特定仿真的详细结果。

**接口地址**: `GET /api/v1/sim/results/{simulation_id}`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "sim_123",
    "type": "laplace2d",
    "title": "平行板电容器电场分布",
    "parameters": {"nx": 60, "ny": 40, "v_top": 1.0},
    "results": {
      "png_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "data_url": "/api/v1/sim/results/sim_123/data.json"
    },
    "metadata": {
      "computation_time": 0.15,
      "grid_size": [60, 40]
    },
    "created_at": "2025-12-23T10:00:00Z"
  }
}
```

### 11. 删除仿真记录

删除指定的仿真记录。

**接口地址**: `DELETE /api/v1/sim/results/{simulation_id}`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "仿真记录删除成功"
  }
}
```

## 批量仿真

### 12. 参数扫描仿真

对参数进行扫描，批量执行仿真。

**接口地址**: `POST /api/v1/sim/parameter_sweep`

**请求参数**:
```json
{
  "simulation_type": "point_charges",
  "base_parameters": {
    "charges": [{"x": 0.0, "y": 0.0, "q": 1e-9}],
    "grid_size": 50
  },
  "sweep_parameters": {
    "charges[0].q": {
      "type": "linear",
      "start": 1e-10,
      "end": 1e-8,
      "steps": 10
    }
  },
  "output_format": "summary"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "task_id": "sweep_456",
    "status": "processing",
    "total_simulations": 10,
    "completed": 0,
    "estimated_time": 30,
    "results_url": "/api/v1/sim/sweep/sweep_456/results"
  }
}
```

## 可视化选项

### 通用可视化参数
- `colormap`: 颜色映射 (viridis, plasma, jet, etc.)
- `show_contour`: 显示等值线
- `show_field`: 显示场矢量
- `show_grid`: 显示网格
- `title`: 图像标题
- `xlabel`, `ylabel`: 坐标轴标签

### 输出格式
- `png_base64`: Base64 编码的 PNG 图像
- `svg`: SVG 矢量图（可选）
- `data`: 原始数值数据
- `animation`: 动画帧序列

## 性能优化

### 计算优化
- 自适应网格细化
- 并行计算支持
- 内存使用优化
- 缓存机制

### 响应优化
- 异步计算任务
- 进度状态查询
- 结果缓存
- 压缩传输

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| INVALID_PARAMETERS | 参数无效 | 检查参数格式和取值范围 |
| COMPUTATION_FAILED | 计算失败 | 调整参数或联系技术支持 |
| CONVERGENCE_ERROR | 收敛失败 | 增加迭代次数或调整容差 |
| MEMORY_LIMIT_EXCEEDED | 内存超限 | 减少网格大小或分批计算 |
| TIMEOUT | 计算超时 | 简化模型或增加超时时间 |

## 使用限制

### 计算资源限制
- 最大网格点数：100,000
- 单次计算超时：300 秒
- 并发任务数：5 个
- 结果存储期限：30 天

### 频率限制
- 仿真请求：20 次/分钟
- 批量扫描：5 次/小时
- 历史查询：60 次/分钟
