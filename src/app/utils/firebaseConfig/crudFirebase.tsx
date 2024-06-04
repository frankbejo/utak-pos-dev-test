import { child, get, ref, remove, set, update } from 'firebase/database';
import firebaseConfig from './firebaseConfig';

const database = firebaseConfig();
export async function create(path: string, body: any) {
  const res = await set(ref(database, path), body);
  return res;
}

export async function retrieve(path: string) {
  const dbRef = ref(database);
  const res = await get(child(dbRef, path));
  if (res.exists()) {
    return res.val();
  }
  return new Error('error');
}

export async function change(path: string, body: any) {
  const res = await update(ref(database, path), body);
  return res;
}

export async function discard(path: string) {
  const dbRef = ref(database, path);
  try {
    const res = await remove(dbRef);
    return res;
  } catch (error) {
    console.log({ error });
    return new Error('error');
  }
}
