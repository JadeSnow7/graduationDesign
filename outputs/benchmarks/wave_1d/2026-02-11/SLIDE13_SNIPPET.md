# Slide 13 数据片段（wave_1d Rust POC）

## endpoint 口径
- Profile A: p95 降低 -5.02%，加速 0.95x
- Profile B: p95 降低 12.37%，加速 1.14x

## kernel 口径
- Profile A: p95 降低 98.75%，加速 79.69x
- Profile B: p95 降低 97.22%，加速 35.91x

## 正确性
- Profile A: max_abs_diff=0.00000000, l2_rel_error=0.00000000
- Profile B: max_abs_diff=0.00000000, l2_rel_error=0.00000000

## 结论
- 满足误差阈值: True；至少一个 profile 达到 p95 >=30% 降幅: True
