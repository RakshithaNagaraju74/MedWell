const axios = require('axios');

function isPotentialDrugWord(word) {
  // Must start with a letter, contain only alphanumerics or hyphens, min length 3
  return /^[a-zA-Z][a-zA-Z0-9\-]{2,}$/.test(word);
}

async function correctDrugName(word) {
  try {
    const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/approximateTerm`, {
      params: {
        term: word,
        maxEntries: 1
      }
    });

    const candidates = response.data.approximateGroup.candidate;
    if (!candidates || candidates.length === 0) return null;

    const rxcuiCandidate = candidates.find(c => parseInt(c.score) >= 80);
    if (!rxcuiCandidate) return null;

    // Fetch the correct drug name using RxCUI
    const rxcui = rxcuiCandidate.rxcui;
    const nameResp = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
    const correctName = nameResp.data.properties.name;

    return correctName || null;
  } catch (error) {
    console.error(`RxNorm error for "${word}":`, error.message);
    return null;
  }
}

async function convertToDigitalPrescription(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  const correctedLines = await Promise.all(lines.map(async (line) => {
    const words = line.split(/\s+/);
    const correctedWords = await Promise.all(words.map(async word => {
      if (!isPotentialDrugWord(word)) return word;

      const corrected = await correctDrugName(word);
      if (corrected && corrected.toLowerCase() !== word.toLowerCase()) {
        console.log(`🔍 "${word}" ➜ "${corrected}"`);
        return corrected.toLowerCase(); // standardize case
      }
      return word;
    }));

    return correctedWords.join(' ');
  }));

  return correctedLines;
}

module.exports = { convertToDigitalPrescription };
