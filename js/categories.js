/* ProofStamp – Kategorien & Konstanten */
const CATEGORIES = [
  { id: "apartment", emoji: "\u{1F3E0}", i18nKey: "catApartment" },
  { id: "vehicle", emoji: "\u{1F697}", i18nKey: "catVehicle" },
  { id: "purchase", emoji: "\u{1F4E6}", i18nKey: "catPurchase" },
  { id: "communication", emoji: "\u{1F4AC}", i18nKey: "catCommunication" },
  { id: "contract", emoji: "\u{1F4C4}", i18nKey: "catContract" },
  { id: "workplace", emoji: "\u{1F4BC}", i18nKey: "catWorkplace" },
  { id: "other", emoji: "\u{1F4C1}", i18nKey: "catOther" }
];

const DB_NAME = "proofstamp-db";
const DB_VERSION = 1;
const STORE_NAME = "proofs";
const APP_VERSION = "1.0.0";

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function getCategoryLabel(id) {
  const cat = getCategoryById(id);
  return cat.emoji + " " + t(cat.i18nKey);
}
