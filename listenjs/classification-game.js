import { initials, finals, wholeSyllables } from '../pinyin-data.js';
import { shuffleArray } from '../main.js';

// 定义拼音类型
const PINYIN_TYPES = {
    INITIAL: '声母',
    FINAL: '韵母',
    WHOLE_SYLLABLE: '整体认读'
};

// 已在index.html中定义UI结构，无需在此创建

/**
 * 生成拼音归类题目
 */
export function generateClassificationQuestion() {
    // 随机选择一种拼音类型
    const types = [PINYIN_TYPES.INITIAL, PINYIN_TYPES.FINAL, PINYIN_TYPES.WHOLE_SYLLABLE];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    // 根据类型选择对应的拼音数组
    let sourceArray;
    switch(selectedType) {
        case PINYIN_TYPES.INITIAL:
            sourceArray = initials;
            break;
        case PINYIN_TYPES.FINAL:
            sourceArray = finals;
            break;
        case PINYIN_TYPES.WHOLE_SYLLABLE:
            sourceArray = wholeSyllables;
            break;
    }
    
    // 从对应类型的拼音中随机选择2-4个作为正确答案
    const correctCount = Math.min(2 + Math.floor(Math.random() * 3), sourceArray.length); // 2-4个
    const correctOptions = [];
    const sourceCopy = [...sourceArray];
    
    for (let i = 0; i < correctCount; i++) {
        const randomIndex = Math.floor(Math.random() * sourceCopy.length);
        correctOptions.push(sourceCopy.splice(randomIndex, 1)[0]);
    }
    
    // 从其他类型中选择干扰项，总共7个选项
    const allOptions = [...correctOptions];
    const otherTypes = types.filter(type => type !== selectedType);
    
    // 收集干扰项
    const distractors = [];
    otherTypes.forEach(type => {
        let array;
        switch(type) {
            case PINYIN_TYPES.INITIAL:
                array = initials;
                break;
            case PINYIN_TYPES.FINAL:
                array = finals;
                break;
            case PINYIN_TYPES.WHOLE_SYLLABLE:
                array = wholeSyllables;
                break;
        }
        distractors.push(...array);
    });
    
    // 随机选择干扰项，使总选项数为7
    const distractorCount = 7 - correctOptions.length;
    const shuffledDistractors = shuffleArray(distractors);
    for (let i = 0; i < distractorCount && shuffledDistractors.length > 0; i++) {
        allOptions.push(shuffledDistractors.pop());
    }
    
    // 打乱所有选项
    const shuffledOptions = shuffleArray(allOptions);
    
    return {
        type: selectedType,
        correctOptions,
        options: shuffledOptions
    };
}

/**
 * 检查答案
 */
export function checkClassificationAnswer(selectedOptions, correctOptions) {
    // 检查是否所有正确选项都被选中，且没有选择错误选项
    const allCorrectSelected = correctOptions.every(option => selectedOptions.includes(option));
    const noIncorrectSelected = selectedOptions.every(option => correctOptions.includes(option));
    
    const isCorrect = allCorrectSelected && noIncorrectSelected;
    
    if (isCorrect) {
        return {
            isCorrect: true,
            scoreChange: correctOptions.length * 10,
            message: `✅ 恭喜你！全部选择正确！`
        };
    } else {
        // 计算得分：正确选择的加分，错误选择的扣分
        let scoreChange = 0;
        const correctSelected = selectedOptions.filter(option => correctOptions.includes(option)).length;
        const incorrectSelected = selectedOptions.filter(option => !correctOptions.includes(option)).length;
        
        scoreChange = correctSelected * 5 - incorrectSelected * 5;
        
        return {
            isCorrect: false,
            scoreChange: scoreChange,
            message: `❌ 选择有误，请再仔细看看！`
        };
    }
}