import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "slums_history";

export async function addSessionScore(entry) {
  const existing = await getSessionHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([{ id: String(Date.now()), ...entry }, ...existing]));
}

export async function getSessionHistory() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearSessionHistory() {
  await AsyncStorage.removeItem(KEY);
}
