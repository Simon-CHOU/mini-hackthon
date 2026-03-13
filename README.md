


```markdown
# 🚀 Mini-Hackathon: Web Terminal Time Machine (网页终端时光机 MVP)

## 🎯 赛题背景 / Background
作为一个 CS 助教，我希望为学生提供一个“开箱即用、随时回放”的完美编程环境。传统的 SSH 教学经常卡在配环境和基础命令上。
我的终极愿景是：**Thin Client + Fat Server + Pro-Sports Style Rewind**。学生只需打开浏览器，免登录即可进入真实的开发环境（写代码、编译运行），并且支持像体育赛事回放一样，像素级回顾他们的每一步操作，方便 debug 和教学复盘。

## 🚀 挑战目标 / The Challenge
由于这只是一场极限迷你黑客松，我们将宏大的“真实云端环境”收缩为最具核心竞争力的 **前端 MVP 原型验证**。
你需要构建一个 **基于 Web 的终端模拟器（Web Terminal），并实现操作的“录制与回放（Rewind）”功能**。

## ⏱️ 极限约束 / Constraints (必读)
这是一场属于 AI 时代的挑战，核心考察你使用 AI 的 **Vibe Coding（意念编程）** 能力：
1. **强制工具**：必须深度使用 Agentic Coder（如 Cursor, Devin, GitHub Copilot Workspace 等）进行辅助开发。
2. **时间限制：绝对的 25 分钟**。从你开始输入第一句 Prompt 起计时，25分钟一到 **必须停手**。
3. **完成即交付**：无论 25 分钟后你的项目是一个完美的 Demo，还是一个只跑通了一半的半成品，甚至是报错的代码，都 **必须直接提交**。我们看重的是你在 25 分钟内拆解需求、指挥 AI 的过程和方向。

## 🛠️ 功能需求 / MVP Requirements
在 25 分钟内，你需要指挥你的 AI 完成以下收缩后的核心功能：

*   **需求 1：免登录的 Web 界面 (Zero Friction)**
    *   一个极简的单页 HTML/JS 应用。打开浏览器直接看到黑乎乎的终端窗口，没有注册/登录流程。
*   **需求 2：伪终端模拟 (Mock Terminal)**
    *   *Vibe Coding 提示*：建议让 AI 使用 `xterm.js` 或类似轻量库。
    *   不需要真的连上 Windows 11 的 SSH 后端！只需实现本地的 Echo（输入什么显示什么），或者模拟几个假命令（如输入 `ls` 返回假目录，输入 `gcc main.c` 返回假编译信息）。
*   **需求 3：时光倒流核心体验 (The "Rewind" Feature)**
    *   提供一个「Record（录制）」和「Replay（回放）」按钮。
    *   *Vibe Coding 提示*：建议让 AI 记录终端的输入按键时间戳，或者使用 `rrweb` 这样的库。点击 Replay 时，可以清空屏幕，并按原本的速度自动重现刚才输入的所有代码和命令。

## 💡 给选手的 Vibe Coding 战术建议
*   **不要从零手写**：把上面的需求翻译成一段极度明确的 Prompt，直接扔给 Cursor。
*   **砍掉后端**：告诉 AI：“全部用前端静态文件（HTML/CSS/JS）实现，伪造终端的响应逻辑，不要写任何 Node.js/Python 后端”。
*   **专注杀手功能**：终端外观可以丑，但“输入 -> 记录 -> 重放”的循环一定要优先做出来。

## 📦 提交指南 / Submission
请严格按照以下流程在 25 分钟结束时提交你的产物：

1. **Fork 仓库**：前往[https://github.com/Simon-CHOU/mini-hackthon](https://github.com/Simon-CHOU/mini-hackthon) 点击 Fork。
2. **创建目录**：在仓库根目录下创建一个以你（或你们小队）名字命名的文件夹（例如：`team-vibe-coders/`）。
3. **提交代码**：将你 25 分钟内的所有代码文件放入该文件夹。
4. **添加说明**：在你的文件夹中包含一个 `README.md`，简要填写：
    *   队伍名称 / 成员（1-2人）：
    *   使用的 Agentic Coder 工具（如 Cursor）：
    *   完成度自评（25分钟内做到了哪一步）：
    *   你提供给 AI 的第一句关键 Prompt（复制粘贴过来）：
5. **提交 PR**：向原仓库提交 Pull Request (PR)，标题格式为 `[Hackathon] 队伍名称 - Web Terminal Time Machine`。

**Ready? Set your timers for 25 minutes... Vibe Code!**
```