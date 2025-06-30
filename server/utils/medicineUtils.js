const axios = require('axios');

// Correct drug name using RxNorm approximateTerm API
async function correctDrugName(drug) {
  try {
    const res = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(drug)}&maxEntries=1`
    );
    const candidates = res.data.approximateGroup?.candidate;
    if (candidates && candidates.length > 0) {
      return candidates[0].term; // Return best match
    }
    return drug; // Return original if no match found
  } catch (err) {
    // On error, return original
    return drug;
  }
}

// Get RxCUI (RxNorm Concept Unique Identifier) by drug name
async function getRxCUI(drugName) {
  try {
    const res = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
    );
    const idGroup = res.data.idGroup;
    if (idGroup && idGroup.rxnormId && idGroup.rxnormId.length > 0) {
      return idGroup.rxnormId[0]; // Return first RxCUI
    }
    return null; // No RxCUI found
  } catch (err) {
    return null; // On error return null
  }
}

// Get detailed medicine info by RxCUI
async function getMedicineInfo(rxcui) {
  try {
    const res = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`
    );
    return res.data.properties || null; // Return properties object or null
  } catch (err) {
    return null; // On error return null
  }
}

// Convert raw OCR text to corrected digital prescription lines
async function convertToDigitalPrescription(text) {
  const lines = text.split('\n').filter(Boolean);
  const digitalPrescriptions = [];

  for (const line of lines) {
    const words = line.trim().split(' ');
    let correctedName = null;

    // Try drug name candidates starting from 3 words down to 1 word
    for (let len = Math.min(3, words.length); len > 0; len--) {
      const candidate = words.slice(0, len).join(' ');
      const corrected = await correctDrugName(candidate);

      // If correction is found and different from candidate
      if (corrected && corrected.toLowerCase() !== candidate.toLowerCase()) {
        correctedName = corrected;
        const rest = words.slice(len).join(' ');
        digitalPrescriptions.push(`${correctedName} ${rest}`.trim());
        break;
      }
    }

    // If no correction found, keep original line
    if (!correctedName) {
      digitalPrescriptions.push(line.trim());
    }
  }

  return digitalPrescriptions;
}

module.exports = {
  correctDrugName,
  getRxCUI,
  getMedicineInfo,
  convertToDigitalPrescription,
};
