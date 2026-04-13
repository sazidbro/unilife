import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, School, IdCard, Camera, Save, Info, Github, ExternalLink, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { UserProfile } from '@/types';
import { motion } from 'motion/react';

export function Profile() {
  const [profile, setProfile] = React.useState<UserProfile>(db.getProfile());
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = () => {
    db.updateProfile(profile);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Student Profile
        </h2>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          size="sm" 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="gap-2 rounded-full px-4 shadow-md"
        >
          {isEditing ? <><Save className="h-4 w-4" /> Save</> : "Edit Profile"}
        </Button>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-sm rounded-3xl">
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
                  <AvatarImage src={profile.profilePic} className="object-cover" />
                  <AvatarFallback className="text-3xl font-black bg-primary text-primary-foreground">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-20 pb-8 space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black tracking-tight">{profile.name}</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{profile.university}</p>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2 ml-1">
                  <User className="h-3 w-3" /> Full Name
                </Label>
                {isEditing ? (
                  <Input 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                    className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                  />
                ) : (
                  <div className="p-4 bg-muted/30 rounded-2xl font-bold text-sm">{profile.name}</div>
                )}
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2 ml-1">
                    <School className="h-3 w-3" /> University
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={profile.university} 
                      onChange={(e) => setProfile({ ...profile, university: e.target.value })} 
                      className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                    />
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-2xl font-bold text-sm">{profile.university}</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2 ml-1">
                    <IdCard className="h-3 w-3" /> Student ID
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={profile.studentId} 
                      onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} 
                      className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/30"
                    />
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-2xl font-bold text-sm">{profile.studentId}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-bold flex items-center gap-2 px-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info className="h-4 w-4 text-primary" />
          </div>
          About UniLife
        </h3>
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                UniLife is a personal assistant designed specifically for university students. 
                It helps you manage your daily expenses, track your study hours, and stay motivated 
                with daily tasks and quotes.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px]">v1.0.0</Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px]">Offline Ready</Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px]">PWA</Badge>
              </div>
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary mb-2">Developed By</p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-lg">Sazid Moontasir</h4>
                    <p className="text-xs font-bold text-muted-foreground">Khulna University</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
