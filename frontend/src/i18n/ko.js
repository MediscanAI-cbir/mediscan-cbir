export const ko = {
  // Navigation
  nav: {
    home: "홈",
    scan: "스캔 & 검색",
    features: "기능",
    contact: "문의",
    startFree: "스캔 & 검색",
    aboutUs: "소개",
  },

  // Home Page
  home: {
    heroLabel: "이미지·텍스트 기반 의료 검색",
    badge: "AI 의료 분석",
    headline1: "불확실성을 줄입니다.",
    headline2: "진단을 가속합니다.",
    description: "시각적 콘텐츠 또는 텍스트 설명으로 의료 이미지 아카이브를 탐색하고, 시각적 또는 의미적으로 유사한 사례를 찾아 구조화된 유사성 워크플로를 통해 대학 연구 프로토타입 CBIR을 발견합니다.",
    cta1: "스캔 & 검색",
    cta1Link: "/search",
    cta2Link: "/features",
    cta2: "자세히 알아보기",

    stats: {
      title1: "검색 가능한 사례",
      value1: "100K+",
      title2: "검색 시간",
      value2: "< 2초",
      title3: "진단 정확도",
      value3: "95%+",
      title4: "해석 지원",
      value4: "24/7",
    },

    whyChoose: {
      headline: "왜 MEDISCAN AI인가요?",
      description: "데모, 교육, 실험을 위한 의료 이미지 검색 워크플로를 탐색하도록 설계된 대학 프로토타입.",
      features: [
        {
          icon: "route",
          title: "지능형 검색",
          desc: "방사선 데이터에 대한 빠르고 읽기 쉬운 워크플로를 통한 시각적 또는 의미적 유사성 검색.",
        },
        {
          icon: "brain",
          title: "진단 지원",
          desc: "관련 사례를 비교하고 해석을 지원하며 진단 신뢰도를 높입니다.",
        },
        {
          icon: "blocks",
          title: "확장 가능한 연구 인프라",
          desc: "간단한 FastAPI + React 스택과 선택적 메타데이터 강화로 로컬에서 작동합니다.",
        },
      ],
    },

    howWorks: {
      headline: "작동 방식",
      description: "의료 이미지 아카이브를 열기 위한 세 가지 직관적인 단계.",
      steps: [
        {
          num: "1",
          title: "업로드",
          desc: "아카이브에서 의료 이미지를 선택하거나 새 사례를 업로드합니다.",
        },
        {
          num: "2",
          title: "분석",
          desc: "MEDISCAN이 즉시 시각적 및 의미적 특징을 인덱싱합니다.",
        },
        {
          num: "3",
          title: "발견",
          desc: "점수와 사용 가능한 메타데이터가 포함된 순위별 유사 결과를 받습니다.",
        },
      ],
    },

    modes: {
      headline: "두 가지 보완적인 검색 모드",
      description: "구조적 유사성을 위한 시각적 경로와 임상적으로 관련된 사례 탐색을 위한 해석적 경로.",
      rootLabel: "MEDISCAN 검색",
      visual: {
        title: "시각적 분석",
        items: [
          "시각적 유사성 검색",
        ],
        desc: "유사한 해부학적 구조와 시각적 특징을 가진 이미지를 찾습니다.",
        use: "사용 시기: 비교 해부학, 형태학적 매칭, 구조적 유사성.",
      },
      semantic: {
        title: "해석적 분석",
        items: [
          "의미적 유사성 검색",
          "텍스트 기반 검색",
        ],
        desc: "유사한 병리와 임상적 의미를 가진 사례를 발견합니다.",
        use: "사용 시기: 질병 발견, 진단적 추론, 증거 기반 선택.",
      },
    },

    useCases: {
      headline: "의료 전문가를 위해 설계",
      audience: "방사선과 의사, 병리학자, 병원 시스템, 연구 센터.",
      inlineDescription: "동일한 워크플로 내에서 이전 사례를 검색하고, 유사한 표본을 비교하고, 중복 검사를 줄이고, 코호트 식별을 가속합니다.",
      roles: [
        {
          icon: "stethoscope",
          title: "방사선과 의사",
          desc: "이전 사례를 즉시 검색합니다. 과거 데이터로 진단 신뢰도를 높입니다.",
        },
        {
          icon: "microscope",
          title: "병리학자",
          desc: "참조 데이터베이스에서 비교 가능한 표본과 조직 샘플을 탐색합니다.",
        },
        {
          icon: "hospital",
          title: "병원 시스템",
          desc: "중복 영상 검사를 줄입니다. 임상 효율성과 결과를 개선합니다.",
        },
        {
          icon: "search",
          title: "연구 센터",
          desc: "관련 환자 코호트를 빠르게 식별하여 연구를 가속합니다.",
        },
      ],
    },

    features: {
      headline: "강력한 기능",
      list: [
        { title: "초고속", desc: "수백만 개의 이미지에서 1초 미만의 레이턴시" },
        { title: "해석적 지능", desc: "주석이 달린 의료 데이터셋으로 훈련된 AI" },
        { title: "이중 검색", desc: "동일한 데이터셋의 시각적 및 의미적 검색 모드" },
        { title: "연구 프로토타입", desc: "데모, 실험, 코드 읽기를 위해 설계" },
        { title: "결과 내보내기", desc: "표시된 결과를 JSON, CSV 또는 PDF로 내보내기" },
        { title: "오픈 API", desc: "로컬 통합 및 테스트를 위한 간단한 REST 엔드포인트" },
      ],
    },

    footer: {
      tagline: "의료 이미지 검색 대학 프로토타입.",
      compliance: "대학 프로토타입 · 비임상 · 로컬 데모",
      contact: "문의하기",
      rights: "모든 권리 보유.",
      privacy: "개인정보 처리방침",
      terms: "법적 고지",
      aboutus: "소개",
      navigationTitle: "탐색",
      supportTitle: "지원",
      legalTitle: "법적 사항",
      connectTitle: "링크",
      builtWith: "사용 기술",
      documentation: "문서",
      faq: "자주 묻는 질문",
    },
  },

  // Search Page
  search: {
    headline: "의료 이미지 스캔 & 검색",
    description: "의료 이미지를 업로드하고 즉시 유사한 사례를 발견합니다.",
    step1: "1. 이미지 업로드",
    step1Desc: "JPEG 또는 PNG 형식",
    step2: "2. 분석 모드 선택",
    step3: "3. 결과 보기",
    searching: "이미지 분석 중...",
    error: "서버 연결 오류.",
    analysisMode: "분석 모드",
    modeVisual: "시각적 분석",
    modeSemantic: "해석적 분석",
    numResults: "결과 수",
    search: "검색",
    howWorks: "두 가지 분석 모드",
    visual: {
      name: "시각적 분석",
      icon: "search",
      desc: "시각적으로 유사한 외관과 구조를 가진 이미지를 찾습니다.",
      use: "사용 시기: 해부학적으로 유사한 사례 검색",
    },
    semantic: {
      name: "해석적 분석",
      icon: "hospital",
      desc: "유사한 임상적 의미와 병리를 가진 사례를 찾습니다.",
      use: "사용 시기: 특정 질병이나 임상 상태 검색",
    },
    highlights: {
      title1: "즉시 결과",
      desc1: "1초 미만의 검색 시간",
      title2: "해석적으로 관련",
      desc2: "의료 데이터셋으로 훈련된 AI",
      title3: "완전 무료",
      desc3: "등록 불요, 제한 없음",
    },
    footer: "대학 프로토타입 · 비임상 합성 · 등록 불요",

    hub: {
      badge: "의료 이미지 검색 엔진",
      headline: "의료 검색",
      description: "검색 유형을 선택하세요.",
      imageCard: {
        title: "시각적 검색",
        subtitle: "시각적 및 의미적 분석",
        desc: "방사선 사진 또는 의료 이미지를 가져와 데이터베이스에서 가장 가까운 사례를 검색합니다.",
        features: [
          "시각적 구조 분석",
          "이미지 의미적 비교",
        ],
        cta: "이미지 분석",
      },
      textCard: {
        title: "텍스트 기반 검색",
        subtitle: "자연어 검색",
        desc: "영어로 의료 사례를 설명하고 의료적 의미로 해당 이미지를 찾습니다.",
        features: [
          "의료적 의미로 검색",
          "의미적으로 관련된 결과",
        ],
        cta: "사례 설명",
      },
      choose: {
        title: "어떤 접근 방식을 선택할까요?",
        imageLabel: "이미지로 — 다음의 경우:",
        imageItems: [
          "분석할 방사선 사진이나 스캔이 있음",
          "시각적으로 유사한 사례를 찾고 있음",
          "해부학적 구조를 비교하고 싶음",
        ],
        textLabel: "설명으로 — 다음의 경우:",
        textItems: [
          "이미지를 사용할 수 없음",
          "진단 또는 병리를 알고 있음",
          "의료 개념을 탐색하고 싶음",
        ],
      },
    },

    image: {
      headline: "이미지로 검색",
      back: "뒤로",
      invalidFileType: "JPEG 및 PNG 파일만 허용됩니다.",
      uploadPrompt: "여기에 이미지를 드래그하거나",
      browseAction: "찾아보기",
      acceptedFormats: "JPEG 또는 PNG만",
      previewAlt: "선택한 이미지 미리보기",
      legendEyebrow: "읽어보세요",
      legendTitle: "목적에 맞는 올바른 분석 모드 선택",
      legendDescription: "두 모드는 동일한 용도가 아닙니다: 하나는 이미지에서 보이는 것을 빠르게 비교하고, 다른 하나는 의료적 의미가 가까운 사례를 검색합니다. 검색을 시작하기 전에 가장 적합한 모드를 선택하기 위해 이 참고 사항을 사용하세요.",
      legend: {
        visual: {
          label: "시각적 분석",
          title: "구조적 및 해부학적 유사성",
          description: "시각적 분석은 이미지에서 시작하여 화면에서 비슷한 사례를 찾을 때 적합한 선택입니다. 전체적인 외관, 보이는 구조, 해부학적 유사성을 강조합니다.",
          note: "방사선 사진을 빠르게 비교하거나, 비슷한 외관의 이미지를 찾거나, 사례가 데이터베이스의 다른 예시와 시각적으로 유사한지 확인하는 데 유용합니다.",
        },
        interpretive: {
          label: "해석적 분석",
          title: "의료적 및 의미적 유사성",
          description: "해석적 분석은 외관이 완전히 동일하지 않더라도 사례 읽기와 관련된 사례를 찾는 것이 목적일 때 더 유용합니다. 의미의 근접성과 임상적 관련성을 우선시합니다.",
          note: "진단적 의도가 가까운 사례를 탐색하거나, 의료적으로 관련된 예시로 검색을 확장하거나, 단순한 시각적 유사성보다 임상적 유용성을 우선시할 때 유용합니다.",
        },
      },
      detailStep: "3. 세부 정보",
      readyStep: "3. 검색 시작",
      readyTitle: "시각적 검색 시작",
      readyDescription: "의료 이미지를 가져오고, 분석 모드를 선택한 다음, 검색을 시작하여 가장 가까운 사례를 찾습니다.",
      pendingStep: "3. 분석 시작",
      pendingTitle: "이미지가 준비되었습니다",
      pendingDescription: "분석 매개변수를 조정하고 '검색'을 클릭하여 가장 가까운 시각적 또는 해석적 일치를 찾습니다.",
      modeChangeConfirm: "모드를 변경하면 현재 결과가 삭제됩니다. 검색을 다시 실행해야 합니다.",
      modeChangeConfirmAction: "계속",
      modeChangeCancel: "취소",
      modeInfoLabel: "분석 모드 빠른 도움말 보기",
      selectionGuide: {
        label: "조합",
        title: "필터와 다중 선택 재검색 조합",
        description: "필터는 표시된 목록을 좁히는 데 사용됩니다. 다중 선택 재검색을 통해 이미 관련성이 높은 소그룹 이미지에서 새로운 더 좁혀진 검색을 시작할 수 있습니다.",
        note: "예: 캡션 + 최소 점수로 몇 가지 사례를 분리한 다음, 다중 선택 재검색으로 더 가까운 이웃을 탐색합니다.",
      },
    },

    text: {
      headline: "의료 텍스트로 검색",
      badge: "해석적 분석 · 자연어",
      label: "의료 쿼리",
      langNote: "영어로",
      placeholder: "예: chest X-ray bilateral pneumonia...",
      back: "뒤로",
      searching: "분석 중...",
      error: "오류가 발생했습니다.",
      step1: "1. 의료 쿼리",
      step1Desc: "의료적 표현 · 영어",
      step2: "2. 결과 수 선택",
      step3: "결과",
      readyStep: "3. 검색 시작",
      pendingStep: "3. 분석 시작",
      emptyStep: "3. 검색 시작",
      readyTitle: "해석적 검색 시작",
      readyDescription: "영어로 의료 설명을 입력한 다음, 임상적으로 가장 일치하는 캡션을 가진 이미지를 검색합니다.",
      pendingTitle: "쿼리가 준비되었습니다",
      pendingDescription: "결과 수를 조정하고 '검색'을 클릭하여 가장 가까운 해석적 일치를 찾습니다.",
      modeInfoLabel: "해석적 분석 빠른 도움말 보기",
      legendEyebrow: "읽어보세요",
      legendTitle: "텍스트 기반 해석적 분석 이해",
      legendDescription: "여기서 검색은 이미지가 아닌 의료 설명에서 시작됩니다. MediScan은 영어 쿼리를 인덱싱된 임상 캡션과 매칭하여 단순한 시각적 외관뿐만 아니라 의료적 의미가 가까운 사례를 찾습니다.",
      legend: {
        interpretive: {
          label: "해석적 분석",
          title: "의료적 의미로 검색",
          description: "텍스트 쿼리는 의료적 의미가 가까운 사례를 찾기 위해 단어를 캡션 및 관련 임상 개념과 비교합니다.",
          note: "가설, 진단, 방사선 소견 또는 정확한 임상적 표현에서 시작할 때 사용합니다.",
        },
        writing: {
          label: "표현 방식",
          title: "유용한 방식으로 사례 설명",
          description: "영어로 짧고 구조화된 표현을 우선시합니다: 모달리티, 해부학적 영역, 주요 소견, 유용한 임상적 맥락. 예: chest X-ray with bilateral lower lobe opacities.",
          note: "너무 모호한 쿼리는 결과를 크게 확장합니다; 너무 긴 쿼리는 종종 중요한 신호를 희석합니다.",
        },
      },
      quickNoteEyebrow: "읽어보세요",
      quickNoteTitle: "텍스트 기반 검색",
      quickNoteDescription: "영어로 관찰 내용을 설명하여 의미적 인덱스를 조회합니다.",
      quickNoteChip: "해석적 분석",
      quickNoteBody: "간결한 의료적 표현을 사용하여 유사한 소견이나 병리를 나타내는 캡션을 가진 이미지를 찾습니다.",
      quickNoteExample: "예: chest X-ray bilateral pneumonia",
    },
    conclusion: {
      title: "AI 합성",
      copy: "복사",
      collapse: "접기",
      expand: "펼치기",
      disclaimer: "검색 요약만. 의료적 판단이나 진단을 대체하지 않습니다.",
      generate: "합성 생성",
      loading: "합성 생성 중...",
      regenerate: "재생성",
      error: "현재 합성을 생성할 수 없습니다.",
      noResults: "합성을 요청하기 전에 검색을 실행하세요.",
    },
    filters: {
      title: "필터",
      refineHint: "페이지를 벗어나지 않고 텍스트 검색의 표시 결과를 좁힙니다.",
      infoLabel: "텍스트 검색 필터 도움말 보기",
      reset: "초기화",
      minScore: "최소 점수",
      caption: "캡션",
      captionPlaceholder: "캡션으로 필터...",
      quickTerms: "제안 단어",
      quickTermsHint: "클릭하여 좁히기",
      cui: "CUI 코드",
      cuiPlaceholder: "예: C0018799",
      cuiPresence: "CUI 존재",
      all: "모두",
      withCui: "CUI 있음",
      withoutCui: "CUI 없음",
      cuiTypesTitle: "CUI 유형 필터",
      cuiModalite: "모달리티",
      cuiAnatomie: "해부학",
      cuiFinding: "병리 / 소견",
      cuiTypeAll: "모두",
      sort: "정렬",
      sortDesc: "점수 ↓",
      sortAsc: "점수 ↑",
      reference: "이미지 참조",
      referencePlaceholder: "예: ROCO_000123",
      referenceHint: "ID에서 특정 이미지를 찾습니다.",
      guide: {
        eyebrow: "필터 도움말",
        title: "텍스트 검색 결과 좁히기",
        description: "필터는 이미 찾은 목록에 작용합니다. 검색을 다시 실행하지 않고 표시를 좁힙니다.",
        caption: {
          label: "캡션, CUI 및 참조",
          title: "텍스트 결과에서 사례 유형 찾기",
          description: "캡션 필터는 이미 검색된 설명에서 검색합니다. CUI 필터는 모달리티, 해부학, 병리로 추가로 좁히며, 참조를 통해 특정 ID를 찾을 수 있습니다.",
          note: "광범위한 쿼리에서 더 좁혀진 선택으로 이동하는 데 편리합니다.",
        },
        score: {
          label: "점수 및 정렬",
          title: "텍스트와 가장 가까운 일치 유지",
          description: "최소 점수는 설명에서 가장 멀리 있는 결과를 제거합니다. 점수↓는 최상의 결과를 상단에 표시; 점수↑는 더 한계적인 사례를 표시합니다.",
          note: "더 엄격한 목록을 원하면 임계값을 올립니다.",
        },
        order: {
          label: "조합",
          title: "더 좁혀진 읽기 구축",
          description: "가장 효과적인 것은 여러 필터를 결합하여 유용한 하위 집합을 빠르게 분리하는 것입니다.",
          note: "예: 캡션 키워드 + 최소 점수 + 해부학.",
        },
      },
      compare: "비교",
      compareOn: "✓ 비교 활성",
      export: "내보내기",
    },
    results: {
      visualMode: "시각적 분석",
      semanticMode: "해석적 분석",
      textMode: "텍스트 검색",
      relaunchImage: "이 이미지에서 검색",
      compareAction: "비교",
      closeCompare: "비교 닫기",
      compareTitle: "비교",
      queryImageLabel: "쿼리 이미지",
      selectedImageLabel: "해당 결과",
      resultMetadataHint: "아래 정보는 선택된 결과에 해당합니다.",
      resultCaptionLabel: "결과 캡션",
      resultScoreLabel: "결과 점수",
      resultCuiLabel: "결과 CUI 코드",
      openDetails: "큰 이미지 보기",
      closeDetails: "세부 정보 창 닫기",
      downloadImage: "이미지 다운로드",
      detailsTitle: "결과 세부 정보",
      paginationLabel: "결과 페이지네이션",
      pageLabel: "페이지",
      previousPage: "이전",
      nextPage: "다음",
      captionLabel: "전체 캡션",
      scoreLabel: "점수",
      rawScoreLabel: "원시 점수",
      rankLabel: "순위",
      identifierLabel: "참조",
      cuiLabel: "CUI 코드",
      noCaption: "이 이미지에 사용 가능한 캡션이 없습니다.",
      notAvailable: "사용 불가",
      resultsFoundSingular: "개의 결과가 발견되었습니다",
      resultsFoundPlural: "개의 결과가 발견되었습니다",
      selectedCount: "개의 이미지가 선택되었습니다",
      selectedImageSingular: "개의 이미지가 선택되었습니다",
      selectedImagePlural: "개의 이미지가 선택되었습니다",
      selectionPanelTitle: "다중 선택 재검색",
      selectionHelpLabel: "다중 선택 재검색 도움말 보기",
      selectionSummaryEmpty: "선택된 이미지 없음",
      selectionHint: "하나 이상의 결과 카드에 체크하여 소그룹 이미지에서 새 검색을 구성합니다.",
      selectionReadySingle: "선택은 하나의 참조 이미지에서 검색을 재실행할 준비가 되었습니다.",
      selectionReadyPlural: "선택은 여러 참조 이미지에서 검색을 재실행할 준비가 되었습니다.",
      removeSelectedImage: "선택에서 이 이미지 제거",
      selectionExpand: "다중 선택 재검색 펼치기",
      selectionCollapse: "다중 선택 재검색 접기",
      clearSelection: "선택 지우기",
      relaunchSelection: "선택에서 검색",
      selectionSearchSingle: "이미지에서 검색",
      selectionSearchPlural: "이미지에서 검색",
    },
  },

  // Contact Page
  contact: {
    headline: "문의하기",
    description: "질문, 버그 보고, 또는 인사하고 싶으신가요? 모든 메시지를 읽습니다.",
    supportLabel: "지원",
    supportDesc: "MediScan에 관한 기술적 질문이나 피드백.",
    supportAddr: "mediscanaisupport@gmail.com",
    responseLabel: "응답 시간",
    responseDesc: "24시간 내 응답 (영업일 기준)",
    sentTitle: "메시지 전송됨",
    sentDesc: "메시지가 MEDISCAN 팀에 전달되었습니다. 곧 연락드리겠습니다.",
    sentAnother: "다른 메시지 보내기",
    formName: "이름",
    formEmail: "이메일",
    formSubject: "제목",
    formSubjectPlaceholder: "무엇에 관한 건가요?",
    formMessage: "메시지",
    formPlaceholder1: "이름",
    formPlaceholder2: "your@email.com",
    formPlaceholder4: "어떻게 도와드릴까요?",
    formSubmit: "보내기",
    formSending: "전송 중...",
    formPrivacy: "귀하의 정보는 절대 공유되지 않습니다.",
    errorGeneric: "현재 메시지를 보낼 수 없습니다. 나중에 다시 시도해 주세요.",
  },

  // About Page
  about: {
    headline: "MEDISCAN AI 소개",
    eyebrow: "대학 프로토타입",
    description:
      "유사성 검색을 통한 의료 이미지 해석을 지원하기 위해 컴퓨터 비전, 벡터 검색, 언어 모델을 결합한 대학 프로젝트.",
    missionVision: "미션 & 비전",
    mission: {
      title: "우리의 미션",
      image: "/mission.png",
      image_d: "/mission_d.png",
      text: "의료 전문가가 시각적 또는 의미적 유사성으로 의료 이미지 아카이브를 검색하고, 빠르고 맥락화된 AI 지원 해석을 얻을 수 있도록 합니다.",
    },
    vision: {
      title: "우리의 목표",
      image: "/goal.png",
      image_d: "/goal_d.png",
      text: "의료 데이터의 개인 정보를 존중하고 새로운 데이터로 지속적으로 개선되는 AI 기반 진단 지원 도구를 향한 첫 번째 단계를 구축합니다.",
    },
    architecture: {
      title: "작동 방식",
      cards: [
        {
          image: "/vector.png",
          image_d: "/vector_d.png",
          title: "벡터 인코딩",
          text: "두 가지 모드: 구조적 유사성을 위한 시각적(DINOv2)과 의료적 의미를 위한 의미적(BioMedCLIP). 각 이미지는 다차원 벡터로 변환됩니다.",
        },
        {
          image: "/faiss_about.png",
          image_d: "/faiss_about_d.png",
          title: "FAISS 유사성 검색",
          text: "유사도 점수, 캡션, 파일 참조를 가진 k개의 가장 가까운 이미지를 검색하는 고성능 벡터 엔진.",
        },
        {
          image: "/llm.png",
          image_d: "/llm_d.png",
          title: "LLM 해석",
          text: "일치하는 결과의 캡션이 언어 모델(Groq + LLaMA)에 전송되어 신뢰 수준과 권장 사항이 포함된 합성 의료 결론을 생성합니다.",
        },
        {
          image: "/export.png",
          image_d: "/export_d.png",
          title: "내보내기",
          text: "이후 분석 또는 보고를 위해 이미지와 함께 JSON, CSV 또는 PDF로 결과를 내보낼 수 있습니다.",
        },
      ],
    },
    pipeline: {
      title: "처리 파이프라인",
      steps: [
        { title: "이미지 업로드", desc: "사용자가 React 인터페이스를 통해 의료 이미지를 전송합니다." },
        { title: "벡터화", desc: "이미지가 수치 벡터로 변환됩니다 (시각적 또는 의미적 모드)." },
        { title: "유사성 검색", desc: "FAISS가 벡터를 인덱싱된 데이터베이스와 비교 → 상위 k 결과." },
        { title: "표시 및 필터링", desc: "점수별 정렬, 필터링, 텍스트 검색이 있는 인터랙티브 이미지 그리드." },
        { title: "AI 분석", desc: "결과 캡션이 Groq + LLaMA에 전송되어 합성 의료 결론을 생성합니다." },
        { title: "내보내기", desc: "이미지와 함께 JSON, CSV 또는 PDF로 결과 다운로드." },
      ],
    },
    stack: {
      title: "기술 스택",
      items: ["React", "FastAPI", "FAISS", "DINOv2", "BioMedCLIP", "Groq", "LLaMA", "Python", "NumPy"],
    },
    team: {
      title: "팀",
      members: [
        { name: "Taouache Rayane", color: "semantic", photo: "/photo-rayane.jpeg", github: "https://github.com/RayaneWebDev" },
        { name: "Ozan Taskin",     color: "visual",   photo: "/photo-ozan.jpeg",   github: "https://github.com/OzanTaskin" },
        { name: "Ales Ferhani",    color: "semantic", photo: "/photo-ales.jpeg",   github: "https://github.com/ales-frhn" },
        { name: "Maxime Huang",    color: "visual",   photo: "/photo-maxime.jpeg", github: "https://github.com/Somixe" },
      ],
    },
    disclaimer: {
      note: "참고:",
      text: "이 시스템은 자격을 갖춘 의료 전문가를 위한 지원 도구입니다. 임상적 판단을 대체하지 않으며 인증된 의료 기기가 아닙니다.",
    },
  },

  // How It Works
  howItWorks: {
    headline: "MEDISCAN AI 작동 방식",
    description: "시각적 및 의미적 임베딩으로 구동되는 의료 이미지 검색.",
    pipeline: {
      title: "검색 파이프라인",
      steps: [
        { label: "해석적 이미지", icon: "📋" },
        { label: "AI 분석", icon: "⚙️" },
        { label: "특징 추출", icon: "📊" },
        { label: "해석적 인덱스", icon: "🗄️" },
        { label: "최상의 결과", icon: "✅" },
      ],
    },
    modes: {
      title: "두 가지 보완적인 분석 접근 방식",
      visual: {
        name: "시각적 분석",
        model: "고급 시각적 인코딩",
        desc: "시각적 구조, 패턴, 형태학적 특징을 분석합니다.",
        steps: [
          {
            title: "시각적 특징 추출",
            desc: "딥러닝 모델이 중요한 시각적 패턴을 추출합니다.",
          },
          {
            title: "해석적 컨텍스트 통합",
            desc: "인덱싱된 데이터셋의 특징과 시각적 특징을 비교합니다.",
          },
          {
            title: "유사도 점수화",
            desc: "시각적 및 구조적 유사성으로 이미지를 순위화합니다.",
          },
          {
            title: "결과 순위화",
            desc: "해부학적으로나 시각적으로 유사한 사례를 반환합니다.",
          },
        ],
      },
      semantic: {
        name: "해석적 분석",
        model: "생의학 언어 모델",
        desc: "생의학적 임베딩 공간에서 이미지 캡션과 텍스트 쿼리를 정렬합니다.",
        steps: [
          {
            title: "생의학적 인코딩",
            desc: "프로젝트에 구성된 생의학 모델에 의해 임베딩이 생성됩니다.",
          },
          {
            title: "해석적 추론",
            desc: "캡션과 텍스트 쿼리에서 표현되는 의미적 관계를 포착합니다.",
          },
          {
            title: "증거 정렬",
            desc: "공유 임베딩 공간에서 의미적 유사성으로 사례를 연관시킵니다.",
          },
          {
            title: "신뢰도 점수화",
            desc: "각 결과에는 교정된 의료적 신뢰도가 아닌 유사도 점수가 포함됩니다.",
          },
        ],
      },
    },
    when: {
      title: "올바른 분석 모드 선택",
      visual: {
        title: "시각적 분석 사용 시기:",
        cases: [
          "해부학적으로 유사한 사례가 필요한 경우",
          "같은 모달리티에서 이미지 비교",
          "구조적 패턴이나 형태학적 특징을 찾고 있는 경우",
        ],
      },
      semantic: {
        title: "해석적 분석 사용 시기:",
        cases: [
          "특정 진단이나 상태를 찾고 있는 경우",
          "이미지가 다른 모달리티나 출처에서 나온 경우",
          "외관보다 임상적 의미가 더 중요한 경우",
        ],
      },
    },
  },

  // FAQ
  faq: {
    headline: "자주 묻는 질문",
    description: "현재 프로토타입, 범위 및 제한에 관한 답변을 찾습니다.",
    categories: {
      general: "일반",
      technical: "기술",
      security: "보안"
    },
    items: [
      // --- 일반 ---
      {
        category: "general",
        q: "MEDISCAN AI의 주요 목적은 무엇인가요?",
        r: "MEDISCAN AI는 의료 이미지 검색을 위한 대학 프로토타입입니다. 임상 의사 결정 시스템을 구성하지 않고 데이터셋 내의 시각적 또는 의미적으로 유사한 사례를 탐색할 수 있습니다."
      },
      {
        category: "general",
        q: "누가 플랫폼을 사용할 수 있나요?",
        r: "현재 버전은 주로 데모, 학생 프로젝트, 기술적 탐색, 의료 이미지 검색에 관한 연구 프로토타입에 적합합니다."
      },
      {
        category: "general",
        q: "이것이 진단 도구인가요?",
        r: "아니요. 이것은 탐색 목적으로만 유사한 사례와 선택적 AI 합성을 반환하는 비임상 프로토타입입니다."
      },
      {
        category: "general",
        q: "어떤 데이터셋이 사용되나요?",
        r: "프로토타입은 ROCO v2를 사용합니다. 이것은 유사성 검색 실험을 위해 필터링되고 주석이 달린 의료 이미지(X선, CT 스캔, MRI)의 공개 데이터셋입니다. 데이터베이스에는 Hugging Face에서 저장 및 제공되는 약 60,000개의 이미지가 포함되어 있습니다.",
        link: {
          label: "ROCO v2에 대해 자세히 알아보기",
          url: "https://huggingface.co/datasets/eltorio/ROCO-radiology"
        }
      },
      {
        category: "general",
        q: "프로젝트는 오픈 소스인가요?",
        r: "네, 소스 코드는 GitHub에서 사용 가능합니다. 프로젝트는 대학 환경에서 개발되었습니다.",
        link: {
          label: "GitHub에서 보기",
          url: "https://github.com/OzanTaskin/mediscan-cbir"
        }
      },

      // --- 기술 ---
      {
        category: "technical",
        q: "'시각적' 검색과 '해석적' 검색의 차이점은 무엇인가요?",
        r: "시각적 검색은 이미지의 구조적 유사성에 초점을 맞춥니다. 해석적 검색은 의미 공간을 사용하여 캡션이 가까운 의미를 표현하는 사례를 찾습니다."
      },
      {
        category: "technical",
        q: "시각적 검색에는 어떤 AI 모델이 사용되나요?",
        r: "시각적 검색은 DINOv2(Meta AI)를 사용합니다. 이것은 1억 4,200만 개의 이미지로 훈련된 자기 지도 비전 트랜스포머입니다. 파인튜닝 없이 시각적 유사성을 위한 고품질 임베딩을 생성합니다.",
        link: { label: "DINOv2에 대해 자세히 알아보기", url: "https://ai.meta.com/blog/dino-v2-computer-vision-self-supervised-learning/" }
      },
      {
        category: "technical",
        q: "의미적 및 텍스트-이미지 검색에는 어떤 AI 모델이 사용되나요?",
        r: "해석적 검색은 BiomedCLIP(Microsoft Research)을 사용합니다. 이것은 PubMed Central에서 얻은 1,500만 개의 의료 이미지-텍스트 쌍으로 훈련된 모델입니다. 방사선 이미지를 위한 풍부한 의미적 표현을 제공합니다.",
        link: { label: "BiomedCLIP에 대해 자세히 알아보기", url: "https://www.microsoft.com/en-us/research/publication/biomedclip-a-multimodal-biomedical-foundation-model-pretrained-from-fifteen-million-scientific-image-text-pairs/" }
      },
      {
        category: "technical",
        q: "기존 PACS/DICOM 시스템과 통합되나요?",
        r: "현재 버전에서는 통합되지 않습니다. 프로토타입은 간단한 REST API를 노출하고 JPEG/PNG 입력으로 작동하지만 PACS/DICOM을 기본적으로 통합하지 않습니다."
      },
      {
        category: "technical",
        q: "어떤 이미지 모달리티가 지원되나요?",
        r: "프로토타입은 연구 데이터셋에 의존하고 인터페이스를 통해 JPEG/PNG 업로드를 허용합니다. DICOM 수집과 전체 모달리티 커버리지는 여기에 구현되지 않았습니다."
      },

      // --- 보안 ---
      {
        category: "security",
        q: "플랫폼은 GDPR 및 HIPAA를 준수하나요?",
        r: "기본적으로 준수하지 않습니다. 준수는 프로젝트가 어떻게 배포, 호스팅, 보안, 관리되는지에 따라 다릅니다. 이 저장소는 비임상 프로토타입으로 간주되어야 합니다."
      },
      {
        category: "security",
        q: "의료 데이터는 어디에 저장되나요?",
        r: "전송된 파일은 검색을 위해 백엔드에서 처리되며, 결과 이미지는 Hugging Face에서 호스팅되는 공개 데이터셋에서 나옵니다. MongoDB 강화는 선택 사항이며 환경에 따라 다릅니다."
      },
      {
        category: "security",
        q: "데이터는 어떻게 암호화되나요?",
        r: "암호화는 배포에 따라 다릅니다. 로컬 개발 환경만으로는 TLS, 암호화된 스토리지 또는 준수 호스팅을 보장하지 않습니다."
      },
      {
        category: "security",
        q: "데이터셋에 환자 데이터가 포함되어 있나요?",
        r: "아니요. 이미지 데이터셋에는 직접 식별 가능한 데이터가 없습니다."
      },
    ],
    contactTitle: "더 궁금한 점이 있으신가요?",
    contactBtn: "팀에 문의하기"
  },
};