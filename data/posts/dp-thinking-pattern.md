# 动态规划：从状态设计到工程可维护实现

动态规划常见的失败点不是不会写代码，而是状态设计不稳定。

## 四步法

1. 明确状态定义：`dp[i]` 或 `dp[i][j]` 含义必须可解释。
2. 写出转移方程：来自哪些子问题。
3. 定义边界：空数组、最小输入、非法状态。
4. 优化空间：检查是否可滚动数组。

## 模板

```javascript
function solve(nums) {
  if (!nums.length) return 0;
  const dp = new Array(nums.length).fill(0);
  dp[0] = Math.max(0, nums[0]);
  for (let i = 1; i < nums.length; i += 1) {
    dp[i] = Math.max(dp[i - 1], nums[i] + (i >= 2 ? dp[i - 2] : 0));
  }
  return dp[nums.length - 1];
}
```

## 工程建议

- 给状态变量起语义化名字。
- 在测试中覆盖边界输入。
- 在注释中写出状态解释，而不是复述代码。
