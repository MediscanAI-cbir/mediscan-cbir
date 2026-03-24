export const en = {
  // Navigation
  nav: {
    home: "Home",
    scan: "Scan & Search",
    features: "Features",
    contact: "Contact",
    startFree: "Scan & Search",
  },

  // Home Page
  home: {
    badge: "Clinical AI Analysis",
    headline: "Reduce Uncertainty. Accelerate Diagnosis.",
    description: "Unlocking the visual archives of medicine with MediScan AI. Search by content, find similar cases instantly, and elevate clinical precision.",
    cta1: "Scan & Search",
    cta2: "Learn More",
    trust: "HIPAA Compliant · No Signup Required · Instant Results",

    stats: {
      title1: "Cases Searchable",
      value1: "100K+",
      title2: "Average Search Time",
      value2: "< 2s",
      title3: "Diagnostic Accuracy",
      value3: "95%+",
      title4: "Clinical Support",
      value4: "24/7",
    },

    whyChoose: {
      headline: "Why MEDISCAN AI",
      description: "An integrated imaging intelligence platform designed to optimize clinical workflows, enhance diagnostic precision for radiologists and pathologists, and accelerate large-scale medical research through automated cohort identification.",
      features: [
        {
          icon: "route",
          title: "Fast, Intuitive Workflow",
          desc: "Add an image, select a search mode, and explore similar cases",
        },
        {
          icon: "between-horizontal-start",
          title: "Explore from Different Angles",
          desc: "Use one search mode to find images that look similar, and another to uncover related medical cases.",
        },
        {
          icon: "brain",
          title: "Multi-Modality Support",
          desc: "Enables retrieval across varied radiology image types within a single structured system.",
        },
        {
          icon: "user-key",
          title: "Your Images Stay Private",
          desc: "Search images are not stored permanently and are used only during the query process.",
        },
        {
          icon: "hard-drive",
          title: "No Special Hardware Needed",
          desc: "Runs without specialized hardware, making the platform easier to access and use.",
        },
        {
          icon: "blocks",
          title: "Seamless Integration",
          desc: "Works with your PACS, EMR, and hospital infrastructure. API-first design.",
        },
      ],
    },

    howWorks: {
      headline: "How It Works",
      description: "Three intuitive steps to unlock your medical image archive.",
      steps: [
        {
          num: "1",
          title: "Upload",
          desc: "Select a medical image from your archive or upload a new case.",
        },
        {
          num: "2",
          title: "Analyze",
          desc: "MediScan AI analyzes visual and clinical features instantly.",
        },
        {
          num: "3",
          title: "Discover",
          desc: "Receive ranked results with confidence scores and clinical metadata.",
        },
      ],
    },

    modes: {
      headline: "Two Intelligent Search Modes",
      description: "Choose the approach that matches your clinical question.",
      visual: {
        title: "Visual Analysis",
        desc: "Find images with similar anatomical structures and visual characteristics.",
        use: "Use when: Comparative anatomy, morphology matching, or structural similarity.",
      },
      semantic: {
        title: "Clinical Analysis",
        desc: "Discover cases with comparable pathology and clinical significance.",
        use: "Use when: Disease finding, diagnostic reasoning, or evidence-based case selection.",
      },
    },

    useCases: {
      headline: "Built for Healthcare Professionals",
      roles: [
        {
          icon: "stethoscope",
          title: "Radiologists",
          desc: "Find precedent cases instantly. Improve diagnostic confidence with historical data.",
        },
        {
          icon: "microscope",
          title: "Pathologists",
          desc: "Explore comparable specimens and tissue samples across your repository.",
        },
        {
          icon: "hospital",
          title: "Hospital Systems",
          desc: "Reduce redundant imaging studies. Improve clinical efficiency and outcomes.",
        },
        {
          icon: "search",
          title: "Research Centers",
          desc: "Accelerate studies by rapidly identifying relevant patient cohorts.",
        },
      ],
    },

    features: {
      headline: "Powerful Features",
      list: [
        { title: "Lightning Speed", desc: "Sub-second latency on millions of images" },
        { title: "Clinical Intelligence", desc: "AI trained on annotated medical datasets" },
        { title: "Multi-Modal", desc: "All imaging types and modalities supported" },
        { title: "Secure", desc: "Enterprise-grade security and compliance" },
        { title: "Analytics", desc: "Track usage patterns and clinical outcomes" },
        { title: "API Access", desc: "Integrate directly into your workflows" },
      ],
    },

    footer: {
      tagline: "Unlock the diagnostic potential of your medical image archive.",
      compliance: "HIPAA Compliant · Enterprise Secure · ISO 27001 Certified",
    },
  },

  // Search Page
  search: {
    headline: "Scan & Search Medical Images",
    description: "Upload a medical image and discover similar cases instantly.",
    step1: "1. Upload Image",
    step1Desc: "JPEG or PNG format",
    step2: "2. Choose Analysis Mode",
    step3: "3. View Results",
    searching: "Analyzing your image...",
    error: "Error connecting to server.",
    modeVisual: "Visual Analysis",
    modeSemantic: "Clinical Analysis",
    numResults: "Results",
    search: "Search",
    howWorks: "Two Analysis Modes",
    visual: {
      name: "Visual Analysis",
      icon: "search",
      desc: "Find images with similar visual appearance and structure.",
      use: "Use when: Looking for anatomically similar cases",
    },
    semantic: {
      name: "Clinical Analysis",
      icon: "hospital",
      desc: "Find cases with similar clinical significance and pathology.",
      use: "Use when: Looking for specific diseases or clinical conditions",
    },
    highlights: {
      title1: "Instant Results",
      desc1: "< 1 second search time",
      title2: "Clinically Relevant",
      desc2: "AI-trained on medical datasets",
      title3: "Completely Free",
      desc3: "No signup, no limits",
    },
    footer: "HIPAA Compliant · Your data stays private · No advertisements",
  },

  // Features Page
  features: {
    headline: "Powerful Features",
    description: "Everything needed for clinical-grade image analysis and discovery.",
    items: [
      {
        title: "Sub-Second Search",
        desc: "Query millions of images in under 1 second. Optimized for clinical workflows.",
        features: ["Sub-millisecond latency", "Distributed indexing", "Real-time updates"],
      },
      {
        title: "Multi-Modal Support",
        desc: "Works across all major imaging types—CT, MRI, X-Ray, Ultrasound, Pathology.",
        features: ["10+ imaging modalities", "Cross-modality search", "Format agnostic"],
      },
      {
        title: "Clinical Validation",
        desc: "AI trained on 100K+ clinically-annotated images from peer-reviewed datasets.",
        features: ["Biomedical AI models", "Clinical confidence scores", "Evidence-backed"],
      },
      {
        title: "Enterprise Security",
        desc: "HIPAA compliant. On-premise or cloud. Your data remains under your control.",
        features: ["HIPAA compliance", "End-to-end encryption", "Audit logging"],
      },
      {
        title: "PACS & EMR Integration",
        desc: "Seamless integration with existing hospital infrastructure. No disruption.",
        features: ["DICOM support", "REST API", "Custom workflows"],
      },
      {
        title: "Advanced Analytics",
        desc: "Track usage, measure impact, and extract insights from search patterns.",
        features: ["Search analytics", "Outcome metrics", "Usage dashboards"],
      },
    ],
  },

  // Contact Page
  contact: {
    headline: "Get in Touch",
    description: "Have questions? Our clinical and technical team is here to help.",
    email: "Email",
    sales: "Sales",
    support: "Support",
    emailAddr: "hello@mediscan.ai",
    salesAddr: "sales@mediscan.ai",
    supportAddr: "support@mediscan.ai",
    responses: "Response Times",
    resp1: "General inquiry: Within 24 hours",
    resp2: "Sales demo request: Within 2 hours",
    resp3: "Technical support: Priority response",
    formName: "Full Name",
    formEmail: "Email",
    formOrg: "Hospital / Organization",
    formMessage: "Message",
    formPlaceholder1: "Dr. Sarah Johnson",
    formPlaceholder2: "sarah@hospital.com",
    formPlaceholder3: "Medical Center Name",
    formPlaceholder4: "Tell us about your needs...",
    formSubmit: "Send Message",
    formPrivacy: "We respect your privacy. Your information will never be shared.",
  },

  // How It Works
  howItWorks: {
    headline: "How MediScan AI Works",
    description: "Clinical image search powered by advanced AI and clinical reasoning.",
    pipeline: {
      title: "The Search Pipeline",
      steps: [
        { label: "Clinical Image", icon: "📋" },
        { label: "AI Analysis", icon: "⚙️" },
        { label: "Feature Extraction", icon: "📊" },
        { label: "Clinical Index", icon: "🗄️" },
        { label: "Top Results", icon: "✅" },
      ],
    },
    modes: {
      title: "Two Complementary Analysis Approaches",
      visual: {
        name: "Visual Analysis",
        model: "Advanced Vision Encoding",
        desc: "Analyzes visual structures, patterns, and morphological features.",
        steps: [
          {
            title: "Visual Feature Extraction",
            desc: "Deep learning models extract meaningful visual patterns from the image.",
          },
          {
            title: "Clinical Context Integration",
            desc: "Combines visual features with anatomical and clinical knowledge.",
          },
          {
            title: "Similarity Scoring",
            desc: "Ranks images by visual and structural similarity.",
          },
          {
            title: "Result Ranking",
            desc: "Returns anatomically and visually similar cases.",
          },
        ],
      },
      semantic: {
        name: "Clinical Analysis",
        model: "Biomedical Language Model",
        desc: "Understands clinical context, pathology, and diagnostic significance.",
        steps: [
          {
            title: "Biomedical Encoding",
            desc: "Models trained on 100K+ clinically-annotated medical images.",
          },
          {
            title: "Clinical Reasoning",
            desc: "Recognizes diseases, conditions, and clinical patterns.",
          },
          {
            title: "Evidence Alignment",
            desc: "Matches cases based on clinical similarity and diagnostic value.",
          },
          {
            title: "Confidence Scoring",
            desc: "Each result includes clinical confidence based on training data.",
          },
        ],
      },
    },
    when: {
      title: "Choosing the Right Analysis Mode",
      visual: {
        title: "Use Visual Analysis when:",
        cases: [
          "You need anatomically similar cases",
          "Comparing imaging within the same modality",
          "Looking for structural patterns or morphological features",
        ],
      },
      semantic: {
        title: "Use Clinical Analysis when:",
        cases: [
          "You're searching for a specific diagnosis or condition",
          "Images come from different modalities or sources",
          "Clinical significance matters more than appearance",
        ],
      },
    },
  },
};
