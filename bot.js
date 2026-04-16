(function() {
  // ── スタイル注入 ──────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #mj-bot-wrap * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Helvetica Neue', 'Hiragino Sans', 'Noto Sans JP', sans-serif; }

    /* トリガーボタン */
    #mj-trigger {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #FF3D8B, #E0256F);
      color: #fff; border: none; border-radius: 999px;
      padding: 13px 20px 13px 16px;
      font-size: 14px; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 20px rgba(255,61,139,.45);
      transition: transform .2s, box-shadow .2s;
      animation: mjBounceIn .6s cubic-bezier(.34,1.56,.64,1) both;
    }
    #mj-trigger:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,61,139,.55); }
    #mj-trigger .mj-icon { font-size: 20px; }
    #mj-trigger .mj-close-x { display: none; font-size: 18px; font-weight: 400; }

    /* 吹き出しバブル */
    #mj-bubble {
      position: fixed; bottom: 88px; right: 24px; z-index: 99998;
      background: #fff; border-radius: 16px 16px 4px 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,.13);
      padding: 12px 16px; max-width: 240px;
      font-size: 13px; line-height: 1.55; color: #1A2B5E;
      opacity: 0; transform: translateY(10px) scale(.95);
      transition: opacity .3s ease, transform .3s ease;
      pointer-events: none;
    }
    #mj-bubble.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #mj-bubble::after {
      content: ''; position: absolute; bottom: -8px; right: 20px;
      border: 8px solid transparent; border-top-color: #fff;
      border-bottom: none;
    }

    /* オーバーレイ（スマホ全画面用） */
    #mj-overlay {
      display: none; position: fixed; inset: 0; z-index: 99997;
      background: rgba(26,43,94,.5); backdrop-filter: blur(2px);
    }
    #mj-overlay.show { display: block; }

    /* パネル本体 */
    #mj-panel {
      position: fixed; z-index: 99998;
      background: #fff;
      overflow: hidden; display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transition: opacity .35s ease, transform .35s ease;
    }
    /* PC: 右下ポップアップ */
    @media (min-width: 600px) {
      #mj-panel {
        bottom: 88px; right: 24px;
        width: 380px; max-height: calc(100vh - 120px);
        border-radius: 20px;
        box-shadow: 0 8px 40px rgba(0,0,0,.18);
        transform: translateY(20px) scale(.96);
      }
      #mj-panel.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    }
    /* スマホ: 全画面 */
    @media (max-width: 599px) {
      #mj-panel {
        inset: 0; border-radius: 0;
        transform: translateY(100%);
      }
      #mj-panel.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
      #mj-trigger { bottom: 16px; right: 16px; }
      #mj-bubble { right: 16px; bottom: 80px; }
    }

    /* パネルヘッダー */
    #mj-panel-header {
      background: linear-gradient(135deg, #4A6FD4, #2A4FAA);
      padding: 16px 18px 14px; color: #fff; flex-shrink: 0;
      position: relative;
    }
    #mj-panel-header .mj-h-logo { font-size: 10px; font-weight: 600; letter-spacing: .12em; opacity: .75; margin-bottom: 3px; text-transform: uppercase; }
    #mj-panel-header .mj-h-title { font-size: 16px; font-weight: 700; line-height: 1.4; }
    #mj-panel-header .mj-h-sub { font-size: 12px; opacity: .85; margin-top: 3px; }
    #mj-panel-header .mj-h-close {
      position: absolute; top: 14px; right: 16px;
      background: rgba(255,255,255,.2); border: none; color: #fff;
      width: 28px; height: 28px; border-radius: 50%; font-size: 16px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    #mj-panel-header .mj-h-close:hover { background: rgba(255,255,255,.35); }

    /* パネルコンテンツ */
    #mj-panel-body {
      flex: 1; overflow-y: auto; padding: 18px 16px;
      background: linear-gradient(160deg, #f0f4ff, #fdf0f7);
    }

    /* プログレス */
    .mj-prog-wrap { display: flex; gap: 5px; margin-bottom: 6px; }
    .mj-prog-step { flex: 1; height: 4px; border-radius: 99px; background: #E5E7EB; transition: background .4s; }
    .mj-prog-step.active { background: #4A6FD4; }
    .mj-prog-step.done { background: #A8C0F0; }
    .mj-prog-label { font-size: 10px; color: #9CA3AF; text-align: center; margin-bottom: 14px; }
    .mj-prog-label span { color: #4A6FD4; font-weight: 700; }

    /* カード */
    .mj-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 12px rgba(74,111,212,.1); margin-bottom: 10px; animation: mjFadeUp .35s ease both; }
    @keyframes mjFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes mjBounceIn { from { opacity:0; transform:scale(.7); } to { opacity:1; transform:scale(1); } }

    .mj-card-title { font-size: 14px; font-weight: 700; color: #1A2B5E; margin-bottom: 4px; }
    .mj-card-sub { font-size: 12px; color: #6B7280; margin-bottom: 14px; line-height: 1.5; }

    /* 入力 */
    .mj-field { margin-bottom: 12px; }
    .mj-label { font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
    .mj-input-row { display: flex; align-items: center; gap: 8px; }
    .mj-input {
      flex: 1; height: 44px; border: 1.5px solid #E5E7EB; border-radius: 8px;
      font-size: 20px; font-weight: 700; text-align: center; color: #1A2B5E;
      outline: none; background: #F9FAFB; -moz-appearance: textfield;
      transition: border-color .2s, box-shadow .2s;
    }
    .mj-input::-webkit-inner-spin-button, .mj-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .mj-input:focus { border-color: #4A6FD4; box-shadow: 0 0 0 3px rgba(74,111,212,.12); background: #fff; }
    .mj-unit { font-size: 13px; color: #9CA3AF; min-width: 22px; }

    /* ボタン */
    .mj-btn {
      width: 100%; height: 48px;
      background: linear-gradient(135deg, #4A6FD4, #2A4FAA);
      color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
      cursor: pointer; transition: opacity .2s, transform .1s;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .mj-btn:hover { opacity: .9; }
    .mj-btn:active { transform: scale(.98); }
    .mj-btn:disabled { background: #E5E7EB; color: #9CA3AF; cursor: not-allowed; }
    .mj-btn-arrow { transition: transform .2s; }
    .mj-btn:hover .mj-btn-arrow { transform: translateX(3px); }

    /* BMI結果 */
    .mj-bmi-card { background: #EEF2FF; border: 1.5px solid #C7D5F8; border-radius: 12px; padding: 14px; margin-bottom: 10px; animation: mjFadeUp .4s ease both; }
    .mj-bmi-label { font-size: 11px; color: #4B5563; margin-bottom: 2px; }
    .mj-bmi-num { font-size: 44px; font-weight: 700; color: #2A4FAA; line-height: 1; margin-bottom: 10px; }
    .mj-bar-wrap { position: relative; height: 7px; border-radius: 99px; background: linear-gradient(to right,#93C5FD,#6EE7B7 40%,#4A6FD4 70%,#F59E0B 85%,#EF4444); margin-bottom: 4px; }
    .mj-marker { position: absolute; top: -5px; width: 16px; height: 16px; background: #fff; border: 3px solid #2A4FAA; border-radius: 50%; transform: translateX(-50%); transition: left .6s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 2px 6px rgba(0,0,0,.15); }
    .mj-bar-labels { display: flex; justify-content: space-between; font-size: 9px; color: #9CA3AF; margin-bottom: 10px; }
    .mj-verdict { display: flex; align-items: center; gap: 7px; background: #fff; border-radius: 8px; padding: 10px 12px; font-size: 12px; font-weight: 600; color: #2A4FAA; }
    .mj-verdict.neg { color: #F59E0B; }

    /* チェックリスト */
    .mj-checklist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .mj-check-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; cursor: pointer; background: #F9FAFB; transition: border-color .2s, background .2s; user-select: none; }
    .mj-check-item:hover { border-color: #C7D5F8; background: #EEF2FF; }
    .mj-check-item.checked { border-color: #4A6FD4; background: #EEF2FF; }
    .mj-check-box { width: 20px; height: 20px; border-radius: 5px; border: 2px solid #D1D5DB; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fff; transition: all .2s; margin-top: 1px; }
    .mj-check-item.checked .mj-check-box { background: #4A6FD4; border-color: #4A6FD4; }
    .mj-check-mark { display: none; color: #fff; font-size: 11px; font-weight: 700; }
    .mj-check-item.checked .mj-check-mark { display: block; }
    .mj-check-text { font-size: 12px; color: #1F2937; line-height: 1.45; }
    .mj-choice-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
    .mj-choice-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; cursor: pointer; background: #F9FAFB; transition: border-color .2s, background .2s; user-select: none; font-size: 13px; color: #1A2B5E; }
    .mj-choice-item:hover { border-color: #C7D5F8; background: #EEF2FF; }
    .mj-choice-item.selected { border-color: #4A6FD4; background: #EEF2FF; font-weight: 600; }
    .mj-choice-icon { font-size: 18px; }
    .mj-choice-text { flex: 1; }

    /* 結果ヒーロー */
    .mj-result-hero { background: linear-gradient(135deg, #FF3D8B, #C0245E); border-radius: 12px; padding: 18px 16px; color: #fff; text-align: center; margin-bottom: 10px; animation: mjFadeUp .4s ease both; position: relative; overflow: hidden; }
    .mj-result-hero::before { content:''; position:absolute; top:-30px; right:-30px; width:90px; height:90px; border-radius:50%; background:rgba(255,255,255,.1); }
    .mj-result-emoji { font-size: 30px; margin-bottom: 6px; }
    .mj-result-title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; }
    .mj-result-rows { display: flex; flex-direction: column; gap: 6px; }
    .mj-result-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,.18); border-radius: 7px; padding: 8px 12px; font-size: 12px; }
    .mj-result-row .rv { font-weight: 700; }

    /* オファー */
    .mj-offer { background: #FFF0F6; border: 1.5px solid #FFB3D1; border-radius: 8px; padding: 11px 13px; display: flex; gap: 8px; margin-bottom: 10px; font-size: 12px; color: #1A2B5E; line-height: 1.5; }
    .mj-offer strong { color: #C0245E; font-size: 13px; }

    /* CTA */
    .mj-cta-btn {
      width: 100%; height: 52px;
      background: linear-gradient(135deg, #FF3D8B, #E0256F);
      color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: opacity .2s, transform .1s;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      margin-bottom: 6px; box-shadow: 0 4px 16px rgba(255,61,139,.35);
    }
    .mj-cta-btn:hover { opacity: .9; }
    .mj-cta-sub { font-size: 11px; color: #9CA3AF; text-align: center; margin-bottom: 10px; }
    .mj-disclaimer { font-size: 9px; color: #9CA3AF; text-align: center; line-height: 1.7; }

    /* 安心訴求 */
    .mj-trust { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 10px; }
    .mj-trust-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #9CA3AF; }
  `;
  document.head.appendChild(style);

  // ── HTML注入 ──────────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = 'mj-bot-wrap';
  wrap.innerHTML = `
    <!-- オーバーレイ -->
    <div id="mj-overlay" onclick="mjToggle()"></div>

    <!-- 吹き出し -->
    <div id="mj-bubble">
      あなたはマンジャロの対象かも？<br>
      <strong>30秒で確認できます 👇</strong>
    </div>

    <!-- トリガーボタン -->
    <button id="mj-trigger" onclick="mjToggle()">
      <span class="mj-icon">💊</span>
      <span id="mj-trigger-text">対象か確認する</span>
      <span class="mj-close-x" id="mj-close-x">✕</span>
    </button>

    <!-- パネル -->
    <div id="mj-panel">
      <div id="mj-panel-header">
        <div class="mj-h-logo">MOUNJARO ONLINE</div>
        <div class="mj-h-title">あなたはマンジャロの対象かも？</div>
        <div class="mj-h-sub">30秒で確認できます 👇</div>
        <button class="mj-h-close" onclick="mjToggle()">✕</button>
      </div>
      <div id="mj-panel-body">

        <!-- プログレス -->
        <div class="mj-prog-wrap">
          <div class="mj-prog-step active" id="mj-ps1"></div>
          <div class="mj-prog-step" id="mj-ps2"></div>
          <div class="mj-prog-step" id="mj-ps3"></div>
        </div>
        <div class="mj-prog-label" id="mj-prog-label"><span>Step 1</span> BMI入力</div>

        <!-- SCREEN 1: BMI入力 -->
        <div id="mj-s1">
          <div class="mj-card">
            <div class="mj-card-title">📏 まず、BMIを確認しましょう</div>
            <div class="mj-card-sub">身長と体重を入れるだけ。<br>30秒で終わります。</div>
            <div class="mj-field">
              <label class="mj-label">身長</label>
              <div class="mj-input-row">
                <input class="mj-input" type="number" id="mj-h" placeholder="165" min="140" max="210">
                <span class="mj-unit">cm</span>
              </div>
            </div>
            <div class="mj-field">
              <label class="mj-label">体重</label>
              <div class="mj-input-row">
                <input class="mj-input" type="number" id="mj-w" placeholder="70" min="30" max="200">
                <span class="mj-unit">kg</span>
              </div>
            </div>
            <button class="mj-btn" onclick="mjCalcBMI()">
              BMIを計算する <span class="mj-btn-arrow">→</span>
            </button>
          </div>
          <div class="mj-trust">
            <div class="mj-trust-item">🔒 安全に管理</div>
            <div class="mj-trust-item">🆓 登録不要・無料</div>
          </div>
        </div>

        <!-- SCREEN 2: BMI結果 -->
        <div id="mj-s2" style="display:none">
          <div class="mj-bmi-card">
            <div class="mj-bmi-label">あなたのBMI</div>
            <div class="mj-bmi-num" id="mj-bmi-num">—</div>
            <div class="mj-bar-wrap"><div class="mj-marker" id="mj-marker" style="left:50%"></div></div>
            <div class="mj-bar-labels"><span>低体重<br>18.5未満</span><span>普通体重<br>25未満</span><span>対象目安<br>25以上▶</span></div>
            <div class="mj-verdict" id="mj-verdict"><span>✅</span><span id="mj-verdict-text">処方目安の範囲に該当します</span></div>
          </div>
          <div class="mj-card">
            <div class="mj-card-title">マンジャロ処方目安について</div>
            <div class="mj-card-sub">BMI 25以上が目安です。BMIが低くても、体型や体質によっては処方できる場合があります。</div>
            <button class="mj-btn" onclick="mjGoScreen(3)">次のステップへ <span class="mj-btn-arrow">→</span></button>
          </div>
        </div>

        <!-- SCREEN 3: ライフスタイル設問 -->
        <div id="mj-s3" style="display:none">

          <!-- Q1: 運動習慣 -->
          <div class="mj-card" id="mj-q1-card">
            <div class="mj-card-title">🏃 週にどのくらい運動しますか？</div>
            <div class="mj-card-sub">当てはまるものを選んでください</div>
            <div class="mj-choice-list" id="mj-q1">
              <div class="mj-choice-item" onclick="mjSelectChoice('q1', this)"><span class="mj-choice-icon">🛋️</span><span class="mj-choice-text">ほぼしない</span></div>
              <div class="mj-choice-item" onclick="mjSelectChoice('q1', this)"><span class="mj-choice-icon">🚶</span><span class="mj-choice-text">たまにする</span></div>
              <div class="mj-choice-item" onclick="mjSelectChoice('q1', this)"><span class="mj-choice-icon">💪</span><span class="mj-choice-text">よくする</span></div>
            </div>
          </div>

          <!-- Q2: ダイエット歴 -->
          <div class="mj-card" id="mj-q2-card" style="opacity:.4;pointer-events:none">
            <div class="mj-card-title">📉 ダイエットで成功したことはありますか？</div>
            <div class="mj-card-sub">当てはまるものを選んでください</div>
            <div class="mj-choice-list" id="mj-q2">
              <div class="mj-choice-item" onclick="mjSelectChoice('q2', this)"><span class="mj-choice-icon">😓</span><span class="mj-choice-text">成功したことがない</span></div>
              <div class="mj-choice-item" onclick="mjSelectChoice('q2', this)"><span class="mj-choice-icon">🔄</span><span class="mj-choice-text">リバウンドしてしまった</span></div>
              <div class="mj-choice-item" onclick="mjSelectChoice('q2', this)"><span class="mj-choice-icon">✅</span><span class="mj-choice-text">成功して維持できている</span></div>
            </div>
          </div>

          <button class="mj-btn" id="mj-check-btn" onclick="mjGoScreen(4)" disabled>
            結果を見る <span class="mj-btn-arrow">→</span>
          </button>
        </div>

        <!-- SCREEN 4: 判定結果 -->
        <div id="mj-s4" style="display:none">
          <div class="mj-result-hero">
            <div class="mj-result-emoji">🎉</div>
            <div class="mj-result-title">診察にお申し込み<br>いただけます！</div>
            <div class="mj-result-rows">
              <div class="mj-result-row"><span>BMI</span><span class="rv"><span id="mj-result-bmi">—</span> ✅ 処方目安に該当</span></div>
              <div class="mj-result-row"><span>禁忌チェック</span><span class="rv">✅ 該当なし</span></div>
            </div>
          </div>
          <div class="mj-offer">
            <span>🏷️</span>
            <div><strong>初月限定キャンペーン実施中</strong><br>今だけ初回特別価格。診察料もコミコミです。</div>
          </div>
          <button class="mj-cta-btn" onclick="mjGoLine()">
            無料で相談してみる →
          </button>
          <div class="mj-cta-sub">LINEを追加するだけ。すぐに始められます。</div>
          <div class="mj-disclaimer">本結果は医師による正式な診断ではありません。処方の可否は診察時に医師が最終判断します。本サービスは自由診療です。</div>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // ── ロジック ──────────────────────────────────
  let mjBMI = 0;
  let mjOpen = false;

  // 3秒後に吹き出し表示
  setTimeout(function() {
    const bubble = document.getElementById('mj-bubble');
    if (bubble) bubble.classList.add('show');
    // 8秒後に吹き出し消す
    setTimeout(function() {
      if (bubble && !mjOpen) bubble.classList.remove('show');
    }, 8000);
  }, 3000);

  window.mjToggle = function() {
    mjOpen = !mjOpen;
    const panel = document.getElementById('mj-panel');
    const bubble = document.getElementById('mj-bubble');
    const overlay = document.getElementById('mj-overlay');
    const icon = document.querySelector('#mj-trigger .mj-icon');
    const closeX = document.getElementById('mj-close-x');
    const triggerText = document.getElementById('mj-trigger-text');
    if (mjOpen) {
      panel.classList.add('show');
      overlay.classList.add('show');
      bubble.classList.remove('show');
      icon.style.display = 'none';
      closeX.style.display = 'block';
      triggerText.textContent = '閉じる';
      document.body.style.overflow = 'hidden';
    } else {
      panel.classList.remove('show');
      overlay.classList.remove('show');
      icon.style.display = 'block';
      closeX.style.display = 'none';
      triggerText.textContent = '対象か確認する';
      document.body.style.overflow = '';
    }
  };

  window.mjGoScreen = function(n) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('mj-s' + i);
      if (el) el.style.display = (i === n) ? 'block' : 'none';
    }
    // プログレス更新
    const labels = ['', 'Step 1 BMI入力', 'Step 2 BMI結果', 'Step 3 確認', 'Step 3 判定結果'];
    const stepMap = [0, 1, 2, 3, 3];
    const cur = stepMap[n] || 1;
    for (let i = 1; i <= 3; i++) {
      const ps = document.getElementById('mj-ps' + i);
      if (!ps) continue;
      ps.className = 'mj-prog-step';
      if (i < cur) ps.classList.add('done');
      if (i === cur) ps.classList.add('active');
    }
    const pl = document.getElementById('mj-prog-label');
    if (pl) pl.innerHTML = '<span>Step ' + cur + '</span> ' + (labels[n] || '').replace(/Step \d+ /, '');
    // パネル内スクロールをトップへ
    const body = document.getElementById('mj-panel-body');
    if (body) body.scrollTop = 0;
  };

  window.mjCalcBMI = function() {
    const h = parseFloat(document.getElementById('mj-h').value);
    const w = parseFloat(document.getElementById('mj-w').value);
    if (!h || !w || h < 140 || h > 210 || w < 30 || w > 200) {
      alert('身長・体重を正しく入力してください');
      return;
    }
    mjBMI = Math.round(w / ((h / 100) ** 2) * 10) / 10;
    document.getElementById('mj-bmi-num').textContent = mjBMI;
    document.getElementById('mj-result-bmi').textContent = mjBMI;
    const pct = Math.min(Math.max((mjBMI - 15) / 25 * 100, 3), 97);
    document.getElementById('mj-marker').style.left = pct + '%';
    const verdict = document.getElementById('mj-verdict');
    const vt = document.getElementById('mj-verdict-text');
    if (mjBMI >= 25) {
      verdict.className = 'mj-verdict';
      vt.textContent = '処方目安の範囲に該当します（BMI ' + mjBMI + '）';
    } else {
      verdict.className = 'mj-verdict neg';
      vt.textContent = 'BMIが低めでも、気になる方はそのまま進んでみてください';
    }
    mjGoScreen(2);
  };

  window.mjSelectChoice = function(qId, el) {
    // 同じ設問の選択を解除してから選択
    document.querySelectorAll('#mj-' + qId + ' .mj-choice-item').forEach(function(i) { i.classList.remove('selected'); });
    el.classList.add('selected');
    // Q1が選ばれたらQ2を活性化
    if (qId === 'q1') {
      const q2card = document.getElementById('mj-q2-card');
      if (q2card) { q2card.style.opacity = '1'; q2card.style.pointerEvents = 'auto'; }
    }
    // Q1とQ2両方選ばれたらCTAを活性化
    const q1done = document.querySelector('#mj-q1 .mj-choice-item.selected');
    const q2done = document.querySelector('#mj-q2 .mj-choice-item.selected');
    const btn = document.getElementById('mj-check-btn');
    if (btn) btn.disabled = !(q1done && q2done);
  };

  window.mjToggleCheck = function(el) {
    el.classList.toggle('checked');
    const total = document.querySelectorAll('.mj-check-item').length;
    const checked = document.querySelectorAll('.mj-check-item.checked').length;
    const btn = document.getElementById('mj-check-btn');
    if (btn) btn.disabled = (checked < total);
  };

  window.mjGoLine = function() {
    window.open('https://lin.ee/q3y9Y24', '_blank');
  };

})();
