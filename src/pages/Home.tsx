import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Quote, BookOpen, CheckCircle2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { StudyLog, TodoItem, UserProfile, Transaction } from '@/types';
import { motion } from 'motion/react';

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Don't let what you cannot do interfere with what you can do.",
  "Education is the most powerful weapon which you can use to change the world.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Your education is a dress rehearsal for a life that is yours to lead.",
  "The expert in anything was once a beginner.",
];

export function Home() {
  const [data, setData] = React.useState(db.getData());
  const [newTodo, setNewTodo] = React.useState('');
  const [quote, setQuote] = React.useState('');

  React.useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const refreshData = () => setData(db.getData());

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false,
      date: new Date().toISOString(),
    };
    db.addTodo(todo);
    setNewTodo('');
    refreshData();
  };

  const toggleTodo = (id: string) => {
    db.toggleTodo(id);
    refreshData();
  };

  const deleteTodo = (id: string) => {
    db.deleteTodo(id);
    refreshData();
  };

  const todayStudyMinutes = data.studyLogs
    .filter(l => new Date(l.date).toDateString() === new Date().toDateString())
    .reduce((acc, l) => acc + l.duration, 0);

  const studyGoal = 180; // 3 hours goal
  const studyProgress = Math.min((todayStudyMinutes / studyGoal) * 100, 100);

  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Hello, {data.profile.name}!
        </h2>
        <p className="text-muted-foreground text-sm font-medium">Here's your overview for today.</p>
      </motion.section>

      {/* Expense Summary Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative border-none shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/70 font-medium">Total Balance</CardDescription>
            <CardTitle className="text-4xl font-black tracking-tighter">
              <span className="text-xl font-bold mr-1">TK</span>
              {balance.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-300" />
                  <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Income</span>
                </div>
                <span className="font-bold text-base">TK {totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex flex-col p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-300" />
                  <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Expense</span>
                </div>
                <span className="font-bold text-base">TK {totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Study Progress */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                Study Goal
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">{todayStudyMinutes} / {studyGoal} min</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative pt-1">
              <Progress value={studyProgress} className="h-3 rounded-full" />
              {studyProgress > 0 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${studyProgress}%` }}
                  className="absolute top-1 left-0 h-3 bg-primary rounded-full blur-[2px] opacity-50"
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium text-center">
              {studyProgress >= 100 ? "🎉 Goal reached! Great job!" : `🚀 ${studyGoal - todayStudyMinutes} minutes left to reach your daily goal.`}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivation Quote */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-primary/5 border-dashed border-primary/20 italic relative overflow-hidden">
          <div className="absolute -left-2 -top-2 opacity-5">
            <Quote size={60} />
          </div>
          <CardContent className="pt-6 flex gap-3 relative z-10">
            <Quote className="h-5 w-5 text-primary shrink-0 opacity-40 mt-1" />
            <p className="text-sm leading-relaxed font-medium text-primary/80">{quote}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            Daily Tasks
          </h3>
          <Badge variant="outline" className="rounded-full px-3">{data.todos.filter(t => !t.completed).length} Pending</Badge>
        </div>

        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input 
            placeholder="What's on your mind?" 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 bg-card/50 border-none shadow-sm focus-visible:ring-primary/30"
          />
          <Button type="submit" size="icon" className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" />
          </Button>
        </form>

        <div className="space-y-3">
          {data.todos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/10">
              <p className="text-sm font-medium">No tasks for today. Add one above!</p>
            </div>
          ) : (
            data.todos.map((todo, index) => (
              <motion.div
                layout
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <Checkbox 
                      checked={todo.completed} 
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="h-5 w-5 rounded-md border-2"
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-all",
                    todo.completed ? "line-through text-muted-foreground/60" : "text-foreground"
                  )}>
                    {todo.text}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}
