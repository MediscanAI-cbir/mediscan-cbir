export const fr = {
  // Navigation
  nav: {
    home: "Accueil",
    scan: "Scanner & Chercher",
    features: "Fonctionnalités",
    contact: "Contact",
    startFree: "Scanner & Chercher",
  },

  // Home Page
  home: {
    badge: "Analyse Médicale par IA",
    headline: "Réduire l'incertitude. Accélérer le diagnostic.",
    description: "Déverrouiller les archives visuelles de la médecine avec MediScan AI. Rechercher par contenu, trouver des cas similaires instantanément, et élever la précision clinique.",
    cta1: "Scanner & Chercher",
    cta2: "En Savoir Plus",
    trust: "Conforme HIPAA · Aucune Inscription Requise · Résultats Instantanés",

    stats: {
      title1: "Cas Consultables",
      value1: "100K+",
      title2: "Temps de Recherche",
      value2: "< 2s",
      title3: "Précision Diagnostique",
      value3: "95%+",
      title4: "Support Clinique",
      value4: "24/7",
    },

    whyChoose: {
      headline: "Pourquoi MEDISCAN AI",
      description: "Une plateforme intégrée d’intelligence en imagerie conçue pour optimiser les workflows cliniques, renforcer la précision diagnostique des radiologues et anatomopathologistes, et accélérer la recherche médicale à grande échelle grâce à l’identification automatisée de cohortes.",
      features: [
        {
          icon: "route",
          title: "Flux de Travail Rapide et Intuitif",
          desc: "Ajoutez une image, choisissez un mode de recherche et explorez des cas similaires.",
        },
        {
          icon: "between-horizontal-start",
          title: "Explorer Sous Différents Angles",
          desc: "Utilisez un mode pour trouver des images visuellement proches, et un autre pour découvrir des cas médicaux apparentés.",
        },
        {
          icon: "brain",
          title: "Support Multi-Modalités",
          desc: "Permet la recherche sur différents types d’images radiologiques au sein d’un système structuré unique.",
        },
        {
          icon: "user-key",
          title: "Vos Images Restent Privées",
          desc: "Les images de recherche ne sont pas stockées de manière permanente et sont utilisées uniquement pendant la requête.",
        },
        {
          icon: "hard-drive",
          title: "Aucun Matériel Spécialisé Requis",
          desc: "Fonctionne sans matériel spécialisé, ce qui rend la plateforme plus accessible et plus simple à utiliser.",
        },
        {
          icon: "blocks",
          title: "Intégration Transparente",
          desc: "Fonctionne avec votre PACS, EMR et infrastructure hospitalière. Conception API-first.",
        },
      ],
    },

    howWorks: {
      headline: "Comment Ça Marche",
      description: "Trois étapes intuitives pour déverrouiller votre archive d'images médicales.",
      steps: [
        {
          num: "1",
          title: "Télécharger",
          desc: "Sélectionnez une image médicale de votre archive ou téléchargez un nouveau cas.",
        },
        {
          num: "2",
          title: "Analyser",
          desc: "MediScan AI analyse les caractéristiques visuelles et cliniques instantanément.",
        },
        {
          num: "3",
          title: "Découvrir",
          desc: "Recevez les résultats classés avec scores de confiance et métadonnées cliniques.",
        },
      ],
    },

    modes: {
      headline: "Deux Modes d'Analyse Intelligents",
      description: "Choisissez l'approche qui correspond à votre question clinique.",
      visual: {
        title: "Analyse Visuelle",
        desc: "Trouvez les images avec des structures anatomiques et des caractéristiques visuelles similaires.",
        use: "Utiliser quand : Anatomie comparative, correspondance morphologique, similarité structurelle.",
      },
      semantic: {
        title: "Analyse Clinique",
        desc: "Découvrez les cas avec pathologie et signification clinique comparables.",
        use: "Utiliser quand : Découverte de maladie, raisonnement diagnostique, sélection basée sur les preuves.",
      },
    },

    useCases: {
      headline: "Conçu pour les Professionnels de Santé",
      roles: [
        {
          icon: "stethoscope",
          title: "Radiologues",
          desc: "Trouvez instantanément des cas antérieurs. Renforcez la confiance diagnostique grâce aux données historiques.",
        },
        {
          icon: "microscope",
          title: "Anatomopathologistes",
          desc: "Explorez des spécimens et des échantillons tissulaires comparables dans votre référentiel.",
        },
        {
          icon: "hospital",
          title: "Systèmes Hospitaliers",
          desc: "Réduisez les examens d’imagerie redondants. Améliorez l’efficacité clinique et les résultats.",
        },
        {
          icon: "search",
          title: "Centres de Recherche",
          desc: "Accélérez les études en identifiant rapidement les cohortes de patients pertinentes.",
        },
      ],
    },

    features: {
      headline: "Fonctionnalités Puissantes",
      list: [
        { title: "Vitesse Éclair", desc: "Latence inférieure à la seconde sur des millions d'images" },
        { title: "Intelligence Clinique", desc: "IA entraînée sur des ensembles de données médicales annotées" },
        { title: "Multi-Modal", desc: "Tous les types et modalités d'imagerie supportés" },
        { title: "Sécurisé", desc: "Sécurité et conformité de classe entreprise" },
        { title: "Analyse", desc: "Suivre les modèles d'utilisation et les résultats cliniques" },
        { title: "Accès API", desc: "Intégrer directement dans vos flux de travail" },
      ],
    },

    footer: {
      tagline: "Déverrouiller le potentiel diagnostique de votre archive d'images médicales.",
      compliance: "Conforme HIPAA · Sécurité Entreprise · ISO 27001 Certifié",
    },
  },

  // Search Page
  search: {
    headline: "Scanner & Chercher des Images Médicales",
    description: "Téléchargez une image médicale et découvrez les cas similaires instantanément.",
    step1: "1. Télécharger l'Image",
    step1Desc: "Format JPEG ou PNG",
    step2: "2. Choisir le Mode d'Analyse",
    step3: "3. Voir les Résultats",
    searching: "Analyse de votre image...",
    error: "Erreur de connexion au serveur.",
    modeVisual: "Analyse Visuelle",
    modeSemantic: "Analyse Clinique",
    numResults: "Résultats",
    search: "Chercher",
    howWorks: "Deux Modes d'Analyse",
    visual: {
      name: "Analyse Visuelle",
      icon: "search",
      desc: "Trouvez les images avec une apparence et une structure visuelles similaires.",
      use: "Utiliser quand : Chercher des cas anatomiquement similaires",
    },
    semantic: {
      name: "Analyse Clinique",
      icon: "hospital",
      desc: "Trouvez les cas avec une signification clinique et une pathologie similaires.",
      use: "Utiliser quand : Chercher des maladies ou conditions cliniques spécifiques",
    },
    highlights: {
      title1: "Résultats Instantanés",
      desc1: "< 1 seconde de temps de recherche",
      title2: "Cliniquement Pertinent",
      desc2: "IA entraînée sur des ensembles de données médicales",
      title3: "Complètement Gratuit",
      desc3: "Aucune inscription, aucune limite",
    },
    footer: "Conforme HIPAA · Vos données restent privées · Aucune publicité",
  },

  // Features Page
  features: {
    headline: "Fonctionnalités Puissantes",
    description: "Tout ce qu’il faut pour l’analyse et l’exploration d’images de grade clinique.",
    items: [
      {
        title: "Recherche en Moins d’une Seconde",
        desc: "Interrogez des millions d’images en moins d’une seconde. Optimisé pour les workflows cliniques.",
        features: ["Latence sub-milliseconde", "Indexation distribuée", "Mises à jour en temps réel"],
      },
      {
        title: "Support Multi-Modalités",
        desc: "Fonctionne sur tous les principaux types d’imagerie — TDM, IRM, radiographie, échographie, anatomopathologie.",
        features: ["10+ modalités d’imagerie", "Recherche intermodalités", "Agnostique au format"],
      },
      {
        title: "Validation Clinique",
        desc: "IA entraînée sur plus de 100K images médicales annotées cliniquement issues d’ensembles de données évalués par les pairs.",
        features: ["Modèles IA biomédicaux", "Scores de confiance cliniques", "Étayé par des preuves"],
      },
      {
        title: "Sécurité Entreprise",
        desc: "Conforme HIPAA. Déploiement sur site ou dans le cloud. Vos données restent sous votre contrôle.",
        features: ["Conformité HIPAA", "Chiffrement de bout en bout", "Journalisation d’audit"],
      },
      {
        title: "Intégration PACS & EMR",
        desc: "Intégration fluide avec l’infrastructure hospitalière existante. Sans disruption.",
        features: ["Support DICOM", "API REST", "Flux de travail personnalisés"],
      },
      {
        title: "Analyses Avancées",
        desc: "Suivez l’utilisation, mesurez l’impact et tirez des enseignements des schémas de recherche.",
        features: ["Analyses de recherche", "Métriques de résultats", "Tableaux de bord d’utilisation"],
      },
    ],
  },

  // Contact Page
  contact: {
    headline: "Nous Contacter",
    description: "Vous avez des questions ? Notre équipe clinique et technique est là pour vous aider.",
    email: "Email",
    sales: "Ventes",
    support: "Support",
    emailAddr: "hello@mediscan.ai",
    salesAddr: "sales@mediscan.ai",
    supportAddr: "support@mediscan.ai",
    responses: "Temps de Réponse",
    resp1: "Demande générale : Dans les 24 heures",
    resp2: "Demande de démo : Dans les 2 heures",
    resp3: "Support technique : Réponse prioritaire",
    formName: "Nom Complet",
    formEmail: "Email",
    formOrg: "Hôpital / Organisation",
    formMessage: "Message",
    formPlaceholder1: "Dr. Sarah Johnson",
    formPlaceholder2: "sarah@hospital.com",
    formPlaceholder3: "Nom du Centre Médical",
    formPlaceholder4: "Parlez-nous de vos besoins...",
    formSubmit: "Envoyer le Message",
    formPrivacy: "Nous respectons votre confidentialité. Vos informations ne seront jamais partagées.",
  },

  // How It Works
  howItWorks: {
    headline: "Comment Fonctionne MediScan AI",
    description: "Recherche d'images cliniques alimentée par l'IA avancée et le raisonnement clinique.",
    pipeline: {
      title: "Le Pipeline de Recherche",
      steps: [
        { label: "Image Clinique", icon: "📋" },
        { label: "Analyse IA", icon: "⚙️" },
        { label: "Extraction de Caractéristiques", icon: "📊" },
        { label: "Index Clinique", icon: "🗄️" },
        { label: "Meilleurs Résultats", icon: "✅" },
      ],
    },
    modes: {
      title: "Deux Approches d'Analyse Complémentaires",
      visual: {
        name: "Analyse Visuelle",
        model: "Codage Visuel Avancé",
        desc: "Analyse les structures visuelles, les motifs et les caractéristiques morphologiques.",
        steps: [
          {
            title: "Extraction de Caractéristiques Visuelles",
            desc: "Les modèles d'apprentissage profond extraient les motifs visuels significatifs.",
          },
          {
            title: "Intégration du Contexte Clinique",
            desc: "Combine les caractéristiques visuelles avec les connaissances anatomiques et cliniques.",
          },
          {
            title: "Notation de Similarité",
            desc: "Classe les images par similarité visuelle et structurelle.",
          },
          {
            title: "Classement des Résultats",
            desc: "Retourne les cas anatomiquement et visuellement similaires.",
          },
        ],
      },
      semantic: {
        name: "Analyse Clinique",
        model: "Modèle de Langage Biomédical",
        desc: "Comprend le contexte clinique, la pathologie et la signification diagnostique.",
        steps: [
          {
            title: "Codage Biomédical",
            desc: "Modèles entraînés sur 100K+ images médicales annotées cliniquement.",
          },
          {
            title: "Raisonnement Clinique",
            desc: "Reconnaît les maladies, conditions et motifs cliniques.",
          },
          {
            title: "Alignement des Preuves",
            desc: "Associe les cas en fonction de la similarité clinique et de la valeur diagnostique.",
          },
          {
            title: "Notation de Confiance",
            desc: "Chaque résultat inclut la confiance clinique basée sur les données d'entraînement.",
          },
        ],
      },
    },
    when: {
      title: "Choisir le Bon Mode d'Analyse",
      visual: {
        title: "Utiliser l'Analyse Visuelle quand :",
        cases: [
          "Vous avez besoin de cas anatomiquement similaires",
          "Comparer l'imagerie dans la même modalité",
          "Vous cherchez des motifs structurels ou des caractéristiques morphologiques",
        ],
      },
      semantic: {
        title: "Utiliser l'Analyse Clinique quand :",
        cases: [
          "Vous recherchez un diagnostic ou une condition spécifique",
          "Les images proviennent de modalités ou de sources différentes",
          "La signification clinique compte plus que l'apparence",
        ],
      },
    },
  },
};
