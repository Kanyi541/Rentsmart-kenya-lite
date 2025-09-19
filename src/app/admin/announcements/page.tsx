
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { announcementSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createAnnouncement, deleteAnnouncement } from '@/app/actions';
import { Loader2, Trash2 } from 'lucide-react';
import type { Announcement } from '@/lib/types';
import { getAnnouncements } from '@/lib/api/announcements';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';

// Demo Data
const demoAnnouncements: Announcement[] = [
    { id: '1', title: 'Water Maintenance Schedule', content: 'Please note that the water will be shut off for maintenance on Friday from 10 AM to 2 PM.', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', title: 'Quarterly Pest Control', content: 'Pest control services will be conducted on all floors next Monday. Please ensure your units are accessible.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
];


type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
    const { isDemoUser } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: '',
            content: '',
        }
    });

    async function fetchAnnouncements() {
        setLoading(true);
        if (isDemoUser) {
            setAnnouncements(demoAnnouncements);
            setLoading(false);
            return;
        }
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load announcements.' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnnouncements();
    }, [isDemoUser]);

    const onSubmit = async (data: AnnouncementFormValues) => {
        setIsSubmitting(true);
         if (isDemoUser) {
            toast({ title: 'Demo Mode', description: 'This feature is disabled in the demo.' });
            setIsSubmitting(false);
            return;
        }
        try {
            const result = await createAnnouncement(data);
            if (result?.error) throw new Error(result.error);
            toast({ title: 'Announcement Published!', description: 'Your announcement is now visible to all tenants.' });
            form.reset();
            await fetchAnnouncements();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to publish', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (isDemoUser) {
            toast({ title: 'Demo Mode', description: 'This feature is disabled in the demo.' });
            return;
        }
        try {
            const result = await deleteAnnouncement(id);
             if (result?.error) throw new Error(result.error);
            toast({ title: 'Announcement Deleted' });
            await fetchAnnouncements();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to delete', description: error.message });
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Announcement</CardTitle>
                            <CardDescription>Create a message that will be visible to all tenants on their dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Water Maintenance Schedule" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="e.g., Please note that the water will be shut off..." {...field} rows={5} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Publish Announcement
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Published Announcements</CardTitle>
                             <CardDescription>A log of all past announcements.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {loading ? (
                                <p>Loading...</p>
                           ) : announcements.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No announcements published yet.</p>
                           ) : (
                               <div className="space-y-4">
                                   {announcements.map(ann => (
                                       <div key={ann.id} className="border p-4 rounded-lg relative">
                                            <h3 className="font-semibold">{ann.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{format(new Date(ann.createdAt), 'PPpp')}</p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the announcement.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(ann.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
