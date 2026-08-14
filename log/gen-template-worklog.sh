#!/bin/bash

# 1. Tự động lấy tên cấu hình Git của bạn
AUTHOR_NAME=$(git config user.name | xargs)

# 2. Định nghĩa file đầu ra
OUTPUT_FILE="week_worklog_draft.md"

# 3. Tạo phần Front-Matter (Metadata ở đầu file)
cat <<EOT > $OUTPUT_FILE
---
title: "Project Worklog"
date: $(date +'%Y-%m-%d')
weight: 1
chapter: false
pre: " <b> 1.1. </b> "
---

### Project Objectives:
* [Ghi mục tiêu tổng quan của dự án tại đây]
* [Ví dụ: Hoàn thiện tính năng backend, viết tài liệu API hoặc test script...]

### Tasks to be implemented:
| Day      | Task | Start Date | End Date   | References |
| -------- | ---- | ---------- | ---------- | ---------- |
EOT

# 4. Lấy lịch sử commit (tất cả các nhánh) kèm title và body, nhóm theo ngày
git log --author="$AUTHOR_NAME" --all --reverse --date=format:"%d/%m/%Y_#_%a" --pretty=format:"%ad_#_%s_#_%b_#_END_COMMIT" | \
awk '
BEGIN { RS="_#_END_COMMIT\n?"; FS="_#_" }
{
    date=$1;
    sub(/^\n/, "", date);
    if (date == "") next;
    
    day_of_week=$2;
    commit_msg=$3;
    body=$4;
    
    # Nếu có Co-authored-by (tức là squash & merge PR của người khác), bỏ qua toàn bộ commit này
    if (body ~ /Co-authored-by:/) {
        next;
    }
    
    # Thay thế dấu xuống dòng trong body bằng <br>
    gsub(/\n/, " <br> ", body);
    # Gom các <br> liên tiếp thành 1 <br> duy nhất và xoá ở 2 đầu
    gsub(/( <br> )+/, " <br> ", body);
    gsub(/^ <br> /, "", body);
    gsub(/ <br> $/, "", body);
    
    # Nối title và body
    if (body != "" && body != " ") {
        commit_msg = commit_msg " <br> *Detail:* " body;
    }
    
    # Nếu là ngày mới, ghi nhận ngày cũ trước (nếu có dữ liệu cũ)
    if (current_date != "" && current_date != date) {
        printf "| %-8s | %-150s | %s | %s | |\n", current_day, tasks, current_date, current_date;
        tasks = "";
    }
    
    current_date = date;
    current_day = day_of_week;
    
    # Gom các commit của cùng một ngày lại, phân tách bằng thẻ <br>
    if (tasks == "") {
        tasks = "- " commit_msg;
    } else {
        tasks = tasks " <br><br>- " commit_msg;
    }
}
END {
    # In ra ngày cuối cùng trong danh sách commit
    if (current_date != "") {
        printf "| %-8s | %-150s | %s | %s | |\n", current_day, tasks, current_date, current_date;
    }
}' >> $OUTPUT_FILE

# 5. Ghi nốt phần kết của Template
cat <<EOT >> $OUTPUT_FILE

### Project Achievements:
* [Tổng hợp ngắn gọn các kết quả đạt được từ các task trên]
* [Ví dụ: Ổn định môi trường, hoàn thành X tính năng, viết được Y test case...]
EOT

echo "🎉 Đã khởi tạo bản nháp worklog thành công tại file: $OUTPUT_FILE"