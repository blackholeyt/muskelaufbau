/* Punktemodell aus „Punktesystem.md“ (Stand 19.11.2026).
   mp/lp = rohe Muskel-/Leistungspunkte; em/el = Evidenzstufe; f = Faktor (Progression, Kalorien).
   rec = Stufe im empfohlenen Plan; myth = Stufe im Gym-Mythen-Plan; std = Vergleichsstufe (0 Punkte). */
const EV = {
  H:  { f: 1.0,   label: "Hoch",               dots: 4 },
  MH: { f: 0.875, label: "Mittel bis Hoch",    dots: 3.5 },
  M:  { f: 0.75,  label: "Mittel",             dots: 3 },
  NM: { f: 0.625, label: "Niedrig bis Mittel", dots: 2.5 },
  N:  { f: 0.5,   label: "Niedrig",            dots: 2 },
  SN: { f: 0.25,  label: "Sehr niedrig",       dots: 1 }
};
const BLOCKS = { T: "Training", E: "Ernährung", S: "Supplements", R: "Regeneration" };

const GROUPS = [
  // TRAINING
  { id: "vol", block: "T", doc: "T1", title: "Wochenvolumen", unit: "harte Sätze pro Muskel und Woche", options: [
    { id: "v6", label: "6 Sätze", std: true, mp: 0, lp: 0 },
    { id: "v10", label: "10 Sätze", mp: 10, lp: 5, em: "M", el: "N", why: "Pelland 2026: 6 → 12 Sätze ≈ +1,7 Prozentpunkte in ~10 Wochen, Kurve wie eine Wurzel. Auf 12 Wochen (×1,2), gemischte Probanden (×0,7). 10 Sätze liegen auf derselben Kurve bei 10 MP." },
    { id: "v12", label: "12 Sätze", mp: 14, lp: 7, em: "M", el: "N", why: "Pelland 2026: 6 → 12 Sätze ≈ +1,7 Prozentpunkte in ~10 Wochen. ×1,2 (12 Wochen) × 0,7 (gemischte Probanden) ≈ 1,4 Prozentpunkte = 14 MP." },
    { id: "v16", label: "16 Sätze", rec: true, mp: 21, lp: 9, em: "M", el: "N", why: "Wurzelkurve aus Pelland 2026 (13,8 × (√16 − √6)) = 21 MP. Oberes Ende des Zielbereichs 10–16." },
    { id: "v20", label: "20+ Sätze", myth: true, mp: 28, lp: 9, em: "N", el: "N", why: "Die Wurzelkurve ergäbe 28 MP, aber über ~20 Sätze gibt es bei Trainierten keinen gesicherten Zusatznutzen (Barsuhn 2025, Enes 2024). Deshalb nur Evidenz Niedrig.", note: "Mehr Zeit, kein gesicherter Zusatznutzen" }
  ]},
  { id: "rir", block: "T", doc: "T2", title: "Nähe zum Versagen", unit: "Wiederholungen in Reserve (RIR)", options: [
    { id: "r34", label: "3–4 RIR", std: true, mp: 0, lp: 0 },
    { id: "r12", label: "1–2 RIR", rec: true, mp: 6, lp: 0, em: "NM", el: "N", why: "Robinson 2024: pro RIR weiter weg ≈ −0,48 Prozentpunkte. Von 3–4 auf 1–2 RIR sind es ~1,5 RIR → 6 MP." },
    { id: "r0", label: "Jeder Satz bis Versagen", myth: true, mp: 6, lp: -10, em: "M", el: "N", why: "An Trainierten brachten 0 und 1–2 RIR gleich viel (Refalo 2024: +6,96 vs. +6,98 %). Versagen ermüdet akut stärker und kostet Leistung in den Folgesätzen.", note: "Mehr Ermüdung, kein Zusatznutzen" }
  ]},
  { id: "prog", block: "T", doc: "T7", title: "Progression", unit: "Steigerung über die Wochen", factor: true, options: [
    { id: "p1", label: "Doppelte Progression", std: true, rec: true, f: 1, mp: 0, lp: 0 },
    { id: "p0", label: "Kein Steigern", f: 0.5, lp: -40, em: "M", el: "N", why: "Kassiano 2026: ohne Steigerung +11,6 statt +22,9 % Wachstum. Deshalb Faktor ×0,5 auf das gesamte Wachstum.", note: "Halbiert das Wachstum" }
  ]},
  { id: "ex", block: "T", doc: "T4 · T9", title: "Übungsauswahl", unit: "pro Muskelgruppe", options: [
    { id: "e0", label: "Nur Grundübungen", std: true, mp: 0, lp: 0 },
    { id: "e1", label: "Grundübung + passende Isolation", rec: true, myth: true, mp: 12, lp: 0, em: "NM", el: "N", why: "Trizeps über Kopf +19,9 vs. +13,9 %, Rectus femoris mit Beinstrecker +13,2 vs. +1,1 % (MRT, Untrainierte). Betrifft etwa 40 % der Muskeln." }
  ]},
  { id: "reps", block: "T", doc: "T5", title: "Wiederholungsbereich", unit: "bei gleicher Satzzahl", options: [
    { id: "rp", label: "6–15 Wdh.", std: true, rec: true, mp: 0, lp: 0 },
    { id: "rh", label: "2–4 Wdh. (sehr schwer)", mp: -20, lp: 18, em: "N", el: "H", why: "Schoenfeld 2016 (Trainierte): Oberschenkel +4,1 vs. +10,4 %. Maximalkraft klar besser mit schweren Lasten (Lopez 2021: SMD 0,60).", note: "Viel mehr Zeit pro Satz" },
    { id: "rl", label: "15–30 Wdh. nah am Versagen", mp: 0, lp: -18, em: "M", el: "H", why: "Nah am Versagen wächst der Muskel mit ~30–90 % 1RM etwa gleich (Lopez 2021: SMD 0,12, n. s.). Für Maximalkraft schlechter.", note: "Nur bei 0–1 RIR wirksam" }
  ]},
  { id: "rest", block: "T", doc: "T6", title: "Satzpausen", unit: "zwischen den Sätzen", options: [
    { id: "rs", label: "1,5–3 min", std: true, rec: true, mp: 0, lp: 0 },
    { id: "r60", label: "≤ 60 s", myth: true, mp: -5, lp: -10, em: "NM", el: "M", why: "Singer 2024: SMD 0,13–0,17 zugunsten längerer Pausen. Für Kraft sind bei Trainierten > 2 min besser." }
  ]},
  { id: "split", block: "T", doc: "T3", title: "Split", unit: "bei 4 Einheiten pro Woche", options: [
    { id: "ppl", label: "Push-Pull-Legs", std: true, myth: true, mp: 0, lp: 0 },
    { id: "ul", label: "Upper-Lower", rec: true, mp: 3, lp: 0, em: "SN", el: "SN", why: "Nur ein eigenes Modell: Upper-Lower verteilt die Sätze gleichmäßiger, +0,35 Prozentpunkte ≈ 3 MP. Kein direkter Studienvergleich." }
  ]},
  { id: "rom", block: "T", doc: "T4", title: "Bewegungsumfang", unit: "pro Wiederholung", options: [
    { id: "full", label: "Voll, Dehnung betont", std: true, rec: true, mp: 0, lp: 0 },
    { id: "lp", label: "Teilwdh. nur in der Dehnung", mp: 0, lp: 0, em: "N", el: "N", why: "Bei Trainierten für Quadrizeps und Oberarm kein Vorteil gegenüber vollen Wiederholungen (Wolf 2025, Plotkin 2026)." },
    { id: "sp", label: "Teilwdh. oben (verkürzt)", mp: -10, lp: 0, em: "NM", el: "N", why: "Teilwiederholungen in der Verkürzung brachten weniger als in der Dehnung (Strey 2026: ES 0,28)." }
  ]},
  { id: "peri", block: "T", doc: "T7", title: "Periodisierung", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 5, lp: 9, em: "N", el: "M", why: "Moesgaard 2022: Wachstum SMD 0,13 (n. s.), Kraft SMD 0,31." }
  ]},
  { id: "deload", block: "T", doc: "T7", title: "Deloads nach Bedarf", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 0, lp: 0, em: "N", el: "N", why: "Fürs Wachstum weder nötig noch schädlich (Coleman 2024). Ein Werkzeug gegen Ermüdung." }
  ]},
  { id: "superset", block: "T", doc: "T8", title: "Gegenspieler-Supersätze", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: -2, lp: 0, em: "NM", el: "N", why: "Zhang 2025: Hypertrophie SMD −0,05. Burke 2025: gleiches Wachstum bei 36 % kürzeren Einheiten.", note: "Spart ~⅓ der Zeit" }
  ]},
  { id: "dropset", block: "T", doc: "T8", title: "Drop-Sets / Myo-Reps im letzten Satz", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 1, lp: 0, em: "M", el: "N", why: "Havers 2026: SMD 0,04. Gleiches Wachstum in ½–⅓ der Zeit pro Übung, aber deutlich härter.", note: "Spart Zeit, fühlt sich härter an" }
  ]},
  { id: "machine", block: "T", doc: "T4", title: "Maschinen statt freier Gewichte", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: -2, lp: 0, em: "M", el: "N", why: "Haugen 2023: SMD −0,06, praktisch gleich." }
  ]},
  // ERNÄHRUNG
  { id: "kcal", block: "E", doc: "E1", title: "Kalorien", unit: "pro Tag gegenüber Erhaltung", factor: true, options: [
    { id: "d500", label: "Defizit ~500 kcal", f: 0, lp: -10, em: "M", el: "N", why: "Murphy & Koehler 2022: Defizit senkte den Magermassezuwachs (−0,57), ab ~500 kcal Defizit blieb im Schnitt kein Zuwachs. Faktor ×0.", note: "Kein Zuwachs" },
    { id: "d250", label: "Defizit ~250 kcal", f: 0.5, lp: -5, em: "N", el: "N", why: "Zwischen Erhaltung (×1) und −500 kcal (×0) interpoliert → Faktor ×0,5." },
    { id: "keep", label: "Erhaltung", std: true, f: 1, mp: 0, lp: 0 },
    { id: "s300", label: "Überschuss +250–400", rec: true, f: 1.1, lp: 0, em: "N", el: "N", why: "Ein kleiner Überschuss bringt allenfalls einen kleinen Zusatznutzen beim Muskel → Faktor ×1,1." },
    { id: "s600", label: "Überschuss +500 und mehr", myth: true, f: 1.15, lp: 0, em: "N", el: "N", why: "Kaum mehr Muskel als beim kleinen Überschuss → ×1,15. Dafür deutlich mehr Fett: Hautfalten +10–12 mm bei gleicher Muskeldicke (Helms 2023).", note: "Deutlich mehr Fett" }
  ]},
  { id: "prot", block: "E", doc: "E2", title: "Protein", unit: "g pro kg Körpergewicht und Tag", options: [
    { id: "p12", label: "1,2 g/kg", std: true, mp: 0, lp: 0 },
    { id: "p16", label: "1,6 g/kg", mp: 12, lp: 16, em: "M", el: "NM", why: "Morton 2018: mehr Protein +0,30 kg fettfreie Masse. Knick bei ~1,6 g/kg, aber nicht gesichert → 80 % des Effekts." },
    { id: "p19", label: "1,8–2,0 g/kg", rec: true, mp: 15, lp: 20, em: "M", el: "NM", why: "Morton 2018: +0,30 kg fettfreie Masse, 1RM +2,49 kg. Stoffwechselstudien an Trainierten landen bei 1,7–2,0 g/kg." },
    { id: "p22", label: "2,2 g/kg", mp: 15, lp: 20, em: "N", el: "N", why: "Kein Zusatznutzen über ~2,0 gezeigt, für Gesunde unbedenklich." },
    { id: "p3", label: "3+ g/kg", myth: true, mp: 15, lp: 20, em: "M", el: "N", why: "Direkte Vergleiche an Trainierten (1,6 vs. 3,2 und 1,8 vs. 4,4 g/kg) ohne Zusatznutzen.", note: "Teurer, kein Zusatznutzen" }
  ]},
  { id: "meals", block: "E", doc: "E3", title: "3–5 Proteinmahlzeiten statt 1–2", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 9, lp: 0, em: "N", el: "N", why: "Yasuda 2020: +2,50 vs. +1,77 kg (knapp n. s., Untrainierte)." }
  ]},
  { id: "timing", block: "E", doc: "E3", title: "Protein direkt ums Training", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 6, lp: 0, em: "N", el: "N", why: "Schoenfeld 2013: bei gleicher Tagesmenge sank der Effekt auf 0,16 (n. s.)." }
  ]},
  { id: "presleep", block: "E", doc: "E3", title: "Protein vor dem Schlafen", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 0, em: "N", el: "N", why: "Bei gleicher Tagesmenge kein Unterschied (Joy 2018). Hilft nur, wenn es die Tagesmenge erhöht." }
  ]},
  { id: "source", block: "E", doc: "E4", title: "Proteinquelle", unit: "bei ≥ 1,6 g/kg", options: [
    { id: "mix", label: "Gemischt", std: true, rec: true, mp: 0, lp: 0 },
    { id: "plant", label: "Überwiegend pflanzlich", mp: -3, lp: 0, em: "N", el: "N", why: "Meta-Analyse: tierisch leicht vorn (−0,20). Bei hoher Menge wuchsen vegan und gemischt gleich (Monteyne 2023: je +8,3 %).", note: "Portionen 10–20 % größer gleichen aus" }
  ]},
  { id: "macro", block: "E", doc: "E5", title: "Kohlenhydrate und Fett", unit: "bei gleichen Kalorien und Protein", options: [
    { id: "bal", label: "Ausgewogen (Fett 25–30 %)", std: true, rec: true, mp: 0, lp: 0 },
    { id: "carb", label: "Kohlenhydratbetont", mp: 5, lp: 5, em: "N", el: "N", why: "Henselmans 2026: SMD 0,15 (n. s.)." },
    { id: "keto", label: "Keto", mp: -15, lp: -15, em: "N", el: "NM", why: "Paoli 2021, Vargas 2018: Magermasse stieg nur mit normaler Kost. Burke 2017: schlechtere Ausdauerleistung." },
    { id: "lowfat", label: "Sehr fettarm (< 20 %)", mp: -2, lp: 0, em: "SN", el: "SN", why: "Testosteron ~10–15 % niedriger (Whittaker & Wu 2021), Folgen für den Muskel nicht belegt." }
  ]},
  { id: "fast", block: "E", doc: "E3 · E6", title: "Essfenster", unit: "rund ums Krafttraining", options: [
    { id: "norm", label: "Normal gegessen", std: true, rec: true, mp: 0, lp: 0 },
    { id: "fasted", label: "Nüchtern trainieren", mp: 0, lp: -15, em: "N", el: "N", why: "Kein messbarer Muskelnachteil (Meta-Analyse 2025). Bei Trainierten weniger Volumen (Blake 2025)." },
    { id: "if", label: "Intervallfasten 16:8", mp: 0, lp: -30, em: "N", el: "N", why: "Blake 2025 (Trainierte im Überschuss): Magermasse gleich; Kniebeuge −4 kg ≈ −3 %." }
  ]},
  { id: "fuel", block: "E", doc: "E6", title: "Verpflegung bei Ausdauer > 60 min", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 0, lp: 10, em: "N", el: "M", why: "Essen vorher hilft erst bei > 60 min (Aird 2018: g = 0,3); ~3 % Flüssigkeitsverlust kostet 5,5 % Kraft (Savoie 2015)." }
  ]},
  { id: "alc", block: "E", doc: "E6", title: "Viel Alkohol (~1,5 g/kg)", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: -5, lp: -5, em: "N", el: "N", why: "Parr 2014: Muskelproteinsynthese −24–37 %. Nur Mechanismus." }
  ]},
  { id: "vit", block: "E", doc: "E6", title: "Hochdosiert Vitamin C/E", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: -2, lp: 0, em: "N", el: "N", why: "Clifford 2020: Magermasse −0,07; in Einzelstudien gedämpfte Anpassung." }
  ]},
  // SUPPLEMENTS
  { id: "krea", block: "S", doc: "S1", title: "Kreatin-Monohydrat 3–5 g", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 4, lp: 50, em: "NM", el: "H", why: "Muskel direkt gemessen: Burke 2023 SMD 0,11. Kraft: Wang 2024 +4,4 kg Oberkörper, +11,4 kg Unterkörper ≈ +5 %.", note: "Knapp 1 kg Wasser auf der Waage" }
  ]},
  { id: "whey", block: "S", doc: "S2", title: "Proteinpulver", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 0, em: "N", el: "N", why: "Wirkt nur über die Tagesmenge, nicht als Wirkstoff. Der Nutzen zählt bei der Protein-Stufe." }
  ]},
  { id: "caf", block: "S", doc: "S3", title: "Koffein 1,5–2,5 mg/kg", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 0, lp: 15, em: "N", el: "MH", why: "Mehr Muskel über Wochen nicht belegt (Tamilio 2021, Pakulak 2022). Akut 1RM +~3 % (Grgic 2018).", note: "Nur akut; ≥ 9 h vor dem Schlafen" }
  ]},
  { id: "pre", block: "S", doc: "S3", title: "Pre-Workout", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 15, em: "N", el: "N", why: "Nicht besser als Koffein allein (Snyder 2024, Blake 2020). 44 % der Zutaten verdeckt dosiert, 54 % der Nutzer mit Nebenwirkungen.", note: "Teils verbotene Stimulanzien", warn: true }
  ]},
  { id: "bcaa", block: "S", doc: "S4", title: "BCAA / Leucin", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 4, em: "M", el: "N", why: "Bei ≥ 1,6 g/kg Protein kein Nutzen für Muskel oder Kraft (Plotkin 2021, de Andrade 2020). Etwas weniger Muskelkater." }
  ]},
  { id: "eaa", block: "S", doc: "S4", title: "EAA-Pulver", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 0, em: "SN", el: "SN", why: "Bei jungen Trainierten nie langfristig getestet. Eine Portion Whey liefert ohnehin alle essenziellen Aminosäuren." }
  ]},
  { id: "ba", block: "S", doc: "S4", title: "Beta-Alanin", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 2, lp: 5, em: "N", el: "NM", why: "Fettfreie Masse +0,05 kg (n. s., 20 RCTs). Leistung SMD 0,18 (Saunders 2017), vor allem bei 0,5–10 min Belastung.", note: "Wirksame Dosis über BfR-Grenze", warn: true }
  ]},
  { id: "cit", block: "S", doc: "S4", title: "Citrullin", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 3, em: "SN", el: "N", why: "Muskel nicht gemessen. Akut +3 Wdh. über alle Sätze (Vårvik 2021), bias-korrigiert n. s." }
  ]},
  { id: "hmb", block: "S", doc: "S4", title: "HMB, Glutamin, Arginin", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 0, em: "M", el: "N", why: "HMB bei Trainierten wirkungslos (Sanchez-Martinez 2018); Glutamin und Arginin ohne Empfehlung." }
  ]},
  { id: "myo", block: "S", doc: "S5", title: "Myostatin-„Senker“", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: 0, em: "N", el: "N", why: "Natürliche Methoden senken Myostatin messbar, aber die Senkung sagt den Zuwachs nicht voraus (Kim 2007)." }
  ]},
  // REGENERATION
  { id: "cardio", block: "R", doc: "R1", title: "Laufen und MTB", unit: "Ausdauer neben dem Krafttraining", options: [
    { id: "none", label: "Keine Ausdauer", std: true, myth: true, mp: 0, lp: 0 },
    { id: "plan", label: "2–3× moderat, gut geplant", rec: true, mp: 0, lp: -3, em: "M", el: "NM", why: "Schumann 2022: ganzer Muskel SMD −0,01. Geplant heißt: Kraft zuerst, ≥ 6 h Abstand, nichts Hartes am Tag vor Lower." },
    { id: "bad", label: "Ungeplant (direkt vor Kraft, hart vor Lower)", mp: -8, lp: -20, em: "N", el: "NM", why: "Faserebene −0,23 (Lundberg 2022). Gleiche Einheit bremste den Beinkraftzuwachs (Petré 2021), akut Beinkraft SMD 0,79 (Markov 2022)." }
  ]},
  { id: "sleep", block: "R", doc: "R2", title: "Schlaf", unit: "pro Nacht, gewohnheitsmäßig", options: [
    { id: "s5", label: "≤ 5 h", mp: -10, lp: -40, em: "SN", el: "NM", why: "Schätzung: 5 Nächte à 4 h senkten die Muskelproteinsynthese um 19 % (Saner 2020); akuter Schlafverlust kostete 7,6 % Leistung (Craven 2022)." },
    { id: "s6", label: "~6 h", std: true, myth: true, mp: 0, lp: 0 },
    { id: "s8", label: "7–9 h", rec: true, mp: 10, lp: 25, em: "SN", el: "N", why: "Größe fürs Wachstum bei Trainierten nie gemessen; Schätzung +1 Prozentpunkt (Mechanismus: Saner 2020, Lamon 2021)." }
  ]},
  { id: "stress", block: "R", doc: "R3", title: "Belastung an Tagesform anpassen", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", rec: true, mp: 0, lp: 10, em: "N", el: "N", why: "Kein Wachstumsunterschied gemessen (de Oliveira 2019). Bei hohem Stress war die Kraft erst nach > 96 h statt ~48 h zurück (Stults-Kolehmainen 2014)." }
  ]},
  { id: "cold", block: "R", doc: "R4", title: "Kältebad nach dem Krafttraining", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: -8, lp: -5, em: "N", el: "M", why: "Piñero 2024: Wachstum −0,22. Kraftzuwachs −0,23 (Grgic 2022), weniger Muskelkater." }
  ]},
  { id: "stretchpre", block: "R", doc: "R4", title: "Langes Dehnen vor dem Training (≥ 60 s)", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", myth: true, mp: 0, lp: -23, em: "N", el: "M", why: "Behm 2016: ≥ 60 s pro Muskel −4,6 % Kraft. Kein Wachstumseffekt." }
  ]},
  { id: "stretchlong", block: "R", doc: "R4", title: "Sehr viel Dehnen (15–60 min/Tag)", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 7, lp: 0, em: "N", el: "N", why: "Warneke 2024: Wachstum d = 0,20, aber nur bei extrem langen Dehnzeiten.", note: "Riesiger Zeitaufwand" }
  ]},
  { id: "massage", block: "R", doc: "R4", title: "Massage / Faszienrolle", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 6, em: "SN", el: "NM", why: "Muskelkater SMD 1,13 (Davis 2020); Leistung n. s.; Wachstum unbekannt." }
  ]},
  { id: "compress", block: "R", doc: "R4", title: "Kompression", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 6, em: "SN", el: "NM", why: "Erholung ES 0,38 (Brown 2017)." }
  ]},
  { id: "sauna", block: "R", doc: "R4", title: "Sauna / warmes Bad", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 0, em: "N", el: "N", why: "Magermasse ohne Effekt (Horgan 2023), kein Leistungsnutzen." }
  ]},
  { id: "nap", block: "R", doc: "R2", title: "Nickerchen nach kurzer Nacht", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 5, em: "SN", el: "NM", why: "Hilft der akuten Leistung (Mesas 2023), Wachstum unbekannt." }
  ]},
  { id: "late", block: "R", doc: "R2 · S3", title: "Hart trainieren oder Kaffee kurz vor dem Schlafen", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: -2, lp: -10, em: "SN", el: "N", why: "Koffein kostete im Mittel 45 min Schlaf (Gardiner 2023), harte Einheiten < 2 h vorher verkürzen den Schlaf (Frimpong 2021)." }
  ]},
  { id: "hrv", block: "R", doc: "R3", title: "HRV-gesteuertes Training", toggle: true, options: [
    { id: "off", label: "Aus", std: true, mp: 0, lp: 0 },
    { id: "on", label: "An", mp: 0, lp: 0, em: "N", el: "N", why: "Gleiches Wachstum wie ein fester Plan (de Oliveira 2019: +15,7 vs. +15,8 %)." }
  ]}
];

const SHORT = {
  "prog:p0": "Kein Steigern", "kcal:d500": "Defizit 500 kcal", "kcal:d250": "Defizit 250 kcal", "kcal:s300": "Kleiner Überschuss", "kcal:s600": "Großer Überschuss",
  "krea:on": "Kreatin", "caf:on": "Koffein", "pre:on": "Pre-Workout", "sleep:s8": "Schlaf 7–9 h", "sleep:s5": "Schlaf ≤ 5 h",
  "reps:rh": "2–4 Wdh.", "reps:rl": "15–30 Wdh.", "fast:if": "16:8-Fasten", "fast:fasted": "Nüchtern", "stretchpre:on": "Dehnen vorher",
  "cardio:bad": "Ausdauer ungeplant", "cardio:plan": "Ausdauer geplant", "macro:keto": "Keto", "ex:e1": "Passende Isolation", "rom:sp": "Teilwdh. oben", "cold:on": "Kältebad",
  "rir:r0": "Immer Versagen", "rir:r12": "1–2 RIR", "meals:on": "3–5 Proteinmahlzeiten", "fuel:on": "Verpflegung", "stress:on": "Tagesform", "rest:r60": "Pausen ≤ 60 s",
  "vol:v10": "10 Sätze", "vol:v12": "12 Sätze", "vol:v16": "16 Sätze", "vol:v20": "20+ Sätze", "prot:p16": "Protein 1,6", "prot:p19": "Protein 1,8–2,0", "prot:p22": "Protein 2,2", "prot:p3": "Protein 3+",
  "stretchlong:on": "Viel Dehnen", "timing:on": "Protein-Timing", "peri:on": "Periodisierung", "macro:carb": "KH-betont", "alc:on": "Viel Alkohol", "split:ul": "Upper-Lower",
  "ba:on": "Beta-Alanin", "bcaa:on": "BCAA", "cit:on": "Citrullin", "massage:on": "Massage/Rolle", "compress:on": "Kompression", "nap:on": "Nickerchen", "late:on": "Spät hart/Kaffee",
  "source:plant": "Pflanzlich", "sauna:on": "Sauna/Wärme", "hrv:on": "HRV-Steuerung", "whey:on": "Proteinpulver", "eaa:on": "EAA", "hmb:on": "HMB & Co.", "myo:on": "Myostatin-Senker", "superset:on": "Supersätze", "machine:on": "Maschinen", "dropset:on": "Drop-Sets", "vit:on": "Vitamin C/E", "macro:lowfat": "Sehr fettarm"
};

const BASE_MP = 34, DIMINISH = 0.8, KG_TARGET = 3.5;
const evf = k => k ? EV[k].f : 1;
function optVal(o, kind, w) { const raw = kind === "mp" ? (o.mp || 0) : (o.lp || 0); const ev = kind === "mp" ? o.em : o.el; return w ? raw * evf(ev) : raw; }
function optFactor(o, w) { if (o.f === undefined) return 1; return w ? 1 + (o.f - 1) * evf(o.em) : o.f; }
function stdOf(g) { return g.options.find(x => x.std); }
function getOpt(g, plan) { return g.options.find(x => x.id === plan[g.id]) || stdOf(g); }
/* Zuschläge mit abnehmendem Ertrag; liefert auch die Einzelbeiträge (für die Hantel). */
function planDetail(plan, w) {
  const adds = [], lpAdds = []; let factor = 1; const factors = [];
  GROUPS.forEach(g => {
    const o = getOpt(g, plan);
    if (g.factor) { const f = optFactor(o, w); factor *= f; if (!o.std) factors.push({ g, o, f }); }
    else { const v = optVal(o, "mp", w); if (v) adds.push({ g, o, v }); }
    const l = optVal(o, "lp", w); if (l) lpAdds.push(l);
  });
  const pos = adds.filter(a => a.v > 0).sort((a, b) => b.v - a.v);
  const neg = adds.filter(a => a.v < 0);
  pos.forEach((a, i) => { a.eff = a.v * Math.pow(DIMINISH, i); });
  neg.forEach(a => { a.eff = a.v; });
  const addSum = pos.reduce((s, a) => s + a.eff, 0) + neg.reduce((s, a) => s + a.eff, 0);
  const lpPos = lpAdds.filter(v => v > 0).sort((a, b) => b - a), lpNeg = lpAdds.filter(v => v < 0);
  const lp = lpPos.reduce((s, v, i) => s + v * Math.pow(DIMINISH, i), 0) + lpNeg.reduce((s, v) => s + v, 0);
  return { mp: Math.max(0, (BASE_MP + addSum) * factor), lp, addSum, factor, pos, neg, factors };
}
function presetPlan(kind) {
  const p = {};
  GROUPS.forEach(g => { let o = null; if (kind === "rec") o = g.options.find(x => x.rec); if (kind === "myth") o = g.options.find(x => x.myth); p[g.id] = (o || stdOf(g)).id; });
  return p;
}
const REF_MP = () => planDetail(presetPlan("rec"), true).mp;
function kgPerYear(plan) { return Math.max(0, planDetail(plan, true).mp / REF_MP() * KG_TARGET); }
function rowValues(g, o, w) {
  let mp;
  if (g.factor) {
    const rec = presetPlan("rec");
    mp = planDetail(Object.assign({}, rec, { [g.id]: o.id }), w).mp - planDetail(Object.assign({}, rec, { [g.id]: stdOf(g).id }), w).mp;
  } else mp = optVal(o, "mp", w);
  return { mp, lp: optVal(o, "lp", w) };
}
function allRows(w) {
  const rows = [];
  GROUPS.forEach(g => g.options.forEach(o => { if (o.std) return; const v = rowValues(g, o, w); rows.push({ g, o, mp: v.mp, lp: v.lp, key: g.id + ":" + o.id }); }));
  return rows;
}
if (typeof module !== "undefined") module.exports = { GROUPS, planDetail, presetPlan, kgPerYear, allRows };
