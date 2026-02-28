export type ServiceIcon =
  | "car"
  | "motorbike"
  | "moped"
  | "users"
  | "alert"
  | "brain"
  | "book"
  | "steering-wheel"
  | "world";

export interface ServiceDetail {
  slug: string;
  category: "license" | "course" | "special";
  name: string;
  shortDescription: string;
  icon: ServiceIcon;
  highlight?: boolean;

  // Detail page content
  heroTitle: string;
  heroSubtitle: string;
  overview: string;

  requirements: {
    minAge: string;
    minAgeShort?: string;
    documents: string[];
    prerequisites?: string;
  };

  training: {
    theoryHours: number;
    practiceHours: number;
    practiceLabel?: string;
    specialDrives?: string[];
  };

  exam: {
    theory: string;
    practice: string;
  };

  includedServices: string[];

  faq: { question: string; answer: string }[];

  // Optional transmission variants for Class B licenses
  transmissionVariants?: TransmissionVariant[];
}

// Transmission variant interface for Class B
export interface TransmissionVariant {
  id: string;
  name: string;
  shortName: string;
  description: string;
  examType: string;
  authorization: string;
  pros: string[];
  cons: string[];
}

export const services: ServiceDetail[] = [
  // Führerscheinklassen
  {
    slug: "klasse-b",
    category: "license",
    name: "Klasse BE",
    shortDescription: "Auto – Mindestalter 17½ Jahre",
    icon: "car",
    highlight: true,
    heroTitle: "Klasse BE",
    heroSubtitle: "Der Weg zu deinem PKW-Führerschein",
    overview:
      "Der Führerschein Klasse B ist der beliebteste Führerschein in Deutschland. Er berechtigt zum Führen von Kraftfahrzeugen bis 3.500 kg zulässige Gesamtmasse mit bis zu 8 Sitzplätzen. Mit unserer erfahrenen Ausbildung begleiten wir dich sicher durch Theorie und Praxis bis zur bestandenen Prüfung.",
    requirements: {
      minAge: "17½ Jahre (17 Jahre mit BF17)",
      documents: [
        "Biometrisches Passfoto",
        "Sehtest (nicht älter als 2 Jahre)",
        "Erste-Hilfe-Kurs Bescheinigung",
        "Personalausweis oder Reisepass",
      ],
      prerequisites: "Keine Vorfahrerlaubnis erforderlich",
    },
    training: {
      theoryHours: 14,
      practiceHours: 30,
      specialDrives: [
        "5 Überlandfahrten (45 Min.)",
        "4 Autobahnfahrten (45 Min.)",
        "3 Nachtfahrten (45 Min.)",
      ],
    },
    exam: {
      theory: "30 Fragen, max. 10 Fehlerpunkte erlaubt",
      practice: "Ca. 45-60 Minuten Fahrprüfung",
    },
    includedServices: [
      "Theoretischer Unterricht in kleinen Gruppen",
      "Moderne Fahrzeuge mit aktueller Sicherheitstechnik",
      "Flexible Fahrstundenplanung",
      "Prüfungsbegleitung",
      "Online-Lernmaterial für die Theorie",
    ],
    faq: [
      {
        question: "Wie lange dauert die Ausbildung?",
        answer:
          "Die Dauer hängt von deiner verfügbaren Zeit und deinem Lernfortschritt ab. Bei regelmäßiger Teilnahme am Theorieunterricht und 2-3 Fahrstunden pro Woche kannst du den Führerschein in 3-4 Monaten schaffen.",
      },
      {
        question: "Kann ich mit 17 Jahren den Führerschein machen?",
        answer:
          "Ja, mit dem Begleiteten Fahren (BF17) kannst du bereits mit 17 Jahren Auto fahren – in Begleitung einer eingetragenen Person. Die Ausbildung kannst du schon mit 16½ Jahren beginnen.",
      },
      {
        question: "Was passiert, wenn ich durch die Prüfung falle?",
        answer:
          "Kein Grund zur Sorge! Du kannst die Prüfung nach einer Wartezeit von 2 Wochen wiederholen. Wir analysieren gemeinsam, woran es lag, und bereiten dich mit gezielten Übungsstunden optimal auf den nächsten Versuch vor.",
      },
      {
        question: "Wie teuer ist der Führerschein Klasse B?",
        answer:
          "Die Gesamtkosten setzen sich aus Grundgebühr, Fahrstunden und Prüfungsgebühren zusammen. Komm vorbei für ein persönliches Beratungsgespräch, in dem wir dir einen individuellen Kostenvoranschlag erstellen.",
      },
    ],
    transmissionVariants: [
      {
        id: "manual",
        name: "Manuell (Schaltgetriebe)",
        shortName: "Manuell",
        description:
          "Klassische Ausbildung auf Fahrzeug mit Schaltgetriebe. Du lernst das Kuppeln und Schalten von Grund auf.",
        examType: "Prüfung auf Schaltfahrzeug",
        authorization: "Schalt- UND Automatikfahrzeuge",
        pros: [
          "Volle Flexibilität bei der Fahrzeugwahl",
          "Keine Einschränkungen im Führerschein",
          "Besseres Verständnis der Fahrzeugmechanik",
        ],
        cons: [
          "Anspruchsvoller in der Ausbildung",
          "Ggf. mehr Fahrstunden nötig",
          "Prüfung komplexer (Kupplung, Gangwechsel)",
        ],
      },
      {
        id: "automatic",
        name: "Automatik",
        shortName: "Automatik",
        description:
          "Ausbildung und Prüfung auf Automatikfahrzeug. Ideal für entspanntes Fahren ohne Schaltaufwand.",
        examType: "Prüfung auf Automatikfahrzeug",
        authorization: "NUR Automatikfahrzeuge (Schlüsselzahl 78)",
        pros: [
          "Einfacher zu lernen",
          "Weniger Fahrstunden nötig",
          "Entspanntere Prüfung",
          "Ideal für Stadtverkehr",
        ],
        cons: [
          "Nur Automatik fahren erlaubt",
          "Eingeschränkte Fahrzeugauswahl (z.B. bei Mietwagen)",
          "Spätere Erweiterung auf Schaltgetriebe erfordert neue Prüfung",
        ],
      },
      {
        id: "b197",
        name: "B197 (Automatik mit Schaltberechtigung)",
        shortName: "B197",
        description:
          "Moderner Ausbildungsweg: Ausbildung hauptsächlich auf Automatik + 10 Fahrstunden auf Schaltgetriebe. Beste aus beiden Welten.",
        examType: "Prüfung auf Automatikfahrzeug (einfacher)",
        authorization: "Schalt- UND Automatikfahrzeuge",
        pros: [
          "Einfachere praktische Prüfung (Automatik)",
          "Trotzdem volle Berechtigung für alle Fahrzeuge",
          "Bestes aus beiden Welten",
          "Moderner Ausbildungsweg",
        ],
        cons: [
          "Mindestens 10 zusätzliche Fahrstunden auf Schaltgetriebe",
          "Interne Testfahrt beim Fahrlehrer erforderlich",
          "Nur in Deutschland gültig (im Ausland gilt ggf. nur Automatik)",
        ],
      },
    ],
  },
  {
    slug: "klasse-a",
    category: "license",
    name: "Klasse A",
    shortDescription: "Motorrad – Ab 16 Jahren (A1)",
    icon: "motorbike",
    highlight: false,
    heroTitle: "Klasse A",
    heroSubtitle: "Dein Traum vom Motorradfahren",
    overview:
      "Der Motorradführerschein Klasse A öffnet dir die Welt der Zweiräder. Ob A1, A2 oder der unbeschränkte A-Führerschein – wir bilden dich auf modernen Motorrädern aus und vermitteln dir nicht nur die Technik, sondern auch die richtige Einstellung für sicheres Motorradfahren.",
    requirements: {
      minAge: "A1: 16 Jahre | A2: 18 Jahre | A: 24 Jahre (oder 20 bei Vorbesitz A2)",
      minAgeShort: "ab 16",
      documents: [
        "Biometrisches Passfoto",
        "Sehtest (nicht älter als 2 Jahre)",
        "Erste-Hilfe-Kurs Bescheinigung",
        "Personalausweis oder Reisepass",
      ],
      prerequisites: "Für Aufstieg A1→A2→A: Mindestens 2 Jahre Vorbesitz der vorherigen Klasse",
    },
    training: {
      theoryHours: 10,
      practiceHours: 20,
      specialDrives: [
        "5 Überlandfahrten (45 Min.)",
        "4 Autobahnfahrten (45 Min.)",
        "3 Nachtfahrten (45 Min.)",
      ],
    },
    exam: {
      theory: "20 Fragen, max. 6 Fehlerpunkte erlaubt",
      practice: "Ca. 70 Minuten Fahrprüfung mit Grundfahraufgaben",
    },
    includedServices: [
      "Theoretischer Unterricht speziell für Motorradfahrer",
      "Moderne Motorräder für die Ausbildung",
      "Schutzausrüstung wird gestellt",
      "Übungsplatztraining für Grundfahraufgaben",
      "Begleitete Ausfahrten in der Gruppe",
    ],
    faq: [
      {
        question: "Welche Motorrad-Klasse ist die richtige für mich?",
        answer:
          "A1 (ab 16): Krafträder bis 125 ccm. A2 (ab 18): Krafträder bis 35 kW. A (ab 24 oder 20 bei Aufstieg): Unbeschränkt. Wir beraten dich gerne, welche Klasse zu deinem Alter und deinen Plänen passt.",
      },
      {
        question: "Brauche ich eigene Motorradkleidung?",
        answer:
          "Wir stellen Helm und Protektoren zur Verfügung. Feste Schuhe und robuste Kleidung (Jeans, Jacke) solltest du mitbringen. Für die Prüfung ist vollständige Schutzkleidung Pflicht.",
      },
      {
        question: "Wie funktioniert der Stufenaufstieg?",
        answer:
          "Nach 2 Jahren mit A1 kannst du auf A2 aufsteigen, nach weiteren 2 Jahren auf A. Der Aufstieg erfordert nur eine praktische Prüfung, keine neue Theorieprüfung.",
      },
      {
        question: "Ist Motorradfahren nicht gefährlich?",
        answer:
          "Wie bei jedem Fahrzeug kommt es auf die richtige Ausbildung und verantwortungsvolles Fahren an. Wir legen großen Wert auf defensive Fahrweise und Gefahrenvermeidung.",
      },
    ],
  },
  {
    slug: "mofa",
    category: "license",
    name: "Mofa",
    shortDescription: "Keine Anmeldung bei der Behörde erforderlich",
    icon: "moped",
    highlight: false,
    heroTitle: "Mofa-Prüfbescheinigung",
    heroSubtitle: "Dein erster Schritt zur Mobilität",
    overview:
      "Die Mofa-Prüfbescheinigung ist keine Fahrerlaubnis im klassischen Sinne, sondern ein Nachweis über die erfolgreiche Teilnahme an einer Ausbildung. Damit darfst du Mofas bis 25 km/h fahren. Ideal für Jugendliche ab 15 Jahren, die mobil werden wollen.",
    requirements: {
      minAge: "15 Jahre (Ausbildung ab 14½ Jahren)",
      documents: [
        "Personalausweis oder Reisepass",
      ],
      prerequisites: "Keine Anmeldung bei der Behörde erforderlich",
    },
    training: {
      theoryHours: 6,
      practiceHours: 2,
    },
    exam: {
      theory: "10 Fragen",
      practice: "Keine praktische Prüfung, nur Ausbildung",
    },
    includedServices: [
      "Theoretischer Unterricht",
      "Praktische Fahrübungen",
      "Prüfbescheinigung wird direkt ausgestellt",
      "Keine Behördengänge nötig",
    ],
    faq: [
      {
        question: "Was ist der Unterschied zur Klasse AM?",
        answer:
          "Mit der Mofa-Prüfbescheinigung darfst du nur Fahrzeuge bis 25 km/h fahren, mit AM bis 45 km/h. Die Mofa-Ausbildung ist kürzer und es ist keine Anmeldung bei der Behörde nötig.",
      },
      {
        question: "Muss ich zur Führerscheinstelle?",
        answer:
          "Nein! Anders als bei Führerscheinklassen erfolgt keine Anmeldung bei der Behörde. Die Prüfbescheinigung wird von uns nach bestandener Prüfung direkt ausgestellt.",
      },
      {
        question: "Gibt es eine praktische Prüfung?",
        answer:
          "Nein, es gibt nur eine theoretische Prüfung beim TÜV. Die praktische Ausbildung ist aber Pflicht und bereitet dich auf das sichere Fahren vor.",
      },
      {
        question: "Brauche ich einen Helm?",
        answer:
          "Ja, beim Mofafahren gilt Helmpflicht. Für die Ausbildung stellen wir dir einen Helm zur Verfügung.",
      },
    ],
  },
  {
    slug: "bf17",
    category: "license",
    name: "Begleitetes Fahren (BF17)",
    shortDescription: "Ab 16½ Jahren mit Begleitperson",
    icon: "users",
    highlight: false,
    heroTitle: "Begleitetes Fahren mit 17",
    heroSubtitle: "Früher starten, sicherer ankommen",
    overview:
      "Mit dem Begleiteten Fahren (BF17) kannst du bereits mit 17 Jahren Auto fahren – begleitet von einer eingetragenen Person. Statistiken zeigen: BF17-Fahrer haben später deutlich weniger Unfälle. Die Ausbildung beginnt mit 16½ Jahren, die Prüfung ist frühestens einen Monat vor dem 17. Geburtstag möglich.",
    requirements: {
      minAge: "16½ Jahre (Prüfung ab 17)",
      documents: [
        "Biometrisches Passfoto",
        "Sehtest (nicht älter als 2 Jahre)",
        "Erste-Hilfe-Kurs Bescheinigung",
        "Personalausweis oder Reisepass",
        "Einverständniserklärung der Eltern",
        "Begleitpersonen müssen benannt werden",
      ],
      prerequisites:
        "Begleitpersonen: Mind. 30 Jahre alt, 5+ Jahre Führerschein Klasse B, max. 1 Punkt in Flensburg",
    },
    training: {
      theoryHours: 12,
      practiceHours: 30,
      specialDrives: [
        "5 Überlandfahrten (45 Min.)",
        "4 Autobahnfahrten (45 Min.)",
        "3 Nachtfahrten (45 Min.)",
      ],
    },
    exam: {
      theory: "30 Fragen, max. 10 Fehlerpunkte erlaubt",
      practice: "Ca. 45-60 Minuten Fahrprüfung",
    },
    includedServices: [
      "Identische Ausbildung wie Klasse B",
      "Information für Begleitpersonen",
      "Prüfungsbegleitung",
      "Automatische Umschreibung mit 18 Jahren",
    ],
    faq: [
      {
        question: "Wer kann Begleitperson werden?",
        answer:
          "Die Begleitperson muss mindestens 30 Jahre alt sein, seit mindestens 5 Jahren den Führerschein Klasse B besitzen und darf nicht mehr als 1 Punkt im Fahreignungsregister haben. Du kannst mehrere Personen eintragen lassen.",
      },
      {
        question: "Was passiert, wenn ich ohne Begleitung fahre?",
        answer:
          "Fahren ohne Begleitung gilt als Straftat. Die Folgen: Widerruf der Fahrerlaubnis, Geldstrafe, verlängerte Probezeit und ein verpflichtendes Aufbauseminar.",
      },
      {
        question: "Muss die Begleitperson neben mir sitzen?",
        answer:
          "Ja, die Begleitperson muss auf dem Beifahrersitz sitzen und darf nicht unter Alkohol- oder Drogeneinfluss stehen. Sie darf aber nicht ins Fahren eingreifen.",
      },
      {
        question: "Was passiert mit 18?",
        answer:
          "Mit dem 18. Geburtstag erhältst du automatisch die unbeschränkte Fahrerlaubnis Klasse B. Du musst nur deinen Kartenführerschein bei der Behörde abholen.",
      },
    ],
    transmissionVariants: [
      {
        id: "manual",
        name: "Manuell (Schaltgetriebe)",
        shortName: "Manuell",
        description:
          "Klassische Ausbildung auf Fahrzeug mit Schaltgetriebe. Du lernst das Kuppeln und Schalten von Grund auf.",
        examType: "Prüfung auf Schaltfahrzeug",
        authorization: "Schalt- UND Automatikfahrzeuge",
        pros: [
          "Volle Flexibilität bei der Fahrzeugwahl",
          "Keine Einschränkungen im Führerschein",
          "Besseres Verständnis der Fahrzeugmechanik",
        ],
        cons: [
          "Anspruchsvoller in der Ausbildung",
          "Ggf. mehr Fahrstunden nötig",
          "Prüfung komplexer (Kupplung, Gangwechsel)",
        ],
      },
      {
        id: "automatic",
        name: "Automatik",
        shortName: "Automatik",
        description:
          "Ausbildung und Prüfung auf Automatikfahrzeug. Ideal für entspanntes Fahren ohne Schaltaufwand.",
        examType: "Prüfung auf Automatikfahrzeug",
        authorization: "NUR Automatikfahrzeuge (Schlüsselzahl 78)",
        pros: [
          "Einfacher zu lernen",
          "Weniger Fahrstunden nötig",
          "Entspanntere Prüfung",
          "Ideal für Stadtverkehr",
        ],
        cons: [
          "Nur Automatik fahren erlaubt",
          "Eingeschränkte Fahrzeugauswahl (z.B. bei Mietwagen)",
          "Spätere Erweiterung auf Schaltgetriebe erfordert neue Prüfung",
        ],
      },
      {
        id: "b197",
        name: "B197 (Automatik mit Schaltberechtigung)",
        shortName: "B197",
        description:
          "Moderner Ausbildungsweg: Ausbildung hauptsächlich auf Automatik + 10 Fahrstunden auf Schaltgetriebe. Beste aus beiden Welten.",
        examType: "Prüfung auf Automatikfahrzeug (einfacher)",
        authorization: "Schalt- UND Automatikfahrzeuge",
        pros: [
          "Einfachere praktische Prüfung (Automatik)",
          "Trotzdem volle Berechtigung für alle Fahrzeuge",
          "Bestes aus beiden Welten",
          "Moderner Ausbildungsweg",
        ],
        cons: [
          "Mindestens 10 zusätzliche Fahrstunden auf Schaltgetriebe",
          "Interne Testfahrt beim Fahrlehrer erforderlich",
          "Nur in Deutschland gültig (im Ausland gilt ggf. nur Automatik)",
        ],
      },
    ],
  },
  // Kurse & Spezielles
  {
    slug: "asf",
    category: "course",
    name: "ASF-Kurse",
    shortDescription: "Aufbauseminar für Fahranfänger",
    icon: "alert",
    highlight: false,
    heroTitle: "Aufbauseminar (ASF)",
    heroSubtitle: "Zurück auf den richtigen Weg",
    overview:
      "Das Aufbauseminar für Fahranfänger (ASF) ist ein Pflichtkurs, der bei Verkehrsverstößen in der Probezeit angeordnet wird. In unserem Seminar reflektierst du dein Fahrverhalten, lernst aus Fehlern und entwickelst Strategien für sicheres Fahren. Keine Angst – es ist kein Fahrtest, sondern ein konstruktiver Kurs.",
    requirements: {
      minAge: "Keine Altersbeschränkung",
      documents: [
        "Anordnung der Behörde",
        "Personalausweis oder Reisepass",
        "Führerschein",
      ],
      prerequisites: "Anordnung durch die Fahrerlaubnisbehörde nach Verstoß in der Probezeit",
    },
    training: {
      theoryHours: 9,
      practiceHours: 0.5,
      practiceLabel: "30 Minuten",
    },
    exam: {
      theory: "Keine Prüfung",
      practice: "Keine Prüfung – Teilnahmebescheinigung",
    },
    includedServices: [
      "4 Sitzungen à 135 Minuten",
      "Kleine Gruppen für offene Gespräche",
      "Erfahrene Seminarleiter",
      "Teilnahmebescheinigung für die Behörde",
      "Beobachtungsfahrt zwischen 1. und 2. Sitzung",
    ],
    faq: [
      {
        question: "Was passiert im ASF-Kurs?",
        answer:
          "Das ASF besteht aus 4 Sitzungen in der Gruppe und einer Beobachtungsfahrt. Ihr besprecht Verkehrssituationen, analysiert Risiken und entwickelt gemeinsam bessere Verhaltensweisen. Es ist keine Prüfung – es geht um Reflexion und Lernen.",
      },
      {
        question: "Was ist die Beobachtungsfahrt?",
        answer:
          "Zwischen der 1. und 2. Sitzung findet eine Beobachtungsfahrt statt: 30 Minuten Fahrprobe plus 15 Minuten Nachbesprechung. Dabei fährt jeder Teilnehmer einzeln, während bis zu zwei weitere Teilnehmer im Fahrzeug beobachten. Es ist keine Prüfung!",
      },
      {
        question: "Wie lange habe ich Zeit für das Seminar?",
        answer:
          "Du hast ab Zustellung des Bescheids 8–12 Wochen Zeit, das ASF zu absolvieren. Danach wird die Fahrerlaubnis entzogen. Melde dich also zeitnah an!",
      },
      {
        question: "Wird das ASF auch für A-Klasse angeboten?",
        answer:
          "Das ASF gilt für alle Fahranfänger in der Probezeit, unabhängig ob Auto oder Motorrad. Wir bieten das Seminar regelmäßig an.",
      },
    ],
  },
  {
    slug: "mpu-vorbereitung",
    category: "special",
    name: "MPU-Vorbereitung",
    shortDescription: "Medizinisch-Psychologische Untersuchung",
    icon: "brain",
    highlight: false,
    heroTitle: "MPU-Vorbereitung",
    heroSubtitle: "Gut vorbereitet zur MPU",
    overview:
      "Die Medizinisch-Psychologische Untersuchung (MPU) wird oft als große Hürde empfunden. Mit der richtigen Vorbereitung schaffst du es! Wir arbeiten mit erfahrenen Verkehrspsychologen zusammen und begleiten dich auf dem Weg zurück zum Führerschein. Ob Alkohol, Drogen oder Punkte – wir unterstützen dich individuell.",
    requirements: {
      minAge: "Keine Altersbeschränkung",
      documents: [
        "Anordnung der MPU (falls vorhanden)",
        "Personalausweis oder Reisepass",
        "Unterlagen zum Führerscheinentzug",
      ],
      prerequisites: "Anordnung durch die Fahrerlaubnisbehörde",
    },
    training: {
      theoryHours: 0,
      practiceHours: 0,
    },
    exam: {
      theory: "Keine Prüfung bei uns",
      practice: "MPU bei anerkannter Begutachtungsstelle",
    },
    includedServices: [
      "Erstberatung zur individuellen Situation",
      "Vermittlung an Verkehrspsychologen",
      "Begleitung während der Vorbereitungsphase",
      "Informationen zu Abstinenzprogrammen",
      "Tipps für die MPU-Untersuchung",
    ],
    faq: [
      {
        question: "Was passiert bei einer MPU?",
        answer:
          "Die MPU besteht aus drei Teilen: einem medizinischen Check, einem Reaktionstest am Computer und einem psychologischen Gespräch. Der Gutachter prüft, ob du dein Verhalten reflektiert hast und zukünftig sicher am Verkehr teilnehmen wirst.",
      },
      {
        question: "Wie lange dauert die Vorbereitung?",
        answer:
          "Das hängt vom Grund der MPU ab. Bei Alkohol- oder Drogendelikten ist oft ein Abstinenznachweis über 6-12 Monate nötig. Die eigentliche Vorbereitungsphase mit Psychologen dauert mehrere Wochen bis Monate.",
      },
      {
        question: "Wie hoch ist die Durchfallquote?",
        answer:
          "Ohne Vorbereitung fallen etwa 50% durch. Mit professioneller Vorbereitung steigt die Bestehensquote auf über 90%. Deshalb ist eine gute Vorbereitung so wichtig!",
      },
      {
        question: "Was kostet eine MPU?",
        answer:
          "Die Gesamtkosten einer MPU liegen je nach Grund zwischen 1.500€ und 4.000€. Darin enthalten sind die MPU-Begutachtung, Abstinenznachweise und Vorbereitungskurse. Wir beraten dich gerne zu den genauen Kosten in deinem Fall.",
      },
    ],
  },
  {
    slug: "theoretische-ausbildung",
    category: "course",
    name: "Theoretische Ausbildung",
    shortDescription: "Moderne, multimediale Theorieausbildung",
    icon: "book",
    highlight: false,
    heroTitle: "Theoretische Ausbildung",
    heroSubtitle: "Der Grundstein für sicheres Fahren",
    overview:
      "Moderne, multimediale Ausbildungstechniken gewährleisten bei uns einen effizienten Theorieunterricht. Wir bieten Lehrmaterial zum Heimstudium, kostenlose PC-Plätze zum Üben und Vortests zur optimalen Prüfungsvorbereitung.",
    requirements: {
      minAge: "Keine Altersbeschränkung",
      documents: [
        "Anmeldung bei der Fahrschule",
        "Lehrmaterial (bei uns erhältlich)",
      ],
    },
    training: {
      theoryHours: 14,
      practiceHours: 0,
    },
    exam: {
      theory: "Vortest in der Fahrschule, dann Prüfung beim TÜV/DEKRA",
      practice: "Keine praktische Prüfung für den Theorieteil",
    },
    includedServices: [
      "Moderner, multimedialer Unterricht",
      "Lehrmaterial zum Kaufen für das Heimstudium",
      "Kostenlose PC-Plätze in der Fahrschule",
      "Vortests zur Prüfungsvorbereitung",
      "Flexible Unterrichtszeiten",
    ],
    faq: [
      {
        question: "Wie viele Theoriestunden brauche ich?",
        answer:
          "Für die Ersterteilung Klasse B sind 12 Doppelstunden (90 Min.) Grundstoff und 2 Doppelstunden klassenspezifischer Stoff erforderlich – insgesamt 14 × 90 Minuten. Bei Erweiterung reduziert sich der Grundstoff auf 6 Doppelstunden.",
      },
      {
        question: "Kann ich auch online lernen?",
        answer:
          "Wir bieten Lehrmaterial für das Heimstudium an. Zusätzlich kannst du kostenlos unsere PC-Plätze in der Fahrschule nutzen, um mit unserer Lernsoftware zu üben.",
      },
      {
        question: "Wann bin ich prüfungsreif?",
        answer:
          "Unsere Vortests helfen dir festzustellen, wann du bereit für die Prüfung bist. Erst wenn du die Vortests sicher bestehst, melden wir dich zur theoretischen Prüfung an.",
      },
      {
        question: "Wo findet die Theorieprüfung statt?",
        answer:
          "Die theoretische Prüfung findet beim TÜV oder DEKRA statt. Wir begleiten dich bei der Anmeldung und geben dir alle wichtigen Informationen.",
      },
    ],
  },
  {
    slug: "praktische-ausbildung",
    category: "course",
    name: "Praktische Ausbildung",
    shortDescription: "Sichere Fahrpraxis mit modernen Fahrzeugen",
    icon: "steering-wheel",
    highlight: false,
    heroTitle: "Praktische Ausbildung",
    heroSubtitle: "Vom Anfänger zum sicheren Fahrer",
    overview:
      "Unsere praktische Ausbildung umfasst Grundfahrübungen, Stadtverkehr und die vorgeschriebenen Sonderfahrten. Mit modernen, klimatisierten Fahrzeugen und neuester Sicherheitstechnik begleiten wir dich auf dem Weg zur Fahrprüfung.",
    requirements: {
      minAge: "Abhängig von der Führerscheinklasse",
      documents: [
        "Bestandene Theorieprüfung (vor der praktischen Prüfung)",
        "Gültiger Personalausweis",
      ],
      prerequisites: "Theoretische Grundkenntnisse empfohlen",
    },
    training: {
      theoryHours: 0,
      practiceHours: 30,
      specialDrives: [
        "5 × 45 Min. Überlandfahrten",
        "4 × 45 Min. Autobahnfahrten",
        "3 × 45 Min. Nachtfahrten",
      ],
    },
    exam: {
      theory: "Keine Theorieprüfung für den Praxisteil",
      practice: "Ca. 45-60 Minuten Fahrprüfung mit Prüfer",
    },
    includedServices: [
      "Moderne, klimatisierte Ausbildungsfahrzeuge",
      "Neueste Sicherheitssysteme (Einparkhilfen, automatisches Licht)",
      "Umweltschonende Start-Stop-Systeme",
      "Überlandschulung auf Bundes- und Landstraßen",
      "Autobahnschulung inkl. Fahren bei 120+ km/h",
      "Schulung bei Dämmerung und Dunkelheit",
      "Flexible Terminplanung",
    ],
    faq: [
      {
        question: "Wie viele Fahrstunden brauche ich?",
        answer:
          "Die Anzahl der Übungsstunden ist individuell und hängt von deinem Lernfortschritt ab. Vorgeschrieben sind nur die 12 Sonderfahrten (5 Überland, 4 Autobahn, 3 Nacht). Im Durchschnitt benötigen Fahrschüler etwa 25-35 Fahrstunden insgesamt.",
      },
      {
        question: "Was sind Sonderfahrten?",
        answer:
          "Sonderfahrten sind Pflichtfahrten: Überlandfahrten auf Bundes- und Landstraßen, Autobahnfahrten mit mindestens 120 km/h, und Nachtfahrten bei Dämmerung oder Dunkelheit. Sie bereiten dich auf besondere Verkehrssituationen vor.",
      },
      {
        question: "Welche Fahrzeuge werden verwendet?",
        answer:
          "Wir schulen auf modernen, klimatisierten Fahrzeugen mit neuester Sicherheitstechnik: Einparkhilfen, automatische Lichtsysteme und umweltschonende Start-Stop-Systeme.",
      },
      {
        question: "Kann ich die Fahrstunden flexibel planen?",
        answer:
          "Ja, wir bieten flexible Terminplanung an. Sprich mit uns über deine verfügbaren Zeiten und wir finden passende Fahrstundentermine für dich.",
      },
    ],
  },
  {
    slug: "fuehrerschein-umschreibung",
    category: "special",
    name: "Führerschein Umschreibung",
    shortDescription: "Ausländischen Führerschein umschreiben",
    icon: "world",
    highlight: false,
    heroTitle: "Führerschein Umschreibung",
    heroSubtitle: "Dein ausländischer Führerschein in Deutschland",
    overview:
      "Du hast einen Führerschein aus dem Ausland und möchtest ihn in Deutschland nutzen? Je nach Herkunftsland kann dein Führerschein direkt umgeschrieben werden oder es ist eine Prüfung erforderlich. Wir beraten dich zu den Voraussetzungen und begleiten dich durch den gesamten Prozess.",
    requirements: {
      minAge: "18 Jahre",
      documents: [
        "Gültiger ausländischer Führerschein (Original)",
        "Übersetzung des Führerscheins (bei Bedarf)",
        "Biometrisches Passfoto",
        "Personalausweis oder Reisepass",
        "Meldebescheinigung",
        "Sehtest (nicht älter als 2 Jahre)",
        "Erste-Hilfe-Kurs Bescheinigung",
      ],
      prerequisites: "Wohnsitz in Berlin, Deutschland erforderlich",
    },
    training: {
      theoryHours: 0,
      practiceHours: 0,
    },
    exam: {
      theory: "Je nach Herkunftsland: Keine, verkürzt oder vollständig",
      practice: "Je nach Herkunftsland: Keine, verkürzt oder vollständig",
    },
    includedServices: [
      "Individuelle Beratung zu deinem Herkunftsland",
      "Prüfung der Umschreibungsmöglichkeiten",
      "Unterstützung bei der Dokumentenbeschaffung",
      "Vorbereitung auf Theorie-/Praxisprüfung (falls erforderlich)",
      "Begleitung durch den Behördengang",
    ],
    faq: [
      {
        question: "Kann mein Führerschein direkt umgeschrieben werden?",
        answer:
          "Das hängt vom Ausstellungsland ab. EU/EWR-Führerscheine sind in Deutschland gültig und müssen nur bei Ablauf umgetauscht werden. Führerscheine aus Ländern mit Gegenseitigkeitsabkommen (z.B. USA, Kanada, Japan) können direkt umgeschrieben werden. Bei anderen Ländern ist eine Prüfung erforderlich.",
      },
      {
        question: "Welche Prüfungen muss ich ablegen?",
        answer:
          "Je nach Herkunftsland: Keine Prüfung bei EU/EWR und Ländern mit Abkommen. Bei anderen Ländern: Theoretische und/oder praktische Prüfung. Wir beraten dich individuell zu deiner Situation.",
      },
      {
        question: "Wie lange ist mein ausländischer Führerschein gültig?",
        answer:
          "Mit einem ausländischen Führerschein darfst du in Deutschland maximal 6 Monate fahren (ab Wohnsitznahme). Danach benötigst du einen deutschen Führerschein. Bei EU/EWR-Führerscheinen gilt diese Frist nicht.",
      },
      {
        question: "Was kostet die Umschreibung?",
        answer:
          "Die Kosten variieren je nach erforderlichen Prüfungen. Komm zu einem kostenlosen Beratungsgespräch, in dem wir dir einen individuellen Kostenvoranschlag erstellen.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((service) => service.slug === slug);
}

export function getServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}

// Map for About component links
export const aboutLinks: Record<string, string> = {
  "ASF-Kurse": "/leistungen/asf",
  "MPU-Vorbereitung": "/leistungen/mpu-vorbereitung",
};
