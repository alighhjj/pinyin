// initials-listen-game.js

import { initials } from '../pinyin-data.js';
import { shuffleArray } from '../main.js';

/**
 * @function createListenGameUI
 * @description 创建听一听游戏的UI结构
 * @returns {HTMLElement} 返回听一听游戏区域元素
 */
export function createListenGameUI() {
    const listenGameArea = document.createElement('div');
    listenGameArea.id = 'listen-initials-game';
    listenGameArea.className = 'game-area';
    listenGameArea.innerHTML = `
        <button class="back-btn" id="listen-back-btn">← 返回声母乐园</button>
        <h2>🎯 声母记忆游戏 - 听一听</h2>
        <div class="game-instructions">仔细听声母发音，选择正确的答案！</div>
        <div class="spelling-game">
            <button class="btn" id="start-listen-btn">开始游戏</button>
        </div>
        <div id="listen-question" style="display: none; text-align: center; margin: 20px 0;">
            <button class="btn" id="replay-sound-btn">🔊 再听一遍</button>
            <div id="listen-options" class="pinyin-grid" style="margin: 20px 0;"></div>
            <div id="listen-result" style="margin: 20px 0; font-size: 1.2rem;"></div>
        </div>
    `;
    return listenGameArea;
}

/**
 * @function generateListenQuestion
 * @description 生成听一听题目数据
 * @returns {Object} 包含当前声母和选项的对象
 */
export function generateListenQuestion() {
    // 随机选择一个声母
    const randomIndex = Math.floor(Math.random() * initials.length);
    const currentListenInitial = initials[randomIndex];
    
    // 生成选项（正确答案 + 2个干扰项）
    const options = [currentListenInitial];
    const distractors = initials.filter(i => i !== currentListenInitial);
    
    // 确保至少有3个选项
    while (options.length < 3 && distractors.length > 0) {
        const randomDistractor = distractors.splice(Math.floor(Math.random() * distractors.length), 1)[0];
        options.push(randomDistractor);
    }
    
    // 如果选项仍不足3个，从所有声母中随机选择
    while (options.length < 3) {
        const extra = initials[Math.floor(Math.random() * initials.length)];
        if (!options.includes(extra)) {
            options.push(extra);
        }
    }
    
    // 确保正确答案在选项中
    if (!options.includes(currentListenInitial)) {
        options[0] = currentListenInitial;
    }
    
    // 打乱选项顺序
    const shuffledOptions = shuffleArray(options);
    
    return {
        currentListenInitial,
        options: shuffledOptions
    };
}

/**
 * @function getInitialIndex
 * @description 获取声母的索引
 * @param {string} initial - 声母
 * @returns {number} 声母的索引
 */
export function getInitialIndex(initial) {
    return initials.indexOf(initial);
}

/**
 * @function checkAnswerResult
 * @description 检查答案并返回结果信息
 * @param {string} selected - 用户选择的声母
 * @param {string} correct - 正确的声母
 * @returns {Object} 包含是否正确和分数变化的对象
 */
export function checkAnswerResult(selected, correct) {
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
