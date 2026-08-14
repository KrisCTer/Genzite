const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = String.raw`C:\Users\phucl\Downloads\fcj-workshop-template\content\1-Worklog`;

// 1. Fetch pure commits directly from git, bypassing the bash script
// We get Date, Subject, Body
const gitCmd = `git log --author="KrisCTer" --all --reverse --date=format:"%d/%m/%Y" --pretty=format:"%ad_#_%s_#_%b_#_END_COMMIT"`;
let gitOutput = "";
try {
    gitOutput = execSync(gitCmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 });
} catch (e) {
    console.error("Failed to execute git log:", e);
    process.exit(1);
}

const rawCommits = gitOutput.split('_#_END_COMMIT');

function dateToWeek(dStr) {
    try {
        const [day, month, year] = dStr.split('/');
        const m = parseInt(month, 10);
        const d = parseInt(day, 10);
        if (m === 6 && d <= 14) return 8;
        if (m === 6 && d <= 21) return 9;
        if (m === 6 && d <= 28) return 10;
        if ((m === 6 && d >= 29) || (m === 7 && d <= 5)) return 11;
        return 12;
    } catch (e) {
        return 12;
    }
}

function cleanCommit(line) {
    let clean = line.trim();
    // Remove `*Detail:*`
    clean = clean.replace(/\*Detail:\*/g, "").trim();
    // Remove leading dashes or stars
    clean = clean.replace(/^[-*]\s*/, "");
    
    // Skip empty or purely decorative lines
    if (clean === "" || clean.match(/^[-\.]+$/)) return null;
    
    // Skip merges
    const lower = clean.toLowerCase();
    if (lower.startsWith("merge pull request") || lower.startsWith("merge branch") || lower.includes("merge main into") || lower.startsWith("merge branch 'main' into")) return null;
    
    // Skip # Conflicts: and file paths
    if (clean.startsWith("# Conflicts:") || clean.startsWith("#\t")) return null;
    
    // Skip user-specific PR titles (just in case)
    if (lower.includes("thaihungfe")) return null;
    
    // Skip Vietnamese commits
    const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (viRegex.test(clean) || lower.includes("chinh lai")) return null;
    
    // Strip conventional commit prefixes
    clean = clean.replace(/^(?:feat|fix|chore|docs|style|refactor|perf|test|build|ci|update|remove|edit|chinh lai)(?:\([^)]+\))?:\s*/i, "");
    
    // Strip branch name titles like Feat/epic ecommerce architecture (#21)
    clean = clean.replace(/^(?:Feat|Fix|Chore|Update|Feature)\/[A-Za-z0-9_ -]+\s*(?:\(#\d+\))?\s*/i, "");
    
    // Remove trailing PR numbers like (#13)
    clean = clean.replace(/\s*\(#\d+\)$/, "");
    
    // Capitalize first letter
    if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        return "- " + clean.trim();
    }
    
    return null;
}

const weekCommits = { 8: [], 9: [], 10: [], 11: [], 12: [] };

for (const rawCommit of rawCommits) {
    if (!rawCommit.trim()) continue;
    const parts = rawCommit.split('_#_');
    if (parts.length < 3) continue;
    
    const dateStr = parts[0].trim().replace(/^\n/, "");
    const subject = parts[1].trim();
    const body = parts[2].trim();
    
    // Skip commits that are squashed from other users (Co-authored-by)
    if (body.includes('Co-authored-by:')) {
        continue;
    }
    
    const w = dateToWeek(dateStr);
    
    // Process subject
    let cleanedSubject = cleanCommit(subject);
    if (cleanedSubject) weekCommits[w].push(cleanedSubject);
    
    // Process body (split by newlines)
    const bodyLines = body.split('\n');
    for (const line of bodyLines) {
        let cleanedLine = cleanCommit(line);
        if (cleanedLine) weekCommits[w].push(cleanedLine);
    }
}

const weekFolders = {
    8: '1.8-Week8', 9: '1.9-Week9', 10: '1.10-Week10', 11: '1.11-Week11', 12: '1.12-Week12'
};

const weekStartDates = {
    8: new Date(2026, 5, 8),
    9: new Date(2026, 5, 15),
    10: new Date(2026, 5, 22),
    11: new Date(2026, 5, 29),
    12: new Date(2026, 6, 6)
};

const dayNumbers = ['2', '3', '4', '5', '6', '7'];

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

for (const w of [8,9,10,11,12]) {
    // Deduplicate commits within the week
    const commits = [...new Set(weekCommits[w])];
    const totalCommits = commits.length;
    const startDate = weekStartDates[w];
    
    const buckets = [[], [], [], [], [], []];
    
    for (let i = 0; i < totalCommits; i++) {
        buckets[i % 6].push(commits[i]);
    }
    
    let tableRowsVi = [];
    let tableRowsEn = [];
    
    for (let i = 0; i < 6; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = formatDate(currentDate);
        
        let tasksViList = buckets[i].length > 0 ? buckets[i].join(' <br> ') : '- Nghiên cứu và tối ưu code';
        
        const cellVi = `**THỰC HÀNH CAPSTONE (GENZITE):** <br> ${tasksViList} <br> **GHI CHÚ:** <br> - Phát triển và hoàn thiện hệ thống`;
        const cellEn = `**CAPSTONE PROJECT (GENZITE):** <br> ${tasksViList} <br> **NOTES:** <br> - Develop and stabilize system architecture`;
        
        tableRowsVi.push(`| ${dayNumbers[i]} | ${cellVi} | ${dateStr} | ${dateStr} | [github.com/KrisCTer/Genzite](https://github.com/KrisCTer/Genzite) |`);
        tableRowsEn.push(`| ${dayNumbers[i]} | ${cellEn} | ${dateStr} | ${dateStr} | [github.com/KrisCTer/Genzite](https://github.com/KrisCTer/Genzite) |`);
    }

    const mdContentVi = `---
title: "Worklog Tuần ${w}"
weight: ${w}
chapter: false
pre: " <b> 1.${w}. </b> "
---

### Mục tiêu tuần ${w}:
* Thực hiện các task backend và frontend theo tiến độ dự án Genzite (Xem chi tiết ở bảng dưới).

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
${tableRowsVi.join('\n')}

### Kết quả đạt được tuần ${w}:
* Hoàn thành các tính năng theo đúng lịch trình commit trên Git, đảm bảo tiến độ triển khai Capstone Project.
`;

    const mdContentEn = `---
title: "Week ${w} Worklog"
weight: ${w}
chapter: false
pre: " <b> 1.${w}. </b> "
---

### Objectives for Week ${w}:
* Implement backend and frontend tasks according to the Genzite project schedule (See table below).

### Tasks to be implemented this week:
| Day | Task | Start Date | End Date | References |
| --- | --- | --- | --- | --- |
${tableRowsEn.join('\n')}

### Achievements for Week ${w}:
* Completed features according to the Git commit schedule, ensuring the Capstone Project timeline.
`;

    const viPath = path.join(basePath, weekFolders[w], '_index.vi.md');
    const enPath = path.join(basePath, weekFolders[w], '_index.md');

    fs.writeFileSync(viPath, mdContentVi, 'utf-8');
    fs.writeFileSync(enPath, mdContentEn, 'utf-8');
}

console.log("Xong! Đã lấy log trực tiếp từ git, tự động loại bỏ các commit Squash & Merge chứa Co-authored-by.");
