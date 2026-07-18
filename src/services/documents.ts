import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ExportSettings, DocumentVersion } from '@/types';

export interface DBDocument {
  id: string;
  title: string;
  content: string;
  activeTemplateId: string | null;
  exportSettings: ExportSettings;
  updatedAt?: Timestamp;
}

// Fetch all documents for a user, sorted by updatedAt descending
export async function getUserDocuments(uid: string): Promise<DBDocument[]> {
  try {
    const colRef = collection(db, 'users', uid, 'documents');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const docs: DBDocument[] = [];
    querySnapshot.forEach((snap) => {
      const data = snap.data();
      docs.push({
        id: snap.id,
        title: data.title ?? 'Untitled_Document',
        content: data.content ?? '',
        activeTemplateId: data.activeTemplateId ?? null,
        exportSettings: data.exportSettings ?? {
          pageSize: 'A4',
          margins: 'standard',
          fontSize: 'base',
          theme: 'professional'
        },
        updatedAt: data.updatedAt
      });
    });
    return docs;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
}

// Create a new document in Firestore
export async function createDocument(
  uid: string, 
  title: string, 
  content: string = '', 
  activeTemplateId: string | null = null,
  exportSettings: ExportSettings = {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 'standard',
    customMargins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    fontSize: 'base',
    theme: 'professional'
  }
): Promise<string> {
  try {
    const colRef = collection(db, 'users', uid, 'documents');
    const docRef = await addDoc(colRef, {
      title,
      content,
      activeTemplateId,
      exportSettings,
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

// Update an existing document
export async function saveDocument(
  uid: string,
  docId: string,
  data: {
    title: string;
    content: string;
    activeTemplateId: string | null;
    exportSettings: ExportSettings;
  }
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'documents', docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}

// Rename a document
export async function renameDocument(uid: string, docId: string, newTitle: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'documents', docId);
    await updateDoc(docRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error renaming document:", error);
    throw error;
  }
}

// Delete a document
export async function deleteDocument(uid: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'documents', docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// Create a new version of the document in Firestore
export async function createDocumentVersion(
  uid: string,
  docId: string,
  title: string,
  content: string,
  action: string
): Promise<string> {
  try {
    const colRef = collection(db, 'users', uid, 'documents', docId, 'versions');
    // Generate content snippet (up to 60 characters)
    const previewSnippet = content.trim() 
      ? content.replace(/[#*`_-]/g, '').trim().substring(0, 60) + (content.length > 60 ? '...' : '')
      : 'Empty document';
      
    const docRef = await addDoc(colRef, {
      title,
      content,
      action,
      previewSnippet,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating document version:", error);
    throw error;
  }
}

// Fetch all saved versions of a document, sorted by timestamp descending
export async function getDocumentVersions(uid: string, docId: string): Promise<DocumentVersion[]> {
  try {
    const colRef = collection(db, 'users', uid, 'documents', docId, 'versions');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const versions: DocumentVersion[] = [];
    querySnapshot.forEach((snap) => {
      const data = snap.data();
      versions.push({
        id: snap.id,
        title: data.title ?? 'Untitled',
        content: data.content ?? '',
        action: data.action ?? 'Manual Edit',
        previewSnippet: data.previewSnippet ?? '',
        timestamp: data.timestamp
      });
    });
    return versions;
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return [];
  }
}
