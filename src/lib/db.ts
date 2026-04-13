import { AppData, UserProfile, StudyLog, TodoItem, Transaction } from '../types';

const STORAGE_KEY = 'unilife_data';

const DEFAULT_DATA: AppData = {
  profile: {
    name: 'Student Name',
    university: 'University Name',
    studentId: 'ID-000000',
    profilePic: '',
  },
  transactions: [],
  studyLogs: [],
  todos: [],
};

export const db = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DATA;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_DATA;
    }
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Profile
  getProfile: () => db.getData().profile,
  updateProfile: (profile: UserProfile) => {
    const data = db.getData();
    data.profile = profile;
    db.saveData(data);
  },

  // Transactions
  getTransactions: () => db.getData().transactions,
  addTransaction: (transaction: Transaction) => {
    const data = db.getData();
    data.transactions.unshift(transaction);
    db.saveData(data);
  },
  deleteTransaction: (id: string) => {
    const data = db.getData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    db.saveData(data);
  },

  // Study Logs
  getStudyLogs: () => db.getData().studyLogs,
  addStudyLog: (log: StudyLog) => {
    const data = db.getData();
    data.studyLogs.unshift(log);
    db.saveData(data);
  },
  deleteStudyLog: (id: string) => {
    const data = db.getData();
    data.studyLogs = data.studyLogs.filter(l => l.id !== id);
    db.saveData(data);
  },

  // Todos
  getTodos: () => db.getData().todos,
  addTodo: (todo: TodoItem) => {
    const data = db.getData();
    data.todos.unshift(todo);
    db.saveData(data);
  },
  toggleTodo: (id: string) => {
    const data = db.getData();
    const todo = data.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
    db.saveData(data);
  },
  deleteTodo: (id: string) => {
    const data = db.getData();
    data.todos = data.todos.filter(t => t.id !== id);
    db.saveData(data);
  },
};
