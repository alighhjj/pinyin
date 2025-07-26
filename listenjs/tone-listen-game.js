import { yindiaoKeys } from '../yindiao.js';

// 固定的四个音调
const toneOptions = [
    { pinyin: "ˉ", label: "一声" },
    { pinyin: "ˊ", label: "二声" },
    { pinyin: "ˇ", label: "三声" },
    { pinyin: "`", label: "四声" }
];

// 生成听音题目 - 从yindiaoKeys中选择一个完整拼音作为题目
export function generateToneListenQuestion() {
    // 随机选一个完整拼音为当前题目
    const randomIndex = Math.floor(Math.random() * yindiaoKeys.length);
    const currentToneExample = yindiaoKeys[randomIndex];
    
    console.log("生成题目:", {currentToneExample}); // 调试信息
    
    return {
        currentToneExample, // 题目是完整拼音，如"mā"
        options: toneOptions.map(opt => opt.pinyin)
    };
}

// 检查答案
export function checkToneAnswerResult(selected, correct) {
    console.log('Checking answer:', selected, 'against', correct); // 调试信息
    if (selected === correct) {
        return {
            isCorrect: true,
            message: "答对啦！",
            scoreChange: 20
        };
    } else {
        // 找到正确label
        const correctOption = toneOptions.find(opt => opt.pinyin === correct);
        const correctLabel = correctOption ? correctOption.label : "未知";
        return {
            isCorrect: false,
            message: `再试试！正确答案是${correctLabel}`,
            scoreChange: -5
        };
    }
}

export function createTonesListenGameUI() {
    const toneListenGameArea = document.createElement('div');
    toneListenGameArea.id = 'listen-tone-game';
    toneListenGameArea.className = 'game-area';
    toneListenGameArea.innerHTML = `
        <button class="back-btn" id="listen-tone-back-btn">← 返回声调王国</button>
        <h2>🌟 声调记忆游戏 - 听一听</h2>
        <div class="game-instructions">仔细听声调发音，选择正确的答案！</div>
        <div class="spelling-game">
            <button class="btn" id="start-tone-listen-btn">开始游戏</button>
        </div>
        <div id="tone-listen-question" style="display: none; text-align: center; margin: 20px 0;">
            <button class="btn" id="replay-tone-sound-btn">🔊 再听一遍</button>
            <div id="tone-listen-options" class="pinyin-grid" style="margin: 20px 0;"></div>
            <div id="tone-listen-result" style="margin: 20px 0; font-size: 1.2rem;"></div>
        </div>
        <style>
            #tone-listen-question {
                transition: opacity 0.3s ease-in-out;
            }
        </style>
    `;
    return toneListenGameArea;
}

