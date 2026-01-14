// ==================== 全局變數 ====================
let currentPage = 1;
const totalPages = 3;

// 練習題答案
const answers = {
    5: "What do giant pandas eat?",
    6: "Where",
    7: "how",
    8: "have",
    9: "How long are sharks?",
    10: "About 100 grams"
};

// 活動練習變數
let selectedQuestion = null;
let selectedAnswer = null;
const matchingAnswers = {
    "1": "B",
    "2": "D",
    "3": "C",
    "4": "E",
    "5": "A"
};

const grammarAnswers = {
    "blank1": "have",
    "blank2": "have",
    "blank3": "has",
    "blank4": "has",
    "blank5": "has"
};

const diaryAnswers = {
    "q1": "b",
    "q2": "b",
    "q3": "b",
    "q4": "a",
    "q5": "a"
};

const classificationAnswers = {
    "land": ["polar bear", "giraffe", "lion", "zebra"],
    "sea": ["shark", "sea turtle", "seal", "jelly fish"]
};

// 測驗題正確答案 (修正後)
const quizAnswers = {
    "1": "b",  // 詞彙選擇題1
    "2": "c",  // 詞彙選擇題2
    "match1": "b",  // 匹配題1
    "match2": "a",  // 匹配題2
    "quizBlank1": "has",  // 填空題1
    "quizBlank2": "have",  // 填空題2
    "reading1": "b",  // 閱讀理解1
    "reading2": "a"   // 閱讀理解2
};

// 學習進度管理
let completedPractice = 0;
const totalPracticeQuestions = 10;
let correctAnswers = 0;
let practiceScores = {}; // 儲存每題得分

// 學習數據存儲
const STORAGE_KEY = 'unit6_animal_world_progress';
const SUMMARY_SHOWN_KEY = 'unit6_summary_shown';

// ==================== 音頻管理系統 ====================
let currentAudio = null; // 當前正在播放的音頻對象
let currentAudioButton = null; // 當前正在播放的音頻按鈕

// ==================== 初始化功能 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 載入保存的學習進度
    loadProgress();
    
    // 初始化分頁
    showPage(1);
    
    // 分頁按鈕事件
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) showPage(currentPage - 1);
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) showPage(currentPage + 1);
    });
    
    // 分頁切換功能
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // 更新分頁狀態
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // 如果切換到測驗分頁，重置測驗狀態
            if(targetTab === 'quiz') {
                resetQuiz();
            }
            
            // 保存當前分頁
            saveProgress();
            
            // 停止當前音頻
            stopCurrentAudio();
        });
    });
    
    // 詞彙卡翻轉功能
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
            // 翻轉卡片時停止音頻
            stopCurrentAudio();
        });
    });
    
    // 選擇題功能
    const options = document.querySelectorAll('.option[data-answer], .option[data-question], .option[data-quiz], .option[data-match], .option[data-reading]');
    options.forEach(option => {
        option.addEventListener('click', function() {
            handleOptionClick(this);
        });
        
        // 鍵盤導航支持
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOptionClick(this);
            }
        });
    });
    
    // 提交測驗
    document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    
    // 重置測驗按鈕
    document.getElementById('resetTest').addEventListener('click', resetQuiz);
    
    // 音頻按鈕功能
    initializeAudioButtons();
    
    // 拖拽功能初始化
    initializeDragAndDrop();
    
    // 例句展開/收起功能
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleExampleContent(this);
        });
    });
    
    // 翻譯按鈕功能
    document.querySelectorAll('.translate-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const translationId = this.getAttribute('data-translation');
            toggleTranslation(translationId);
        });
    });
    
    // 更新進度顯示
    updateProgressDisplay();
    
    // ==================== 音頻全局監聽 ====================
    
    // 全局監聽：點擊頁面其他區域停止音頻
    document.addEventListener('click', function(e) {
        // 如果點擊的不是音頻按鈕且當前有音頻在播放，則停止音頻
        if (!e.target.closest('.audio-btn, .audio-paragraph-btn, .audio-example-btn') && currentAudio) {
            stopCurrentAudio();
        }
    });
    
    // 頁面卸載時停止所有音頻
    window.addEventListener('beforeunload', function() {
        stopCurrentAudio();
    });
    
}); // DOMContentLoaded 結束

// ==================== 音頻管理系統 ====================
function initializeAudioButtons() {
    // 詞彙音頻按鈕
    const audioButtons = document.querySelectorAll('.audio-btn');
    audioButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const audioType = this.getAttribute('data-audio');
            playAudio(audioType, this);
        });
    });
    
    // 段落音頻按鈕
    const paragraphAudioButtons = document.querySelectorAll('.audio-paragraph-btn');
    paragraphAudioButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const audioFile = this.getAttribute('data-audio');
            playAudio(audioFile, this);
        });
    });
    
    // 例句音頻
    document.querySelectorAll('.audio-example-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const audioFile = this.getAttribute('data-audio');
            const audioUrl = `./audio/${audioFile}.mp3`;
            playAudioUrl(audioUrl, this);
        });
    });
}

// 停止當前音頻
function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        
        // 恢復之前按鈕的狀態
        if (currentAudioButton) {
            currentAudioButton.classList.remove('playing');
            currentAudioButton.classList.remove('loading');
            // 恢復圖標
            const icon = currentAudioButton.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-volume-up';
            }
        }
        
        currentAudio = null;
        currentAudioButton = null;
    }
}

// 播放音頻
function playAudio(audioType, button) {
    const audioFile = audioType.replace(/ /g, '_');
    const audioUrl = `./audio/${audioFile}.mp3`;
    playAudioUrl(audioUrl, button);
}

// 播放音頻URL
function playAudioUrl(audioUrl, button) {
    // 如果點擊的是當前正在播放的音頻，則停止播放
    if (currentAudioButton === button && currentAudio) {
        stopCurrentAudio();
        return;
    }
    
    // 停止當前音頻
    stopCurrentAudio();
    
    // 創建新的音頻對象
    const audio = new Audio(audioUrl);
    
    // 設置音頻事件
    audio.addEventListener('loadeddata', () => {
        if (button) {
            button.classList.remove('loading');
            button.classList.add('playing');
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-stop';
            }
        }
    });
    
    audio.addEventListener('play', () => {
        // 更新當前音頻狀態
        currentAudio = audio;
        currentAudioButton = button;
    });
    
    audio.addEventListener('ended', () => {
        if (button) {
            button.classList.remove('playing', 'loading');
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-volume-up';
            }
        }
        currentAudio = null;
        currentAudioButton = null;
    });
    
    audio.addEventListener('error', (e) => {
        console.error('音頻加載失敗:', e);
        if (button) {
            button.classList.remove('playing', 'loading');
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-volume-up';
            }
        }
        currentAudio = null;
        currentAudioButton = null;
        
        // 使用靜默通知
        showSilentNotification('音頻文件未找到或無法播放');
    });
    
    // 設置加載狀態
    if (button) {
        button.classList.add('loading');
    }
    
    // 開始播放
    audio.play().catch(e => {
        console.error('播放失敗:', e);
        if (button) {
            button.classList.remove('loading');
        }
        showSilentNotification('音頻播放失敗');
    });
}

// ==================== 分頁控制 ====================
function showPage(pageNum) {
    // 隱藏所有頁面
    for (let i = 1; i <= totalPages; i++) {
        const pageElement = document.getElementById(`page${i}`);
        if (pageElement) pageElement.style.display = 'none';
    }
    
    // 顯示當前頁面
    const currentPageElement = document.getElementById(`page${pageNum}`);
    if (currentPageElement) currentPageElement.style.display = 'grid';
    
    // 更新頁面指示器
    document.getElementById('pageIndicator').textContent = `第 ${pageNum} 頁 / 共 ${totalPages} 頁`;
    
    // 更新按鈕狀態
    document.getElementById('prevPage').disabled = pageNum === 1;
    document.getElementById('nextPage').disabled = pageNum === totalPages;
    
    currentPage = pageNum;
}

// ==================== 學習進度管理 ====================
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            completedPractice = progress.completed || 0;
            correctAnswers = progress.correct || 0;
            practiceScores = progress.scores || {};
            
            // 恢復練習狀態
            Object.keys(practiceScores).forEach(id => {
                const element = document.getElementById(id);
                if (element && practiceScores[id] > 0) {
                    if (element.classList.contains('option')) {
                        element.classList.add('answered');
                    } else if (element.tagName === 'INPUT') {
                        element.classList.add('answered');
                    }
                }
            });
            
            // 檢查是否應該顯示總結彈窗（修正部分）
            // 只有在完成所有練習且尚未顯示過總結時才顯示
            const summaryShown = localStorage.getItem(SUMMARY_SHOWN_KEY);
            if (completedPractice === totalPracticeQuestions && summaryShown !== 'true') {
                // 使用 setTimeout 確保 DOM 完全加載
                setTimeout(() => {
                    showSummary();
                }, 1000);
            }
            
        } catch (e) {
            console.error('載入進度失敗:', e);
        }
    }
}

function saveProgress() {
    const progress = {
        completed: completedPractice,
        correct: correctAnswers,
        scores: practiceScores,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateProgressDisplay() {
    const progressPercent = Math.round((completedPractice / totalPracticeQuestions) * 100);
    const correctRate = completedPractice > 0 ? Math.round((correctAnswers / completedPractice) * 100) : 0;
    
    // 更新進度圓環
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    const progressCircle = document.getElementById('progressCircle');
    progressCircle.style.background = `conic-gradient(#3498db 0% ${progressPercent}%, #eef2f7 ${progressPercent}% 100%)`;
    
    // 更新統計數字
    document.getElementById('completedCount').textContent = completedPractice;
    document.getElementById('totalCount').textContent = totalPracticeQuestions;
    document.getElementById('correctRate').textContent = `${correctRate}%`;
    
    // 更新進度條
    const progressBar = document.getElementById('practice-progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // 更新進度文字
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.textContent = `進度: ${completedPractice}/${totalPracticeQuestions} 已完成`;
    }
    
    // 更新建議
    const nextRecommendation = document.getElementById('nextRecommendation');
    if (nextRecommendation) {
        if (completedPractice === 0) {
            nextRecommendation.textContent = '開始練習以追蹤進度';
        } else if (completedPractice < totalPracticeQuestions) {
            nextRecommendation.textContent = '繼續完成所有練習';
        } else {
            nextRecommendation.textContent = '太棒了！已完成所有練習';
            document.getElementById('completionMessage').style.display = 'inline-block';
        }
    }
    
    // 保存進度
    saveProgress();
    
    // 如果完成所有練習，顯示總結
    if (completedPractice === totalPracticeQuestions) {
        setTimeout(() => {
            showSummary();
        }, 500);
    }
}

// ==================== 答案檢查通用函數 ====================
function markElementCorrect(element) {
    if (!element) return;
    element.classList.remove('incorrect-answer');
    element.classList.add('correct-answer');
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.style.borderColor = '#2ecc71';
        element.style.backgroundColor = '#d5f4e6';
    }
}

function markElementIncorrect(element) {
    if (!element) return;
    element.classList.remove('correct-answer');
    element.classList.add('incorrect-answer');
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.style.borderColor = '#e74c3c';
        element.style.backgroundColor = '#fce4ec';
    }
}

function clearElementMark(element) {
    if (!element) return;
    element.classList.remove('correct-answer', 'incorrect-answer');
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.style.borderColor = '#ddd';
        element.style.backgroundColor = 'white';
    } else {
        element.style.backgroundColor = '';
        element.style.borderColor = '';
    }
}

// ==================== 練習題答案檢查 ====================
function checkAnswer(questionNum) {
    let isCorrect = false;
    let resultDiv, answerInput;
    
    if (questionNum >= 5 && questionNum <= 10) {
        // 練習5-10
        resultDiv = document.getElementById(`q${questionNum}-result`);
        answerInput = document.getElementById(`q${questionNum}-answer`);
        
        if (questionNum === 7 || questionNum === 8) {
            // 選擇題
            const questionElement = resultDiv.parentElement;
            const selectedOption = questionElement.querySelector('.option.selected');
            
            if (!selectedOption) {
                resultDiv.textContent = "❌ 請先選擇一個答案";
                resultDiv.className = "result incorrect";
                resultDiv.style.display = "block";
                return;
            }
            
            const userAnswer = selectedOption.getAttribute('data-answer');
            const correctAnswer = answers[questionNum];
            
            // 清除標記
            const options = questionElement.querySelectorAll('.option');
            options.forEach(opt => clearElementMark(opt));
            
            if (userAnswer === correctAnswer) {
                resultDiv.textContent = "✅ 正確！";
                resultDiv.className = "result correct";
                markElementCorrect(selectedOption);
                isCorrect = true;
            } else {
                resultDiv.textContent = "❌ 不正確";
                resultDiv.className = "result incorrect";
                markElementIncorrect(selectedOption);
            }
        } else {
            // 填空題
            const userAnswer = answerInput.value.trim().toLowerCase();
            const correctAnswer = answers[questionNum].toLowerCase();
            
            clearElementMark(answerInput);
            
            // 允許小寫和句尾標點差異
            const normalizedUserAnswer = userAnswer.replace(/[.?]$/, '');
            const normalizedCorrectAnswer = correctAnswer.replace(/[.?]$/, '');
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
                resultDiv.textContent = "✅ 正確！";
                resultDiv.className = "result correct";
                markElementCorrect(answerInput);
                isCorrect = true;
            } else {
                resultDiv.textContent = `❌ 不正確，正確答案是: ${answers[questionNum]}`;
                resultDiv.className = "result incorrect";
                markElementIncorrect(answerInput);
            }
        }
        
        resultDiv.style.display = "block";
        
        // 更新進度
        if (isCorrect && !answerInput?.classList.contains('answered')) {
            completedPractice++;
            correctAnswers++;
            if (answerInput) answerInput.classList.add('answered');
            practiceScores[`q${questionNum}`] = 1;
        }
    }
    
    updateProgressDisplay();
}

// ==================== 活動練習功能 ====================
// 動物分類
function checkClassification() {
    const landAnimalsZone = document.getElementById('landAnimalsItems');
    const seaAnimalsZone = document.getElementById('seaAnimalsItems');
    
    const landAnimals = Array.from(landAnimalsZone.querySelectorAll('.dropped-item')).map(item => item.getAttribute('data-animal'));
    const seaAnimals = Array.from(seaAnimalsZone.querySelectorAll('.dropped-item')).map(item => item.getAttribute('data-animal'));
    
    const feedback = document.getElementById('classificationFeedback');
    let correctCount = 0;
    let totalCount = 0;
    
    // 檢查陸地動物
    classificationAnswers.land.forEach(animal => {
        const dragItem = document.querySelector(`.drag-item[data-animal="${animal}"]`);
        if (landAnimals.includes(animal)) {
            markElementCorrect(dragItem);
            correctCount++;
        } else {
            markElementIncorrect(dragItem);
        }
        totalCount++;
    });
    
    // 檢查海洋動物
    classificationAnswers.sea.forEach(animal => {
        const dragItem = document.querySelector(`.drag-item[data-animal="${animal}"]`);
        if (seaAnimals.includes(animal)) {
            markElementCorrect(dragItem);
            correctCount++;
        } else {
            markElementIncorrect(dragItem);
        }
        totalCount++;
    });
    
    // 顯示反饋
    if (correctCount === totalCount) {
        feedback.className = 'feedback correct';
        feedback.innerHTML = '✅ 太棒了！全部正確！';
        document.getElementById('zooBadge').style.display = 'inline-block';
        
        // 更新進度
        if (!practiceScores.classification) {
            completedPractice++;
            correctAnswers++;
            practiceScores.classification = 1;
            updateProgressDisplay();
        }
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 有 ${totalCount - correctCount} 個錯誤，正確: ${correctCount}/${totalCount}`;
    }
    
    feedback.style.display = 'block';
}

function resetClassification() {
    const landAnimalsZone = document.getElementById('landAnimalsItems');
    const seaAnimalsZone = document.getElementById('seaAnimalsItems');
    
    landAnimalsZone.innerHTML = '';
    seaAnimalsZone.innerHTML = '';
    
    const dragItems = document.querySelectorAll('.drag-item');
    dragItems.forEach(item => {
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto';
        clearElementMark(item);
    });
    
    const feedback = document.getElementById('classificationFeedback');
    feedback.style.display = 'none';
    document.getElementById('zooBadge').style.display = 'none';
    
    // 移除進度
    if (practiceScores.classification) {
        completedPractice--;
        correctAnswers--;
        delete practiceScores.classification;
        updateProgressDisplay();
    }
}

// 配對練習
function selectQuestion(questionNum) {
    selectedQuestion = questionNum;
    const questionItems = document.querySelectorAll('.question-list .match-item');
    questionItems.forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = 'transparent';
    });
    
    const selectedItem = document.querySelector(`.match-item[data-question="${questionNum}"]`);
    selectedItem.classList.add('selected');
    selectedItem.style.borderColor = '#2980b9';
    
    if (selectedAnswer) checkSingleMatch();
}

function selectAnswer(answerLetter) {
    selectedAnswer = answerLetter;
    const answerItems = document.querySelectorAll('.answer-list .match-item');
    answerItems.forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = 'transparent';
    });
    
    const selectedItem = document.querySelector(`.match-item[data-answer="${answerLetter}"]`);
    selectedItem.classList.add('selected');
    selectedItem.style.borderColor = '#2980b9';
    
    if (selectedQuestion) checkSingleMatch();
}

function checkSingleMatch() {
    if (selectedQuestion && selectedAnswer) {
        const questionItem = document.querySelector(`.match-item[data-question="${selectedQuestion}"]`);
        const answerItem = document.querySelector(`.match-item[data-answer="${selectedAnswer}"]`);
        
        clearElementMark(questionItem);
        clearElementMark(answerItem);
        
        if (matchingAnswers[selectedQuestion] === selectedAnswer) {
            markElementCorrect(questionItem);
            markElementCorrect(answerItem);
            questionItem.classList.add('matched');
            answerItem.classList.add('matched');
            
            // 更新進度
            if (!practiceScores[`match${selectedQuestion}`]) {
                practiceScores[`match${selectedQuestion}`] = 1;
            }
        } else {
            markElementIncorrect(questionItem);
            markElementIncorrect(answerItem);
        }
        
        selectedQuestion = null;
        selectedAnswer = null;
        
        // 檢查是否完成所有配對
        checkMatchingProgress();
    }
}

function checkMatchingProgress() {
    let completedMatches = 0;
    for (let i = 1; i <= 5; i++) {
        const questionItem = document.querySelector(`.match-item[data-question="${i}"]`);
        if (questionItem && questionItem.classList.contains('matched')) {
            completedMatches++;
        }
    }
    
    // 如果完成所有配對，更新進度
    if (completedMatches === 5 && !practiceScores.matchingComplete) {
        completedPractice++;
        correctAnswers++;
        practiceScores.matchingComplete = 1;
        updateProgressDisplay();
    }
}

function checkMatching() {
    const feedback = document.getElementById('matchingFeedback');
    let correctCount = 0;
    
    for (const [question, correctAnswer] of Object.entries(matchingAnswers)) {
        const questionItem = document.querySelector(`.match-item[data-question="${question}"]`);
        const answerItem = document.querySelector(`.match-item[data-answer="${correctAnswer}"]`);
        
        if (questionItem.classList.contains('matched') && answerItem.classList.contains('matched')) {
            correctCount++;
        }
    }
    
    if (correctCount === 5) {
        feedback.className = 'feedback correct';
        feedback.innerHTML = '✅ 太棒了！全部正確！';
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 已完成 ${correctCount}/5 個配對`;
    }
    
    feedback.style.display = 'block';
}

function resetMatching() {
    const allItems = document.querySelectorAll('.match-item');
    allItems.forEach(item => {
        item.classList.remove('selected', 'matched');
        clearElementMark(item);
        item.style.borderColor = 'transparent';
    });
    
    selectedQuestion = null;
    selectedAnswer = null;
    
    const feedback = document.getElementById('matchingFeedback');
    feedback.style.display = 'none';
    
    // 移除進度
    if (practiceScores.matchingComplete) {
        completedPractice--;
        correctAnswers--;
        delete practiceScores.matchingComplete;
        for (let i = 1; i <= 5; i++) {
            delete practiceScores[`match${i}`];
        }
        updateProgressDisplay();
    }
}

// 語法填空
function checkGrammar() {
    const feedback = document.getElementById('grammarFeedback');
    let correctCount = 0;
    let emptyCount = 0;
    const totalQuestions = Object.keys(grammarAnswers).length;
    
    for (const [id, answer] of Object.entries(grammarAnswers)) {
        const input = document.getElementById(id);
        const userAnswer = input.value.trim().toLowerCase();
        
        if (userAnswer === '') {
            emptyCount++;
            input.style.borderColor = '#ff9800';
            input.style.backgroundColor = '#fff3cd';
        } else if (userAnswer === answer) {
            markElementCorrect(input);
            correctCount++;
        } else {
            markElementIncorrect(input);
        }
    }
    
    feedback.style.display = 'block';
    
    if (emptyCount === totalQuestions) {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = '❌ 請先填寫所有答案！';
    } else if (emptyCount > 0) {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 還有 ${emptyCount} 題未填寫！`;
    } else if (correctCount === totalQuestions) {
        feedback.className = 'feedback correct';
        feedback.innerHTML = '✅ 太棒了！全部正確！';
        
        // 更新進度
        if (!practiceScores.grammar) {
            completedPractice++;
            correctAnswers++;
            practiceScores.grammar = 1;
            updateProgressDisplay();
        }
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 正確: ${correctCount}/${totalQuestions}`;
    }
}

function resetGrammar() {
    for (const id of Object.keys(grammarAnswers)) {
        const input = document.getElementById(id);
        input.value = '';
        clearElementMark(input);
    }
    
    const feedback = document.getElementById('grammarFeedback');
    feedback.style.display = 'none';
    
    // 移除進度
    if (practiceScores.grammar) {
        completedPractice--;
        correctAnswers--;
        delete practiceScores.grammar;
        updateProgressDisplay();
    }
}

// 日記問題
function checkDiary() {
    const feedback = document.getElementById('diaryFeedback');
    let correctCount = 0;
    let answeredCount = 0;
    
    for (const [id, answer] of Object.entries(diaryAnswers)) {
        const selectedOption = document.querySelector(`.option.selected[data-question="${id}"]`);
        
        if (selectedOption) {
            answeredCount++;
            const userAnswer = selectedOption.getAttribute('data-answer');
            
            clearElementMark(selectedOption);
            
            if (userAnswer === answer) {
                markElementCorrect(selectedOption);
                correctCount++;
            } else {
                markElementIncorrect(selectedOption);
            }
        }
    }
    
    if (answeredCount === 0) {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = '❌ 請先選擇答案！';
    } else if (answeredCount < 5) {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 還有 ${5 - answeredCount} 題未回答`;
    } else if (correctCount === 5) {
        feedback.className = 'feedback correct';
        feedback.innerHTML = '✅ 太棒了！全部正確！';
        
        // 更新進度
        if (!practiceScores.diary) {
            completedPractice++;
            correctAnswers++;
            practiceScores.diary = 1;
            updateProgressDisplay();
        }
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `❌ 正確: ${correctCount}/5`;
    }
    
    feedback.style.display = 'block';
}

function resetDiary() {
    const allOptions = document.querySelectorAll('.option[data-question]');
    allOptions.forEach(option => {
        option.classList.remove('selected');
        clearElementMark(option);
        option.style.borderColor = 'transparent';
    });
    
    const feedback = document.getElementById('diaryFeedback');
    feedback.style.display = 'none';
    
    // 移除進度
    if (practiceScores.diary) {
        completedPractice--;
        correctAnswers--;
        delete practiceScores.diary;
        updateProgressDisplay();
    }
}

// ==================== 測驗功能 ====================
function submitQuiz() {
    let score = 0;
    const totalQuestions = 8; // 8題，每題2分，滿分16分
    
    // 1. 檢查詞彙選擇題 (2題)
    for(let i = 1; i <= 2; i++) {
        const selectedOption = document.querySelector(`.option.selected[data-quiz="${i}"]`);
        if(selectedOption) {
            const userAnswer = selectedOption.getAttribute('data-answer');
            if(userAnswer === quizAnswers[i]) {
                markElementCorrect(selectedOption);
                score += 2;
            } else {
                markElementIncorrect(selectedOption);
                // 顯示正確答案
                const correctOption = document.querySelector(`.option[data-quiz="${i}"][data-answer="${quizAnswers[i]}"]`);
                if(correctOption) {
                    markElementCorrect(correctOption);
                }
            }
        } else {
            // 未答題目，顯示正確答案
            const correctOption = document.querySelector(`.option[data-quiz="${i}"][data-answer="${quizAnswers[i]}"]`);
            if(correctOption) {
                markElementCorrect(correctOption);
            }
        }
    }
    
    // 2. 檢查匹配題 (2題)
    for(let i = 1; i <= 2; i++) {
        const selectedOption = document.querySelector(`.option.selected[data-match="${i}"]`);
        if(selectedOption) {
            const userAnswer = selectedOption.getAttribute('data-answer');
            if(userAnswer === quizAnswers[`match${i}`]) {
                markElementCorrect(selectedOption);
                score += 2;
            } else {
                markElementIncorrect(selectedOption);
                // 顯示正確答案
                const correctOption = document.querySelector(`.option[data-match="${i}"][data-answer="${quizAnswers[`match${i}`]}"]`);
                if(correctOption) {
                    markElementCorrect(correctOption);
                }
            }
        } else {
            // 未答題目，顯示正確答案
            const correctOption = document.querySelector(`.option[data-match="${i}"][data-answer="${quizAnswers[`match${i}`]}"]`);
            if(correctOption) {
                markElementCorrect(correctOption);
            }
        }
    }
    
    // 3. 檢查語法填空題 (2題)
    const quizBlank1 = document.getElementById('quizBlank1').value.trim().toLowerCase();
    const quizBlank2 = document.getElementById('quizBlank2').value.trim().toLowerCase();
    
    // 第一題
    if(quizBlank1 === quizAnswers.quizBlank1) {
        markElementCorrect(document.getElementById('quizBlank1'));
        score += 2;
    } else {
        if(quizBlank1 !== '') {
            markElementIncorrect(document.getElementById('quizBlank1'));
        }
        // 顯示正確答案
        const blank1Element = document.getElementById('quizBlank1');
        blank1Element.placeholder = `正確答案: ${quizAnswers.quizBlank1}`;
        blank1Element.style.borderColor = '#2ecc71';
        blank1Element.style.backgroundColor = '#d5f4e6';
    }
    
    // 第二題
    if(quizBlank2 === quizAnswers.quizBlank2) {
        markElementCorrect(document.getElementById('quizBlank2'));
        score += 2;
    } else {
        if(quizBlank2 !== '') {
            markElementIncorrect(document.getElementById('quizBlank2'));
        }
        // 顯示正確答案
        const blank2Element = document.getElementById('quizBlank2');
        blank2Element.placeholder = `正確答案: ${quizAnswers.quizBlank2}`;
        blank2Element.style.borderColor = '#2ecc71';
        blank2Element.style.backgroundColor = '#d5f4e6';
    }
    
    // 4. 檢查閱讀理解題 (2題)
    for(let i = 1; i <= 2; i++) {
        const selectedOption = document.querySelector(`.option.selected[data-reading="${i}"]`);
        if(selectedOption) {
            const userAnswer = selectedOption.getAttribute('data-answer');
            if(userAnswer === quizAnswers[`reading${i}`]) {
                markElementCorrect(selectedOption);
                score += 2;
            } else {
                markElementIncorrect(selectedOption);
                // 顯示正確答案
                const correctOption = document.querySelector(`.option[data-reading="${i}"][data-answer="${quizAnswers[`reading${i}`]}"]`);
                if(correctOption) {
                    markElementCorrect(correctOption);
                }
            }
        } else {
            // 未答題目，顯示正確答案
            const correctOption = document.querySelector(`.option[data-reading="${i}"][data-answer="${quizAnswers[`reading${i}`]}"]`);
            if(correctOption) {
                markElementCorrect(correctOption);
            }
        }
    }
    
    // 顯示分數
    const scoreContainer = document.getElementById('scoreContainer');
    const scoreElement = document.getElementById('score');
    const scoreMessage = document.getElementById('scoreMessage');
    
    // 計算百分比
    const percentage = Math.round((score / 16) * 100);
    
    // 顯示正確的分數
    scoreElement.textContent = `${score}/16 (${percentage}%)`;
    
    // 根據分數顯示不同訊息
    if(score === 16) {
        scoreMessage.textContent = "🎉 太棒了！滿分！你是動物小專家！";
    } else if(score >= 14) {
        scoreMessage.textContent = "👍 做得很好！繼續保持！";
    } else if(score >= 10) {
        scoreMessage.textContent = "✓ 還不錯，再複習一下會更好！";
    } else {
        scoreMessage.textContent = "💪 需要多加練習，再試一次吧！";
    }
    
    // 顯示成績單
    scoreContainer.style.display = "block";
    scoreContainer.scrollIntoView({ behavior: 'smooth' });
    
    // 顯示詳細答題情況
    showQuizDetails(score);
    
    // 保存測驗成績
    practiceScores.quiz = score;
    saveProgress();
}

// 新增：顯示測驗詳細結果
function showQuizDetails(score) {
    // 移除之前的詳細結果
    const existingDetails = document.querySelector('.quiz-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    
    // 創建詳細結果區域
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'quiz-details';
    detailsDiv.style.cssText = `
        background-color: #f8fafc;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        border-left: 4px solid #3498db;
    `;
    
    let detailsHTML = `
        <h4 style="color: #2980b9; margin-bottom: 15px;">
            <i class="fas fa-clipboard-list"></i> 答題詳情
        </h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
    `;
    
    // 詞彙選擇題
    detailsHTML += `
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <h5 style="color: #3498db; margin-bottom: 10px;">詞彙選擇題 (2題)</h5>
            <p>1. ${getQuizAnswerStatus(1)}</p>
            <p>2. ${getQuizAnswerStatus(2)}</p>
        </div>
    `;
    
    // 匹配題
    detailsHTML += `
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <h5 style="color: #3498db; margin-bottom: 10px;">匹配題 (2題)</h5>
            <p>1. ${getMatchAnswerStatus(1)}</p>
            <p>2. ${getMatchAnswerStatus(2)}</p>
        </div>
    `;
    
    // 語法填空題
    detailsHTML += `
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <h5 style="color: #3498db; margin-bottom: 10px;">語法填空題 (2題)</h5>
            <p>1. ${getBlankAnswerStatus('quizBlank1')}</p>
            <p>2. ${getBlankAnswerStatus('quizBlank2')}</p>
        </div>
    `;
    
    // 閱讀理解題
    detailsHTML += `
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <h5 style="color: #3498db; margin-bottom: 10px;">閱讀理解題 (2題)</h5>
            <p>1. ${getReadingAnswerStatus(1)}</p>
            <p>2. ${getReadingAnswerStatus(2)}</p>
        </div>
    `;
    
    detailsHTML += `
        </div>
        <div style="margin-top: 15px; padding: 10px; background: ${score >= 12 ? '#d5f4e6' : '#fce4ec'}; border-radius: 8px;">
            <p style="color: ${score >= 12 ? '#155724' : '#721c24'}; font-weight: bold;">
                <i class="fas fa-${score >= 12 ? 'check-circle' : 'exclamation-circle'}"></i>
                總分: ${score}/16 (${Math.round((score / 16) * 100)}%)
            </p>
        </div>
    `;
    
    detailsDiv.innerHTML = detailsHTML;
    document.querySelector('.quiz-container').appendChild(detailsDiv);
}

// 輔助函數：獲取題目答題狀態
function getQuizAnswerStatus(questionNum) {
    const selected = document.querySelector(`.option.selected[data-quiz="${questionNum}"]`);
    const correctAnswer = quizAnswers[questionNum];
    
    if (!selected) {
        return `<span style="color: #e74c3c;">未作答</span> (正確答案: ${correctAnswer.toUpperCase()})`;
    }
    
    const userAnswer = selected.getAttribute('data-answer');
    if (userAnswer === correctAnswer) {
        return `<span style="color: #27ae60;">✓ 正確</span> (你的答案: ${userAnswer.toUpperCase()})`;
    } else {
        return `<span style="color: #e74c3c;">✗ 錯誤</span> (你的答案: ${userAnswer.toUpperCase()}, 正確答案: ${correctAnswer.toUpperCase()})`;
    }
}

function getMatchAnswerStatus(questionNum) {
    const selected = document.querySelector(`.option.selected[data-match="${questionNum}"]`);
    const correctAnswer = quizAnswers[`match${questionNum}`];
    
    if (!selected) {
        return `<span style="color: #e74c3c;">未作答</span>`;
    }
    
    const userAnswer = selected.getAttribute('data-answer');
    if (userAnswer === correctAnswer) {
        return `<span style="color: #27ae60;">✓ 正確</span>`;
    } else {
        return `<span style="color: #e74c3c;">✗ 錯誤</span>`;
    }
}

function getBlankAnswerStatus(blankId) {
    const input = document.getElementById(blankId);
    const correctAnswer = quizAnswers[blankId];
    const userAnswer = input.value.trim().toLowerCase();
    
    if (!userAnswer) {
        return `<span style="color: #e74c3c;">未作答</span> (正確答案: ${correctAnswer})`;
    }
    
    if (userAnswer === correctAnswer) {
        return `<span style="color: #27ae60;">✓ 正確</span> (你的答案: ${userAnswer})`;
    } else {
        return `<span style="color: #e74c3c;">✗ 錯誤</span> (你的答案: ${userAnswer}, 正確答案: ${correctAnswer})`;
    }
}

function getReadingAnswerStatus(questionNum) {
    const selected = document.querySelector(`.option.selected[data-reading="${questionNum}"]`);
    const correctAnswer = quizAnswers[`reading${questionNum}`];
    
    if (!selected) {
        return `<span style="color: #e74c3c;">未作答</span> (正確答案: ${correctAnswer.toUpperCase()})`;
    }
    
    const userAnswer = selected.getAttribute('data-answer');
    if (userAnswer === correctAnswer) {
        return `<span style="color: #27ae60;">✓ 正確</span> (你的答案: ${userAnswer.toUpperCase()})`;
    } else {
        return `<span style="color: #e74c3c;">✗ 錯誤</span> (你的答案: ${userAnswer.toUpperCase()}, 正確答案: ${correctAnswer.toUpperCase()})`;
    }
}

function resetQuiz() {
    // 重置所有選擇題
    const options = document.querySelectorAll('.option[data-quiz], .option[data-match], .option[data-reading]');
    options.forEach(option => {
        option.classList.remove('selected', 'correct-answer', 'incorrect-answer');
        option.style.borderColor = 'transparent';
        option.style.backgroundColor = '';
    });
    
    // 重置填空題
    const blanks = ['quizBlank1', 'quizBlank2'];
    blanks.forEach(blankId => {
        const input = document.getElementById(blankId);
        input.value = '';
        input.placeholder = '';
        input.classList.remove('correct-answer', 'incorrect-answer');
        input.style.borderColor = '#ddd';
        input.style.backgroundColor = 'white';
    });
    
    // 隱藏分數容器
    document.getElementById('scoreContainer').style.display = "none";
    
    // 移除詳細結果
    const detailsDiv = document.querySelector('.quiz-details');
    if (detailsDiv) {
        detailsDiv.remove();
    }
}

// ==================== 輔助功能 ====================
function handleOptionClick(option) {
    const questionNum = option.getAttribute('data-quiz') || option.getAttribute('data-match') || 
                       option.getAttribute('data-reading') || option.getAttribute('data-question');
    const type = option.getAttribute('data-quiz') ? 'quiz' : 
                 option.getAttribute('data-match') ? 'match' : 
                 option.getAttribute('data-reading') ? 'reading' : 
                 option.getAttribute('data-question') ? 'question' : 
                 option.getAttribute('data-answer') ? 'practice' : 'unknown';
    
    // 移除同一問題中其他選項的選中狀態
    if(type === 'question') {
        const siblings = document.querySelectorAll(`.option[data-question="${questionNum}"]`);
        siblings.forEach(sib => {
            sib.classList.remove('selected');
            sib.style.borderColor = 'transparent';
        });
    } else if(type !== 'practice' && type !== 'unknown') {
        const siblings = document.querySelectorAll(`.option[data-${type}="${questionNum}"]`);
        siblings.forEach(sib => {
            sib.classList.remove('selected');
            sib.style.borderColor = 'transparent';
        });
    } else {
        const siblings = option.parentElement.querySelectorAll('.option');
        siblings.forEach(sib => {
            sib.classList.remove('selected');
            sib.style.borderColor = 'transparent';
        });
    }
    
    // 添加選中狀態
    option.classList.add('selected');
    option.style.borderColor = '#2980b9';
    option.focus();
}

function initializeDragAndDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dragItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.getAttribute('data-animal'));
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '#dce5f0';
        });
        
        zone.addEventListener('dragleave', function() {
            this.style.backgroundColor = '#eef2f7';
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '#eef2f7';
            
            const animal = e.dataTransfer.getData('text/plain');
            const animalItem = document.querySelector(`.drag-item[data-animal="${animal}"]`);
            
            if (animalItem) {
                // 如果動物已經在其他區域，先移除
                const existingItems = document.querySelectorAll('.dropped-item');
                existingItems.forEach(item => {
                    if (item.textContent === animal) {
                        item.remove();
                    }
                });
                
                // 創建新的放置項目
                const droppedItem = document.createElement('div');
                droppedItem.className = 'dropped-item';
                droppedItem.textContent = animal;
                droppedItem.setAttribute('data-animal', animal);
                
                this.querySelector('div:last-child').appendChild(droppedItem);
                
                animalItem.style.opacity = '0.3';
                animalItem.style.pointerEvents = 'none';
            }
        });
    });
}

function toggleExampleContent(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains('open');
    
    document.querySelectorAll('.example-content.open').forEach(openContent => {
        if (openContent !== content) {
            openContent.classList.remove('open');
            const closeBtn = openContent.previousElementSibling;
            closeBtn.innerHTML = '<i class="fas fa-comment-dots"></i> 例句';
        }
    });
    
    content.classList.toggle('open');
    button.innerHTML = content.classList.contains('open') 
        ? '<i class="fas fa-times"></i> 關閉例句'
        : '<i class="fas fa-comment-dots"></i> 例句';
}

function toggleTranslation(translationId) {
    const translationElement = document.getElementById(translationId);
    if (translationElement) {
        translationElement.classList.toggle('show');
        
        const translateButton = document.querySelector(`.translate-btn[data-translation="${translationId}"]`);
        if (translateButton) {
            if (translationElement.classList.contains('show')) {
                translateButton.innerHTML = '<i class="fas fa-times"></i>';
                translateButton.style.backgroundColor = '#e74c3c';
            } else {
                translateButton.innerHTML = '<i class="fas fa-language"></i>';
                translateButton.style.backgroundColor = '#9b59b6';
            }
        }
    }
}

// ==================== 靜默通知系統 ====================
function showSilentNotification(message) {
    const notification = document.getElementById('silentNotification');
    const content = document.getElementById('notificationContent');
    
    content.textContent = message;
    notification.classList.add('show');
    
    // 3秒後自動隱藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== 總結功能 ====================
function showSummary() {
    const progressPercent = Math.round((completedPractice / totalPracticeQuestions) * 100);
    const correctRate = completedPractice > 0 ? Math.round((correctAnswers / completedPractice) * 100) : 0;
    
    // 更新總結內容
    document.getElementById('finalProgress').textContent = `${progressPercent}%`;
    document.getElementById('finalCompleted').textContent = completedPractice;
    
    // 生成星星評價
    const starsContainer = document.getElementById('summaryStars');
    starsContainer.innerHTML = '';
    const starCount = Math.min(5, Math.floor(correctRate / 20));
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = i < starCount ? 'fas fa-star' : 'far fa-star';
        starsContainer.appendChild(star);
    }
    
    // 檢查薄弱環節
    const weaknesses = analyzeWeaknesses();
    const weaknessSection = document.getElementById('weaknessSection');
    const modalWeaknessList = document.getElementById('modalWeaknessList');
    
    if (weaknesses.length > 0) {
        weaknessSection.style.display = 'block';
        modalWeaknessList.innerHTML = '';
        weaknesses.forEach(weakness => {
            const li = document.createElement('div');
            li.className = 'weakness-item';
            li.textContent = weakness;
            modalWeaknessList.appendChild(li);
        });
        
        // 更新側邊欄建議
        const weaknessTips = document.getElementById('weaknessTips');
        const weaknessList = document.getElementById('weaknessList');
        weaknessList.innerHTML = '';
        weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.textContent = weakness;
            weaknessList.appendChild(li);
        });
        weaknessTips.style.display = 'block';
    } else {
        weaknessSection.style.display = 'none';
        document.getElementById('weaknessTips').style.display = 'none';
    }
    
    // 顯示總結彈窗
    document.getElementById('summaryModal').style.display = 'flex';
    
    // 標記總結已顯示（關鍵修復：確保只顯示一次）
    localStorage.setItem(SUMMARY_SHOWN_KEY, 'true');
}

function closeSummary() {
    document.getElementById('summaryModal').style.display = 'none';
}

function analyzeWeaknesses() {
    const weaknesses = [];
    
    // 檢查分類練習
    if (!practiceScores.classification) {
        weaknesses.push('動物分類練習');
    }
    
    // 檢查配對練習
    if (!practiceScores.matchingComplete) {
        weaknesses.push('問答配對練習');
    }
    
    // 檢查語法練習
    if (!practiceScores.grammar) {
        weaknesses.push('語法填空練習');
    }
    
    // 檢查閱讀練習
    if (!practiceScores.diary) {
        weaknesses.push('閱讀理解練習');
    }
    
    // 檢查一般練習
    for (let i = 5; i <= 10; i++) {
        if (!practiceScores[`q${i}`]) {
            weaknesses.push(`練習 ${i}`);
            break; // 只顯示一個代表
        }
    }
    
    return weaknesses.slice(0, 3); // 最多顯示3個
}

// ==================== 重置所有練習 ====================
function resetPractice() {
    resetPracticeWithSilentNotification();
}

function resetPracticeWithSilentNotification() {
    // 重置所有進度數據
    completedPractice = 0;
    correctAnswers = 0;
    practiceScores = {};
    
    // 清除所有輸入
    for(let i = 5; i <= 10; i++) {
        const answerInput = document.getElementById(`q${i}-answer`);
        if(answerInput) {
            answerInput.value = "";
            clearElementMark(answerInput);
            answerInput.classList.remove('answered');
        }
        
        const resultDiv = document.getElementById(`q${i}-result`);
        if(resultDiv) resultDiv.style.display = "none";
        
        const options = document.querySelectorAll(`#q${i}-result`).length > 0 ? 
            document.querySelectorAll(`#q${i}-result`)[0].parentElement.querySelectorAll('.option') : [];
        
        options.forEach(option => {
            option.classList.remove('selected', 'answered');
            clearElementMark(option);
        });
    }
    
    // 重置活動練習
    resetClassification();
    resetMatching();
    resetGrammar();
    resetDiary();
    
    // 隱藏完成訊息
    document.getElementById('completionMessage').style.display = 'none';
    document.getElementById('weaknessTips').style.display = 'none';
    
    // 關閉總結彈窗
    closeSummary();
    
    // 更新進度顯示
    updateProgressDisplay();
    
    // 清除本地存儲
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUMMARY_SHOWN_KEY);
    
    // 使用靜默通知
    showSilentNotification('已重置所有練習，可以重新開始學習！');
}

// ==================== 鍵盤導航支持 ====================
document.addEventListener('keydown', function(e) {
    // Tab鍵導航時添加視覺焦點
    if (e.key === 'Tab') {
        setTimeout(() => {
            const focused = document.activeElement;
            if (focused && (focused.classList.contains('option') || 
                focused.classList.contains('btn') || 
                focused.classList.contains('tab') ||
                focused.classList.contains('answer-input'))) {
                focused.classList.add('focus-visible');
            }
        }, 10);
    }
});

document.addEventListener('click', function(e) {
    // 點擊時移除焦點樣式
    document.querySelectorAll('.focus-visible').forEach(el => {
        el.classList.remove('focus-visible');
    });
});