# 在岛屿上重启我的计算机学习路线

今天给自己定了一个新原则：

1. 每天输入一个知识点（书、论文、文档）。
2. 每天输出一段总结（博客、代码、图示）。
3. 每周做一次系统复盘。

## 学习地图

- 计算机系统：进程、内存、I/O、并发
- 数据结构与算法：基础结构 + 常见范式
- 软件工程：测试、架构、可观测性、交付

## 今日代码片段

```python
from dataclasses import dataclass

@dataclass
class DailyRecord:
    topic: str
    output: str
    minutes: int

def score(record: DailyRecord) -> int:
    # 用于衡量学习投入产出，后续可加入更多维度
    return min(100, record.minutes // 2 + len(record.output))
```

## 明日计划

- 补完计算机网络分层模型。
- 完成一个最小可运行算法题模板库。
- 在博客记录 1 个工程实践复盘。
