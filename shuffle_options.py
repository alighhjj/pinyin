import json
import random
import re

def extract_and_convert_data(js_content):
    """
    从JS文件中提取数据并转换为Python对象
    """
    # 提取数组部分
    start_index = js_content.find('[')
    end_index = js_content.rfind(']') + 1
    array_content = js_content[start_index:end_index]
    
    # 使用正则表达式替换字段名和字符串值
    # 处理字段名 (image, pinyin, options)
    array_content = re.sub(r'\bimage:', '"image":', array_content)
    array_content = re.sub(r'\bpinyin:', '"pinyin":', array_content)
    array_content = re.sub(r'\boptions:', '"options":', array_content)
    
    # 处理单引号包围的字符串
    array_content = re.sub(r"'([^']*)'", r'"\1"', array_content)
    
    # 处理emoji和其他特殊字符
    # 确保emoji等特殊字符被正确处理
    
    return array_content

def shuffle_options(data):
    """
    随机打乱每个条目中的options选项顺序
    """
    for item in data:
        if 'options' in item and isinstance(item['options'], list):
            random.shuffle(item['options'])
    return data

def process_extended_recognition_data(input_file, output_file):
    """
    处理extended-recognition-data.js文件，随机打乱options选项顺序
    """
    try:
        # 读取JS文件
        with open(input_file, 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        # 转换为有效的JSON格式
        json_string = extract_and_convert_data(js_content)
        
        # 解析JSON
        data = json.loads(json_string)
        
        # 随机打乱options
        shuffled_data = shuffle_options(data)
        
        # 写入处理后的数据到新文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(shuffled_data, f, ensure_ascii=False, indent=2)
        
        print(f"处理完成！已将options选项顺序随机打乱并保存到 {output_file}")
        print(f"共处理了 {len(shuffled_data)} 个条目")
        
        # 显示前几个条目的示例
        print("\n前3个条目的options顺序示例:")
        for i in range(min(3, len(shuffled_data))):
            print(f"{i+1}. {shuffled_data[i]['options']}")
        
    except Exception as e:
        print(f"处理文件时出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # 处理extended-recognition-data.js文件
    input_file = "extended-recognition-data.js"
    output_file = "extended-recognition-data-shuffled.json"
    process_extended_recognition_data(input_file, output_file)
    
    print("\n脚本执行完成！")