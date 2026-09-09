import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  ImproveResult,
  ApplyResult,
  StudentGoal,
  StudyTask,
  StudentApplication,
} from '../types';

// Persistent per-student store in IndexedDB keyed by student UID
const DATA_DB_NAME = 'varsitypath_student_data';
const DATA_DB_VERSION = 1;

function openStudentDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATA_DB_NAME, DATA_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const stores = [
        'improveResults',
        'applyResults',
        'goals',
        'studyTasks',
        'applications',
      ];
      stores.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class StudentDataService {
  /**
   * Fetch Improve results for the authenticated student
   */
  static async getImproveResults(userId: string): Promise<ImproveResult[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'users', userId, 'improveResults'),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const numericMark = Number(data.mark ?? data.percentage ?? 0);
          return {
            id: docSnap.id,
            subject: String(data.subject || ''),
            topic: String(data.topic || ''),
            mark: numericMark,
            date: String(data.date || ''),
            assessmentType: data.assessmentType,
            score: data.score,
            total: data.total,
            percentage: numericMark,
            notes: data.notes,
            createdAt: data.createdAt,
          };
        }) as ImproveResult[];
      } catch (err) {
        console.error('Failed to fetch improve results from Firestore:', err);
        return [];
      }
    }

    try {
      const idb = await openStudentDB();
      return new Promise((resolve) => {
        const tx = idb.transaction('improveResults', 'readonly');
        const store = tx.objectStore('improveResults');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => {
          const results = (req.result || []).map(({ userId: _, ...item }) => ({
            ...item,
            mark: Number(item.mark ?? item.percentage ?? 0),
            percentage: Number(item.percentage ?? item.mark ?? 0),
          }));
          // Sort by date descending
          results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve(results);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Log an Improve result
   */
  static async addImproveResult(
    userId: string,
    result: Omit<ImproveResult, 'id' | 'createdAt'>
  ): Promise<ImproveResult> {
    if (!userId) throw new Error('Student must be authenticated to log a result.');

    const cleanSubject = result.subject.trim();
    const cleanTopic = result.topic.trim();
    const cleanMark = Math.min(100, Math.max(0, Math.round(Number(result.mark ?? result.percentage ?? 0))));

    if (!cleanSubject) throw new Error('Subject is required.');
    if (!cleanTopic) throw new Error('Topic is required.');
    if (isNaN(cleanMark) || cleanMark < 0 || cleanMark > 100) {
      throw new Error('Mark must be a number between 0 and 100.');
    }
    if (!result.date) throw new Error('Date is required.');

    const newRecord: Omit<ImproveResult, 'id'> & { createdAt: string } = {
      subject: cleanSubject,
      topic: cleanTopic,
      mark: cleanMark,
      date: result.date,
      percentage: cleanMark,
      ...(result.assessmentType ? { assessmentType: result.assessmentType } : {}),
      ...(result.score !== undefined ? { score: result.score } : {}),
      ...(result.total !== undefined ? { total: result.total } : {}),
      ...(result.notes ? { notes: result.notes.trim() } : {}),
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(
        collection(db, 'users', userId, 'improveResults'),
        newRecord
      );
      return { id: docRef.id, ...newRecord };
    }

    const id = 'imp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const itemWithId: ImproveResult = { id, ...newRecord };
    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('improveResults', 'readwrite');
      const store = tx.objectStore('improveResults');
      const req = store.put({ ...itemWithId, userId });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return itemWithId;
  }

  /**
   * Log multiple Improve results at once (e.g., from verified document extraction)
   */
  static async addMultipleImproveResults(
    userId: string,
    results: Array<Omit<ImproveResult, 'id' | 'createdAt'>>
  ): Promise<ImproveResult[]> {
    if (!userId) throw new Error('Student must be authenticated.');
    const savedList: ImproveResult[] = [];
    for (const r of results) {
      const saved = await this.addImproveResult(userId, r);
      savedList.push(saved);
    }
    return savedList;
  }

  /**
   * Delete an Improve result
   */
  static async deleteImproveResult(userId: string, resultId: string): Promise<void> {
    if (!userId) return;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId, 'improveResults', resultId));
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('improveResults', 'readwrite');
      const store = tx.objectStore('improveResults');
      const req = store.delete(resultId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Fetch Apply results for the authenticated student.
   * Note: Apply results contain ONLY Subject and Mark.
   */
  static async getApplyResults(userId: string): Promise<ApplyResult[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      try {
        const snapshot = await getDocs(
          collection(db, 'users', userId, 'applyResults')
        );
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          subject: doc.data().subject,
          mark: doc.data().mark,
        })) as ApplyResult[];
      } catch (err) {
        console.error('Failed to fetch apply results from Firestore:', err);
        return [];
      }
    }

    try {
      const idb = await openStudentDB();
      return new Promise((resolve) => {
        const tx = idb.transaction('applyResults', 'readonly');
        const store = tx.objectStore('applyResults');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => {
          const results = (req.result || []).map((item) => ({
            id: item.id,
            subject: item.subject,
            mark: Number(item.mark),
          }));
          resolve(results);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Add or update an Apply result (Subject and Mark ONLY)
   */
  static async saveApplyResult(
    userId: string,
    subject: string,
    mark: number
  ): Promise<ApplyResult> {
    if (!userId) throw new Error('Student must be authenticated.');

    const cleanSubject = subject.trim();
    const cleanMark = Math.min(100, Math.max(0, Math.round(mark)));

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(
        collection(db, 'users', userId, 'applyResults'),
        { subject: cleanSubject, mark: cleanMark }
      );
      return { id: docRef.id, subject: cleanSubject, mark: cleanMark };
    }

    const id = 'app_' + Math.random().toString(36).substring(2, 9);
    const item: ApplyResult = { id, subject: cleanSubject, mark: cleanMark };
    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applyResults', 'readwrite');
      const store = tx.objectStore('applyResults');
      const req = store.put({ ...item, userId });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return item;
  }

  /**
   * Update mark for an existing Apply result
   */
  static async updateApplyResult(
    userId: string,
    resultId: string,
    mark: number
  ): Promise<void> {
    if (!userId) throw new Error('Student must be authenticated.');
    const cleanMark = Math.min(100, Math.max(0, Math.round(mark)));

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId, 'applyResults', resultId), {
        mark: cleanMark,
      });
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applyResults', 'readwrite');
      const store = tx.objectStore('applyResults');
      const getReq = store.get(resultId);
      getReq.onsuccess = () => {
        const data = getReq.result;
        if (data) {
          data.mark = cleanMark;
          const putReq = store.put(data);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Delete an Apply result
   */
  static async deleteApplyResult(userId: string, resultId: string): Promise<void> {
    if (!userId) return;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId, 'applyResults', resultId));
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applyResults', 'readwrite');
      const store = tx.objectStore('applyResults');
      const req = store.delete(resultId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Fetch Goals for the authenticated student
   */
  static async getGoals(userId: string): Promise<StudentGoal[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const target = Number(data.targetMark ?? data.targetPercentage ?? 70);
          return {
            id: docSnap.id,
            userId,
            title: String(data.title || `Improve ${data.subject || 'Subject'}`),
            subject: String(data.subject || ''),
            currentMark: Number(data.currentMark ?? 0),
            targetMark: target,
            targetPercentage: target,
            targetDate: data.targetDate ? String(data.targetDate) : undefined,
            status: data.status || 'active',
            notes: data.notes ? String(data.notes) : undefined,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          } as StudentGoal;
        });
      } catch (err) {
        console.error('Failed to fetch goals from Firestore:', err);
        return [];
      }
    }

    try {
      const idb = await openStudentDB();
      return new Promise((resolve) => {
        const tx = idb.transaction('goals', 'readonly');
        const store = tx.objectStore('goals');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => {
          const raw = (req.result || []).map(({ userId: _, ...item }) => {
            const target = Number(item.targetMark ?? item.targetPercentage ?? 70);
            return {
              ...item,
              userId,
              title: item.title || `Improve ${item.subject || 'Subject'}`,
              targetMark: target,
              targetPercentage: target,
              status: item.status || 'active',
            };
          });
          resolve(raw);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Save a Goal
   */
  static async addGoal(
    userId: string,
    goal: Omit<StudentGoal, 'id' | 'createdAt'>
  ): Promise<StudentGoal> {
    if (!userId) throw new Error('Student must be authenticated.');

    const target = Number(goal.targetMark ?? goal.targetPercentage ?? 70);
    const newRecord: Omit<StudentGoal, 'id'> = {
      userId,
      title: goal.title?.trim() || `Improve ${goal.subject.trim()} to ${target}%`,
      subject: goal.subject.trim(),
      currentMark: Number(goal.currentMark ?? 0),
      targetMark: target,
      targetPercentage: target,
      status: goal.status || 'active',
      ...(goal.targetDate ? { targetDate: goal.targetDate } : {}),
      ...(goal.notes ? { notes: goal.notes.trim() } : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', userId, 'goals'), newRecord);
      return { id: docRef.id, ...newRecord };
    }

    const item: StudentGoal = {
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      ...newRecord,
    };
    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('goals', 'readwrite');
      const store = tx.objectStore('goals');
      const req = store.put({ ...item, userId });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return item;
  }

  /**
   * Update a Goal
   */
  static async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<StudentGoal>
  ): Promise<void> {
    if (!userId || !goalId) return;

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId, 'goals', goalId), payload);
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('goals', 'readwrite');
      const store = tx.objectStore('goals');
      const getReq = store.get(goalId);
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.userId === userId) {
          store.put({ ...getReq.result, ...payload });
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Delete a Goal
   */
  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!userId) return;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('goals', 'readwrite');
      const store = tx.objectStore('goals');
      const req = store.delete(goalId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Fetch Study Tasks for the authenticated student
   */
  static async getStudyTasks(userId: string): Promise<StudyTask[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users', userId, 'studyTasks'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const isCompleted = Boolean(data.completed || data.status === 'completed');
          return {
            id: docSnap.id,
            userId,
            title: String(data.title || ''),
            description: String(data.description || ''),
            subject: String(data.subject || ''),
            topic: data.topic ? String(data.topic) : undefined,
            priority: (data.priority as any) || 'medium',
            status: isCompleted ? 'completed' : (data.status as any) || 'todo',
            completed: isCompleted,
            source: (data.source as any) || 'manual',
            sourceId: data.sourceId ? String(data.sourceId) : undefined,
            targetMark: data.targetMark ? Number(data.targetMark) : undefined,
            currentMark: data.currentMark ? Number(data.currentMark) : undefined,
            estimatedMinutes: Number(data.estimatedMinutes || 45),
            dueDate: data.dueDate ? String(data.dueDate) : undefined,
            completedAt: data.completedAt ? String(data.completedAt) : undefined,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          } as StudyTask;
        });
      } catch (err) {
        console.error('Failed to fetch study tasks from Firestore:', err);
        return [];
      }
    }

    try {
      const idb = await openStudentDB();
      return new Promise((resolve) => {
        const tx = idb.transaction('studyTasks', 'readonly');
        const store = tx.objectStore('studyTasks');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => {
          const raw = (req.result || []).map(({ userId: _, ...item }) => {
            const isCompleted = Boolean(item.completed || item.status === 'completed');
            return {
              ...item,
              userId,
              completed: isCompleted,
              status: isCompleted ? 'completed' : (item.status as any) || 'todo',
            };
          });
          resolve(raw);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Add a Study Task
   */
  static async addStudyTask(
    userId: string,
    task: Omit<StudyTask, 'id' | 'createdAt'>
  ): Promise<StudyTask> {
    if (!userId) throw new Error('Student must be authenticated.');

    const isCompleted = Boolean(task.completed || task.status === 'completed');
    const newRecord: Omit<StudyTask, 'id'> = {
      userId,
      title: task.title.trim(),
      description: task.description?.trim() || `Revision task for ${task.subject}`,
      subject: task.subject.trim(),
      ...(task.topic ? { topic: task.topic.trim() } : {}),
      priority: task.priority || 'medium',
      status: isCompleted ? 'completed' : task.status || 'todo',
      completed: isCompleted,
      source: task.source || 'manual',
      ...(task.sourceId ? { sourceId: task.sourceId } : {}),
      ...(task.targetMark ? { targetMark: Number(task.targetMark) } : {}),
      ...(task.currentMark ? { currentMark: Number(task.currentMark) } : {}),
      estimatedMinutes: Number(task.estimatedMinutes || 45),
      dueDate: task.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', userId, 'studyTasks'), newRecord);
      return { id: docRef.id, ...newRecord };
    }

    const item: StudyTask = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      ...newRecord,
    };
    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('studyTasks', 'readwrite');
      const store = tx.objectStore('studyTasks');
      const req = store.put({ ...item, userId });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return item;
  }

  /**
   * Update a Study Task
   */
  static async updateStudyTask(
    userId: string,
    taskId: string,
    updates: Partial<StudyTask>
  ): Promise<void> {
    if (!userId || !taskId) return;

    const payload: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.completed !== undefined) {
      payload.status = updates.completed ? 'completed' : 'todo';
      payload.completedAt = updates.completed ? new Date().toISOString() : null;
    }

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId, 'studyTasks', taskId), payload);
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('studyTasks', 'readwrite');
      const store = tx.objectStore('studyTasks');
      const getReq = store.get(taskId);
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.userId === userId) {
          store.put({ ...getReq.result, ...payload });
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Toggle Study Task completion
   */
  static async toggleStudyTask(userId: string, taskId: string, completed: boolean): Promise<void> {
    await this.updateStudyTask(userId, taskId, {
      completed,
      status: completed ? 'completed' : 'todo',
    });
  }

  /**
   * Reschedule a Study Task
   */
  static async rescheduleStudyTask(userId: string, taskId: string, newDueDate: string): Promise<void> {
    await this.updateStudyTask(userId, taskId, {
      dueDate: newDueDate,
    });
  }

  /**
   * Delete Study Task
   */
  static async deleteStudyTask(userId: string, taskId: string): Promise<void> {
    if (!userId) return;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId, 'studyTasks', taskId));
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('studyTasks', 'readwrite');
      const store = tx.objectStore('studyTasks');
      const req = store.delete(taskId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // APPLICATION TRACKER (Durable, User-Isolated)
  // ==========================================

  /**
   * Fetch all tracked university applications for a student
   */
  static async getApplications(userId: string): Promise<StudentApplication[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      const colRef = collection(db, 'users', userId, 'applications');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as StudentApplication[];
    }

    const idb = await openStudentDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('applications', 'readonly');
      const store = tx.objectStore('applications');
      const index = store.index('userId');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const apps = (req.result || []) as StudentApplication[];
        apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(apps);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Add a new application to tracker with duplicate prevention
   */
  static async addApplication(
    userId: string,
    app: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StudentApplication> {
    if (!userId) throw new Error('Student user ID is required.');

    // 1. Duplicate prevention check
    const existing = await this.getApplications(userId);
    const duplicate = existing.find(
      (a) => a.programmeId === app.programmeId && a.universityId === app.universityId
    );
    if (duplicate) {
      throw new Error(`This programme is already in your Application Tracker (${duplicate.programmeName}).`);
    }

    const now = new Date().toISOString();
    const initialStatus = app.status || 'planning';
    const statusHistory = app.statusHistory?.length
      ? app.statusHistory
      : [{ status: initialStatus, changedAt: now, notes: `Added to tracker with status: ${initialStatus}` }];

    const appData = {
      ...app,
      userId,
      status: initialStatus,
      statusHistory,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      const colRef = collection(db, 'users', userId, 'applications');
      const docRef = await addDoc(colRef, appData);
      return { id: docRef.id, ...appData };
    }

    const idb = await openStudentDB();
    const id = 'app_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newRecord: StudentApplication = { id, ...appData };

    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applications', 'readwrite');
      const store = tx.objectStore('applications');
      const req = store.put(newRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return newRecord;
  }

  /**
   * Update an existing tracked application (status, deadlines, notes)
   */
  static async updateApplication(
    userId: string,
    applicationId: string,
    updates: Partial<StudentApplication>
  ): Promise<void> {
    if (!userId || !applicationId) return;

    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'users', userId, 'applications', applicationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applications', 'readwrite');
      const store = tx.objectStore('applications');
      const getReq = store.get(applicationId);
      getReq.onsuccess = () => {
        if (!getReq.result) {
          resolve();
          return;
        }
        const existing = getReq.result as StudentApplication;
        let newHistory = existing.statusHistory || [];

        // If status changed, automatically log status transition to history
        if (updates.status && updates.status !== existing.status) {
          newHistory = [
            ...newHistory,
            {
              status: updates.status,
              changedAt: now,
              notes: updates.notes || `Status changed from ${existing.status} to ${updates.status}`,
            },
          ];
        }

        const merged: StudentApplication = {
          ...existing,
          ...updates,
          statusHistory: updates.statusHistory || newHistory,
          updatedAt: now,
        };
        const putReq = store.put(merged);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Remove an application from tracker
   */
  static async deleteApplication(userId: string, applicationId: string): Promise<void> {
    if (!userId || !applicationId) return;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId, 'applications', applicationId));
      return;
    }

    const idb = await openStudentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction('applications', 'readwrite');
      const store = tx.objectStore('applications');
      const req = store.delete(applicationId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
