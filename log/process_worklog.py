import os
from datetime import datetime

input_file = r'c:\Users\phucl\Downloads\Genzite\log\week_worklog_draft.md'
base_path = r'C:\Users\phucl\Downloads\fcj-workshop-template\content\1-Worklog'

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

table_lines = [line for line in lines if line.startswith('| ') and not line.startswith('| Day') and not line.startswith('| ---')]

def get_date(line):
    parts = [p.strip() for p in line.split('|')]
    if len(parts) > 3:
        return parts[3]
    return ""

def date_to_week(d_str):
    try:
        dt = datetime.strptime(d_str, "%d/%m/%Y")
        if dt.month == 6 and dt.day <= 14: return 8
        if dt.month == 6 and dt.day <= 21: return 9
        if dt.month == 6 and dt.day <= 28: return 10
        if (dt.month == 6 and dt.day >= 29) or (dt.month == 7 and dt.day <= 5): return 11
        return 12
    except:
        return 12

weeks = {8: [], 9: [], 10: [], 11: [], 12: []}
for line in table_lines:
    d = get_date(line)
    w = date_to_week(d)
    weeks[w].append(line)

week_folders = {
    8: '1.8-Week8', 9: '1.9-Week9', 10: '1.10-Week10', 11: '1.11-Week11', 12: '1.12-Week12'
}

for w, w_lines in weeks.items():
    md_content = f"""---
title: "Worklog Tuần {w}"
weight: {w}
chapter: false
pre: " <b> 1.{w}. </b> "
---

### Mục tiêu tuần {w}:
* Thực hiện các task backend và frontend theo tiến độ dự án Genzite (Xem chi tiết ở bảng dưới).

### Các công việc triển khai:
| Day | Task | Start Date | End Date | References |
| --- | --- | --- | --- | --- |
{''.join(w_lines)}
### Kết quả đạt được:
* Hoàn thành các tính năng theo đúng lịch trình commit trên Git.
"""
    
    vi_path = os.path.join(base_path, week_folders[w], '_index.vi.md')
    en_path = os.path.join(base_path, week_folders[w], '_index.md')
    
    with open(vi_path, 'w', encoding='utf-8') as out_f:
        out_f.write(md_content)
    
    md_content_en = md_content.replace(f"Tuần {w}", f"Week {w}") \
        .replace("Mục tiêu tuần", "Objectives for Week") \
        .replace("Các công việc triển khai", "Tasks implemented") \
        .replace("Kết quả đạt được", "Achievements") \
        .replace("Thực hiện các task backend và frontend theo tiến độ dự án Genzite (Xem chi tiết ở bảng dưới).", "Implement backend and frontend tasks according to the Genzite project schedule (See table below).") \
        .replace("Hoàn thành các tính năng theo đúng lịch trình commit trên Git.", "Completed features according to the Git commit schedule.")
    
    with open(en_path, 'w', encoding='utf-8') as out_f:
        out_f.write(md_content_en)

print("Xong! Đã phân chia toàn bộ log thật vào Tuần 8 - 12.")
