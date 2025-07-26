# 拼音小世界

一个适合儿童和初学者的趣味拼音学习网页应用，包含声母、韵母、整体认读、声调、拼读、识字、闯关等多种互动游戏。

## 功能特色

- 声母、韵母、整体认读音节学习与发音
- 声母/韵母/整体认读“听一听”听音辨认游戏
- 声调练习
- 拼读组合游戏
- 识字认读（图文配拼音）
- 闯关测试与成就系统
- 分数与进度自动保存
- 音效与背景音乐控制

## 使用方法

1. 克隆或下载本项目到本地。
2. 使用浏览器直接打开 `index.html` 即可体验全部功能。
3. 推荐使用 VS Code 的 Live Server 插件或命令行静态服务器（如 [serve](https://www.npmjs.com/package/serve)）运行，示例命令：

   ```sh
   npx serve -l 3666 .
   ```

   然后在浏览器访问 [http://localhost:3666](http://localhost:3666)。

## 依赖说明

- 纯前端实现，无需后端。
- 语音播放基于浏览器的 Web Speech API。
- 若需拼音转换功能，请确保引入了 [pinyin-pro](https://github.com/zh-lx/pinyin-pro) 等相关库（如有需要）。

## 目录结构

- `index.html`      主页面
- `main.js`         主要交互逻辑
- `listenjs/initials-listen-game.js`   声母听一听模块
- `listenjs/finals-listen-game.js`     韵母听一听模块
- `listenjs/wholeSyllables-listen-game.js` 整体认读听一听模块
- `README.md`       项目说明

## 功能流程图

### 声母/韵母/整体认读 - 听一听 功能流程

```mermaid
flowchart TD
    A[用户点击听一听按钮] --> B[playXXXListenGame函数]
    B --> C[隐藏主界面]
    C --> D[创建/显示听一听游戏区域]
    D --> E[重置游戏状态]
    E --> F[显示开始界面]

    F --> G[用户点击开始游戏按钮]
    G --> H[startXXXListenGame函数]
    H --> I[隐藏开始按钮]
    I --> J[显示题目区域]
    J --> K[nextXXXListenQuestion函数]

    K --> L[随机选择目标音节]
    L --> M[playCurrentXXXSound函数]
    M --> N[播放发音]
    N --> O[生成3个选项]
    O --> P[打乱选项顺序]
    P --> Q[显示选择按钮]

    Q --> R[用户选择答案]
    R --> S[checkXXXListenAnswer函数]
    S --> T{答案是否正确?}

    T -->|正确| U[显示成功反馈]
    U --> V[更新分数+20]
    V --> W[显示下一题按钮]

    T -->|错误| X[显示错误反馈]
    X --> Y[更新分数-5]
    Y --> Z[允许继续选择]

    W --> K
    Z --> Q

    AA[用户点击返回按钮] --> BB[backToXXXGame函数]
    BB --> CC[隐藏听一听游戏区域]
    CC --> DD[显示主界面]
```

> 其中 XXX 代表 initials、finals、wholeSyllables 三类。

## 贡献与许可

欢迎学习、修改和扩展本项目，仅供学习和非商业用途。
## 贡献与许可

欢迎学习、修改和扩展本项目，仅供学习和非商业用途。
