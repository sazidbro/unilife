export interface UserProfile {
  name: string;
  university: string;
  studentId: string;
  profilePic: string;
}

export type TransactionCategory = 'Food' | 'Transport' | 'Education' | 'Entertainment' | 'Shopping' | 'Health' | 'Bills' | 'Others';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: number;
  date: string;
  description: string;
}

export interface StudyLog {
  id: string;
  date: string;
  subject: string;
  duration: number; // in minutes
  notes: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface AppData {
  profile: UserProfile;
  transactions: Transaction[];
  studyLogs: StudyLog[];
  todos: TodoItem[];
}
