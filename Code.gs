/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   KRASIVY LUX — Google Apps Script Backend                   ║
 * ║   Paste this entire file into Google Apps Script             ║
 * ║   (script.google.com) and deploy as a Web App               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * SHEETS STRUCTURE (auto-created on first run):
 *   Sheet "Watches": id | name | type | price | description | mainImage | colors | colorImages
 *   Sheet "Orders":  timestamp | watchId | watchName | watchColor | watchPrice | clientName | clientPhone | wilayaCode | wilayaName | deliveryMode | shippingDZD | carrier | clientAddress | notes
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// The spreadsheet ID is in your Google Sheets URL:
// https://docs.google.com/spreadsheets/d/  <SPREADSHEET_ID>  /edit
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// ── MAIN ROUTER ───────────────────────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    if (action === 'getWatches') result = getWatches();
    else if (action === 'getOrders')  result = getOrders();
    else result = { error: 'Unknown action' };
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var raw = (e.postData && e.postData.contents) ? e.postData.contents : '';
  if (!raw) {
    return jsonResponse({ error: 'No post data — vérifiez le déploiement Web App et le corps de la requête' });
  }

  var payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON' });
  }

  var action = payload.action;
  var result;

  try {
    if      (action === 'addWatch')     result = addWatch(payload);
    else if (action === 'deleteWatch') result = deleteWatch(payload);
    else if (action === 'addOrder')    result = addOrder(payload);
    else if (action === 'uploadImage') result = uploadImage(payload);
    else result = { error: 'Unknown action' };
  } catch (err) {
    result = { error: err.message };
  }

  return jsonResponse(result);
}

/**
 * Enregistre une image (base64) sur Google Drive et renvoie une URL affichable.
 * Au premier usage, autorisez l’accès à Google Drive dans la fenêtre Apps Script.
 */
function uploadImage(data) {
  if (!data.base64) {
    return { error: 'Missing base64' };
  }
  var bytes = Utilities.base64Decode(data.base64);
  var mime = data.mimeType || 'image/jpeg';
  var name = data.fileName || ('watch-' + Date.now() + '.jpg');
  var blob = Utilities.newBlob(bytes, mime, name);
  var file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = file.getId();
  var url = 'https://drive.google.com/uc?export=view&id=' + id;
  return { success: true, url: url };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── SETUP SHEETS ─────────────────────────────────────────────────────────────
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getWatchesSheet() {
  return getOrCreateSheet('Watches', [
    'id','name','type','price','description','mainImage','colors','colorImages'
  ]);
}

function getOrdersSheet() {
  return getOrCreateSheet('Orders', [
    'timestamp','watchId','watchName','watchColor','watchPrice',
    'clientName','clientPhone','wilayaCode','wilayaName','deliveryMode','shippingDZD','carrier','clientAddress','notes'
  ]);
}

// ── WATCHES ───────────────────────────────────────────────────────────────────
function getWatches() {
  const sheet = getWatchesSheet();
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { watches: [] };

  const headers = rows[0];
  const watches = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(w => w.id); // skip empty rows

  return { watches };
}

function addWatch(data) {
  const sheet = getWatchesSheet();
  sheet.appendRow([
    data.id,
    data.name,
    data.type,
    data.price,
    data.description || '',
    data.mainImage,
    data.colors,
    data.colorImages || '',
  ]);
  return { success: true, id: data.id };
}

function deleteWatch(data) {
  const sheet = getWatchesSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Watch not found' };
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
function addOrder(data) {
  const sheet = getOrdersSheet();
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.watchId,
    data.watchName,
    data.watchColor,
    data.watchPrice,
    data.clientName,
    data.clientPhone,
    data.wilayaCode != null ? data.wilayaCode : '',
    data.wilayaName || '',
    data.deliveryMode || '',
    data.shippingDZD != null ? data.shippingDZD : '',
    data.carrier || 'ZR Express',
    data.clientAddress || '',
    data.notes || '',
  ]);
  return { success: true };
}

function getOrders() {
  const sheet = getOrdersSheet();
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { orders: [] };

  const headers = rows[0];
  const orders  = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(o => o.clientName && String(o.clientName).trim() !== '');

  return { orders };
}
