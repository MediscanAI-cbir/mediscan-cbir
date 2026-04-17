export const ja = {
  // Navigation
  nav: {
    home: "ホーム",
    scan: "スキャン & 検索",
    features: "機能",
    contact: "お問い合わせ",
    startFree: "スキャン & 検索",
    aboutUs: "概要",
  },

  // Home Page
  home: {
    heroLabel: "画像・テキスト誘導型医療検索",
    badge: "AIによる医療分析",
    headline1: "不確実性を減らす。",
    headline2: "診断を加速する。",
    description: "視覚的コンテンツやテキスト説明から医療画像アーカイブを探索し、視覚的・意味的に類似したケースを検索し、構造化された類似ワークフローを通じた大学研究プロトタイプのCBIRを発見します。",
    cta1: "スキャン & 検索",
    cta1Link: "/search",
    cta2Link: "/features",
    cta2: "詳細を見る",

    stats: {
      title1: "検索可能なケース数",
      value1: "100K+",
      title2: "検索時間",
      value2: "< 2秒",
      title3: "診断精度",
      value3: "95%+",
      title4: "解釈支援",
      value4: "24/7",
    },

    whyChoose: {
      headline: "なぜ MEDISCAN AI を選ぶのか？",
      description: "デモ、教育、実験のために医療画像検索ワークフローを探索するために設計された大学プロトタイプ。",
      features: [
        {
          icon: "route",
          title: "インテリジェント検索",
          desc: "放射線データに対する高速で読みやすいワークフローによる視覚的・意味的類似検索。",
        },
        {
          icon: "brain",
          title: "診断支援",
          desc: "関連ケースを比較し、解釈を支援し、診断の信頼性を高めます。",
        },
        {
          icon: "blocks",
          title: "スケーラブルな研究基盤",
          desc: "シンプルなFastAPI + Reactスタックとオプションのメタデータ強化でローカル動作。",
        },
      ],
    },

    howWorks: {
      headline: "使い方",
      description: "医療画像アーカイブを解放するための3つの直感的なステップ。",
      steps: [
        {
          num: "1",
          title: "アップロード",
          desc: "アーカイブから医療画像を選択するか、新しいケースをアップロードします。",
        },
        {
          num: "2",
          title: "分析",
          desc: "MEDISCANが視覚的・意味的特徴を即座にインデックス化します。",
        },
        {
          num: "3",
          title: "発見",
          desc: "スコアと利用可能なメタデータを持つランク付けされた類似結果を受け取ります。",
        },
      ],
    },

    modes: {
      headline: "2つの補完的な検索モード",
      description: "構造的類似性のための視覚的経路と、臨床的に関連するケース探索のための解釈的経路。",
      rootLabel: "MEDISCAN検索",
      visual: {
        title: "視覚的分析",
        items: [
          "視覚的類似性検索",
        ],
        desc: "類似した解剖学的構造と視覚的特徴を持つ画像を検索します。",
        use: "使用場面：比較解剖学、形態学的マッチング、構造的類似性。",
      },
      semantic: {
        title: "解釈的分析",
        items: [
          "意味的類似性検索",
          "テキスト誘導検索",
        ],
        desc: "類似した病理と臨床的意義を持つケースを発見します。",
        use: "使用場面：疾患発見、診断的推論、エビデンスに基づく選択。",
      },
    },

    useCases: {
      headline: "医療専門家のために設計",
      audience: "放射線科医、病理医、病院システム、研究センター。",
      inlineDescription: "同一のワークフロー内で過去のケースを検索し、類似標本を比較し、重複検査を減らし、コホート特定を加速します。",
      roles: [
        {
          icon: "stethoscope",
          title: "放射線科医",
          desc: "過去のケースを即座に検索。履歴データで診断の信頼性を高めます。",
        },
        {
          icon: "microscope",
          title: "病理医",
          desc: "参照データベース内の比較可能な標本や組織サンプルを探索します。",
        },
        {
          icon: "hospital",
          title: "病院システム",
          desc: "重複した画像検査を削減。臨床効率と結果を改善します。",
        },
        {
          icon: "search",
          title: "研究センター",
          desc: "関連する患者コホートを迅速に特定することで研究を加速します。",
        },
      ],
    },

    features: {
      headline: "強力な機能",
      list: [
        { title: "超高速", desc: "数百万枚の画像に対して1秒未満のレイテンシ" },
        { title: "解釈的インテリジェンス", desc: "注釈付き医療データセットで訓練されたAI" },
        { title: "デュアル検索", desc: "同一データセット上の視覚的・意味的検索モード" },
        { title: "研究プロトタイプ", desc: "デモ、実験、コード読解のために設計" },
        { title: "結果エクスポート", desc: "表示結果をJSON、CSV、またはPDFでエクスポート" },
        { title: "オープンAPI", desc: "ローカル統合とテスト用のシンプルなRESTエンドポイント" },
      ],
    },

    footer: {
      tagline: "医療画像検索の大学プロトタイプ。",
      compliance: "大学プロトタイプ · 非臨床 · ローカルデモ",
      contact: "お問い合わせ",
      rights: "全著作権所有。",
      privacy: "プライバシー",
      terms: "法的通知",
      aboutus: "概要",
      navigationTitle: "ナビゲーション",
      supportTitle: "サポート",
      legalTitle: "法的事項",
      connectTitle: "リンク",
      builtWith: "使用技術",
      documentation: "ドキュメント",
      faq: "よくある質問",
    },
  },

  // Search Page
  search: {
    headline: "医療画像をスキャン & 検索",
    description: "医療画像をアップロードして、類似ケースを即座に発見します。",
    step1: "1. 画像をアップロード",
    step1Desc: "JPEGまたはPNG形式",
    step2: "2. 分析モードを選択",
    step3: "3. 結果を見る",
    searching: "画像を分析中...",
    error: "サーバーへの接続エラー。",
    analysisMode: "分析モード",
    modeVisual: "視覚的分析",
    modeSemantic: "解釈的分析",
    numResults: "結果数",
    search: "検索",
    howWorks: "2つの分析モード",
    visual: {
      name: "視覚的分析",
      icon: "search",
      desc: "視覚的に類似した外観と構造を持つ画像を検索します。",
      use: "使用場面：解剖学的に類似したケースを検索する場合",
    },
    semantic: {
      name: "解釈的分析",
      icon: "hospital",
      desc: "類似した臨床的意義と病理を持つケースを検索します。",
      use: "使用場面：特定の疾患や臨床症状を検索する場合",
    },
    highlights: {
      title1: "即時結果",
      desc1: "1秒未満の検索時間",
      title2: "解釈的に関連",
      desc2: "医療データセットで訓練されたAI",
      title3: "完全無料",
      desc3: "登録不要、制限なし",
    },
    footer: "大学プロトタイプ · 非臨床合成 · 登録不要",

    hub: {
      badge: "医療画像検索エンジン",
      headline: "医療検索",
      description: "検索の種類を選択してください。",
      imageCard: {
        title: "視覚的検索",
        subtitle: "視覚的・意味的分析",
        desc: "レントゲン写真や医療画像をインポートして、データベース内の最も近いケースを検索します。",
        features: [
          "視覚的構造の分析",
          "画像の意味的比較",
        ],
        cta: "画像を分析する",
      },
      textCard: {
        title: "テキスト誘導検索",
        subtitle: "自然言語検索",
        desc: "医療ケースを英語で説明し、医療的意味で対応する画像を検索します。",
        features: [
          "医療的意味による検索",
          "意味的に関連する結果",
        ],
        cta: "ケースを説明する",
      },
      choose: {
        title: "どのアプローチを選ぶか？",
        imageLabel: "画像で — 以下の場合：",
        imageItems: [
          "分析するレントゲン写真やスキャンがある",
          "視覚的に類似したケースを探している",
          "解剖学的構造を比較したい",
        ],
        textLabel: "説明で — 以下の場合：",
        textItems: [
          "画像が利用できない",
          "診断や病理を知っている",
          "医療的概念を探求したい",
        ],
      },
    },

    image: {
      headline: "画像による検索",
      back: "戻る",
      invalidFileType: "JPEGおよびPNGファイルのみ受け付けます。",
      uploadPrompt: "ここに画像をドラッグするか、",
      browseAction: "参照",
      acceptedFormats: "JPEGまたはPNGのみ",
      previewAlt: "選択した画像のプレビュー",
      legendEyebrow: "お読みください",
      legendTitle: "目的に応じた適切な分析モードの選択",
      legendDescription: "2つのモードは同じ用途ではありません：一方は画像内で見えるものを素早く比較し、もう一方は医療的意味で近いケースを検索します。検索を開始する前に最も適切なモードを選択するためにこの注意書きをご使用ください。",
      legend: {
        visual: {
          label: "視覚的分析",
          title: "構造的・解剖学的類似性",
          description: "視覚的分析は、画像から始めて画面上で似ているケースを検索する場合に適切な選択肢です。全体的な外観、見える構造、解剖学的類似性を重視します。",
          note: "レントゲン写真を素早く比較したり、近い外観の画像を検索したり、ケースがデータベース内の他の例と視覚的に類似しているかどうかを確認するのに便利です。",
        },
        interpretive: {
          label: "解釈的分析",
          title: "医療的・意味的類似性",
          description: "解釈的分析は、外観が全く同一でなくても、ケースの読解に関連するケースを検索することが目的の場合により有用です。意味の近さと臨床的関連性を優先します。",
          note: "診断的意図が近いケースを探索したり、医療的に関連する例への検索を拡大したり、単純な視覚的類似性より臨床的有用性を優先する場合に便利です。",
        },
      },
      detailStep: "3. 詳細",
      readyStep: "3. 検索を開始",
      readyTitle: "視覚的検索を開始",
      readyDescription: "医療画像をインポートし、分析モードを選択して、検索を開始して最も近いケースを見つけます。",
      pendingStep: "3. 分析を開始",
      pendingTitle: "画像の準備が整いました",
      pendingDescription: "分析パラメータを調整し、「検索」をクリックして最も近い視覚的または解釈的一致を検索します。",
      modeChangeConfirm: "モードを変更すると現在の結果が削除されます。検索を再実行する必要があります。",
      modeChangeConfirmAction: "続行",
      modeChangeCancel: "キャンセル",
      modeInfoLabel: "分析モードのクイックヘルプを見る",
      selectionGuide: {
        label: "組み合わせ",
        title: "フィルターと複数選択再検索の組み合わせ",
        description: "フィルターは表示されるリストを絞り込むために使用します。複数選択再検索により、すでに関連性の高い小グループの画像から新しいより絞り込まれた検索を開始できます。",
        note: "例：キャプション + 最小スコアでいくつかのケースを分離してから、複数選択再検索でさらに近い近傍を探索する。",
      },
    },

    text: {
      headline: "医療テキストによる検索",
      badge: "解釈的分析 · 自然言語",
      label: "医療クエリ",
      langNote: "英語で",
      placeholder: "例：chest X-ray bilateral pneumonia...",
      back: "戻る",
      searching: "分析中...",
      error: "エラーが発生しました。",
      step1: "1. 医療クエリ",
      step1Desc: "医療的表現 · 英語",
      step2: "2. 結果数を選択",
      step3: "結果",
      readyStep: "3. 検索を開始",
      pendingStep: "3. 分析を開始",
      emptyStep: "3. 検索を開始",
      readyTitle: "解釈的検索を開始",
      readyDescription: "英語で医療的説明を入力し、検索を開始して臨床的に最も一致するキャプションを持つ画像を検索します。",
      pendingTitle: "クエリの準備が整いました",
      pendingDescription: "結果数を調整し、「検索」をクリックして最も近い解釈的一致を検索します。",
      modeInfoLabel: "解釈的分析のクイックヘルプを見る",
      legendEyebrow: "お読みください",
      legendTitle: "テキスト誘導解釈的分析を理解する",
      legendDescription: "ここでは、検索は画像からではなく医療的説明から始まります。MediScanは英語のクエリをインデックス化された臨床キャプションと照合し、単純な視覚的外観だけでなく医療的意味で近いケースを検索します。",
      legend: {
        interpretive: {
          label: "解釈的分析",
          title: "医療的意味による検索",
          description: "テキストクエリは、医療的意味で近いケースを検索するために、言葉をキャプションと関連する臨床的概念と比較します。",
          note: "仮説、診断、放射線所見、または正確な臨床的表現から始める場合に使用します。",
        },
        writing: {
          label: "表現方法",
          title: "有用な方法でケースを説明する",
          description: "英語で短く構造化された表現を優先します：モダリティ、解剖学的領域、主な所見、有用な臨床的文脈。例：chest X-ray with bilateral lower lobe opacities。",
          note: "あいまいすぎるクエリは結果を大幅に広げます；長すぎるクエリは重要なシグナルを希釈することが多いです。",
        },
      },
      quickNoteEyebrow: "お読みください",
      quickNoteTitle: "テキスト誘導検索",
      quickNoteDescription: "英語で観察内容を説明して意味的インデックスを照会します。",
      quickNoteChip: "解釈的分析",
      quickNoteBody: "簡潔な医療的表現を使用して、類似した所見や病理を示すキャプションを持つ画像を検索します。",
      quickNoteExample: "例：chest X-ray bilateral pneumonia",
    },
    conclusion: {
      title: "AI合成",
      copy: "コピー",
      collapse: "折りたたむ",
      expand: "展開する",
      disclaimer: "検索サマリーのみ。医療的判断や診断の代替ではありません。",
      generate: "合成を生成",
      loading: "合成を生成中...",
      regenerate: "再生成",
      error: "現在合成を生成できません。",
      noResults: "合成をリクエストする前に検索を実行してください。",
    },
    filters: {
      title: "フィルター",
      refineHint: "ページを離れずにテキスト検索の表示結果を絞り込みます。",
      infoLabel: "テキスト検索フィルターのヘルプを見る",
      reset: "リセット",
      minScore: "最小スコア",
      caption: "キャプション",
      captionPlaceholder: "キャプションでフィルター...",
      quickTerms: "提案語",
      quickTermsHint: "クリックして絞り込む",
      cui: "CUIコード",
      cuiPlaceholder: "例：C0018799",
      cuiPresence: "CUiの存在",
      all: "すべて",
      withCui: "CUIあり",
      withoutCui: "CUIなし",
      cuiTypesTitle: "CUIタイプフィルター",
      cuiModalite: "モダリティ",
      cuiAnatomie: "解剖学",
      cuiFinding: "病理 / 所見",
      cuiTypeAll: "すべて",
      sort: "並べ替え",
      sortDesc: "スコア ↓",
      sortAsc: "スコア ↑",
      reference: "画像参照",
      referencePlaceholder: "例：ROCO_000123",
      referenceHint: "IDから特定の画像を検索します。",
      guide: {
        eyebrow: "フィルターヘルプ",
        title: "テキスト検索結果を絞り込む",
        description: "フィルターはすでに見つかったリストに作用します。検索を再実行せずに表示を絞り込みます。",
        caption: {
          label: "キャプション、CUI、参照",
          title: "テキスト結果内のケースタイプを検索",
          description: "キャプションフィルターはすでに検索された説明を検索します。CUIフィルターはモダリティ、解剖学、病理でさらに絞り込み、参照により特定のIDを検索できます。",
          note: "広いクエリから絞り込まれた選択に移行するのに便利です。",
        },
        score: {
          label: "スコアと並べ替え",
          title: "テキストに最も近い一致を維持",
          description: "最小スコアはあなたの説明から最も遠い結果を削除します。スコア↓は最良のものを上位に表示；スコア↑はより限界のケースを表示します。",
          note: "より厳格なリストが必要な場合はしきい値を上げます。",
        },
        order: {
          label: "組み合わせ",
          title: "より絞り込まれた読み取りを構築",
          description: "最も効果的なのは複数のフィルターを組み合わせて有用なサブセットを素早く分離することです。",
          note: "例：キャプションキーワード + 最小スコア + 解剖学。",
        },
      },
      compare: "比較",
      compareOn: "✓ 比較有効",
      export: "エクスポート",
    },
    results: {
      visualMode: "視覚的分析",
      semanticMode: "解釈的分析",
      textMode: "テキスト検索",
      relaunchImage: "この画像から検索",
      compareAction: "比較",
      closeCompare: "比較を閉じる",
      compareTitle: "比較",
      queryImageLabel: "クエリ画像",
      selectedImageLabel: "対応する結果",
      resultMetadataHint: "以下の情報は選択された結果に対応しています。",
      resultCaptionLabel: "結果のキャプション",
      resultScoreLabel: "結果のスコア",
      resultCuiLabel: "結果のCUIコード",
      openDetails: "大きな画像を見る",
      closeDetails: "詳細ウィンドウを閉じる",
      downloadImage: "画像をダウンロード",
      detailsTitle: "結果の詳細",
      paginationLabel: "結果のページネーション",
      pageLabel: "ページ",
      previousPage: "前へ",
      nextPage: "次へ",
      captionLabel: "完全なキャプション",
      scoreLabel: "スコア",
      rawScoreLabel: "生スコア",
      rankLabel: "ランク",
      identifierLabel: "参照",
      cuiLabel: "CUIコード",
      noCaption: "この画像に利用可能なキャプションはありません。",
      notAvailable: "利用不可",
      resultsFoundSingular: "件の結果が見つかりました",
      resultsFoundPlural: "件の結果が見つかりました",
      selectedCount: "枚の画像が選択されました",
      selectedImageSingular: "枚の画像が選択されました",
      selectedImagePlural: "枚の画像が選択されました",
      selectionPanelTitle: "複数選択再検索",
      selectionHelpLabel: "複数選択再検索のヘルプを見る",
      selectionSummaryEmpty: "画像が選択されていません",
      selectionHint: "1枚または複数の結果カードにチェックを入れて、小グループの画像から新しい検索を構成します。",
      selectionReadySingle: "選択は1枚の参照画像から検索を再実行する準備ができています。",
      selectionReadyPlural: "選択は複数の参照画像から検索を再実行する準備ができています。",
      removeSelectedImage: "選択からこの画像を削除",
      selectionExpand: "複数選択再検索を展開",
      selectionCollapse: "複数選択再検索を折りたたむ",
      clearSelection: "選択をクリア",
      relaunchSelection: "選択から検索",
      selectionSearchSingle: "画像から検索",
      selectionSearchPlural: "画像から検索",
    },
  },

  // Contact Page
  contact: {
    headline: "お問い合わせ",
    description: "質問、バグ報告、またはご挨拶？すべてのメッセージを読んでいます。",
    supportLabel: "サポート",
    supportDesc: "MediScanに関する技術的な質問やフィードバック。",
    supportAddr: "mediscanaisupport@gmail.com",
    responseLabel: "返答時間",
    responseDesc: "24時間以内に返答（営業日）",
    sentTitle: "メッセージ送信済み",
    sentDesc: "あなたのメッセージはMEDISCANチームに送信されました。すぐにご連絡します。",
    sentAnother: "別のメッセージを送る",
    formName: "お名前",
    formEmail: "メールアドレス",
    formSubject: "件名",
    formSubjectPlaceholder: "何についてですか？",
    formMessage: "メッセージ",
    formPlaceholder1: "お名前",
    formPlaceholder2: "your@email.com",
    formPlaceholder4: "どのようにお手伝いできますか？",
    formSubmit: "送信",
    formSending: "送信中...",
    formPrivacy: "お客様の情報は共有されません。",
    errorGeneric: "現在メッセージを送信できません。後でもう一度お試しください。",
  },

  // About Page
  about: {
    headline: "MEDISCAN AI について",
    eyebrow: "大学プロトタイプ",
    description:
      "コンピュータビジョン、ベクトル検索、言語モデルを組み合わせて、類似性検索による医療画像の解釈を支援する大学プロジェクト。",
    missionVision: "ミッション & ビジョン",
    mission: {
      title: "私たちのミッション",
      image: "/mission.png",
      image_d: "/mission_d.png",
      text: "医療専門家が視覚的または意味的類似性によって医療画像アーカイブを検索し、迅速でコンテキスト化されたAI支援解釈を得られるようにします。",
    },
    vision: {
      title: "私たちの目標",
      image: "/goal.png",
      image_d: "/goal_d.png",
      text: "医療データのプライバシーを尊重し、新しいデータによって継続的に改善するAIベースの診断支援ツールへの最初のステップを構築します。",
    },
    architecture: {
      title: "仕組み",
      cards: [
        {
          image: "/vector.png",
          image_d: "/vector_d.png",
          title: "ベクトルエンコーディング",
          text: "2つのモード：構造的類似性のための視覚的（DINOv2）と医療的意味のための意味的（BioMedCLIP）。各画像は多次元ベクトルに変換されます。",
        },
        {
          image: "/faiss_about.png",
          image_d: "/faiss_about_d.png",
          title: "FAISS類似性検索",
          text: "類似度スコア、キャプション、ファイル参照を持つk個の最も近い画像を取得する高性能ベクトルエンジン。",
        },
        {
          image: "/llm.png",
          image_d: "/llm_d.png",
          title: "LLM解釈",
          text: "一致した結果のキャプションが言語モデル（Groq + LLaMA）に送られ、信頼レベルと推奨事項を持つ合成医療結論を生成します。",
        },
        {
          image: "/export.png",
          image_d: "/export_d.png",
          title: "エクスポート",
          text: "結果を後の分析やレポートのために画像付きでJSON、CSV、またはPDFとしてエクスポートできます。",
        },
      ],
    },
    pipeline: {
      title: "処理パイプライン",
      steps: [
        { title: "画像アップロード", desc: "ユーザーがReactインターフェース経由で医療画像を送信します。" },
        { title: "ベクトル化", desc: "画像が数値ベクトルに変換されます（視覚的または意味的モード）。" },
        { title: "類似性検索", desc: "FAISSがベクトルをインデックス化されたデータベースと比較 → トップk結果。" },
        { title: "表示とフィルタリング", desc: "スコアによる並べ替え、フィルタリング、テキスト検索を持つインタラクティブな画像グリッド。" },
        { title: "AI分析", desc: "結果のキャプションがGroq + LLaMAに送られ、合成医療結論を生成します。" },
        { title: "エクスポート", desc: "画像付きでJSON、CSV、またはPDFとして結果をダウンロード。" },
      ],
    },
    stack: {
      title: "技術スタック",
      items: ["React", "FastAPI", "FAISS", "DINOv2", "BioMedCLIP", "Groq", "LLaMA", "Python", "NumPy"],
    },
    team: {
      title: "チーム",
      members: [
        { name: "Taouache Rayane", color: "semantic", photo: "/photo-rayane.jpeg", github: "https://github.com/RayaneWebDev" },
        { name: "Ozan Taskin",     color: "visual",   photo: "/photo-ozan.jpeg",   github: "https://github.com/OzanTaskin" },
        { name: "Ales Ferhani",    color: "semantic", photo: "/photo-ales.jpeg",   github: "https://github.com/ales-frhn" },
        { name: "Maxime Huang",    color: "visual",   photo: "/photo-maxime.jpeg", github: "https://github.com/Somixe" },
      ],
    },
    disclaimer: {
      note: "注意：",
      text: "このシステムは資格のある医療専門家向けの支援ツールです。臨床的判断に代わるものではなく、認定された医療機器ではありません。",
    },
  },

  // How It Works
  howItWorks: {
    headline: "MEDISCAN AI の仕組み",
    description: "視覚的・意味的埋め込みによる医療画像検索。",
    pipeline: {
      title: "検索パイプライン",
      steps: [
        { label: "解釈的画像", icon: "📋" },
        { label: "AI分析", icon: "⚙️" },
        { label: "特徴抽出", icon: "📊" },
        { label: "解釈的インデックス", icon: "🗄️" },
        { label: "最良の結果", icon: "✅" },
      ],
    },
    modes: {
      title: "2つの補完的な分析アプローチ",
      visual: {
        name: "視覚的分析",
        model: "高度な視覚エンコーディング",
        desc: "視覚的構造、パターン、形態学的特徴を分析します。",
        steps: [
          {
            title: "視覚的特徴抽出",
            desc: "深層学習モデルが重要な視覚的パターンを抽出します。",
          },
          {
            title: "解釈的コンテキストの統合",
            desc: "インデックス化されたデータセットの特徴と視覚的特徴を比較します。",
          },
          {
            title: "類似度スコアリング",
            desc: "視覚的・構造的類似性によって画像をランク付けします。",
          },
          {
            title: "結果ランキング",
            desc: "解剖学的・視覚的に類似したケースを返します。",
          },
        ],
      },
      semantic: {
        name: "解釈的分析",
        model: "生医学言語モデル",
        desc: "生医学的埋め込み空間で画像キャプションとテキストクエリを整合させます。",
        steps: [
          {
            title: "生医学的エンコーディング",
            desc: "プロジェクトで設定された生医学モデルによって埋め込みが生成されます。",
          },
          {
            title: "解釈的推論",
            desc: "キャプションとテキストクエリで表現される意味的関係を捕捉します。",
          },
          {
            title: "エビデンスアライメント",
            desc: "共有埋め込み空間での意味的類似性によってケースを関連付けます。",
          },
          {
            title: "信頼度スコアリング",
            desc: "各結果にはキャリブレーションされた医療的信頼度ではなく類似度スコアが含まれます。",
          },
        ],
      },
    },
    when: {
      title: "適切な分析モードを選択する",
      visual: {
        title: "視覚的分析を使用する場合：",
        cases: [
          "解剖学的に類似したケースが必要",
          "同一モダリティでの画像比較",
          "構造的パターンや形態学的特徴を検索している",
        ],
      },
      semantic: {
        title: "解釈的分析を使用する場合：",
        cases: [
          "特定の診断や症状を検索している",
          "画像が異なるモダリティやソースから来ている",
          "外観より臨床的意義の方が重要",
        ],
      },
    },
  },

  // FAQ
  faq: {
    headline: "よくある質問",
    description: "現在のプロトタイプ、その範囲と制限に関する回答を見つけます。",
    categories: {
      general: "一般",
      technical: "技術",
      security: "セキュリティ"
    },
    items: [
      // --- 一般 ---
      {
        category: "general",
        q: "MEDISCAN AIの主な目的は何ですか？",
        r: "MEDISCAN AIは医療画像検索の大学プロトタイプです。臨床意思決定システムを構成することなく、データセット内の視覚的または意味的に類似したケースを探索できます。"
      },
      {
        category: "general",
        q: "誰がプラットフォームを使用できますか？",
        r: "現在のバージョンは主にデモ、学生プロジェクト、技術的探索、医療画像検索に関する研究プロトタイプに適しています。"
      },
      {
        category: "general",
        q: "これは診断ツールですか？",
        r: "いいえ。これは類似ケースとオプションのAI合成を探索目的のみで返す非臨床プロトタイプです。"
      },
      {
        category: "general",
        q: "どのデータセットが使用されていますか？",
        r: "プロトタイプはROCO v2を使用しています。これは類似性検索実験のためにフィルタリング・注釈付けされた医療画像（X線、CTスキャン、MRI）の公開データセットです。データベースにはHugging Faceから保存・提供される約60,000枚の画像が含まれています。",
        link: {
          label: "ROCO v2の詳細を見る",
          url: "https://huggingface.co/datasets/eltorio/ROCO-radiology"
        }
      },
      {
        category: "general",
        q: "プロジェクトはオープンソースですか？",
        r: "はい、ソースコードはGitHubで利用可能です。プロジェクトは大学の枠組みで開発されています。",
        link: {
          label: "GitHubで見る",
          url: "https://github.com/MediscanAI-cbir/mediscan-cbir"
        }
      },

      // --- 技術 ---
      {
        category: "technical",
        q: "「視覚的」検索と「解釈的」検索の違いは何ですか？",
        r: "視覚的検索は画像の構造的類似性に焦点を当てます。解釈的検索は意味空間を使用して、キャプションが近い意味を表すケースを検索します。"
      },
      {
        category: "technical",
        q: "視覚的検索にはどのAIモデルが使用されていますか？",
        r: "視覚的検索はDINOv2（Meta AI）を使用します。これは1億4,200万枚の画像でトレーニングされた自己教師あり型ビジョントランスフォーマーです。ファインチューニングなしで視覚的類似性のための高品質な埋め込みを生成します。",
        link: { label: "DINOv2の詳細を見る", url: "https://ai.meta.com/blog/dino-v2-computer-vision-self-supervised-learning/" }
      },
      {
        category: "technical",
        q: "意味的・テキスト画像検索にはどのAIモデルが使用されていますか？",
        r: "解釈的検索はBiomedCLIP（Microsoft Research）を使用します。これはPubMed Centralから得られた1,500万の医療画像テキストペアでトレーニングされたモデルです。放射線画像のための豊富な意味的表現を提供します。",
        link: { label: "BiomedCLIPの詳細を見る", url: "https://www.microsoft.com/en-us/research/publication/biomedclip-a-multimodal-biomedical-foundation-model-pretrained-from-fifteen-million-scientific-image-text-pairs/" }
      },
      {
        category: "technical",
        q: "既存のPACS/DICOMシステムと統合されますか？",
        r: "現在のバージョンでは統合されていません。プロトタイプはシンプルなREST APIを公開し、JPEG/PNG入力で動作しますが、PACS/DICOMをネイティブに統合していません。"
      },
      {
        category: "technical",
        q: "どの画像モダリティがサポートされていますか？",
        r: "プロトタイプは研究データセットに依存し、インターフェース経由でJPEG/PNGアップロードを受け付けます。DICOMの取り込みと完全なモダリティカバレッジはここでは実装されていません。"
      },

      // --- セキュリティ ---
      {
        category: "security",
        q: "プラットフォームはGDPRおよびHIPAAに準拠していますか？",
        r: "デフォルトでは準拠していません。準拠はプロジェクトのデプロイ、ホスティング、セキュリティ、ガバナンス方法によって異なります。このリポジトリは非臨床プロトタイプとして考慮されるべきです。"
      },
      {
        category: "security",
        q: "医療データはどこに保存されますか？",
        r: "送信されたファイルは検索のためにバックエンドで処理され、結果画像はHugging Faceでホストされている公開データセットから来ます。MongoDBの強化はオプションで、環境によって異なります。"
      },
      {
        category: "security",
        q: "データはどのように暗号化されますか？",
        r: "暗号化はデプロイメントによって異なります。ローカル開発環境だけではTLS、暗号化ストレージ、準拠ホスティングを保証しません。"
      },
      {
        category: "security",
        q: "データセットには患者データが含まれていますか？",
        r: "いいえ。画像データセットには直接識別可能なデータは含まれていません。"
      },
    ],
    contactTitle: "まだ質問がありますか？",
    contactBtn: "チームにお問い合わせ"
  },
};