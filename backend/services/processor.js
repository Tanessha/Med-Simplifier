import fs from "fs";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import * as cheerio from "cheerio";
import { fleschKincaidGrade } from "../utils/readability.js";

const pdfjs = pdfjsLib.default ?? pdfjsLib;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

function isGeminiQuotaError(err) {
  const message = String(err?.message || "");
  return /429|RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(message);
}

function normalizeAiDisplayText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/^\s*•\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const BASIC_TERMS = [
  ["myocardial infarction", "heart attack"],
  ["bronchial hyperresponsiveness (BHR)", "airway over-sensitivity"],
  ["bronchial hyperresponsiveness", "airway over-sensitivity"],
  ["expiratory airflow obstruction", "trouble breathing out"],
  ["airway remodeling", "permanent airway damage"],
  ["smooth muscle hypertrophy", "thickening of airway muscles"],
  ["smooth muscle contraction", "airway muscle tightening"],
  ["subepithelial fibrosis", "scarring under the airway lining"],
  ["IgE-mediated", "allergy-driven"],
  ["mucus hypersecretion", "too much mucus production"],
  ["type 2 inflammation", "allergy-type immune response"],
  ["non-type 2 pathways", "non-allergy immune pathways"],
  ["persistent airflow limitation", "ongoing difficulty breathing"],
  ["mast cells", "immune cells that trigger allergic reactions"],
  ["Th2 lymphocytes", "white blood cells that drive allergic reactions"],
  ["fractional exhaled nitric oxide", "exhaled breath test (FeNO)"],
  ["gastroesophageal reflux", "acid reflux"],
  ["post-bronchodilator", "after using an inhaler"],
  ["methacholine challenge", "airway sensitivity test"],
  ["peak expiratory flow", "peak breathing speed (PEF)"],
  ["blood eosinophils", "allergy blood cell count"],
  ["steroid-resistant", "resistant to steroid treatment"],
  ["fixed obstruction", "permanent airway blockage"],
  ["chronic obstructive pulmonary disease", "long-term lung disease (COPD)"],
  ["blood pressure", "blood pressure"],
  ["heart rate", "heart rate"],
  ["blood sugar", "blood sugar"],
  ["bone marrow", "bone marrow"],
  ["immune system", "immune system"],
  ["inflammatory response", "immune swelling response"],
  ["inflammatory cells", "immune cells causing swelling"],
  ["lymph nodes", "glands that fight infection"],
  ["heterogeneous", "varied"],
  ["chronic", "long-term"],
  ["inflammation", "immune swelling"],
  ["inflammatory", "swelling-causing"],
  ["disorder", "condition"],
  ["characterized by", "defined by"],
  ["characterized", "defined"],
  ["bronchial", "airway"],
  ["reversible", "treatable"],
  ["expiratory", "breathing-out"],
  ["obstruction", "blockage"],
  ["structural", "physical"],
  ["pathophysiology", "how the disease works"],
  ["eosinophils", "allergy white blood cells"],
  ["eosinophilic", "allergy-related"],
  ["neutrophils", "infection-fighting white blood cells"],
  ["neutrophilic", "infection-fighting"],
  ["lymphocytes", "white blood cells"],
  ["cytokines", "immune chemical messengers"],
  ["paucigranulocytic", "low immune-cell activity type"],
  ["granulocytic", "immune-cell type"],
  ["phenotypes", "types"],
  ["phenotype", "type"],
  ["spirometry", "breathing function test"],
  ["bronchodilator", "inhaler that opens airways"],
  ["rhinosinusitis", "nose and sinus inflammation"],
  ["comorbidities", "other health conditions"],
  ["comorbidity", "another health condition"],
  ["biomarkers", "measurable body signals"],
  ["biomarker", "measurable body signal"],
  ["ambulatory", "day-to-day"],
  ["stratified", "grouped"],
  ["variants", "variations"],
  ["allergen", "allergy trigger"],
  ["allergic", "allergy-related"],
  ["non-allergic", "non-allergy"],
  ["hypertension", "high blood pressure"],
  ["hypoglycemia", "low blood sugar"],
  ["dyspnea", "shortness of breath"],
  ["tachycardia", "fast heartbeat"],
  ["bradycardia", "slow heartbeat"],
  ["edema", "swelling"],
  ["hemorrhage", "bleeding"],
  ["lesion", "sore or wound"],
  ["benign", "harmless, not cancer"],
  ["malignant", "cancerous"],
  ["metastasis", "cancer spreading"],
  ["prognosis", "expected outcome"],
  ["diagnosis", "identifying the condition"],
  ["pathology", "the disease"],
  ["cardiac", "heart-related"],
  ["pulmonary", "lung-related"],
  ["renal", "kidney-related"],
  ["hepatic", "liver-related"],
  ["neurological", "brain and nerve related"],
  ["gastrointestinal", "stomach and gut"],
  ["musculoskeletal", "muscle and bone"],
  ["hypertrophy", "enlargement"],
  ["atrophy", "shrinking"],
  ["ischemia", "reduced blood flow"],
  ["infarction", "tissue death"],
  ["sepsis", "dangerous blood infection"],
  ["thrombosis", "blood clot"],
  ["embolism", "traveling blockage"],
  ["prophylaxis", "prevention"],
  ["contraindication", "reason not to use"],
  ["anticoagulant", "blood thinner"],
  ["analgesic", "pain reliever"],
  ["antipyretic", "fever reducer"],
  ["diuretic", "water pill"],
  ["subcutaneous", "under the skin"],
  ["intramuscular", "into the muscle"],
  ["intravenous", "into the vein"],
  ["bilateral", "both sides"],
  ["unilateral", "one side"],
  ["etiology", "cause"],
  ["exacerbation", "sudden worsening"],
  ["remission", "period of improvement"],
  ["acute", "sudden"],
  ["asymptomatic", "no symptoms"],
  ["symptomatic", "showing symptoms"],
  ["fibrosis", "scarring"],
  ["necrosis", "tissue death"],
  ["biopsy", "tissue sample test"],
  ["catheter", "thin tube"],
  ["stenosis", "narrowing"],
  ["occluded", "blocked"],
  ["perfusion", "blood flow"],
  ["ventilation", "breathing or air delivery to lungs"],
  ["alveoli", "tiny lung air sacs"],
  ["dysfunctional", "not working properly"],
  ["sensitization", "becoming sensitive to something"],
  ["allergen", "allergy trigger"],
  ["antibody", "disease-fighting protein"],
  ["antigen", "foreign substance"],
  ["receptor", "a cell structure that receives signals"],
  ["mediated", "triggered or controlled"],
  ["pathogenesis", "how a disease develops"],
  ["endemic", "commonly found in an area"],
  ["epidemic", "widespread outbreak of disease"],
  ["pandemic", "worldwide outbreak of disease"],
  ["virulence", "how harmful a germ is"],
  ["pathogens", "germs that cause disease"],
  ["microorganism", "tiny living thing like bacteria or virus"],
  ["immunodeficiency", "weak immune system"],
  ["autoimmune", "self-attacking immune response"],
  ["idiopathic", "cause unknown"],
  ["congenital", "from birth"],
  ["degenerative", "getting progressively worse"],
  ["progressive", "gradually worsening"],
];

const INTERMEDIATE_TERMS = [
  ["myocardial infarction", "heart attack (myocardial infarction)"],
  ["bronchial hyperresponsiveness (BHR)", "airway over-sensitivity (BHR)"],
  ["bronchial hyperresponsiveness", "airway over-sensitivity (BHR)"],
  ["smooth muscle hypertrophy", "airway muscle hypertrophy (thickening)"],
  ["subepithelial fibrosis", "scarring under the airway lining"],
  ["IgE-mediated", "IgE antibody-driven (allergy-type)"],
  ["mucus hypersecretion", "excess mucus production"],
  ["type 2 inflammation", "type 2 (eosinophilic/allergic) inflammation"],
  ["Th2 lymphocytes", "Th2 T-cells (allergy-promoting white blood cells)"],
  ["mast cells", "mast cells (immune cells in allergic reactions)"],
  ["paucigranulocytic", "paucigranulocytic (low white blood cell presence)"],
  ["fractional exhaled nitric oxide", "exhaled nitric oxide test (FeNO)"],
  ["gastroesophageal reflux", "acid reflux (GERD)"],
  ["post-bronchodilator", "after inhaler use"],
  ["methacholine challenge", "airway sensitivity test"],
  ["peak expiratory flow", "peak airflow (PEF)"],
  ["steroid-resistant", "resistant to steroid treatment"],
  ["chronic obstructive pulmonary disease", "COPD (chronic lung disease)"],
  ["tachycardia", "fast heart rate (tachycardia)"],
  ["bradycardia", "slow heart rate (bradycardia)"],
  ["metastasis", "cancer spread (metastasis)"],
  ["ischemia", "reduced blood flow (ischemia)"],
  ["thrombosis", "blood clot (thrombosis)"],
  ["sepsis", "severe blood infection (sepsis)"],
  ["edema", "fluid swelling (edema)"],
  ["hypertension", "high blood pressure (hypertension)"],
  ["hypoglycemia", "low blood sugar (hypoglycemia)"],
  ["dyspnea", "shortness of breath (dyspnea)"],
  ["phenotypes", "subtypes"],
  ["eosinophilic", "eosinophilic (allergy cell-driven)"],
  ["neutrophilic", "neutrophilic (infection-cell driven)"],
  ["fibrosis", "fibrosis (scarring)"],
  ["prophylaxis", "preventive treatment (prophylaxis)"],
  ["contraindication", "reason to avoid this treatment"],
  ["exacerbation", "flare-up or worsening episode"],
  ["asymptomatic", "without noticeable symptoms"],
  ["pathophysiology", "disease mechanism"],
  ["pathogenesis", "disease development process"],
  ["spirometry", "breathing function test (spirometry)"],
  ["rhinosinusitis", "nose and sinus inflammation"],
  ["comorbidities", "other health conditions"],
  ["comorbidity", "another health condition"],
  ["biomarkers", "measurable body signals"],
  ["ambulatory", "day-to-day self-monitoring"],
  ["stratified", "grouped"],
  ["idiopathic", "of unknown cause"],
  ["autoimmune", "self-attacking immune response"],
];

function applyTerms(text, terms) {
  let result = text;
  for (const [from, to] of terms) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![\\w\\-])${escaped}(?![\\w\\-])`, "gi");
    result = result.replace(pattern, to);
  }
  return result.replace(/\(([^)]{1,20})\)\s*\(\1\)/gi, "($1)");
}

function breakLongSentences(text) {
  return text
    .replace(/;\s*/g, ".\n")
    .replace(/,\s+(which|that|where|when|while|however|although|therefore)\s+/gi, ". $1 ");
}

function splitSentences(text) {
  return sanitizeExtractedText(text)
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitIntoSections(text) {
  const blocks = sanitizeExtractedText(text)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const sections = [];
  let pendingHeading = null;

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] || "";
    const rest = lines.slice(1).join(" ").trim();
    const looksLikeHeading =
      lines.length === 1 &&
      firstLine.length <= 50 &&
      !/[.!?]$/.test(firstLine);

    if (looksLikeHeading) {
      pendingHeading = firstLine;
      continue;
    }

    if (pendingHeading) {
      sections.push({ heading: pendingHeading, content: block });
      pendingHeading = null;
      continue;
    }

    if (rest) {
      sections.push({ heading: firstLine, content: rest });
    } else {
      sections.push({ heading: null, content: block });
    }
  }

  if (pendingHeading) {
    sections.push({ heading: pendingHeading, content: "" });
  }

  return sections.length ? sections : [{ heading: null, content: sanitizeExtractedText(text) }];
}

function simplifyHeading(heading, targetLevel) {
  if (!heading) return null;

  const maps = {
    basic: {
      pathophysiology: "What is happening in the lungs",
      "clinical phenotypes": "Common types of asthma",
      "diagnostic metrics": "How doctors check for asthma",
    },
    intermediate: {
      pathophysiology: "What is happening in the airways",
      "clinical phenotypes": "Asthma types",
      "diagnostic metrics": "How asthma is diagnosed",
    },
    advanced: {},
  };

  const key = heading.trim().toLowerCase();
  return maps[targetLevel]?.[key] || heading;
}

function cleanSentenceOutput(text) {
  return sanitizeExtractedText(
    text
      .replace(/\b([A-Za-z][A-Za-z -]+)\s+\1\b/gi, "$1")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/,\s*,/g, ", ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
  );
}

function sentenceCase(text) {
  return text.replace(/^\s*([a-z])/, (_, letter) => letter.toUpperCase());
}

function rewriteBasicSentence(sentence) {
  let result = sentence
    .replace(
      /\bis a heterogeneous, chronic inflammatory disorder of the airways characterized by\b/gi,
      "is a long-term airway condition that causes"
    )
    .replace(/\bit involves\b/gi, "This means the body develops")
    .replace(
      /\bnon-type 2 pathways, including\b/gi,
      "Other non-allergy pathways, including"
    )
    .replace(/\bphenotypes encompass\b/gi, "Doctors describe several asthma types, including")
    .replace(/\bdiagnosis relies on\b/gi, "Doctors usually diagnose it with")
    .replace(/\balongside\b/gi, "They may also use")
    .replace(/\boften linked to\b/gi, "often happens along with");

  result = applyTerms(result, BASIC_TERMS);

  const replacements = [
    [/\bcontribute to\b/gi, "can lead to"],
    [/\bdriving\b/gi, "causing"],
    [/\bvia\b/gi, "through"],
    [/\bsupports ambulatory monitoring\b/gi, "can help with home monitoring"],
    [/\bdemonstrating\b/gi, "showing"],
    [/\bconfirmation\b/gi, "confirming the diagnosis"],
    [/\bunderlying structural changes known as\b/gi, "long-term changes called"],
    [/\belevated\b/gi, "higher-than-normal"],
    [/\bpersistent\b/gi, "ongoing"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  result = result
    .replace(/,\s*(including|with|such as)\s+/gi, ". This can include ")
    .replace(/\s+and\s+/gi, " and ")
    .replace(/>\s*12%/g, "more than 12%")
    .replace(/>\s*20%/g, "more than 20%");

  return sentenceCase(cleanSentenceOutput(result));
}

function rewriteIntermediateSentence(sentence) {
  let result = sentence
    .replace(
      /\bis a heterogeneous, chronic inflammatory disorder of the airways characterized by\b/gi,
      "is a chronic airway condition marked by"
    )
    .replace(/\bit involves\b/gi, "It commonly involves")
    .replace(/\bphenotypes encompass\b/gi, "Asthma phenotypes include")
    .replace(/\bdiagnosis relies on\b/gi, "Diagnosis usually uses")
    .replace(/\balongside\b/gi, "and may also include")
    .replace(/\boften linked to\b/gi, "often occurs with");

  result = applyTerms(result, INTERMEDIATE_TERMS);

  const replacements = [
    [/\bcontribute to\b/gi, "can contribute to"],
    [/\bsupports ambulatory monitoring\b/gi, "supports home monitoring"],
    [/\bunderlying structural changes known as\b/gi, "structural changes called"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  result = result
    .replace(/>\s*12%/g, "more than 12%")
    .replace(/>\s*20%/g, "more than 20%");

  return sentenceCase(cleanSentenceOutput(result));
}

function buildSectionBlock(heading, sentences, bulletPrefix = "- ") {
  const content = sentences.filter(Boolean).map((sentence) => `${bulletPrefix}${sentence}`).join("\n");
  if (!heading) return content;
  return `${heading}\n${content}`;
}

function simplifyBasic(text) {
  const sections = splitIntoSections(text);
  const rewrittenSections = sections.map(({ heading, content }) => {
    const simplifiedHeading = simplifyHeading(heading, "basic");
    const rewrittenSentences = splitSentences(content).map(rewriteBasicSentence);
    return buildSectionBlock(simplifiedHeading, rewrittenSentences);
  }).filter(Boolean);

  return [
    "Plain Language Summary",
    "----------------------",
    "",
    ...rewrittenSections,
    "",
    "This version uses short sentences and everyday words."
  ].join("\n");
}

function simplifyIntermediate(text) {
  const sections = splitIntoSections(text);
  const rewrittenSections = sections.map(({ heading, content }) => {
    const simplifiedHeading = simplifyHeading(heading, "intermediate");
    const rewrittenSentences = splitSentences(content).map(rewriteIntermediateSentence);
    return buildSectionBlock(simplifiedHeading, rewrittenSentences);
  }).filter(Boolean);

  return [
    "Patient-Friendly Version",
    "------------------------",
    "",
    ...rewrittenSections,
    "",
    "Medical terms are kept where useful, with clearer explanations."
  ].join("\n");
}

function simplifyAdvanced(text) {
  const sections = splitIntoSections(text);
  const rewrittenSections = sections.map(({ heading, content }) => {
    const advancedHeading = simplifyHeading(heading, "advanced");
    const cleanedContent = breakLongSentences(sanitizeExtractedText(content));
    return advancedHeading ? `${advancedHeading}\n${cleanedContent}` : cleanedContent;
  }).filter(Boolean);

  return [
    "Clinical Summary",
    "----------------",
    "",
    ...rewrittenSections,
    "",
    "Clinical terminology is preserved for higher-literacy readers."
  ].join("\n");
}

function buildFallbackRewrite(text, targetLevel) {
  switch (targetLevel) {
    case "basic":
      return simplifyBasic(text);
    case "intermediate":
      return simplifyIntermediate(text);
    case "advanced":
      return simplifyAdvanced(text);
    default:
      return simplifyIntermediate(text);
  }
}

function getAiInstructions(targetLevel) {
  const instructionsByLevel = {
    basic: "Reader profile: basic literacy, roughly Grade 6 or below. Use very simple everyday language, short bullets, and direct explanations. Keep all important medical facts, fix broken sentences, avoid repetition, and keep medical terms only when necessary.",
    intermediate: "Reader profile: intermediate literacy, roughly Grade 8 to 10. Use patient-friendly language with brief explanations of useful medical terms. Preserve all important medical facts, fix broken sentences, and avoid repetition.",
    advanced: "Reader profile: advanced literacy, roughly Grade 12+. Use clear clinical language while staying readable. Preserve all important medical facts, fix broken sentences, avoid repetition, and keep correct medical terminology.",
  };

  return instructionsByLevel[targetLevel] || instructionsByLevel.intermediate;
}

function getSummaryShapeInstructions(sourceType) {
  if (sourceType === "url") {
    return [
      "Rewrite the content into a true summary, not a cleaned transcript.",
      "Organize the answer into these sections when the information is present: What is it?, Symptoms, Causes / Triggers, Types, Treatment / Management, Important Notes.",
      "Use bullet points under each section.",
      "Keep each bullet short and easy to scan.",
      "Merge related ideas instead of repeating them.",
      "Do not preserve the original paragraph order.",
      "Do not include references, ads, menus, navigation, or duplicated details.",
      "Keep the response compact, usually under about 220 words.",
    ].join("\n");
  }

  if (sourceType === "image") {
    return [
      "If the source looks like a prescription or medical note, organize the answer into these sections when present: What is it?, Medicines / Treatments, Instructions, Important Notes.",
      "Use bullet points under each section.",
      "Ignore clinic branding, logos, addresses, phone numbers, and decorative letterhead unless medically necessary.",
      "If handwriting is unclear, keep only the parts that are reasonably readable and do not guess.",
      "Keep the response compact and easy to scan.",
    ].join("\n");
  }

  return [
    "Summarize the content instead of copying it.",
    "Use clear section headings and short bullets when helpful.",
    "Keep the rewrite noticeably shorter than the source.",
  ].join("\n");
}

function pickMatchingLines(lines, patterns, limit = 3) {
  const matches = [];

  for (const line of lines) {
    if (patterns.some((pattern) => pattern.test(line))) {
      matches.push(line);
      if (matches.length >= limit) {
        break;
      }
    }
  }

  return matches;
}

function buildCompactUrlFallback(text) {
  const lines = sanitizeExtractedText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.length > 8)
    .filter((line) => !/^health - diseases/i.test(line))
    .filter((line) => !/^asthma$/i.test(line));

  const whatItIs = pickMatchingLines(lines, [
    /airways .* swell/i,
    /hard to breathe/i,
    /long-term .* inflammation/i,
    /bronchospasm/i,
  ], 2);

  const symptoms = pickMatchingLines(lines, [
    /shortness of breath/i,
    /wheezing/i,
    /chest tightness/i,
    /\bcough\b/i,
    /symptoms of asthma/i,
  ], 4);

  const triggers = pickMatchingLines(lines, [
    /trigger/i,
    /allerg/i,
    /cold air/i,
    /exercise/i,
    /smoke/i,
    /stress/i,
  ], 4);

  const care = pickMatchingLines(lines, [
    /rescue inhaler/i,
    /action plan/i,
    /seek emergency/i,
    /call 911/i,
    /emergency room/i,
    /manage asthma/i,
  ], 3);

  const sections = [];

  if (whatItIs.length) {
    sections.push(`What it is\n- ${whatItIs.join("\n- ")}`);
  }
  if (symptoms.length) {
    sections.push(`Common symptoms\n- ${symptoms.join("\n- ")}`);
  }
  if (triggers.length) {
    sections.push(`Common triggers\n- ${triggers.join("\n- ")}`);
  }
  if (care.length) {
    sections.push(`Care and emergency help\n- ${care.join("\n- ")}`);
  }

  if (!sections.length) {
    const fallbackLines = lines.slice(0, 8);
    sections.push(`Quick summary\n- ${fallbackLines.join("\n- ")}`);
  }

  return sanitizeExtractedText(sections.join("\n\n"));
}

function getExtractionInstructions(sourceType) {
  const sourceNotes = {
    text: "The input is plain medical text pasted by a user.",
    url: "The input comes from a webpage and may contain navigation, headers, footers, or repeated site content.",
    document: "The input comes from a medical document and may contain formatting noise, repeated headers, or partial extraction artifacts.",
    image: "The input comes from an image or scan and may contain OCR issues, labels, stamps, handwriting, clinic letterhead, and non-essential text.",
    pdf: "The input comes from a PDF and may contain tables, repeated page headers, footers, or fragmented extraction.",
  };

  return [
    "You are cleaning medical source content before a patient-friendly rewrite.",
    sourceNotes[sourceType] || sourceNotes.text,
    "Keep only medically relevant content.",
    "Remove navigation, branding, subscription prompts, legal notices, repeated headings, and unrelated boilerplate.",
    "Preserve important facts, symptoms, diagnoses, test results, treatments, dates, and medication instructions when present.",
    sourceType === "image"
      ? "For handwritten prescriptions, focus on the patient name, medicines, dosage, schedule, duration, and instructions. Ignore logos, clinic addresses, timings, and phone numbers unless medically relevant."
      : "",
    "Return plain text only.",
    "Do not add commentary such as 'Here is the cleaned text'.",
  ].filter(Boolean).join("\n");
}

function isWeakExtraction(text) {
  const cleaned = sanitizeExtractedText(text);
  if (!cleaned) return true;
  if (cleaned.length < 180) return true;

  const lines = cleaned.split("\n").filter(Boolean);
  const averageLineLength =
    lines.length > 0 ? lines.reduce((total, line) => total + line.length, 0) / lines.length : 0;

  return averageLineLength < 20 || /error reading content|file uploaded successfully|no readable text/i.test(cleaned);
}

async function geminiGenerate(parts) {
  const geminiApiKey = getGeminiApiKey();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const aiText =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim() || "";

  return sanitizeExtractedText(normalizeAiDisplayText(aiText));
}

function buildUploadedFileSummaryPrompt(targetLevel, options = {}) {
  const { sourceType = "document", originalName = "", mimeType = "" } = options;
  const levelInstructions = getAiInstructions(targetLevel);

  return [
    "You are a medical content simplifier.",
    "Read the uploaded medical file directly and produce a clean, useful result.",
    `Target literacy level from the user's saved literacy profile: ${targetLevel}.`,
    levelInstructions,
    `File source type: ${sourceType}.`,
    `Original filename: ${originalName || "unknown"}.`,
    `Mime type: ${mimeType || "unknown"}.`,
    "First determine whether the file is mainly a prescription, a medical report, a lab result, a scan result, or a general medical note.",
    "",
    "If it is a prescription:",
    "- Organize into exactly these sections when present: What it is, Medicines / Treatments, How to Take Them, Important Notes.",
    "- Under Medicines / Treatments, use one bullet per medicine.",
    "- For each medicine bullet, format it like: Medicine name - likely use.",
    "- If the medicine name is partly uncertain, begin with 'Possibly:' before the name.",
    "- Explain the likely use of each medicine from general medical knowledge when the medicine name is readable enough to identify.",
    "- If the written name is imperfect but still clearly resembles a common brand or generic medicine, give the likely use and label the medicine as 'Possibly:'.",
    "- Only say the use is unclear when the medicine identity is too unclear to infer safely.",
    "- Under How to Take Them, use one short bullet per medicine.",
    "- Keep the wording natural and patient-friendly, similar to: 'Take one pill in the morning and one pill at night (1-0-1).'",
    "- Include dose, timing, frequency, duration, before/after food, and other instructions when readable.",
    "- Preserve prescription schedule codes exactly when visible.",
    "- Interpret common schedule codes like this: 1-1-1 means morning, afternoon, and night; 1-0-1 means morning and night; 0-0-1 means night only; 1-0-0 means morning only.",
    "- Do not change 0-0-1 into twice daily or morning-and-night dosing.",
    "- Do not change 1-0-0 into 1-0-1 or any other schedule.",
    "- Preserve duration and follow-up instructions exactly when readable.",
    "- If a duration or instruction is ambiguous, keep the original text and say it is unclear instead of converting it to days, weeks, or months.",
    "- Do not turn shorthand like A/F, AIF, B/F, SOS, HS, OD, BD, TDS, or handwritten abbreviations into full instructions unless the meaning is highly clear.",
    "- Ignore clinic branding, addresses, phone numbers, logos, and decorative letterhead unless medically relevant.",
    "- Do not include filler phrases like 'Here is a summary'.",
    "- Do not output long paragraphs.",
    "- Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "- Use plain text headings only.",
    "",
    "If it is a report, lab result, or scan:",
    "- Organize into exactly these sections when present: What the Report Is About, Key Findings, What It May Mean, Important Notes.",
    "- Explain the condition or findings in simple language.",
    "- State what can reasonably be concluded from the file.",
    "- Do not overstate certainty and do not invent unreadable findings.",
    "",
    "General rules:",
    "- Fix broken or incomplete sentences.",
    "- Do not repeat information.",
    "- Do not invent facts or change medical meaning.",
    "- If handwriting or image quality is unclear, keep only the parts that are reasonably readable and say what is unclear.",
    "- If a date, duration, or review instruction is uncertain, say it is unclear or likely, rather than stating it as certain.",
    "- Use short bullets under headings.",
    "- Keep each bullet to one or two lines when possible.",
    "- Keep the output easy to scan.",
    "- Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
  ].join("\n");
}

function buildUploadedFileNotesPrompt(options = {}) {
  const { sourceType = "document", originalName = "", mimeType = "" } = options;

  return [
    "Read the uploaded medical file directly and extract the medically useful content only.",
    `File source type: ${sourceType}.`,
    `Original filename: ${originalName || "unknown"}.`,
    `Mime type: ${mimeType || "unknown"}.`,
    "If it is a prescription, focus on patient details, medicine names, dose, timing, duration, and instructions.",
    "For prescription schedule codes, preserve them exactly when visible.",
    "Interpret common schedule codes like this: 1-1-1 means morning, afternoon, and night; 1-0-1 means morning and night; 0-0-1 means night only; 1-0-0 means morning only.",
    "Preserve duration and follow-up instructions exactly when readable.",
    "If a duration or instruction is ambiguous, keep the original text and mark it unclear instead of converting it.",
    "If it is a report or scan, focus on the condition, findings, measurements, impressions, and conclusions.",
    "Ignore clinic branding, logos, addresses, phone numbers, working hours, and decorative text unless medically relevant.",
    "Do not guess unreadable handwriting. Mark unclear parts as unclear.",
    "Do not begin with filler like 'Here is the extracted content'.",
    "Return fuller extracted medical content than the simplified summary, but keep it clean and structured.",
    "Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "Use plain text headings and simple lines only.",
  ].join("\n");
}

async function geminiReadMedicalFile(filePath, mimeType, prompt) {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return "";
  }

  const buffer = fs.readFileSync(filePath);

  try {
    return await geminiGenerate([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      },
    ]);
  } catch (err) {
    if (isGeminiQuotaError(err)) {
      return "";
    }
    throw err;
  }
}

export async function buildMedicalNotesFromFile(filePath, options = {}) {
  const { mimeType = "" } = options;
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey || !mimeType) {
    return "";
  }

  return geminiReadMedicalFile(
    filePath,
    mimeType,
    buildUploadedFileNotesPrompt(options)
  );
}

export async function summarizeUploadedMedicalFile(filePath, targetLevel, options = {}) {
  const { mimeType = "" } = options;
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey || !mimeType) {
    return "";
  }

  return geminiReadMedicalFile(
    filePath,
    mimeType,
    buildUploadedFileSummaryPrompt(targetLevel, options)
  );
}

async function rewriteWithAi(text, targetLevel) {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return buildFallbackRewrite(text, targetLevel);
  }

  const levelInstructions = getAiInstructions(targetLevel);

  const prompt = [
    "You rewrite medical content into a cleaner, shorter, literacy-matched summary.",
    "Remove site navigation, duplicate lines, legal or subscription prompts, and non-medical website boilerplate.",
    "Keep only medically useful information.",
    `Target literacy level: ${targetLevel}.`,
    levelInstructions,
    "Format the answer as a concise summary with short headings when useful.",
    "Aim for 4 to 6 short sections at most.",
    "Use bullets only when they improve readability.",
    "Do not repeat the source paragraph-by-paragraph.",
    "Keep only the most important symptoms, causes or triggers, warning signs, and care guidance.",
    "Do not start with phrases like 'Here is a summary' or 'Sure'.",
    "Do not include menus, request-an-appointment prompts, newsletter text, language switchers, or unrelated site content.",
    "Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "Source text:",
    text,
  ].join("\n\n");

  return geminiGenerate([{ text: prompt }]);
}

async function rewriteWithAiSummary(text, targetLevel, sourceType = "text") {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return buildFallbackRewrite(text, targetLevel);
  }

  const levelInstructions = getAiInstructions(targetLevel);
  const shapeInstructions = getSummaryShapeInstructions(sourceType);

  const prompt = [
    "You are a medical content simplifier.",
    "Convert complex medical text into a clear, accurate, easy-to-understand summary.",
    `Source type: ${sourceType}.`,
    `Target literacy level from the user's saved literacy profile: ${targetLevel}.`,
    levelInstructions,
    shapeInstructions,
    "Preserve all important medical information.",
    "Do not remove key facts, symptoms, causes, treatments, risks, or warnings that appear in the source.",
    "Do not invent facts or change the meaning of medical terms.",
    "Fix broken or incomplete sentences.",
    "Remove website boilerplate, duplicated points, legal text, newsletter prompts, navigation, references, and unrelated site content.",
    "Do not start with 'Here is a summary' or similar filler.",
    "Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "Use plain text headings and simple hyphen bullets only when helpful.",
    "Source text:",
    text,
  ].join("\n\n");

  return geminiGenerate([{ text: prompt }]);
}

export async function summarizeUploadedMedicalContent(
  text,
  targetLevel,
  options = {}
) {
  const cleanedText = sanitizeExtractedText(text);
  const { sourceType = "document", originalName = "", mimeType = "" } = options;
  const geminiApiKey = getGeminiApiKey();

  if (!cleanedText) {
    return "";
  }

  if (!geminiApiKey) {
    return rewriteText(cleanedText, targetLevel, {
      sourceType,
      requireMeaningfulChange: true,
    });
  }

  const levelInstructions = getAiInstructions(targetLevel);
  const prompt = [
    "You are a medical content simplifier.",
    "Your task is to read uploaded medical content and choose the right output style based on what kind of document it is.",
    `Target literacy level from the user's saved literacy profile: ${targetLevel}.`,
    levelInstructions,
    `File source type: ${sourceType}.`,
    `Original filename: ${originalName || "unknown"}.`,
    `Mime type: ${mimeType || "unknown"}.`,
    "First determine whether the content is mainly a prescription, a medical report, a lab result, a scan summary, or a general medical note.",
    "Then follow the matching output style below.",
    "",
    "If it is a prescription:",
    "- Organize into: What it is, Medicines / Treatments, How to Take Them, Important Notes.",
    "- For each medicine, include the name as written if readable.",
    "- Explain the likely use of the medicine when reasonably supported by the text or by a clearly recognizable medicine name.",
    "- If the written name is imperfect but still clearly resembles a common brand or generic medicine, label it as 'Possibly:' and give the likely use.",
    "- Only say the use is unclear when the medicine identity is too unclear to infer safely.",
    "- Explain the schedule, frequency, duration, and special instructions when readable.",
    "- Keep the style concise and helpful, similar to: 'Possibly: Ralicab - This medicine likely helps reduce stomach acid.'",
    "- In How to Take Them, keep one short bullet per medicine and preserve the same timing seen in the extracted content.",
    "- Preserve prescription schedule codes exactly when visible.",
    "- Interpret common schedule codes like this: 1-1-1 means morning, afternoon, and night; 1-0-1 means morning and night; 0-0-1 means night only; 1-0-0 means morning only.",
    "- Do not convert 0-0-1 into morning-and-night dosing.",
    "- Do not convert 1-0-0 into morning-and-night dosing.",
    "- Preserve duration and follow-up instructions exactly when readable.",
    "- If a duration or instruction is ambiguous, keep the original text and mark it unclear instead of converting it.",
    "- Do not expand shorthand like A/F, AIF, B/F, SOS, HS, OD, BD, or TDS unless the meaning is highly clear from the note.",
    "- If handwriting is unclear, do not guess. Mark unreadable parts as unclear.",
    "",
    "If it is a medical report, lab result, or scan result:",
    "- Organize into: What the Report Is About, Key Findings, What It May Mean, Important Notes.",
    "- Explain the medical condition or finding in simple language.",
    "- Summarize what can reasonably be concluded from the report.",
    "- Do not overstate certainty. If the report is incomplete or unclear, say so.",
    "",
    "General rules:",
    "- Preserve important medical facts.",
    "- Fix broken or incomplete sentences.",
    "- Do not repeat information.",
    "- Do not invent details or change medical meaning.",
    "- Ignore clinic branding, addresses, phone numbers, logos, and unrelated website text unless medically relevant.",
    "- Use short bullets under headings.",
    "- Keep the output easy to scan.",
    "- Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "Source text:",
    cleanedText,
  ].join("\n");

  try {
    return await geminiGenerate([{ text: prompt }]);
  } catch (err) {
    if (isGeminiQuotaError(err)) {
      return rewriteText(cleanedText, targetLevel, {
        sourceType,
        requireMeaningfulChange: true,
      });
    }
    throw err;
  }
}

export async function buildMedicalNotes(text, sourceType = "text") {
  const cleanedText = sanitizeExtractedText(text);
  const geminiApiKey = getGeminiApiKey();
  if (!cleanedText) {
    return "";
  }

  if (!geminiApiKey) {
    const lines = cleanedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 28);
    return sanitizeExtractedText(lines.join("\n"));
  }

  const prompt = [
    "Extract concise medical notes from the source.",
    `Source type: ${sourceType}.`,
    "Return only the medically useful points.",
    "Ignore advertising, branding, navigation, images, references, and general website copy.",
    "Prefer clear structured medical notes with headings when helpful.",
    "Include the important definition, symptoms, causes or triggers, types if present, treatment or management, and important risks or warnings when present.",
    sourceType === "image"
      ? "If this is a prescription image, focus on the patient details, medicines, dose, timing, duration, and instructions. Interpret common schedule codes like this: 1-1-1 means morning, afternoon, and night; 1-0-1 means morning and night; 0-0-1 means night only; 1-0-0 means morning only. Ignore clinic headers, addresses, and contact information unless medically necessary."
      : "",
    "Keep the notes fuller than the simplified summary, but still remove website junk and repeated lines.",
    "Keep it under about 420 words.",
    "Do not use Markdown formatting such as **, *, ##, or numbered-list styling.",
    "Use plain text only.",
    "Source text:",
    cleanedText,
  ].filter(Boolean).join("\n\n");

  try {
    return await geminiGenerate([{ text: prompt }]);
  } catch (err) {
    if (isGeminiQuotaError(err)) {
      const lines = cleanedText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 28);
      return sanitizeExtractedText(lines.join("\n"));
    }
    throw err;
  }
}

async function distillMedicalTextWithAi(text, sourceType = "text") {
  const cleanedText = sanitizeExtractedText(text);
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey || !cleanedText) {
    return cleanedText;
  }

  const prompt = [
    getExtractionInstructions(sourceType),
    "Source text:",
    cleanedText.slice(0, 18000),
  ].join("\n\n");

  const aiText = await geminiGenerate([{ text: prompt }]);
  return sanitizeExtractedText(aiText) || cleanedText;
}

function classifyLevel(score) {
  if (score < 6) return "Low Literacy";
  if (score < 10) return "Patient-Friendly";
  return "Doctor-Level";
}

function sanitizeExtractedText(text) {
  return (text || "")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeForComparison(text) {
  return sanitizeExtractedText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isNearCopyRewrite(source, rewritten) {
  const sourceNorm = normalizeForComparison(source);
  const rewrittenNorm = normalizeForComparison(rewritten);

  if (!sourceNorm || !rewrittenNorm) {
    return false;
  }

  if (rewrittenNorm.includes(sourceNorm.slice(0, Math.min(200, sourceNorm.length)))) {
    return true;
  }

  const sourceWords = sourceNorm.split(" ").filter(Boolean);
  const rewrittenWords = rewrittenNorm.split(" ").filter(Boolean);
  if (!sourceWords.length || !rewrittenWords.length) {
    return false;
  }

  const overlapCount = rewrittenWords.filter((word) => sourceWords.includes(word)).length;
  const overlapRatio = overlapCount / rewrittenWords.length;
  const relativeLength = rewrittenNorm.length / sourceNorm.length;

  return overlapRatio > 0.82 && relativeLength > 0.72;
}

function stripHtmlToText(html) {
  return sanitizeExtractedText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|section|article|br)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
  );
}

function normalizeUrlPathTitle(url) {
  try {
    const pathname = new URL(url).pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.replace(/[-_]+/g, " ").trim())
      .filter(Boolean)
      .join(" - ");
    if (
      /^(health|diseases?|conditions?)\b/i.test(pathname) ||
      /\b\d{3,}\b/.test(pathname)
    ) {
      return "";
    }
    return pathname;
  } catch {
    return "";
  }
}

function removeLowValueNodes(html) {
  const $ = cheerio.load(html);

  [
    "script",
    "style",
    "noscript",
    "svg",
    "form",
    "header",
    "footer",
    "nav",
    "aside",
    "iframe",
    ".newsletter",
    ".subscribe",
    ".signup",
    ".social",
    ".advertisement",
    ".ads",
    ".cookie",
    ".breadcrumbs",
    ".menu",
    ".navigation",
    "[role='navigation']",
    "[aria-label*='breadcrumb']",
    "[aria-label*='social']",
  ].forEach((selector) => $(selector).remove());

  $("a, button").each((_, element) => {
    const text = $(element).text().trim().toLowerCase();
    if (
      [
        "request an appointment",
        "subscribe",
        "sign up",
        "learn more",
        "retry",
        "give now",
        "find a doctor",
      ].includes(text)
    ) {
      $(element).remove();
    }
  });

  return $.html();
}

function dedupeLines(text) {
  const seen = new Set();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

function filterLowValueLines(text) {
  const lowValuePatterns = [
    /this content does not have an .* version/i,
    /skip to content/i,
    /request an appointment/i,
    /sign up for free/i,
    /from .* to your inbox/i,
    /review\/update the information/i,
    /there is a problem with information submitted/i,
    /find a doctor/i,
    /learn more about .* use of data/i,
    /subscribe!?/i,
    /retry/i,
    /care at .* clinic/i,
    /for medical professionals/i,
    /giving to .* clinic/i,
    /mayo clinic school/i,
    /patient & visitor guide/i,
    /health letter/i,
    /^health - diseases - \d+/i,
    /^care at$/i,
    /^mayo clinic$/i,
    /^health$/i,
    /^library$/i,
    /^research$/i,
    /^education$/i,
    /^giving to$/i,
    /^locations$/i,
    /^clinical trials$/i,
    /^billing & insurance$/i,
    /^departments & centers$/i,
    /^international services$/i,
    /^contact us$/i,
    /^tests & procedures$/i,
    /^drugs & supplements$/i,
    /^healthy lifestyle$/i,
    /^medical professional resources$/i,
    /^refer a patient$/i,
    /^continuing medical education$/i,
    /^video center$/i,
    /^journals & publications$/i,
    /^research faculty$/i,
    /^laboratories$/i,
    /^core facilities$/i,
    /^centers & programs$/i,
    /^departments & divisions$/i,
    /^postdoctoral fellowships$/i,
    /^training grant programs$/i,
    /^frequently asked questions$/i,
    /^make a donation$/i,
    /^log in$/i,
    /^search$/i,
    /^menu request appointment$/i,
    /^donate$/i,
    /^diagnosis & treatment$/i,
    /^doctors & departments$/i,
    /^print$/i,
    /^enlarge image$/i,
    /^close$/i,
    /^products & services$/i,
    /^a book:/i,
    /^more information$/i,
    /^email$/i,
    /^address 1$/i,
    /^error /i,
    /thank you for subscribing/i,
    /sorry something went wrong/i,
    /^living with /i,
    /^see more discussions$/i,
    /^show references$/i,
    /accessed [A-Z][a-z]+ \d{1,2}, \d{4}/i,
    /doi:/i,
    /^by mayo clinic staff$/i,
    /^\d+ replies$/i,
    /^chevron-right$/i,
    /^overview$/i,
    /^symptoms &causes/i,
    /^symptoms & causes/i,
    /^care atmayo clinic/i,
    /^care at mayo clinic/i,
    /^research & education/i,
    /^diseases & conditions$/i,
    /^request appointment$/i,
    /^mayo clinic does not endorse/i,
    /^advertising revenue supports/i,
    /^policy opportunities/i,
    /^mayo clinic press/i,
    /^terms & conditions$/i,
    /^privacy policy$/i,
    /^notice of privacy practices$/i,
    /^notice of nondiscrimination$/i,
    /^digital accessibility statement$/i,
    /^site map$/i,
    /^manage cookies$/i,
    /^all rights reserved\.?$/i,
    /^english$/i,
    /^advertisement$/i,
    /^view image online/i,
    /^better health starts here$/i,
    /^experts you can trust$/i,
    /^a note from /i,
    /^what is asthma\?$/i,
    /^español$/i,
    /^العربية$/i,
    /^简体中文$/i,
  ];

  const cleaned = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !lowValuePatterns.some((pattern) => pattern.test(line)))
    .filter((line) => line.length > 1);

  return cleaned.join("\n");
}

function trimMedicalArticleWindow(text) {
  const lines = sanitizeExtractedText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return "";
  }

  const startPatterns = [
    /^overview$/i,
    /^symptoms$/i,
    /^what it is$/i,
    /^about this condition$/i,
    /^if you have /i,
    /^[A-Z][A-Za-z' -]+ is a condition in which/i,
  ];

  const endPatterns = [
    /^by mayo clinic staff$/i,
    /^show references$/i,
    /^references$/i,
    /^related$/i,
    /^associated procedures$/i,
    /^news from /i,
    /^connect with others like you/i,
    /^mayo clinic does not endorse/i,
    /^advertising revenue supports/i,
    /^terms & conditions$/i,
    /^privacy policy$/i,
    /^© /i,
  ];

  let startIndex = lines.findIndex((line) => startPatterns.some((pattern) => pattern.test(line)));
  if (startIndex === -1) {
    startIndex = 0;
  }

  let endIndex = lines.findIndex((line, index) => index > startIndex && endPatterns.some((pattern) => pattern.test(line)));
  if (endIndex === -1) {
    endIndex = lines.length;
  }

  const articleLines = lines.slice(startIndex, endIndex).filter((line) => {
    if (/^\w[\w &:-]{0,80}$/.test(line)) {
      return true;
    }

    const medicalSignal =
      /(asthma|symptom|doctor|treatment|trigger|allergen|wheez|cough|breath|lung|inhaler|emergency|risk|complication|prevention|diagnosis|airway|mucus|exercise|infection|medicine|vaccin|pneumonia|peak flow|shortness of breath)/i;

    return medicalSignal.test(line);
  });

  return sanitizeExtractedText(articleLines.join("\n"));
}

function extractReadableArticle(html, url) {
  const cleanedHtml = removeLowValueNodes(html);
  const dom = new JSDOM(cleanedHtml, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article?.textContent) {
    return "";
  }

  const titlePrefix = sanitizeExtractedText(article.title || normalizeUrlPathTitle(url));
  const articleText = sanitizeExtractedText(article.textContent);
  const combined = titlePrefix ? `${titlePrefix}\n\n${articleText}` : articleText;

  return sanitizeExtractedText(filterLowValueLines(dedupeLines(combined)));
}

function extractHeuristicArticle(html, url) {
  const $ = cheerio.load(removeLowValueNodes(html));
  const candidateSelectors = [
    "main article",
    "article",
    "main",
    "[role='main']",
    ".content",
    ".article-content",
    ".main-content",
    ".body-content",
    "#content",
    "#main-content",
  ];

  const blocks = [];

  for (const selector of candidateSelectors) {
    $(selector).each((_, element) => {
      const text = sanitizeExtractedText(
        $(element)
          .find("h1, h2, h3, p, li")
          .map((__, node) => $(node).text())
          .get()
          .join("\n")
      );

      if (text.length > 500) {
        blocks.push(text);
      }
    });

    if (blocks.length) {
      break;
    }
  }

  if (!blocks.length) {
    const bodyText = sanitizeExtractedText(
      $("body")
        .find("h1, h2, h3, p, li")
        .map((_, node) => $(node).text())
        .get()
        .join("\n")
    );

    if (bodyText) {
      blocks.push(bodyText);
    }
  }

  const titlePrefix = normalizeUrlPathTitle(url);
  const combined = [titlePrefix, ...blocks].filter(Boolean).join("\n\n");
  return sanitizeExtractedText(filterLowValueLines(dedupeLines(combined)));
}

function extractStructuredPageText(html, url) {
  const $ = cheerio.load(html);
  const bodyLines = $("body")
    .find("h1, h2, h3, p, li")
    .map((_, node) => sanitizeExtractedText($(node).text()))
    .get()
    .filter(Boolean);

  const titlePrefix = normalizeUrlPathTitle(url);
  const combined = [titlePrefix, ...bodyLines].filter(Boolean).join("\n");
  return sanitizeExtractedText(trimMedicalArticleWindow(filterLowValueLines(dedupeLines(combined))));
}

function shouldUseFallbackArticleText(text) {
  const cleaned = sanitizeExtractedText(text);
  if (!cleaned) return true;

  const lines = cleaned.split("\n").filter(Boolean);
  if (lines.length <= 2) return true;
  if (cleaned.length < 400) return true;

  return false;
}

async function extractPdfText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return sanitizeExtractedText(pages.join("\n\n"));
}

async function extractPdfTextWithOcr(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const imageBuffer = canvas.toBuffer("image/png");
    const { data: ocrData } = await Tesseract.recognize(imageBuffer, "eng");
    pages.push(ocrData?.text || "");
  }

  return sanitizeExtractedText(pages.join("\n\n"));
}

async function extractDocxText(filePath) {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return sanitizeExtractedText(value);
}

async function extractImageText(filePath) {
  const { data } = await Tesseract.recognize(filePath, "eng");
  return sanitizeExtractedText(data?.text);
}

async function extractWithGeminiFallback(filePath, mimeType) {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return "";
  }

  const buffer = fs.readFileSync(filePath);

  try {
    return await geminiGenerate([
      {
        text: [
          "Read this medical file and extract only the medically relevant content.",
          "Ignore logos, repeated headers, navigation-like text, decoration, and unrelated boilerplate.",
          "Preserve diagnoses, symptoms, medications, test results, treatment plans, dates, and key instructions when present.",
          "If this is a handwritten prescription, focus on medicine names, dosage, frequency, duration, and instructions. Ignore clinic branding, addresses, and phone numbers unless medically relevant.",
          "Return plain text only.",
        ].join("\n"),
      },
      {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      },
    ]);
  } catch (err) {
    if (isGeminiQuotaError(err)) {
      return "";
    }
    throw err;
  }
}

async function extractPlainText(filePath) {
  return sanitizeExtractedText(fs.readFileSync(filePath, "utf-8"));
}

export function analyzeText(text) {
  const score = fleschKincaidGrade(text);
  return { score, level: classifyLevel(score) };
}

export async function rewriteText(text, targetLevel, options = {}) {
  const { sourceType = "text", requireMeaningfulChange = false } = options;

  try {
    let aiResult =
      sourceType === "url"
        ? await rewriteWithAiSummary(text, targetLevel, sourceType)
        : await rewriteWithAi(text, targetLevel);

    if (
      requireMeaningfulChange &&
      aiResult &&
      (aiResult.startsWith("Plain Language Summary") || isNearCopyRewrite(text, aiResult))
    ) {
      aiResult = await rewriteWithAiSummary(text, targetLevel, sourceType);
    }

    if (
      sourceType === "url" &&
      aiResult &&
      (aiResult.startsWith("Plain Language Summary") || isNearCopyRewrite(text, aiResult))
    ) {
      const notes = await buildMedicalNotes(text, sourceType);
      aiResult = notes ? await rewriteWithAiSummary(notes, targetLevel, sourceType) : aiResult;
    }

    if (
      sourceType === "url" &&
      aiResult &&
      (aiResult.startsWith("Plain Language Summary") || isNearCopyRewrite(text, aiResult))
    ) {
      aiResult = buildCompactUrlFallback(text);
    }

    if (aiResult) {
      return aiResult;
    }
  } catch (err) {
    console.error("AI rewrite failed, falling back to local simplifier:", err.message);
  }

  if (sourceType === "url") {
    return buildCompactUrlFallback(text);
  }

  return buildFallbackRewrite(text, targetLevel);
}

export async function processFileContent(file, literacyLevel) {
  let text = "";
  const geminiApiKey = getGeminiApiKey();

  try {
    if (file.mimetype === "application/pdf") {
      if (geminiApiKey) {
        text = await extractWithGeminiFallback(file.path, file.mimetype);
      }
      if (isWeakExtraction(text)) {
        text = await extractPdfText(file.path);
      }
      if (isWeakExtraction(text)) {
        text = await extractPdfTextWithOcr(file.path);
      }
      if (isWeakExtraction(text) && geminiApiKey) {
        const aiText = await extractWithGeminiFallback(file.path, file.mimetype);
        if (aiText) {
          text = aiText;
        }
      }
    } else if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractDocxText(file.path);
      if (text) {
        text = await distillMedicalTextWithAi(text, "document");
      }
    } else if (file.mimetype.startsWith("image/")) {
      if (geminiApiKey) {
        text = await extractWithGeminiFallback(file.path, file.mimetype);
      }
      if (isWeakExtraction(text)) {
        text = await extractImageText(file.path);
      }
      if (isWeakExtraction(text) && geminiApiKey) {
        const aiText = await extractWithGeminiFallback(file.path, file.mimetype);
        if (aiText) {
          text = aiText;
        }
      }
    } else {
      text = await extractPlainText(file.path);
      if (text) {
        text = await distillMedicalTextWithAi(text, "document");
      }
    }
  } catch (err) {
    throw new Error(`Unable to read uploaded file: ${err.message}`);
  }

  if (!text) {
    throw new Error("No readable text could be extracted from the uploaded file.");
  }

  const score = fleschKincaidGrade(text);
  return { text, score, level: literacyLevel };
}

export async function processUrlContent(url, literacyLevel) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch URL content (${response.status}).`);
  }

  const html = await response.text();
  const articleText = extractReadableArticle(html, url);
  const heuristicText = trimMedicalArticleWindow(extractHeuristicArticle(html, url));
  const structuredText = extractStructuredPageText(html, url);
  const fallbackText = trimMedicalArticleWindow(filterLowValueLines(dedupeLines(stripHtmlToText(html))));
  const preferredText = shouldUseFallbackArticleText(articleText)
    ? (
        shouldUseFallbackArticleText(heuristicText)
          ? (shouldUseFallbackArticleText(structuredText) ? fallbackText : structuredText)
          : heuristicText
      )
    : articleText;
  const text = sanitizeExtractedText(preferredText).slice(0, 12000);

  if (!text) {
    throw new Error("No readable text could be extracted from the URL.");
  }

  const score = fleschKincaidGrade(text);
  return { text, score, level: literacyLevel };
}
