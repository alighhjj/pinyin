import { initials, finals, wholeSyllables } from './pinyin-data.js';
import { extendedRecognitionData } from './extended-recognition-data.js';
import { createListenGameUI, generateListenQuestion, getInitialIndex, checkAnswerResult } from './listenjs/initials-listen-game.js';
import { createFinalsListenGameUI, generateFinalsListenQuestion, getFinalIndex, checkFinalAnswerResult } from './listenjs/finals-listen-game.js';
import { createWholeSyllablesListenGameUI, generateWholeSyllablesListenQuestion, getWholeSyllableIndex, checkWholeSyllableAnswerResult } from './listenjs/wholeSyllables-listen-game.js';
import { createTonesListenGameUI, generateToneListenQuestion, checkToneAnswerResult } from './listenjs/tone-listen-game.js';
import { generateClassificationQuestion, checkClassificationAnswer } from './listenjs/classification-game.js';


// 游戏状态
export let gameState = {
    currentGame: null,
    score: 0,
    level: 1,
    musicEnabled: true,
    soundEnabled: true,
    learnedInitials: 0,
    learnedFinals: 0,
    learnedWholeSyllables: 0,
    // 用于跟踪独立学习的拼音字符的集合
    learnedInitialsSet: new Set(),
    learnedFinalsSet: new Set(),
    learnedWholeSyllablesSet: new Set(),
    // 听一听游戏状态
    listenGameState: {
        currentListenInitial: null,
        listenScore: 0
    },
    finalsListenGameState: {
        currentListenFinal: null,
        listenScore: 0
    },
    wholeSyllablesListenGameState: {
        currentListenWhole: null,
        listenScore: 0
    },
    tonesListenGameState: {
        currentListenToneExample: null,
        currentCorrectTone: null,
        listenScore: 0
    },
    // 拼音归类游戏状态
    classificationGameState: {
        currentQuestion: null,
        selectedOptions: [],
        listenScore: 0
    },
    // 识字认读游戏状态
    recognitionGameState: {
        currentRecognitionIndex: 0,
        currentQuestion: null,
        selectedOption: null,
        isAnswerCorrect: false
    }
};

// 显示游戏区域
function showGame(gameType) {
    console.log('showGame called with:', gameType);
    // 隐藏主菜单
    document.getElementById('main-menu').style.display = 'none';
    
    // 隐藏所有游戏区域
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    
    // 显示选择的游戏
    const gameArea = document.getElementById(gameType + '-game');
    if (gameArea) {
        gameArea.classList.add('active');
        gameState.currentGame = gameType;
        initializeGame(gameType);
        
        // 滚动到游戏区域
        setTimeout(() => {
            gameArea.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// 返回主菜单
function backToMenu() {
    document.getElementById('main-menu').style.display = 'grid';
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    gameState.currentGame = null;
    
    // 滚动到顶部
    document.querySelector('.header').scrollIntoView({ behavior: 'smooth' });
}

// 听一听游戏控制函数
export function playInitialsGame() {
    // 隐藏当前游戏区域，显示听一听游戏
    document.getElementById('initials-game').classList.remove('active');
    
    // 创建或显示听一听游戏区域
    let listenGameArea = document.getElementById('listen-initials-game');
    if (!listenGameArea) {
        listenGameArea = createListenGameUI();
        document.querySelector('.container').appendChild(listenGameArea);
    }
    listenGameArea.classList.add('active');
    
    // 绑定事件监听器
    setupListenGameListeners();
    
    // 重置游戏状态
    gameState.listenGameState.currentListenInitial = null;
    gameState.listenGameState.listenScore = 0;
}

function setupListenGameListeners() {
    const backBtn = document.getElementById('listen-back-btn');
    const startBtn = document.getElementById('start-listen-btn');
    const replayBtn = document.getElementById('replay-sound-btn');
    
    if (backBtn) backBtn.onclick = backToInitialsGame;
    if (startBtn) startBtn.onclick = startToInitialsGame;
    if (replayBtn) replayBtn.onclick = playCurrentSound;
}

function startToInitialsGame() {
    document.getElementById('start-listen-btn').style.display = 'none';
    document.getElementById('listen-question').style.display = 'block';
    nextListenQuestion();
}

function backToInitialsGame() {
    const listenGameArea = document.getElementById('listen-initials-game');
    if (listenGameArea) {
        listenGameArea.classList.remove('active');
    }
    document.getElementById('initials-game').classList.add('active');
}

function nextListenQuestion() {
    const questionData = generateListenQuestion();
    gameState.listenGameState.currentListenInitial = questionData.currentListenInitial;
    
    // 播放音频
    playCurrentSound();
    
    // 显示选项
    displayListenOptions(questionData.options);
    
    // 清空结果区域
    document.getElementById('listen-result').innerHTML = '';
}

// 挂载到window，确保HTML onclick可用
window.nextListenQuestion = nextListenQuestion;

function displayListenOptions(options) {
    const optionsContainer = document.getElementById('listen-options');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = option;
        card.onclick = () => checkListenAnswer(option);
        card.style.background = '';
        card.disabled = false;
        optionsContainer.appendChild(card);
    });
}

function playCurrentSound() {
    const currentInitial = gameState.listenGameState.currentListenInitial;
    if (currentInitial) {
        playInitialSound(currentInitial, getInitialIndex(currentInitial));
    }
}

function checkListenAnswer(selected) {
    const currentInitial = gameState.listenGameState.currentListenInitial;
    const result = checkAnswerResult(selected, currentInitial);

    updateScore(result.scoreChange);
    
    // 播放音效
    if (result.isCorrect) {
        playSound('rightanswer.mp3');
    } else {
        playSound('wronganswer.mp3');
    }

    const resultContainer = document.getElementById('listen-result');
    if (result.isCorrect) {
        resultContainer.innerHTML = `
            <span style="color: #4ecdc4;">${result.message}</span>
            <button class="btn" onclick="nextListenQuestion()">下一题</button>
        `;

        // 标记正确答案并禁用所有选项
        document.querySelectorAll('#listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === currentInitial) {
                btn.style.background = '#4ecdc4';
            }
            btn.disabled = true;
        });
    } else {
        resultContainer.innerHTML = `
            <span style="color: #ff6b6b;">${result.message}</span>
        `;

        // 只禁用错误选项，其他选项可继续点击
        document.querySelectorAll('#listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#ff6b6b';
                btn.disabled = true;
            }
        });
    }
}

// 初始化游戏
function initializeGame(gameType) {
    switch(gameType) {
        case 'initials':
            createInitialsGrid();
            // 使用Set的大小来初始化进度
            gameState.learnedInitials = gameState.learnedInitialsSet ? gameState.learnedInitialsSet.size : 0;
            updateProgress('initials-progress', gameState.learnedInitials, initials.length);
            break;
        case 'finals':
            createFinalsGrid();
            // 使用Set的大小来初始化进度
            gameState.learnedFinals = gameState.learnedFinalsSet ? gameState.learnedFinalsSet.size : 0;
            updateProgress('finals-progress', gameState.learnedFinals, finals.length);
            break;
        case 'wholeSyllables':
            createWholeSyllablesGrid();
            // 使用Set的大小来初始化进度
            gameState.learnedWholeSyllables = gameState.learnedWholeSyllablesSet ? gameState.learnedWholeSyllablesSet.size : 0;
            updateProgress('wholeSyllables-progress', gameState.learnedWholeSyllables, wholeSyllables.length);
            break;
        case 'recognition':
            createRecognitionGame();
            break;
        case 'tones':
            // 声调游戏已经在HTML中定义
            break;
        case 'classification':
            // 拼音归类游戏初始化
            break;
        default:
            console.log('游戏类型：' + gameType);
    }
}

// 创建声母网格
function createInitialsGrid() {
    const grid = document.getElementById('initials-grid');
    grid.innerHTML = '';
    
    initials.forEach((initial, index) => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = initial;
        card.onclick = () => playInitialSound(initial, index);
        grid.appendChild(card);
    });
}

// 创建韵母网格
function createFinalsGrid() {
    const grid = document.getElementById('finals-grid');
    grid.innerHTML = '';
    
    finals.forEach((final, index) => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = final;
        card.onclick = () => playFinalSound(final, index);
        grid.appendChild(card);
    });
}

// 创建整体认读网格
function createWholeSyllablesGrid() {
    const grid = document.getElementById('wholeSyllables-grid');
    grid.innerHTML = '';
    
    wholeSyllables.forEach((syllable, index) => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = syllable;
        card.onclick = () => playWholeSyllableSound(syllable, index);
        grid.appendChild(card);
    });
}

// 创建识字游戏
function createRecognitionGame() {
    // 使用扩展的数据集
    const data = extendedRecognitionData;
    
    if (data.length > 0) {
        // 随机选择一个题目索引
        const randomIndex = Math.floor(Math.random() * data.length);
        gameState.recognitionGameState.currentRecognitionIndex = randomIndex;
        const currentData = data[randomIndex];
        
        document.getElementById('recognition-image').textContent = currentData.image;
        
        const options = document.getElementById('recognition-options');
        options.innerHTML = '';
        
        // 打乱选项顺序
        const shuffledOptions = shuffleArray([...currentData.options]);
       
        shuffledOptions.forEach(option => {
            const card = document.createElement('button');
            card.className = 'pinyin-card';
            card.textContent = option;
            card.onclick = () => selectRecognition(option);
            // 添加data属性用于识别正确答案
            if (option === currentData.pinyin) {
                card.dataset.correct = "true";
            }
            options.appendChild(card);
        });
        
        // 重置状态
        gameState.recognitionGameState.currentQuestion = currentData;
        gameState.recognitionGameState.selectedOption = null;
        gameState.recognitionGameState.isAnswerCorrect = false;
    }
}

// 播放声母音频
export async function playInitialSound(initial, index) {
    if (gameState.soundEnabled) {
        const audioData = await getPinyinAudio(initial);
        if (audioData && audioData.url) {
            playAudio(audioData.url);
        } else {
            speak(initial);
        }
    }
   
   // 视觉反馈
   const cards = document.querySelectorAll('#initials-grid .pinyin-card');
   if (cards[index]) {
       cards[index].classList.add('clicked');
       setTimeout(() => {
           cards[index].classList.remove('clicked');
       }, 600);
   }
   
   // 标记为已学习（使用Set来跟踪独立学习的声母）
   if (!gameState.learnedInitialsSet) {
       gameState.learnedInitialsSet = new Set();
   }
   gameState.learnedInitialsSet.add(initial);
   gameState.learnedInitials = gameState.learnedInitialsSet.size;
   updateProgress('initials-progress', gameState.learnedInitials, initials.length);
   
   updateScore(10);
}

// 播放韵母音频
async function playFinalSound(final, index) {
    if (gameState.soundEnabled) {
        const audioData = await getPinyinAudio(final);
        if (audioData && audioData.url) {
            playAudio(audioData.url);
        } else {
            speak(final);
        }
    }
   
   // 视觉反馈
   const cards = document.querySelectorAll('#finals-grid .pinyin-card');
   if (cards[index]) {
       cards[index].classList.add('clicked');
       setTimeout(() => {
           cards[index].classList.remove('clicked');
       }, 600);
   }
   
   // 标记为已学习（使用Set来跟踪独立学习的韵母）
   if (!gameState.learnedFinalsSet) {
       gameState.learnedFinalsSet = new Set();
   }
   gameState.learnedFinalsSet.add(final);
   gameState.learnedFinals = gameState.learnedFinalsSet.size;
   updateProgress('finals-progress', gameState.learnedFinals, finals.length);
   
   updateScore(10);
}

// 播放声调（使用yindiao.json）
async function playTone(toneName, example) {
    if (gameState.soundEnabled) {
        const audioPath = await getYindiaoAudio(example);
        if (audioPath) {
            playAudio(audioPath);
            console.log('播放声调:', toneName, '音频路径:', audioPath);
        } else {
            speak(example);
        }
    }
}

// 播放整体认读音节音频
async function playWholeSyllableSound(syllable, index) {
    if (gameState.soundEnabled) {
        const audioData = await getPinyinAudio(syllable);
        if (audioData && audioData.url) {
            playAudio(audioData.url);
        } else {
            speak(syllable);
        }
    }

    // 视觉反馈
    const cards = document.querySelectorAll('#wholeSyllables-grid .pinyin-card');
    if (cards[index]) {
        cards[index].classList.add('clicked');
        setTimeout(() => {
            cards[index].classList.remove('clicked');
        }, 600);
    }

    // 标记为已学习（使用Set来跟踪独立学习的整体认读音节）
    if (!gameState.learnedWholeSyllablesSet) {
        gameState.learnedWholeSyllablesSet = new Set();
    }
    gameState.learnedWholeSyllablesSet.add(syllable);
    gameState.learnedWholeSyllables = gameState.learnedWholeSyllablesSet.size;
    updateProgress('wholeSyllables-progress', gameState.learnedWholeSyllables, wholeSyllables.length);

    updateScore(10);
}

// 语音播放 (使用Web Speech API) - 简化版
function speak(text) {
   if ('speechSynthesis' in window && gameState.soundEnabled) {
       // 创建语音对象
       const utterance = new SpeechSynthesisUtterance(text);
       
       // 设置语言
       utterance.lang = 'zh-CN';
       
       // 开始朗读
       speechSynthesis.speak(utterance);
   }
}

// 播放音频文件
function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Error playing audio:", e));
}

// 从pinyin.json加载拼音音频数据
let pinyinAudioData = {};
async function loadPinyinAudioData() {
    try {
        const response = await fetch('./pinyin.json');
        pinyinAudioData = await response.json();
        console.log('拼音音频数据加载成功:', pinyinAudioData);
    } catch (error) {
        console.error('加载拼音音频数据失败:', error);
    }
}

// 获取拼音对应的音频数据（从pinyin.json）
async function getPinyinAudio(pinyin) {
    if (Object.keys(pinyinAudioData).length === 0) {
        await loadPinyinAudioData();
    }
    return pinyinAudioData[pinyin];
}

// 从yindiao.json加载音调音频数据
let yindiaoAudioData = {};
async function loadYindiaoAudioData() {
    try {
        const response = await fetch('./yindiao.json');
        yindiaoAudioData = await response.json();
        console.log('音调音频数据加载成功:', yindiaoAudioData);
    } catch (error) {
        console.error('加载音调音频数据失败:', error);
    }
}

// 获取音调对应的音频数据（从yindiao.json）
async function getYindiaoAudio(pinyin) {
    if (Object.keys(yindiaoAudioData).length === 0) {
        await loadYindiaoAudioData();
    }
    return yindiaoAudioData[pinyin];
}

// 播放音效
function playSound(soundFile) {
    if (gameState.soundEnabled) {
        const audio = new Audio(`./tone-audios/${soundFile}`);
        audio.play().catch(e => console.error("播放音效失败:", e));
    }
}

// 识字认读
function selectRecognition(selectedPinyin) {
    // 使用扩展的数据集
    const data = extendedRecognitionData;
    
    if (data.length > 0) {
        const currentData = data[gameState.recognitionGameState.currentRecognitionIndex];
        
        // 获取所有选项按钮
        const optionButtons = document.querySelectorAll('#recognition-options .pinyin-card');
        
        // 检查选择是否正确
        if (selectedPinyin === currentData.pinyin) {
            // 正确答案
            showAchievement('正确！你认识这个！');
            playSound('rightanswer.mp3'); // 播放正确答案音效
            updateScore(30);
            
            // 高亮显示正确答案
            optionButtons.forEach(btn => {
                if (btn.textContent === selectedPinyin) {
                    btn.style.background = '#4ecdc4';
                }
                // 禁用所有按钮
                btn.onclick = null;
            });
            
            // 显示下一个按钮
            const nextButton = document.querySelector('[data-action="nextRecognitionWord"]');
            if (nextButton) {
                nextButton.style.display = 'inline-block';
            }
            
            // 更新状态
            gameState.recognitionGameState.selectedOption = selectedPinyin;
            gameState.recognitionGameState.isAnswerCorrect = true;
        } else {
            // 错误答案 - 只提示错误，不要显示正确答案
            showAchievement('😢 不对哦，请重新选择！', true); // true表示是错误信息
            playSound('wronganswer.mp3'); // 播放错误答案音效
            
            // 高亮显示错误答案
            optionButtons.forEach(btn => {
                if (btn.textContent === selectedPinyin) {
                    btn.style.background = '#ff6b6b';
                    // 禁用错误选项
                    btn.onclick = null;
                }
            });
            
            // 更新状态
            gameState.recognitionGameState.selectedOption = selectedPinyin;
        }
    }
}

// 下一个识字词
function nextRecognitionWord() {
    // 使用扩展的数据集
    const data = extendedRecognitionData;
    
    if (data.length > 0) {
        createRecognitionGame();
        // 隐藏下一个按钮，直到用户选择正确答案
        const nextButton = document.querySelector('[data-action="nextRecognitionWord"]');
        if (nextButton) {
            nextButton.style.display = 'none';
        }
    } else {
        showAchievement('识字游戏完成！你认识了很多字！');
        playSound('rightanswer.mp3'); // 播放完成音效
        gameState.recognitionGameState.currentRecognitionIndex = 0;
    }
}

// 显示成就/反馈信息
export function showAchievement(message, isError = false) {
   const achievement = document.getElementById('achievement');
   const text = document.getElementById('achievement-text');
   const title = document.getElementById('achievement-title');
   
   // 设置消息内容
   text.textContent = message;
   
   // 根据是否是错误信息设置不同的标题和样式
   if (isError) {
       // 错误反馈样式
       title.textContent = '加油!';
       achievement.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'; // 红色渐变
   } else {
       // 正确反馈样式
       title.textContent = '🎉 太棒了!';
       achievement.style.background = 'linear-gradient(45deg, #ffd700, #ffed4a)'; // 黄金渐变
   }
   
   achievement.classList.add('show');
   
   setTimeout(() => {
       achievement.classList.remove('show');
   }, 2000);
}

// 更新分数
export function updateScore(points) {
   gameState.score = Math.max(0, gameState.score + points);
   updateScoreDisplay();
}

// 更新分数显示
function updateScoreDisplay() {
   document.getElementById('score-value').textContent = gameState.score;
}

// 更新进度显示
function updateProgress(elementId, learnedCount, totalCount) {
   const progressElement = document.getElementById(elementId);
   if (progressElement) {
       const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;
       progressElement.innerHTML = `
           <div class="progress-bar">
               <div class="progress-fill" style="width: ${percentage}%"></div>
           </div>
           <div class="progress-text">${learnedCount}/${totalCount} (${percentage}%)</div>
       `;
   }
}

// 鼓励话语
function showEncouragement() {
   const encouragements = [
       '你真棒！继续加油！',
       '学习很认真呢！',
       '拼音小达人就是你！',
       '今天学了不少呢！',
       '很棒的进步！',
       '小熊猫为你骄傲！',
       '继续努力哦！',
       '你越来越棒了！'
   ];
   
   const randomMessage = encouragements[Math.floor(Math.random() * encouragements.length)];
   showAchievement(randomMessage, false); // 添加false参数
   speak(randomMessage);
}

// 获取随机项目
function getRandomItems(array, count) {
   const shuffled = array.slice().sort(() => 0.5 - Math.random());
   return shuffled.slice(0, Math.min(count, array.length));
}

// 辅助函数：打乱数组
export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 音频控制
function toggleMusic() {
    gameState.musicEnabled = !gameState.musicEnabled;
    const btn = document.getElementById('music-btn');
    btn.classList.toggle('muted', !gameState.musicEnabled);
    btn.textContent = gameState.musicEnabled ? '🎵' : '🔇';
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('sound-btn');
    btn.classList.toggle('muted', !gameState.soundEnabled);
    btn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
}

// 将函数添加到全局作用域，以便HTML中的onclick可以访问
window.toggleMusic = toggleMusic;
window.toggleSound = toggleSound;

// 简化的语音初始化函数（移除复杂的语音选择逻辑）
function initSpeech() {
    // 不需要特殊的初始化，直接使用浏览器默认设置
}

// 页面加载完成初始化
window.addEventListener('load', function() {
    console.log('页面加载完成，开始初始化事件监听器');
    
    // 绑定主菜单卡片点击事件
    const moduleCards = document.querySelectorAll('.module-card');
    console.log('Found module cards:', moduleCards.length);
    
    moduleCards.forEach((card, index) => {
        console.log(`Binding card ${index}:`, card.dataset.gameType);
        card.addEventListener('click', function(e) {
            console.log('Card clicked:', this.dataset.gameType);
            e.preventDefault();
            const gameType = this.dataset.gameType;
            if (gameType) {
                console.log('Calling showGame with:', gameType);
                showGame(gameType);
                
                // 特殊处理识字认读游戏，自动开始
                if (gameType === 'recognition') {
                    // 隐藏下一个按钮，直到用户选择正确答案
                    const nextButton = document.querySelector('[data-action="nextRecognitionWord"]');
                    if (nextButton) {
                        nextButton.style.display = 'none';
                    }
                }
            } else {
                console.log('No gameType found for card');
            }
        });
    });

    // 绑定通用按钮点击事件 (data-action)
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            switch (action) {
                case 'backToMenu':
                    backToMenu();
                    break;
                case 'playInitialsGame':
                    playInitialsGame();
                    break;
                case 'playFinalsListenGame':
                    playFinalsListenGame();
                    break;
                case 'startToneGame':
                    startToneGame();
                    break;
                case 'tonePractice':
                    tonePractice();
                    break;
                case 'nextRecognitionWord':
                    nextRecognitionWord();
                    break;
                case 'toggleMusic':
                    toggleMusic();
                    break;
                case 'toggleSound':
                    toggleSound();
                    break;
                case 'showEncouragement':
                    showEncouragement();
                    break;
                case 'playWholeSyllablesListenGame':
                    playWholeSyllablesListenGame();
                    break;
                case 'playTonesListenGame':
                    playTonesListenGame();
                    break;
                case 'playClassificationGame':
                    playClassificationGame();
                    break;
                case 'startClassificationGame':
                    startClassificationGame();
                    break;
                case 'submitClassificationAnswer':
                    submitClassificationAnswer();
                    break;
                case 'nextClassificationQuestion':
                    nextClassificationQuestion();
                    break;
                default:
                    console.warn('未知动作:', action);
            }
        });
    });

    // 绑定声母/韵母/整体认读卡片点击事件
    document.querySelectorAll(
        '#initials-grid .pinyin-card, #finals-grid .pinyin-card, #wholeSyllables-grid .pinyin-card, [data-tone-name][data-tone-example]'
    ).forEach(card => {
        card.addEventListener('click', function() {
            // 声调卡片
            if (this.hasAttribute('data-tone-name') && this.hasAttribute('data-tone-example')) {
                const toneName = this.dataset.toneName;
                const toneExample = this.dataset.toneExample;
                playTone(toneName, toneExample);
                return;
            }
            // 声母/韵母/整体认读卡片
            const pinyin = this.textContent.trim();
            const index = parseInt(this.dataset.index);
            if (this.closest('#initials-grid')) {
                playInitialSound(pinyin, index);
            } else if (this.closest('#finals-grid')) {
                playFinalSound(pinyin, index);
            } else if (this.closest('#wholeSyllables-grid')) {
                playWholeSyllableSound(pinyin, index);
            }
        });
    });

    // 初始化分数显示
   // 初始化分数显示
   updateScoreDisplay();
   
   // 添加键盘支持
   document.addEventListener('keydown', function(event) {
       if (event.key === 'Escape' && gameState.currentGame) {
           backToMenu();
       }
   });
   
   // 添加触摸友好性
   document.querySelectorAll('.pinyin-card, .btn').forEach(element => {
       element.addEventListener('touchstart', function() {
           this.style.transform = 'scale(0.95)';
       });
               
       element.addEventListener('touchend', function() {
           this.style.transform = '';
       });
   });
});

// 自动保存进度
setInterval(() => {
   localStorage.setItem('pinyinGameProgress', JSON.stringify({
       score: gameState.score,
       learnedInitials: gameState.learnedInitials,
       learnedFinals: gameState.learnedFinals,
       level: gameState.level,
       // 将Set转换为数组进行保存
       learnedInitialsList: gameState.learnedInitialsSet ? Array.from(gameState.learnedInitialsSet) : [],
       learnedFinalsList: gameState.learnedFinalsSet ? Array.from(gameState.learnedFinalsSet) : [],
       learnedWholeSyllablesList: gameState.learnedWholeSyllablesSet ? Array.from(gameState.learnedWholeSyllablesSet) : []
   }));
}, 10000);

// 加载保存的进度
function loadProgress() {
   const saved = localStorage.getItem('pinyinGameProgress');
   if (saved) {
       try {
           const progress = JSON.parse(saved);
           gameState.score = progress.score || 0;
           gameState.learnedInitials = progress.learnedInitials || 0;
           gameState.learnedFinals = progress.learnedFinals || 0;
           gameState.level = progress.level || 1;
           
           // 恢复Set对象
           if (progress.learnedInitialsList) {
               gameState.learnedInitialsSet = new Set(progress.learnedInitialsList);
               gameState.learnedInitials = gameState.learnedInitialsSet.size;
           }
           if (progress.learnedFinalsList) {
               gameState.learnedFinalsSet = new Set(progress.learnedFinalsList);
               gameState.learnedFinals = gameState.learnedFinalsSet.size;
           }
           if (progress.learnedWholeSyllablesList) {
               gameState.learnedWholeSyllablesSet = new Set(progress.learnedWholeSyllablesList);
               gameState.learnedWholeSyllables = gameState.learnedWholeSyllablesSet.size;
           }
           
           updateScoreDisplay();
       } catch (e) {
           console.log('加载进度失败');
       }
   }
}

// 页面加载时恢复进度
loadProgress();

// 初始化简化版语音
initSpeech();

// 加载拼音音频数据
loadPinyinAudioData();

// 加载音调音频数据
loadYindiaoAudioData();

export function playFinalsListenGame() {
    // 隐藏当前游戏区域，显示韵母配对游戏
    document.getElementById('finals-game').classList.remove('active');
    
    // 创建或显示韵母配对游戏区域
    let finalsListenGameArea = document.getElementById('listen-finals-game');
    if (!finalsListenGameArea) {
        finalsListenGameArea = createFinalsListenGameUI();
        document.querySelector('.container').appendChild(finalsListenGameArea);
    }
    finalsListenGameArea.classList.add('active');
    
    // 绑定事件监听器
    setupFinalsListenGameListeners();
    
    // 重置游戏状态
    gameState.finalsListenGameState.currentListenFinal = null;
    gameState.finalsListenGameState.listenScore = 0;
}

// 设置韵母听一听游戏的事件监听器
function setupFinalsListenGameListeners() {
    const backBtn = document.getElementById('listen-finals-back-btn');
    const startBtn = document.getElementById('start-finals-listen-btn');
    const replayBtn = document.getElementById('replay-finals-sound-btn');

    if (backBtn) backBtn.onclick = backToFinalsGame;
    if (startBtn) startBtn.onclick = startFinalsListenGame;
    if (replayBtn) replayBtn.onclick = playCurrentFinalSound;
}

function backToFinalsGame() {
    const finalsListenGameArea = document.getElementById('listen-finals-game');
    if (finalsListenGameArea) {
        finalsListenGameArea.classList.remove('active');
    }
    document.getElementById('finals-game').classList.add('active');
}

function startFinalsListenGame() {
    document.getElementById('start-finals-listen-btn').style.display = 'none';
    document.getElementById('finals-listen-question').style.display = 'block';
    nextFinalsListenQuestion();
}

function nextFinalsListenQuestion() {
    const questionData = generateFinalsListenQuestion();
    gameState.finalsListenGameState.currentListenFinal = questionData.currentListenFinal;
    playCurrentFinalSound();
    displayFinalsListenOptions(questionData.options);
    document.getElementById('finals-listen-result').innerHTML = '';
}
window.nextFinalsListenQuestion = nextFinalsListenQuestion;

function displayFinalsListenOptions(options) {
    const optionsContainer = document.getElementById('finals-listen-options');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = option;
        card.onclick = () => checkFinalsListenAnswer(option);
        card.style.background = '';
        card.disabled = false;
        optionsContainer.appendChild(card);
    });
}

function playCurrentFinalSound() {
    const currentFinal = gameState.finalsListenGameState.currentListenFinal;
    if (currentFinal) {
        playFinalSound(currentFinal, getFinalIndex(currentFinal));
    }
}

function checkFinalsListenAnswer(selected) {
    const currentFinal = gameState.finalsListenGameState.currentListenFinal;
    const result = checkFinalAnswerResult(selected, currentFinal);

    updateScore(result.scoreChange);
    
    // 播放音效
    if (result.isCorrect) {
        playSound('rightanswer.mp3');
    } else {
        playSound('wronganswer.mp3');
    }

    const resultContainer = document.getElementById('finals-listen-result');
    if (result.isCorrect) {
        resultContainer.innerHTML = `
            <span style="color: #4ecdc4;">${result.message}</span>
            <button class="btn" onclick="nextFinalsListenQuestion()">下一题</button>
        `;
        document.querySelectorAll('#finals-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === currentFinal) {
                btn.style.background = '#4ecdc4';
            }
            btn.disabled = true;
        });
    } else {
        resultContainer.innerHTML = `
            <span style="color: #ff6b6b;">${result.message}</span>
        `;
        document.querySelectorAll('#finals-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#ff6b6b';
                btn.disabled = true;
            }
        });
    }
}

// 播放整体认读听一听游戏
export function playWholeSyllablesListenGame() {
    document.getElementById('wholeSyllables-game').classList.remove('active');
    let area = document.getElementById('listen-wholeSyllables-game');
    if (!area) {
        area = createWholeSyllablesListenGameUI();
        document.querySelector('.container').appendChild(area);
    }
    area.classList.add('active');
    setupWholeSyllablesListenGameListeners();
    gameState.wholeSyllablesListenGameState.currentListenWhole = null;
    gameState.wholeSyllablesListenGameState.listenScore = 0;
}
window.playWholeSyllablesListenGame = playWholeSyllablesListenGame;

















// 拼音归类游戏主控函数
export function playClassificationGame() {
    console.log("进入拼音归类游戏");
    // 显示拼音归类游戏区域
    let area = document.getElementById('classification-game');
    if (area) {
        area.classList.add('active');
        console.log("已显示拼音归类游戏区域");
    } else {
        console.error("无法找到拼音归类游戏区域");
    }
    
    // 初始化状态
    gameState.classificationGameState = {
        currentQuestion: null,
        selectedOptions: [],
        listenScore: 0
    };
    console.log("已初始化游戏状态");
    
    // 设置事件监听器
    setupClassificationGameListeners();
}

function setupClassificationGameListeners() {
    console.log("设置拼音归类游戏事件监听器");
    // 不需要手动绑定事件监听器，因为已在HTML中使用data-action属性
    // 页面加载时会自动绑定所有[data-action]元素的点击事件
    console.log("拼音归类游戏事件监听器设置完成（使用data-action属性）");
}

function backToMenuFromClassification() {
    const area = document.getElementById('classification-game');
    if (area) area.classList.remove('active');
    backToMenu();
}

function startClassificationGame() {
    console.log("开始拼音归类游戏");
    document.getElementById('start-classification-btn').style.display = 'none';
    document.getElementById('classification-question').style.display = 'block';
    document.getElementById('submit-classification-btn').style.display = 'inline-block';
    document.getElementById('next-classification-btn').style.display = 'none';
    nextClassificationQuestion();
}

function nextClassificationQuestion() {
    console.log("进入下一题");
    // 重置状态
    gameState.classificationGameState.selectedOptions = [];
    
    // 生成新题目
    const questionData = generateClassificationQuestion();
    gameState.classificationGameState.currentQuestion = questionData;
    console.log("生成的新题目:", questionData);
    
    // 显示题目说明
    const instructionElement = document.getElementById('classification-instruction');
    if (instructionElement) {
        instructionElement.textContent = `请选择所有的${questionData.type}`;
        console.log("已更新题目说明");
    } else {
        console.error("无法找到题目说明元素");
    }
    
    // 显示选项
    displayClassificationOptions(questionData.options);
    
    // 设置按钮状态：显示提交按钮，隐藏下一题按钮
    const submitBtn = document.getElementById('submit-classification-btn');
    const nextBtn = document.getElementById('next-classification-btn');
    
    if (submitBtn) {
        submitBtn.style.display = 'inline-block';
        console.log("已显示提交按钮");
    } else {
        console.error("无法找到提交按钮元素");
    }
    
    if (nextBtn) {
        nextBtn.style.display = 'none';
        console.log("已隐藏下一题按钮");
    } else {
        console.error("无法找到下一题按钮元素");
    }
    
    // 清空结果区域
    const resultElement = document.getElementById('classification-result');
    if (resultElement) {
        resultElement.innerHTML = '';
        console.log("已清空结果区域");
    } else {
        console.error("无法找到结果区域元素");
    }
    
    // 语音提示
    if (gameState.soundEnabled) {
        speak(`请选择所有的${questionData.type}`);
    }
}

function submitClassificationAnswer() {
    const question = gameState.classificationGameState.currentQuestion;
    const selectedOptions = gameState.classificationGameState.selectedOptions;
    
    if (selectedOptions.length === 0) {
        document.getElementById('classification-result').innerHTML = 
            '<span style="color: #ff6b6b;">请至少选择一个选项！</span>';
        playSound('wronganswer.mp3'); // 播放错误音效
        return;
    }
    
    const result = checkClassificationAnswer(selectedOptions, question.correctOptions);
    updateScore(result.scoreChange);
    
    // 播放音效
    if (result.isCorrect) {
        playSound('rightanswer.mp3'); // 播放正确音效
    } else {
        playSound('wronganswer.mp3'); // 播放错误音效
    }
    
    const resultContainer = document.getElementById('classification-result');
    resultContainer.innerHTML = `<span style="color: ${result.isCorrect ? '#4ecdc4' : '#ff6b6b'};">${result.message}</span>`;
    
    // 隐藏提交按钮
    document.getElementById('submit-classification-btn').style.display = 'none';
    
    // 显示下一题按钮
    document.getElementById('next-classification-btn').style.display = 'inline-block';
    
    // 标记正确和错误选项
    document.querySelectorAll('#classification-options .pinyin-card').forEach(card => {
        const option = card.textContent;
        if (question.correctOptions.includes(option)) {
            // 正确选项标记为绿色
            card.style.background = '#4ecdc4';
        } else if (selectedOptions.includes(option)) {
            // 错误选择标记为红色
            card.style.background = '#ff6b6b';
        }
        // 禁用所有选项
        card.onclick = null;
    });
}

// 显示选项
function displayClassificationOptions(options) {
    console.log("显示选项:", options);
    const optionsContainer = document.getElementById('classification-options');
    if (!optionsContainer) {
        console.error("无法找到选项容器元素");
        return;
    }
    
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = option;
        card.onclick = () => toggleClassificationOption(option, card);
        card.style.background = ''; // 重置背景色
        optionsContainer.appendChild(card);
    });
    
    console.log("已完成选项显示");
}

// 切换选项选择状态
function toggleClassificationOption(option, cardElement) {
    console.log("切换选项状态:", option);
    const selectedOptions = gameState.classificationGameState.selectedOptions;
    const index = selectedOptions.indexOf(option);
    
    if (index > -1) {
        // 如果已选中，则取消选择
        selectedOptions.splice(index, 1);
        cardElement.style.background = ''; // 重置背景色
        console.log("已取消选择:", option);
    } else {
        // 如果未选中，则添加选择
        selectedOptions.push(option);
        cardElement.style.background = '#4ecdc4'; // 设置选中背景色
        console.log("已选择:", option);
    }
    
    console.log("当前选中选项:", selectedOptions);
}

window.nextClassificationQuestion = nextClassificationQuestion;
window.backToMenuFromClassification = backToMenuFromClassification;
window.startClassificationGame = startClassificationGame;
window.submitClassificationAnswer = submitClassificationAnswer;



function setupWholeSyllablesListenGameListeners() {
    const backBtn = document.getElementById('listen-wholeSyllables-back-btn');
    const startBtn = document.getElementById('start-wholeSyllables-listen-btn');
    const replayBtn = document.getElementById('replay-wholeSyllables-sound-btn');
    if (backBtn) backBtn.onclick = backToWholeSyllablesGame;
    if (startBtn) startBtn.onclick = startWholeSyllablesListenGame;
    if (replayBtn) replayBtn.onclick = playCurrentWholeSyllableSound;
}

function backToWholeSyllablesGame() {
    const area = document.getElementById('listen-wholeSyllables-game');
    if (area) area.classList.remove('active');
    document.getElementById('wholeSyllables-game').classList.add('active');
}

function startWholeSyllablesListenGame() {
    document.getElementById('start-wholeSyllables-listen-btn').style.display = 'none';
    document.getElementById('wholeSyllables-listen-question').style.display = 'block';
    nextWholeSyllablesListenQuestion();
}

function nextWholeSyllablesListenQuestion() {
    const questionData = generateWholeSyllablesListenQuestion();
    gameState.wholeSyllablesListenGameState.currentListenWhole = questionData.currentListenWhole;
    playCurrentWholeSyllableSound();
    displayWholeSyllablesListenOptions(questionData.options);
    document.getElementById('wholeSyllables-listen-result').innerHTML = '';
}
window.nextWholeSyllablesListenQuestion = nextWholeSyllablesListenQuestion;

function displayWholeSyllablesListenOptions(options) {
    const optionsContainer = document.getElementById('wholeSyllables-listen-options');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = option;
        card.onclick = () => checkWholeSyllablesListenAnswer(option);
        card.style.background = '';
        card.disabled = false;
        optionsContainer.appendChild(card);
    });
}

function playCurrentWholeSyllableSound() {
    const currentWhole = gameState.wholeSyllablesListenGameState.currentListenWhole;
    if (currentWhole) {
        playWholeSyllableSound(currentWhole, getWholeSyllableIndex(currentWhole));
    }
}

function checkWholeSyllablesListenAnswer(selected) {
    const currentWhole = gameState.wholeSyllablesListenGameState.currentListenWhole;
    const result = checkWholeSyllableAnswerResult(selected, currentWhole);

    updateScore(result.scoreChange);
    
    // 播放音效
    if (result.isCorrect) {
        playSound('rightanswer.mp3');
    } else {
        playSound('wronganswer.mp3');
    }

    const resultContainer = document.getElementById('wholeSyllables-listen-result');
    if (result.isCorrect) {
        resultContainer.innerHTML = `
            <span style="color: #4ecdc4;">${result.message}</span>
            <button class="btn" onclick="nextWholeSyllablesListenQuestion()">下一题</button>
        `;
        document.querySelectorAll('#wholeSyllables-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === currentWhole) {
                btn.style.background = '#4ecdc4';
            }
            btn.disabled = true;
        });
    } else {
        resultContainer.innerHTML = `
            <span style="color: #ff6b6b;">${result.message}</span>
        `;
        document.querySelectorAll('#wholeSyllables-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#ff6b6b';
                btn.disabled = true;
            }
        });
    }
}

// 音调小屋听一听主控函数
export function playTonesListenGame() {
    // 隐藏当前游戏区域，显示音调听一听游戏
    document.getElementById('tones-game').classList.remove('active');
    // 创建或显示音调听一听游戏区域
    let tonesListenGameArea = document.getElementById('listen-tone-game');
    if (!tonesListenGameArea) {
        tonesListenGameArea = createTonesListenGameUI();
        document.querySelector('.container').appendChild(tonesListenGameArea);
    }
    tonesListenGameArea.classList.add('active');
    setupTonesListenGameListeners();
    // 初始化状态
    gameState.tonesListenGameState = {
        currentListenToneExample: null,
        currentCorrectTone: null,
        listenScore: 0
    };
}

function setupTonesListenGameListeners() {
    const backBtn = document.getElementById('listen-tone-back-btn');
    const startBtn = document.getElementById('start-tone-listen-btn');
    const replayBtn = document.getElementById('replay-tone-sound-btn');
    if (backBtn) backBtn.onclick = backToTonesGame;
    if (startBtn) startBtn.onclick = startTonesListenGame;
    if (replayBtn) replayBtn.onclick = playCurrentToneSound;
}

function backToTonesGame() {
    const area = document.getElementById('listen-tone-game');
    if (area) area.classList.remove('active');
    document.getElementById('tones-game').classList.add('active');
}

function startTonesListenGame() {
    document.getElementById('start-tone-listen-btn').style.display = 'none';
    document.getElementById('tone-listen-question').style.display = 'block';
    nextTonesListenQuestion();
}

function nextTonesListenQuestion() {
    // 添加淡出效果
    const questionArea = document.getElementById('tone-listen-question');
    questionArea.style.opacity = '0';
    
    setTimeout(() => {
        const questionData = generateToneListenQuestion();
        gameState.tonesListenGameState.currentListenToneExample = questionData.currentToneExample;
        
        // 从yindiao.json中获取正确答案
        const audioPath = yindiaoAudioData[questionData.currentToneExample];
        let correctTone = "";
        if (audioPath) {
            if (audioPath.endsWith("1.mp3")) correctTone = "ˉ";
            else if (audioPath.endsWith("2.mp3")) correctTone = "ˊ";
            else if (audioPath.endsWith("3.mp3")) correctTone = "ˇ";
            else if (audioPath.endsWith("4.mp3")) correctTone = "`";
        }
        
        gameState.tonesListenGameState.currentCorrectTone = correctTone;
        playCurrentToneSound();
        displayTonesListenOptions(questionData.options);
        document.getElementById('tone-listen-result').innerHTML = '';
        
        // 重置选项卡样式
        document.querySelectorAll('#tone-listen-options .pinyin-card').forEach(btn => {
            btn.style.background = '';
            btn.disabled = false;
        });
        
        // 淡入效果
        questionArea.style.opacity = '1';
        
        console.log("题目详情:", {
            example: questionData.currentToneExample,
            audioPath: audioPath,
            correctTone: correctTone
        });
    }, 300);
}
window.nextTonesListenQuestion = nextTonesListenQuestion;

function displayTonesListenOptions(options) {
    const optionsContainer = document.getElementById('tone-listen-options');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const card = document.createElement('button');
        card.className = 'pinyin-card';
        card.textContent = option;
        card.onclick = () => checkTonesListenAnswer(option);
        card.style.background = '';
        card.disabled = false;
        optionsContainer.appendChild(card);
    });
}

async function playCurrentToneSound() {
    const currentToneExample = gameState.tonesListenGameState.currentListenToneExample;
    if (currentToneExample) {
        // 播放 yindiao.json 中的音频（使用完整拼音作为键）
        const audioPath = await getYindiaoAudio(currentToneExample);
        if (audioPath) {
            playAudio(audioPath);
        } else {
            speak(currentToneExample);
        }
    }
}

function checkTonesListenAnswer(selected) {
    const correctTone = gameState.tonesListenGameState.currentCorrectTone;
    const result = checkToneAnswerResult(selected, correctTone);

    updateScore(result.scoreChange);
    
    // 播放音效
    if (result.isCorrect) {
        playSound('rightanswer.mp3');
    } else {
        playSound('wronganswer.mp3');
    }

    const resultContainer = document.getElementById('tone-listen-result');
    if (result.isCorrect) {
        resultContainer.innerHTML = `
            <span style="color: #4ecdc4;">${result.message}</span>
            <button class="btn" onclick="nextTonesListenQuestion()">下一题</button>
        `;
        // 标记正确答案并禁用所有选项
        document.querySelectorAll('#tone-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === correctTone) {
                btn.style.background = '#4ecdc4';
            }
            btn.disabled = true;
        });
    } else {
        resultContainer.innerHTML = `
            <span style="color: #ff6b6b;">${result.message}</span>
            <button class="btn" onclick="nextTonesListenQuestion()">下一题</button>
        `;
        // 禁用所有选项，防止用户继续点击
        document.querySelectorAll('#tone-listen-options .pinyin-card').forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#ff6b6b';
                btn.disabled = true;
            }
        });
        
        // 显示正确答案
        setTimeout(() => {
            document.querySelectorAll('#tone-listen-options .pinyin-card').forEach(btn => {
                if (btn.textContent === correctTone) {
                    btn.style.background = '#4ecdc4';
                }
            });
        }, 1000);
    }
}