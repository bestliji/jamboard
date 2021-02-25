export function getAllMarkerKeysFromStorage(inDocumentID) {
  const markerKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(inDocumentID)) {
      markerKeys.push(key);
    }
  }
  return markerKeys;
}

export function getMarkerFromStorage(inKey) {
  return JSON.parse(localStorage.getItem(inKey))
}

export function saveMarkerToStorage(inKey, inMarker) {
  localStorage.setItem(inKey, JSON.stringify(inMarker))
}