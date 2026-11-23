/* Inhalte aus dem Leitfaden Muskelaufbau (Version 7, 19.11.2026) und den Einzeldokumenten. */
const PLAN = {
  "Upper A": [
    ["Kurzhantel-Bankdrücken flach", "3 × 6–10", "1–2, letzter 0–1", "2–3 min"],
    ["Kabel-Fly mit tiefer Dehnung", "2 × 10–15", "0–1, letzter 0", "1,5 min"],
    ["Latzug mit voller Armstreckung", "3 × 8–12", "1–2, letzter 0–1", "2 min"],
    ["Rudern brustgestützt", "3 × 8–12", "1–2, letzter 0–1", "2 min"],
    ["Seitheben am Kabel", "3 × 12–20", "0–1, letzter 0", "1–1,5 min"],
    ["Trizepsdrücken über Kopf am Kabel", "2 × 10–15", "0–1, letzter 0", "1,5 min"],
    ["Scott-Curl", "2 × 8–12", "0–1, letzter 0", "1,5 min"]
  ],
  "Lower A": [
    ["Kniebeuge, so tief wie sauber", "4 × 5–8", "2, nie Versagen", "3 min"],
    ["Beinpresse, großer Bewegungsumfang", "2 × 10–12", "1–2", "2 min"],
    ["Beinstrecker, Lehne zurückgelehnt", "2 × 10–15", "0–1, letzter 0", "1,5 min"],
    ["Rumänisches Kreuzheben (RDL)", "3 × 6–10", "2, nie Versagen", "2,5–3 min"],
    ["Beinbeuger sitzend", "3 × 8–12", "0–1, letzter 0", "1,5 min"],
    ["Wadenheben stehend, Knie gestreckt, unten 1–2 s halten", "4 × 8–12", "0–1, letzter 0", "1–1,5 min"]
  ],
  "Upper B": [
    ["Schrägbankdrücken ~30°", "3 × 6–10", "1–2, letzter 0–1", "2–3 min"],
    ["Brustpresse", "2 × 10–15", "1–2, letzter 0–1", "2 min"],
    ["Klimmzug oder Latzug eng/neutral", "3 × 6–10", "1–2", "2–3 min"],
    ["Kabelrudern", "3 × 10–15", "1–2, letzter 0–1", "2 min"],
    ["Seitheben mit Kurzhanteln", "3 × 12–20", "0–1, letzter 0", "1–1,5 min"],
    ["Trizeps: Kurzhantel über Kopf oder Pushdown", "2 × 12–15", "0–1, letzter 0", "1,5 min"],
    ["Kabel-Curl, Arm hinter dem Körper", "2 × 12–15", "0–1, letzter 0", "1,5 min"]
  ],
  "Lower B": [
    ["Beinpresse oder Hackenschmidt", "3 × 8–12, dann 3 × 15–20", "1–2; leichte 0–1", "2 min"],
    ["Beinstrecker, Lehne zurückgelehnt", "2 × 15–25", "0–1, letzter 0", "1,5 min"],
    ["RDL oder Rückenstrecker", "3 × 10–15", "2", "2 min"],
    ["Beinbeuger sitzend", "3 × 12–15", "0–1, letzter 0", "1,5 min"],
    ["Wadenheben an der Beinpresse, Knie gestreckt", "4 × 15–20", "0–1, letzter 0", "1 min"]
  ]
};

const SETS = [["Brust", 10], ["Rücken", 12], ["Schultern", 10], ["Trizeps", 8], ["Bizeps", 10], ["Quadrizeps", 16], ["Hamstrings", 12], ["Gesäß", 9], ["Waden", 8]];

const EXERCISE = [
  { m: "Rectus femoris", a: ["Beinstrecker", 13.2], b: ["Beinpresse", 1.1], src: "Kinoshita 2026" },
  { m: "Gesäß", a: ["Beinpresse", 15.4], b: ["Beinstrecker", 0.2], src: "Kinoshita 2026" },
  { m: "Trizeps", a: ["über Kopf", 19.9], b: ["Pushdown", 13.9], src: "Maeo 2023" },
  { m: "Hamstrings", a: ["Beinbeuger sitzend", 14], b: ["Beinbeuger liegend", 9], src: "Maeo 2021" }
];

const SLEEP = [
  { k: "Muskelproteinsynthese, 1 Nacht wach", v: -18, src: "Lamon 2021" },
  { k: "Muskelproteinsynthese, 5 Nächte à 4 h", v: -19, src: "Saner 2020" },
  { k: "Testosteron, 1 Woche à 5 h", lo: -15, hi: -10, src: "Leproult 2011" },
  { k: "Kraftausdauer, akut", v: -9.85, src: "Craven 2022" },
  { k: "Leistung gesamt, akut", v: -7.56, src: "Craven 2022" },
  { k: "Maximalkraft, akut", v: -2.85, src: "Craven 2022" }
];

const SCALE = [
  { k: "Muskel pro Monat", lo: 0.2, hi: 0.4, hl: true },
  { k: "Tagesschwankung der Waage", lo: 0, hi: 0.5, approx: true },
  { k: "Wasser beim Kreatin-Start", lo: 0, hi: 1, approx: true },
  { k: "Glykogen nach KH-reichem Tag", lo: 1, hi: 2 },
  { k: "Geplante Zunahme pro Monat (75 kg)", lo: 0.8, hi: 1.6 }
];

const RESPONSE = [
  { k: "Hubal 2005 (585 Personen)", lo: 0, hi: 40, mean: 18.9, open: true },
  { k: "Ahtiainen 2016", lo: -11, hi: 30, mean: 4.8 }
];

const MACROS = [
  { k: "Ruhetag", p: 150, f: 85, c: 335 },
  { k: "Krafttag", p: 150, f: 90, c: 400 },
  { k: "Kraft + lockere Ausdauer", p: 150, f: 90, c: 450 },
  { k: "Lange Ausdauereinheit", p: 160, f: 95, c: 525 }
];

const MYTHS = [
  { b: "T", m: "8–12 Wiederholungen sind die Hypertrophie-Zone.", f: "Nah am Versagen wächst der Muskel mit ~5–30 Wiederholungen etwa gleich.", d: "T5" },
  { b: "T", m: "Jeder Satz muss bis zum Versagen gehen.", f: "1–2 Wiederholungen vor dem Versagen brachten bei Trainierten gleich viel.", d: "T2" },
  { b: "T", m: "Je mehr Sätze, desto besser.", f: "Über ~20 Sätze pro Muskel bei Trainierten kein gesicherter Zusatznutzen.", d: "T1" },
  { b: "T", m: "Kurze Pausen bauen über Hormone mehr Muskel auf.", f: "≤ 60 s bringt eher etwas weniger; die Hormon-Begründung trägt nicht.", d: "T6" },
  { b: "T", m: "Ständig neue Übungen schocken den Muskel.", f: "Zufälliger Wechsel brachte keinen Vorteil und erschwert die Progression.", d: "T4" },
  { b: "T", m: "Freie Gewichte bauen mehr Muskel als Maschinen.", f: "Fürs Wachstum gleich.", d: "T4" },
  { b: "T", m: "Alle 4 Wochen muss ein Deload sein.", f: "Fürs Wachstum weder nötig noch schädlich; ein Werkzeug gegen Ermüdung.", d: "T7" },
  { b: "T", m: "Mit der richtigen Übung baut man gezielt die obere Brust auf.", f: "Unsicher; mehrere Studien fanden keine Verschiebung innerhalb des Muskels.", d: "T9" },
  { b: "E", m: "Viel essen baut schneller Muskel.", f: "Bei Trainierten brachte ein großer Überschuss vor allem Fett.", d: "E1" },
  { b: "E", m: "Je mehr Protein, desto besser.", f: "Über ~2,2 g/kg kein zusätzlicher Muskelaufbau gezeigt.", d: "E2" },
  { b: "E", m: "Protein muss in 30–60 Minuten nach dem Training kommen.", f: "Bei gleicher Tagesmenge kein Vorteil.", d: "E3" },
  { b: "E", m: "Mehr als 30 g Protein pro Mahlzeit werden verbrannt.", f: "Nach Ganzkörpertraining wirkten 100 g stärker und länger als 25 g.", d: "E3" },
  { b: "E", m: "Mit pflanzlichem Protein baut man kaum Muskel auf.", f: "Bei ~1,6–2 g/kg wuchsen die Muskeln vegan und gemischt gleich.", d: "E4" },
  { b: "E", m: "Keto ist für den Aufbau genauso gut.", f: "Erschwert den Überschuss; die Magermasse stieg teils nur mit normaler Kost.", d: "E5" },
  { b: "E", m: "Vitamin C und E helfen der Regeneration.", f: "Im Mittel kein Effekt, in Einzelstudien gebremste Anpassung.", d: "E6" },
  { b: "S", m: "Kreatin braucht eine Ladephase und viel mehr als 5 g.", f: "Höhere Dosen und Ladephase brachten keinen Vorteil.", d: "S1" },
  { b: "S", m: "Kreatin schadet den Nieren und macht Haarausfall.", f: "Bei Gesunden steigt das Kreatinin, die gemessene Nierenfunktion nicht; Haarausfall nicht belegt.", d: "S1" },
  { b: "S", m: "Isolat baut mehr Muskel als Konzentrat.", f: "Fürs Wachstum kein Unterschied.", d: "S2" },
  { b: "S", m: "Pre-Workouts geben den entscheidenden Kick.", f: "Nicht besser als Koffein allein, oft verdeckt dosiert, mehr Nebenwirkungen.", d: "S3" },
  { b: "S", m: "BCAA schützen den Muskel und bauen ihn auf.", f: "Bei ausreichender Proteinzufuhr kein Effekt auf Kraft oder Muskel.", d: "S4" },
  { b: "S", m: "Natürliche Myostatin-Senker steigern das Wachstum.", f: "Messbare Senkung, aber kein Zusammenhang mit dem Zuwachs.", d: "S5" },
  { b: "R", m: "Cardio killt die Gains.", f: "Bei moderater Menge kein messbarer Nachteil fürs Wachstum des ganzen Muskels.", d: "R1" },
  { b: "R", m: "Eine schlechte Nacht ruiniert das Training.", f: "Maximalkraft im Mittel nur ~3 % weniger.", d: "R2" },
  { b: "R", m: "Cortisol durch Stress frisst Muskeln.", f: "Der Cortisolanstieg nach dem Training hing sogar schwach positiv mit dem Faserwachstum zusammen.", d: "R3" },
  { b: "R", m: "Eine Pulsuhr (HRV) steuert das Training besser.", f: "Gleiches Wachstum wie mit festem Plan.", d: "R3" },
  { b: "R", m: "Ein Eisbad beschleunigt die Regeneration.", f: "Weniger Muskelkater, aber die Kraft kommt nicht schneller zurück.", d: "R4" },
  { b: "R", m: "Dehnen beugt Muskelkater vor.", f: "0,5–1 von 100 Punkten weniger Schmerz, praktisch bedeutungslos.", d: "R4" },
  { b: "R", m: "Viel Muskelkater heißt gutes Training.", f: "Muskelkater ist kein Maß für Wachstum.", d: "R4" }
];

/* Quiz: belegte Aussagen als Gegenstück zu den Mythen */
const FACTS = [
  { b: "T", m: "Von 6 auf 12 harte Sätze pro Woche wächst der Muskel spürbar mehr.", f: "Rund +1,7 Prozentpunkte Wachstum in ~10 Wochen, danach mit abnehmendem Zusatznutzen (Pelland 2026).", d: "T1" },
  { b: "T", m: "Mit 25 Wiederholungen nah am Versagen wächst der Muskel etwa so gut wie mit 8.", f: "Zwischen ~5 und ~30 Wiederholungen wächst der Muskel gleich, wenn du nah ans Versagen gehst.", d: "T5" },
  { b: "T", m: "Ohne Steigerung wächst der Muskel nur etwa halb so stark.", f: "Ohne Progression +11,6 statt +22,9 % (Kassiano 2026). Doppelte Progression und ein Trainingsprotokoll reichen.", d: "T7" },
  { b: "T", m: "Beinstrecker und Beinpresse bauen den vorderen Oberschenkel nicht gleich gut auf.", f: "Rectus femoris +13,2 % mit Beinstrecker, aber nur +1,1 % mit Beinpresse (Kinoshita 2026, MRT).", d: "T4" },
  { b: "T", m: "Bei gleichen Wochensätzen ist es fürs Wachstum fast egal, ob du einen Muskel 2× oder 3× pro Woche trainierst.", f: "Eine höhere Frequenz brachte bei gleichen Sätzen keinen gesicherten Vorteil.", d: "T3" },
  { b: "E", m: "Schon ein Defizit von etwa 500 kcal am Tag kann den Muskelaufbau ganz stoppen.", f: "Ab etwa 500 kcal Defizit blieb im Schnitt kein Zuwachs übrig (Murphy & Koehler 2022).", d: "E1" },
  { b: "E", m: "Für den Aufbau reicht ein kleiner Überschuss von etwa 250–400 kcal am Tag.", f: "Mehr Überschuss brachte bei Trainierten vor allem Fett, die Muskeldicke stieg gleich (Helms 2023).", d: "E1" },
  { b: "E", m: "Mehr Protein bringt Trainierten mehr zusätzliche fettfreie Masse als Anfängern.", f: "Im Mittel +0,30 kg fettfreie Masse, bei Trainierten +1,05 kg (Morton 2018, 49 Studien).", d: "E2" },
  { b: "E", m: "Nach einem kohlenhydratreichen Tag kann die Waage 1–2 kg mehr zeigen, ohne dass du Fett zugenommen hast.", f: "Glykogen und Wasser verschieben das Gewicht um bis zu 1–2 kg. Deshalb nur Wochenschnitte vergleichen.", d: "E5 · Q1" },
  { b: "S", m: "Kreatin bringt vor allem Kraft und nur wenig zusätzlichen Muskel.", f: "Kraft +4,4 kg im Oberkörper und +11,4 kg im Unterkörper (Wang 2024); beim Muskel bewegt kein Supplement viel.", d: "S1" },
  { b: "S", m: "Beim Kreatin-Start zeigt die Waage oft knapp 1 kg mehr.", f: "Das ist vor allem Wasser. Die ersten 2–4 Wochen beim Wiegen deshalb nicht werten.", d: "S1" },
  { b: "S", m: "Koffein steigert die Maximalkraft kurzfristig etwas.", f: "Akut ~3 % mehr Maximalkraft mit 1,5–2,5 mg/kg, etwa 1–2 Tassen Kaffee.", d: "S3" },
  { b: "S", m: "Pro Gramm Protein ist Whey teurer als Magerquark.", f: "30 g Protein kosten aus Whey 1,10–1,80 €, aus Magerquark 0,45–0,60 €.", d: "S2" },
  { b: "R", m: "Fünf kurze Nächte senken die Muskelproteinsynthese messbar.", f: "Fünf Nächte à 4 h senkten sie um 19 % (Saner 2020).", d: "R2" },
  { b: "R", m: "Ein Kältebad direkt nach dem Krafttraining kann den Muskelaufbau eher bremsen.", f: "Keine passive Maßnahme bringt Muskel; ein Kältebad direkt danach kostet eher. Deshalb kein Kältebad nach dem Krafttraining.", d: "R4" },
  { b: "R", m: "Ausdauer direkt vor dem Krafttraining kostet Beinkraft.", f: "Deutlicher Kraftverlust (SMD 0,79; Markov 2022). Deshalb Kraft vor Ausdauer, möglichst ≥ 6 h Abstand.", d: "R1" }
];
