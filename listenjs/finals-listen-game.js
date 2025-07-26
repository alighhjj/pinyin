import { finals } from '../pinyin-data.js';
import { shuffleArray } from '../main.js';

/**
 * 创建韵母听一听游戏UI
 */
export function createFinalsListenGameUI() {
    const finalsListenGameArea = document.createElement('div');
    finalsListenGameArea.id = 'listen-finals-game';
    finalsListenGameArea.className = 'game-area';
    finalsListenGameArea.innerHTML = `
        <button class="back-btn" id="listen-finals-back-btn">← 返回韵母王国</button>
        <h2>🌟 韵母记忆游戏 - 听一听</h2>
        <div class="game-instructions">仔细听韵母发音，选择正确的答案！</div>
        <div class="spelling-game">
            <button class="btn" id="start-finals-listen-btn">开始游戏</button>
        </div>
        <div id="finals-listen-question" style="display: none; text-align: center; margin: 20px 0;">
            <button class="btn" id="replay-finals-sound-btn">🔊 再听一遍</button>
            <div id="finals-listen-options" class="pinyin-grid" style="margin: 20px 0;"></div>
            <div id="finals-listen-result" style="margin: 20px 0; font-size: 1.2rem;"></div>
        </div>
    `;
    return finalsListenGameArea;
}

/**
 * 生成韵母听一听题目
 */
export function generateFinalsListenQuestion() {
    const randomIndex = Math.floor(Math.random() * finals.length);
    const currentListenFinal = finals[randomIndex];

    // 生成选项（正确答案 + 2个干扰项）
    const options = [currentListenFinal];
    const distractors = finals.filter(f => f !== currentListenFinal);

    while (options.length < 3 && distractors.length > 0) {
        const randomDistractor = distractors.splice(Math.floor(Math.random() * distractors.length), 1)[0];
        options.push(randomDistractor);
    }
    while (options.length < 3) {
        const extra = finals[Math.floor(Math.random() * finals.length)];
        if (!options.includes(extra)) {
            options.push(extra);
        }
    }
    if (!options.includes(currentListenFinal)) {
        options[0] = currentListenFinal;
    }
    const shuffledOptions = shuffleArray(options);

    return {
        currentListenFinal,
        options: shuffledOptions
    };
}

/**
 * 获取韵母索引
 */
export function getFinalIndex(final) {
    return finals.indexOf(final);
}

/**
 * 检查韵母答案
 */
export function checkFinalAnswerResult(selected, correct) {
    if (selected === correct) {
        return {
            isCorrect: true,
            scoreChange: 20,
            message: `✅ 正确！是 ${correct}`
        };
    } else {
        return {
            isCorrect: false,
            scoreChange: -5,
            message: `❌ 不对哦，再试试！`
        };
    }
}
