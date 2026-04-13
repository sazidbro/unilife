import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, BookOpen, Clock, Calendar, Trash2, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';
import { StudyLog } from '@/types';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export function Study() {
  const [data, setData] = React.useState(db.getData());
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  // Form State
  const [subject, setSubject] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const refreshData = () => setData(db.getData());

  const handleAddLog = () => {
    if (!subject || !duration || isNaN(Number(duration))) return;
    
    const log: StudyLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      subject,
      duration: Number(duration),
      notes,
    };

    db.addStudyLog(log);
    setIsAddOpen(false);
    setSubject('');
    setDuration('');
    setNotes('');
    refreshData();
  };

  const deleteLog = (id: string) => {
    db.deleteStudyLog(id);
    refreshData();
  };

  const totalMinutes = data.studyLogs.reduce((acc, l) => acc + l.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Study Tracker
        </h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 rounded-full px-4 shadow-lg shadow-primary/20" />}>
            <Plus className="h-4 w-4" /> Log Study
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Study Log</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject / Topic</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g. Mathematics, React Basics" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Duration (Minutes)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  placeholder="60" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Notes (Optional)</Label>
                <Input 
                  id="notes" 
                  placeholder="What did you learn?" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddLog} className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">Save Log</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-lg bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Total Time</span>
              </div>
              <div className="text-2xl font-black tracking-tight">{totalHours} <span className="text-xs opacity-50">hrs</span></div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-lg bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Sessions</span>
              </div>
              <div className="text-2xl font-black tracking-tight">{data.studyLogs.length}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 px-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          Recent Activity
        </h3>

        <ScrollArea className="h-[calc(100vh-350px)] px-1">
          <div className="space-y-4 pb-4">
            {data.studyLogs.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/10">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-12 w-12 opacity-20" />
                </div>
                <p className="text-sm font-medium">No study logs yet. Start learning!</p>
              </div>
            ) : (
              data.studyLogs.map((log, index) => (
                <motion.div
                  layout
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl space-y-3 group hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-black text-lg leading-tight tracking-tight">{log.subject}</div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 opacity-50" />
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </span>
                        <span className="opacity-20">|</span>
                        <span className="flex items-center gap-1.5 text-primary">
                          <Clock className="h-3 w-3" />
                          {log.duration} min
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteLog(log.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {log.notes && (
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      <p className="text-sm text-muted-foreground pl-4 py-1 leading-relaxed italic">
                        {log.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
