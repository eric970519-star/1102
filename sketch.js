// ==========================================
// 台灣鳥類叫聲小偵探 - sketch.js
// ==========================================

// 1. 專案基本設定
const PROJECT = {
  title: "台灣鳥類叫聲小偵探",
  version: "1.0.0",
  goals: [
    { id: 1, name: "辨識常見台灣特有種與留鳥叫聲" },
    { id: 2, name: "分辨鳥鳴聲的節奏與高低音特徵" },
    { id: 3, name: "說出鳥類棲息環境與保護常識" }
  ]
};

// 2. 功能開關
const FEATURES = {
  soundAutoPlay: true, // 進入題目時自動播放聲音
  showTimer: true,     // 顯示作答計時
  allowRetryWrong: true // 啟用錯題再練
};

// 3. 視覺風格設定 (色彩、字型)
const STYLE = {
  bg: "#F4F7F2",         // 背景淺灰綠
  primary: "#2C5E3B",    // 主色：森林綠
  accent: "#D97706",     // 輔色：明亮黃/橘
  ok: "#1F7A4D",         // 答對綠
  bad: "#C8372D",        // 答錯紅
  cardBg: "#FFFFFF",     // 卡片底色
  text: "#222222"        // 文字顏色
};

// 4. 題目資料庫 (共 6 題，含動態繪製鳥類圖形與合成音效)
const QUESTIONS = [
  {
    id: "Q1",
    type: "sound",
    bird: "台灣藍鵲",
    goal: 1,
    q: "聽到這種短促、像「嘎-嘎-嘎」或笛音般嘹亮的叫聲，最可能是哪一種鳥？",
    options: ["台灣藍鵲", "普通麻雀", "白頭翁", "五色鳥"],
    answer: "台灣藍鵲",
    explain: "台灣藍鵲是台灣特有種，叫聲嘹亮且常成群結隊出現，伴隨長長的尾羽。"
  },
  {
    id: "Q2",
    type: "anim",
    bird: "五色鳥",
    goal: 2,
    q: "動畫中這隻俗稱「花和尚」的鳥，牠規律且單調的叫聲像什麼聲音？",
    options: ["敲木魚（咚、咚、咚）", "消防車警報", "腳踏車鈴", "手機鈴聲"],
    answer: "敲木魚（咚、咚、咚）",
    explain: "五色鳥的叫聲低沉而有節奏，聽起來非常像和尚在森林裡敲木魚。"
  },
  {
    id: "Q3",
    type: "sound",
    bird: "白頭翁",
    goal: 1,
    q: "都市公園常見、頭頂有一塊白斑的白頭翁，牠們最經典的叫聲聽起來像什麼？",
    options: ["「巧固球、巧固球」", "「啾-啾-啾」急促叫", "「咕-咕-咕」", "「嘎嘎」大叫"],
    answer: "「巧固球、巧固球」",
    explain: "白頭翁的叫聲聽起來很像在喊「巧固球」，是辨識牠們的重要特徵。"
  },
  {
    id: "Q4",
    type: "anim",
    bird: "夜鷺",
    goal: 3,
    q: "如果在水邊聽到低沉粗糙的「呱──」一聲，通常是哪種鳥飛過？",
    options: ["夜鷺（暗光鳥）", "小白鷺", "夜鷹", "翠鳥"],
    answer: "夜鷺（暗光鳥）",
    explain: "夜鷺俗稱暗光鳥，黃昏或夜間常在水邊活動，飛行時會發出低沉的呱呱聲。"
  },
  {
    id: "Q5",
    type: "sound",
    bird: "綠繡眼",
    goal: 2,
    q: "聲音聽起來細緻、婉轉且連綿不斷，像在枝頭輕聲呢喃的是誰？",
    options: ["綠繡眼（青笛仔）", "大卷尾", "斑鳩", "夜鷹"],
    answer: "綠繡眼（青笛仔）",
    explain: "綠繡眼體型嬌小，叫聲細而輕柔，常在樹冠層成群互相呼喚。"
  },
  {
    id: "Q6",
    type: "anim",
    bird: "大卷尾",
    goal: 3,
    q: "全身黑色、尾羽分岔像剪刀、飛行技術高超的是哪隻「護巢大將軍」？",
    options: ["大卷尾（烏秋）", "台灣藍鵲", "黑冠麻鷺", "八哥"],
    answer: "大卷尾（烏秋）",
    explain: "大卷尾又稱烏秋，個性勇敢，繁殖期時常會俯衝驅趕靠近巢穴的大型鳥類或人類。"
  }
];

// 遊戲狀態變數
let screen = "start"; // 畫面狀態: start, quiz, result
let queue = [];       // 目前要考的題目索引清單
let pos = 0;          // 目前在 queue 中的第幾題
let selectedOption = null; // 使用者選的選項
let isAnswered = false;    // 是否已作答
let records = [];     // 記錄作答結果 [{qi, correct, time}]
let startTime = 0;    // 每一題開始的時間
let totalStartTime = 0; // 總計時開始
let elapsedTime = 0;  // 總花費秒數

// Web Audio 相關變數
let audioCtx;
let isAudioInitialized = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  
  // 初始化題目佇列
  resetQueue();
}

function draw() {
  background(STYLE.bg);

  if (screen === "start") {
    drawStartScreen();
  } else if (screen === "quiz") {
    drawQuizScreen();
  } else if (screen === "result") {
    drawResultScreen();
  }
}

// 重設題目序列
function resetQueue() {
  queue = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    queue.push(i);
  }
}

// -----------------------------------------
// 1. 開始畫面 (F1)
// -----------------------------------------
function drawStartScreen() {
  push();
  // 標題與簡介
  fill(STYLE.primary);
  textSize(min(width * 0.05, 36));
  textStyle(BOLD);
  text(PROJECT.title, width / 2, height * 0.15);

  textSize(min(width * 0.022, 16));
  textStyle(NORMAL);
  fill(80);
  text("透過可愛的鳥類動畫與聲音合成，挑戰成為森林鳥類小達人！", width / 2, height * 0.22);

  // 顯示學習目標卡片
  let cardW = min(width * 0.8, 600);
  let cardH = height * 0.35;
  let cardX = (width - cardW) / 2;
  let cardY = height * 0.28;

  fill(STYLE.cardBg);
  noStroke();
  rect(cardX, cardY, cardW, cardH, 12);

  fill(STYLE.primary);
  textSize(18);
  textStyle(BOLD);
  text("🎯 學習目標", cardX + 30, cardY + 30);

  textStyle(NORMAL);
  textSize(15);
  textAlign(LEFT, CENTER);
  for (let i = 0; i < PROJECT.goals.length; i++) {
    let g = PROJECT.goals[i];
    fill(STYLE.accent);
    ellipse(cardX + 40, cardY + 75 + i * 45, 10, 10);
    fill(STYLE.text);
    text(g.name, cardX + 65, cardY + 75 + i * 45);
  }
  textAlign(CENTER, CENTER);

  // 開始按鈕
  let btnW = 220;
  let btnH = 55;
  let btnX = (width - btnW) / 2;
  let btnY = height * 0.72;

  if (isMouseOver(btnX, btnY, btnW, btnH)) {
    fill(34, 112, 60);
  } else {
    fill(STYLE.primary);
  }
  rect(btnX, btnY, btnW, btnH, 28);

  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("開始測驗", width / 2, btnY + btnH / 2);

  pop();
}

// -----------------------------------------
// 2. 作答畫面 (F2, F3, F4)
// -----------------------------------------
function drawQuizScreen() {
  let qIndex = queue[pos];
  let qData = QUESTIONS[qIndex];

  push();
  // 頂部資訊：題號與進度
  fill(STYLE.primary);
  textSize(18);
  textStyle(BOLD);
  text(`第 ${pos + 1} / ${queue.length} 題`, width / 2, 40);

  // 進度條
  let barW = min(width * 0.7, 500);
  let barH = 8;
  let barX = (width - barW) / 2;
  let barY = 70;
  fill(220);
  noStroke();
  rect(barX, barY, barW, barH, 4);
  fill(STYLE.primary);
  rect(barX, barY, barW * ((pos + 1) / queue.length), barH, 4);

  // 多媒體互動區 (上方卡片：放置小動畫或聲音提示)
  let mediaW = min(width * 0.7, 500);
  let mediaH = 130;
  let mediaX = (width - mediaW) / 2;
  let mediaY = 95;

  fill(STYLE.cardBg);
  rect(mediaX, mediaY, mediaW, mediaH, 10);

  // 繪製動態多媒體提示圖示
  drawMediaVisual(qData, mediaX, mediaY, mediaW, mediaH);

  // 題目文字
  let qY = 250;
  fill(STYLE.text);
  textSize(min(width * 0.03, 18));
  textStyle(BOLD);
  text(qData.q, width / 2, qY);

  // 選項按鈕區
  let optW = min(width * 0.7, 500);
  let optH = 45;
  let optGap = 12;
  let startY = 300;

  for (let i = 0; i < qData.options.length; i++) {
    let optY = startY + i * (optH + optGap);
    let optX = (width - optW) / 2;

    let isOver = isMouseOver(optX, optY, optW, optH);
    let isSelected = (selectedOption === qData.options[i]);

    // 按鈕背景顏色判定
    if (isAnswered) {
      if (qData.options[i] === qData.answer) {
        fill(STYLE.ok); // 正解顯示綠色
      } else if (isSelected) {
        fill(STYLE.bad); // 選錯顯示紅色
      } else {
        fill(235);
      }
    } else {
      if (isOver) {
        fill(220, 235, 225);
      } else {
        fill(255);
      }
      stroke(STYLE.primary);
      strokeWeight(1.5);
    }

    rect(optX, optY, optW, optH, 8);
    noStroke();

    // 選項文字
    if (isAnswered && (qData.options[i] === qData.answer || isSelected)) {
      fill(255);
    } else {
      fill(STYLE.text);
    }
    textSize(15);
    textStyle(NORMAL);
    text(qData.options[i], width / 2, optY + optH / 2);
  }

  // 若已作答，顯示解析與「下一題」按鈕
  if (isAnswered) {
    let feedbackY = startY + qData.options.length * (optH + optGap) + 10;
    fill(selectedOption === qData.answer ? 220 : 255, 240, 220);
    rect(optX, feedbackY, optW, 70, 8);

    fill(STYLE.text);
    textSize(13);
    textAlign(LEFT, TOP);
    text("💡 解析：" + qData.explain, optX + 15, feedbackY + 12, optW - 30, 55);
    textAlign(CENTER, CENTER);

    // 下一題按鈕
    let nextW = 140;
    let nextH = 40;
    let nextX = width / 2 - nextW / 2;
    let nextY = feedbackY + 80;

    fill(STYLE.primary);
    rect(nextX, nextY, nextW, nextH, 20);
    fill(255);
    textSize(15);
    textStyle(BOLD);
    text(pos < queue.length - 1 ? "下一題 ➔" : "查看成績 ➔", width / 2, nextY + nextH / 2);
  }

  pop();
}

// 繪製多媒體區的簡易動畫或圖示
function drawMediaVisual(qData, x, y, w, h) {
  push();
  fill(STYLE.primary);
  textSize(14);
  textStyle(BOLD);
  text(`🎵 【${qData.type === 'sound' ? '聲音辨識題' : '情境動畫題'}】點擊上方可重聽`, x + w / 2, y + 20);

  // 畫一隻可愛的小鳥圖示代表音訊或動畫
  let cx = x + w / 2;
  let cy = y + 75;
  
  // 簡單繪製跳動音符或鳥形裝飾
  fill(STYLE.accent);
  ellipse(cx - 30, cy, 25, 20); // 鳥身
  ellipse(cx - 20, cy - 10, 15, 15); // 鳥頭
  triangle(cx - 10, cy - 12, cx - 5, cy - 10, cx - 10, cy - 8); // 嘴巴
  
  // 繪製音波線條裝飾
  stroke(STYLE.primary);
  strokeWeight(2);
  noFill();
  arc(cx + 20, cy, 30, 30, -QUARTER_PI, QUARTER_PI);
  arc(cx + 28, cy, 45, 45, -QUARTER_PI, QUARTER_PI);
  pop();
}

// -----------------------------------------
// 3. 成績畫面 (F5, F6, F8)
// -----------------------------------------
function drawResultScreen() {
  push();
  fill(STYLE.primary);
  textSize(28);
  textStyle(BOLD);
  text("🎉 測驗完成！", width / 2, height * 0.12);

  // 計算成績
  let totalQ = queue.length;
  let correctCount = records.filter(r => r.correct).length;
  let score = Math.round((correctCount / totalQ) * 100);

  textSize(22);
  fill(STYLE.accent);
  text(`總得分：${score} 分 (答對 ${correctCount} / ${totalQ} 題)`, width / 2, height * 0.20);

  // 學習目標達成率長條圖 (F8)
  let boxW = min(width * 0.8, 500);
  let boxH = 160;
  let boxX = (width - boxW) / 2;
  let boxY = height * 0.26;

  fill(STYLE.cardBg);
  noStroke();
  rect(boxX, boxY, boxW, boxH, 12);

  fill(STYLE.primary);
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("📊 學習目標達成情形", boxX + 20, boxY + 15);

  let goalStartY = boxY + 50;
  for (let i = 0; i < PROJECT.goals.length; i++) {
    let g = PROJECT.goals[i];
    let targetRecords = records.filter(r => QUESTIONS[r.qi].goal === g.id);
    let targetCorrect = targetRecords.filter(r => r.correct).length;
    let ratio = targetRecords.length > 0 ? targetCorrect / targetRecords.length : 0;

    fill(STYLE.text);
    textSize(13);
    text(g.name, boxX + 20, goalStartY + i * 35);

    // 長條圖外框
    let barW = 180;
    let barH = 12;
    let barX = boxX + boxW - barW - 20;
    let barY = goalStartY + i * 35 + 2;

    fill(220);
    rect(barX, barY, barW, barH, 6);

    // 長條圖填色 (依比例變色)
    fill(ratio >= 0.8 ? STYLE.ok : ratio >= 0.5 ? STYLE.accent : STYLE.bad);
    rect(barX, barY, barW * ratio, barH, 6);
  }
  textAlign(CENTER, CENTER);

  // 按鈕區 (錯題再練、重新挑戰、回到首頁)
  let btnW = min(width * 0.7, 400);
  let btnH = 45;
  let btnX = (width - btnW) / 2;
  let startBtnY = height * 0.58;

  let wrongRecords = records.filter(r => !r.correct);

  // 錯題再練按鈕 (F6)
  if (wrongRecords.length > 0 && FEATURES.allowRetryWrong) {
    if (isMouseOver(btnX, startBtnY, btnW, btnH)) fill(210, 140, 20);
    else fill(STYLE.accent);
    rect(btnX, startBtnY, btnW, btnH, 22);
    fill(255);
    textSize(16);
    textStyle(BOLD);
    text(`🔄 錯題再練（${wrongRecords.length} 題）`, width / 2, startBtnY + btnH / 2);
    startBtnY += 60;
  }

  // 從頭再玩
  if (isMouseOver(btnX, startBtnY, btnW, btnH)) fill(34, 112, 60);
  else fill(STYLE.primary);
  rect(btnX, startBtnY, btnW, btnH, 22);
  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("🏠 從頭再玩一次", width / 2, startBtnY + btnH / 2);

  pop();
}

// -----------------------------------------
// 滑鼠點擊互動事件
// -----------------------------------------
function mousePressed() {
  // 確保 Web Audio 啟動
  if (!isAudioInitialized) {
    userStartAudio();
    initAudioContext();
    isAudioInitialized = true;
  }

  if (screen === "start") {
    let btnW = 220;
    let btnH = 55;
    let btnX = (width - btnW) / 2;
    let btnY = height * 0.72;
    if (isMouseOver(btnX, btnY, btnW, btnH)) {
      resetQueue();
      startNewRound(queue);
    }
  } 
  else if (screen === "quiz") {
    let qIndex = queue[pos];
    let qData = QUESTIONS[qIndex];

    let optW = min(width * 0.7, 500);
    let optH = 45;
    let optGap = 12;
    let startY = 300;

    // 點擊上方多媒體區可重新播放聲音
    let mediaW = min(width * 0.7, 500);
    let mediaH = 130;
    let mediaX = (width - mediaW) / 2;
    let mediaY = 95;
    if (mouseX >= mediaX && mouseX <= mediaX + mediaW && mouseY >= mediaY && mouseY <= mediaY + mediaH) {
      playBirdSound(qData.bird);
      return;
    }

    if (!isAnswered) {
      // 檢查是否點到選項
      for (let i = 0; i < qData.options.length; i++) {
        let optY = startY + i * (optH + optGap);
        let optX = (width - optW) / 2;
        if (isMouseOver(optX, optY, optW, optH)) {
          selectedOption = qData.options[i];
          isAnswered = true;
          let correct = (selectedOption === qData.answer);
          let timeSpent = (millis() - startTime) / 1000;

          // 紀錄作答
          records.push({ qi: qIndex, correct: correct, time: timeSpent });

          // 播放對應音效
          playFeedbackSound(correct);
          break;
        }
      }
    } else {
      // 已經作答後，點擊「下一題」按鈕
      let feedbackY = startY + qData.options.length * (optH + optGap) + 10;
      let nextW = 140;
      let nextH = 40;
      let nextX = width / 2 - nextW / 2;
      let nextY = feedbackY + 80;

      if (isMouseOver(nextX, nextY, nextW, nextH)) {
        if (pos < queue.length - 1) {
          pos++;
          selectedOption = null;
          isAnswered = false;
          startTime = millis();
          if (FEATURES.soundAutoPlay) {
            playBirdSound(QUESTIONS[queue[pos]].bird);
          }
        } else {
          screen = "result";
          elapsedTime = (millis() - totalStartTime) / 1000;
          
          // 在 Console 輸出詳細測試紀錄
          console.log("=== 測驗結果紀錄 ===");
          console.table(records);
        }
      }
    }
  } 
  else if (screen === "result") {
    let btnW = min(width * 0.7, 400);
    let btnH = 45;
    let btnX = (width - btnW) / 2;
    let startBtnY = height * 0.58;

    let wrongRecords = records.filter(r => !r.correct);

    // 點擊「錯題再練」
    if (wrongRecords.length > 0 && FEATURES.allowRetryWrong) {
      if (isMouseOver(btnX, startBtnY, btnW, btnH)) {
        let wrongIndices = wrongRecords.map(r => r.qi);
        startNewRound(wrongIndices);
        return;
      }
      startBtnY += 60;
    }

    // 點擊「從頭再玩」
    if (isMouseOver(btnX, startBtnY, btnW, btnH)) {
      resetQueue();
      startNewRound(queue);
    }
  }
}

function startNewRound(newQueue) {
  queue = newQueue;
  pos = 0;
  records = [];
  selectedOption = null;
  isAnswered = false;
  screen = "quiz";
  startTime = millis();
  totalStartTime = millis();

  if (FEATURES.soundAutoPlay) {
    playBirdSound(QUESTIONS[queue[0]].bird);
  }
}

// 輔助函式：判斷滑鼠是否在按鈕範圍內
function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// -----------------------------------------
// Web Audio 聲音合成與音效
// -----------------------------------------
function initAudioContext() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playBirdSound(birdName) {
  if (!audioCtx) return;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  let now = audioCtx.currentTime;

  if (birdName === "台灣藍鵲") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (birdName === "五色鳥") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(350, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else {
    // 預設鳥鳴聲
    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.setValueAtTime(1400, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

function playFeedbackSound(correct) {
  if (!audioCtx) return;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  let now = audioCtx.currentTime;

  if (correct) {
    // 答對：清脆的兩聲高音
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else {
    // 答錯：低沉短促聲
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}
