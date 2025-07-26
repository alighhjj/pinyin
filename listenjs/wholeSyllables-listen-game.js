import { wholeSyllables } from '../pinyin-data.js';
import { shuffleArray } from '../main.js';

/**
 * 创建整体认读听一听游戏UI
 */
export function createWholeSyllablesListenGameUI() {
    const area = document.createElement('div');
    area.id = 'listen-wholeSyllables-game';
    area.className = 'game-area';
    area.innerHTML = `
        <button class="back-btn" id="listen-wholeSyllables-back-btn">← 返回整体认读</button>
        <h2>✨ 整体认读 - 听一听</h2>
        <div class="game-instructions">仔细听整体认读音节发音，选择正确的答案！</div>
        <div class="spelling-game">
            <button class="btn" id="start-wholeSyllables-listen-btn">开始游戏</button>
        </div>
        <div id="wholeSyllables-listen-question" style="display: none; text-align: center; margin: 20px 0;">
            <button class="btn" id="replay-wholeSyllables-sound-btn">🔊 再听一遍</button>
            <div id="wholeSyllables-listen-options" class="pinyin-grid" style="margin: 20px 0;"></div>
            <div id="wholeSyllables-listen-result" style="margin: 20px 0; font-size: 1.2rem;"></div>
        </div>
    `;
    return area;
}

/**
 * 生成整体认读听一听题目
 */
export function generateWholeSyllablesListenQuestion() {
    const randomIndex = Math.floor(Math.random() * wholeSyllables.length);
    const currentListenWhole = wholeSyllables[randomIndex];

    // 生成选项（正确答案 + 2个干扰项）
    const options = [currentListenWhole];
    const distractors = wholeSyllables.filter(w => w !== currentListenWhole);

    while (options.length < 3 && distractors.length > 0) {
        const randomDistractor = distractors.splice(Math.floor(Math.random() * distractors.length), 1)[0];
        options.push(randomDistractor);
    }
    while (options.length < 3) {
        const extra = wholeSyllables[Math.floor(Math.random() * wholeSyllables.length)];
        if (!options.includes(extra)) {
            options.push(extra);
        }
    }
    if (!options.includes(currentListenWhole)) {
        options[0] = currentListenWhole;
    }
    const shuffledOptions = shuffleArray(options);

    return {
        currentListenWhole,
        options: shuffledOptions
    };
}

/**
 * 获取整体认读音节索引
 */
export function getWholeSyllableIndex(syllable) {
    return wholeSyllables.indexOf(syllable);
}

/**
 * 检查整体认读音节答案
 */
export function checkWholeSyllableAnswerResult(selected, correct) {
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
