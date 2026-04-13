import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Filter, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  History, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { format, startOfDay, startOfWeek, startOfMonth, isWithinInterval, subDays, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/db';
import { Transaction, TransactionCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES: TransactionCategory[] = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Others'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function Expenses() {
  const [data, setData] = React.useState(db.getData());
  const [isAdding, setIsAdding] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [filterRange, setFilterRange] = React.useState<'all' | 'day' | 'week' | 'month'>('all');
  
  // Form state
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<string>('Food');
  const [customCategory, setCustomCategory] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  const [type, setType] = React.useState<'income' | 'expense'>('expense');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  const refreshData = () => setData(db.getData());

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const finalCategory = isCustom ? (customCategory || 'Others') : category;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      category: finalCategory as TransactionCategory,
      amount: Number(amount),
      description: description || finalCategory,
      date: new Date(date).toISOString(),
    };

    db.addTransaction(transaction);
    setAmount('');
    setDescription('');
    setCustomCategory('');
    setIsCustom(false);
    setIsAdding(false);
    refreshData();
  };

  const deleteTransaction = (id: string) => {
    db.deleteTransaction(id);
    refreshData();
  };

  // Filtering logic
  const filteredTransactions = data.transactions.filter(t => {
    const tDate = parseISO(t.date);
    const now = new Date();
    
    let inRange = true;
    if (filterRange === 'day') inRange = isWithinInterval(tDate, { start: startOfDay(now), end: now });
    if (filterRange === 'week') inRange = isWithinInterval(tDate, { start: startOfWeek(now), end: now });
    if (filterRange === 'month') inRange = isWithinInterval(tDate, { start: startOfMonth(now), end: now });

    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    
    return inRange && matchesCategory;
  });

  // Summary stats
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart data
  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: filteredTransactions
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0)
  })).filter(d => d.value > 0);

  const dailyData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, 'MMM dd');
    const amount = data.transactions
      .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: dayStr, amount };
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const profile = data.profile;
    
    // Header Background (Modern Gradient-like)
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('UniLife Financial Report', 14, 22);
    
    // Student Info Block (Left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', 14, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${profile.name || 'Sazid Moontasir'}`, 14, 37);
    doc.text(`ID: ${profile.studentId || 'N/A'}`, 14, 42);
    doc.text(`Varsity: ${profile.university || 'Khulna University'}`, 14, 47);
    
    // Report Info Block (Right)
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT DETAILS', pageWidth - 14, 32, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Print Date: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth - 14, 37, { align: 'right' });
    doc.text(`Range: ${filterRange === 'all' ? 'All Time' : filterRange.toUpperCase()}`, pageWidth - 14, 42, { align: 'right' });

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 14, 62);

    const summaryData = [
      ['Total Income', `TK ${totalIncome.toLocaleString()}`],
      ['Total Expenses', `TK ${totalExpense.toLocaleString()}`],
      ['Net Balance', `TK ${balance.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 65,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
    });

    // Category Breakdown
    let currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown', 14, currentY);

    const uniqueCategories = Array.from(new Set(filteredTransactions.filter(t => t.type === 'expense').map(t => t.category)));
    const categoryBreakdown = uniqueCategories.map(cat => {
      const amount = filteredTransactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((acc, t) => acc + t.amount, 0);
      const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0';
      return [cat, `TK ${amount.toLocaleString()}`, `${percentage}%`];
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Category', 'Total Spent', 'Percentage']],
      body: categoryBreakdown.length > 0 ? categoryBreakdown : [['No expenses recorded', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    // Recent Transactions (Limit to ensure one page)
    currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Transactions', 14, currentY);

    // Calculate remaining space to decide how many transactions to show
    const footerHeight = 40;
    const availableHeight = pageHeight - currentY - footerHeight;
    const rowHeight = 8;
    const maxRows = Math.floor(availableHeight / rowHeight) - 2; // -2 for header and safety
    const displayRows = Math.max(5, Math.min(maxRows, filteredTransactions.length));

    const tableData = filteredTransactions.slice(0, displayRows).map(t => [
      format(parseISO(t.date), 'MMM dd'),
      t.type.toUpperCase(),
      t.category,
      t.description.length > 25 ? t.description.substring(0, 22) + '...' : t.description,
      `TK ${t.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
      body: tableData,
      headStyles: { fillColor: [63, 81, 181] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'INCOME') data.cell.styles.textColor = [0, 128, 0];
          if (data.cell.raw === 'EXPENSE') data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    // Footer Block
    const finalY = pageHeight - 30;
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, pageWidth - 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'bold');
    doc.text('CREATOR INFORMATION', 14, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: Sazid Moontasir`, 14, finalY + 13);
    doc.text(`Varsity: Khulna University`, 14, finalY + 18);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('UniLife App - Your Academic & Financial Companion', pageWidth / 2, pageHeight - 5, { align: 'center' });

    doc.save(`UniLife_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground text-sm">Track your spending and income.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/70">Total Balance</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tighter">TK {balance.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> Income
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">TK {totalIncome.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" /> Expenses
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-red-600">TK {totalExpense.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No expense data for this period.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChartIcon className="h-4 w-4 text-primary" />
              Last 7 Days Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* History & Filters */}
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Transaction History
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={filterRange} onValueChange={(v: any) => setFilterRange(v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Calendar className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-medium">{t.category}</span>
                          <span>•</span>
                          <span>{format(parseISO(t.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={cn(
                        "text-sm font-black",
                        t.type === 'income' ? "text-green-600" : "text-red-600"
                      )}>
                        {t.type === 'income' ? '+' : '-'} TK {t.amount.toLocaleString()}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => deleteTransaction(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No transactions found matching your filters.
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Add Transaction</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="flex p-1 bg-muted rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        type === 'expense' ? "bg-background shadow-sm text-red-600" : "text-muted-foreground"
                      )}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        type === 'income' ? "bg-background shadow-sm text-green-600" : "text-muted-foreground"
                      )}
                    >
                      Income
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Amount (TK)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-2xl font-black h-14 rounded-2xl"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Category</label>
                      {!isCustom ? (
                        <div className="flex gap-2">
                          <Select value={category} onValueChange={(v: any) => {
                            if (v === 'custom') {
                              setIsCustom(true);
                            } else {
                              setCategory(v);
                            }
                          }}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                              <SelectItem value="custom" className="font-bold text-primary">+ Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            placeholder="Enter category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="rounded-xl pr-10"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustom(false)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Date</label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Description</label>
                    <Input
                      placeholder="What was this for?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                    Save Transaction
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
