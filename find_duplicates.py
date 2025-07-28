import json

def has_duplicates(options):
    """
    检查options列表中是否有重复项
    返回: (是否有重复项, 重复的项集合)
    """
    seen = set()
    duplicates = set()
    
    for option in options:
        if option in seen:
            duplicates.add(option)
        else:
            seen.add(option)
    
    return len(duplicates) > 0, duplicates

def process_data_for_duplicates(input_file, duplicates_file, clean_file):
    """
    处理数据，将有重复options的数据项分离出来
    """
    try:
        # 读取JSON文件
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        duplicates_data = []  # 存储有重复项的数据
        clean_data = []       # 存储无重复项的数据
        
        duplicate_count = 0
        
        # 遍历所有数据项
        for item in data:
            if 'options' in item and isinstance(item['options'], list):
                # 检查是否有重复项
                has_dup, duplicates = has_duplicates(item['options'])
                
                if has_dup:
                    # 有重复项，添加到duplicates_data
                    duplicates_data.append(item)
                    duplicate_count += 1
                    print(f"发现重复项: {item['image']} {item['pinyin']}")
                    print(f"  重复的选项: {duplicates}")
                    print(f"  所有选项: {item['options']}\n")
                else:
                    # 无重复项，添加到clean_data
                    clean_data.append(item)
            else:
                # 如果没有options字段或不是列表，视为无重复项
                clean_data.append(item)
        
        # 将有重复项的数据写入单独的文件
        with open(duplicates_file, 'w', encoding='utf-8') as f:
            json.dump(duplicates_data, f, ensure_ascii=False, indent=2)
        
        # 将无重复项的数据写入原文件
        with open(clean_file, 'w', encoding='utf-8') as f:
            json.dump(clean_data, f, ensure_ascii=False, indent=2)
        
        print(f"处理完成！")
        print(f"发现 {duplicate_count} 个有重复选项的数据项")
        print(f"有重复项的数据已保存到: {duplicates_file}")
        print(f"无重复项的数据已保存到: {clean_file}")
        
    except Exception as e:
        print(f"处理文件时出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    input_file = "extended-recognition-data-shuffled.json"
    duplicates_file = "duplicates.json"
    clean_file = "extended-recognition-data-shuffled.json"
    
    process_data_for_duplicates(input_file, duplicates_file, clean_file)
    
    print("\n脚本执行完成！")