
'use client'

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moveOutNoticeSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { getTenantById } from '@/lib/api/tenants';
import type { Tenant, MoveOutNotice } from '@/lib/types';
import { createMoveOutNotice } from '@/app/actions';
import { Loader2, AlertTriangle, CalendarIcon, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getNoticesForTenant } from '@/lib/api/move-out';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type MoveOutNoticeFormValues = z.infer<typeof moveOutNoticeSchema>;

const demoMoveOutNotices: MoveOutNotice[] = [
    { id: 'mo1', moveOutDate: new Date(Date.now() + 86400000 * 30), noticeType: 'Standard', status: 'Pending', createdAt: new Date().toISOString(), tenantId: 'demotenant', rentalId: 'demo1', roomId: 'r2' }
];

export default function MoveOutPage() {
    const { user, isDemoUser } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [notices, setNotices] = useState<MoveOutNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<MoveOutNoticeFormValues>({
        resolver: zodResolver(moveOutNoticeSchema),
    });

    const moveOutDate = form.watch('moveOutDate');

    const noticeType = useMemo(() => {
        if (!moveOutDate) return null;
        const today = new Date();
        today.setHours(0,0,0,0);
        const diff = differenceInCalendarDays(moveOutDate, today);
        return diff >= 7 ? 'Standard' : 'Immediate';
    }, [moveOutDate]);
    
    async function fetchInitialData() {
        if (!user) return;
        setLoading(true);

        if (isDemoUser) {
            const storedTenant = localStorage.getItem('demoTenant');
            setTenant(storedTenant ? JSON.parse(storedTenant) : null);
            const storedNotices = localStorage.getItem('demoClientMoveOutNotices');
            setNotices(storedNotices ? JSON.parse(storedNotices) : demoMoveOutNotices);
            setLoading(false);
            return;
        }

        try {
            const [tenantData, noticesData] = await Promise.all([
                getTenantById(user.uid),
                getNoticesForTenant(user.uid)
            ]);
            setTenant(tenantData);
            setNotices(noticesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load your details or notices." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialData();
    }, [user, isDemoUser]);

    const onSubmit = async (data: MoveOutNoticeFormValues) => {
        if (!user || !tenant?.rentalId || !tenant?.roomId || !noticeType) {
            toast({ variant: 'destructive', title: "Error", description: "Your tenant information is incomplete. Cannot submit notice." });
            return;
        }

        setIsSubmitting(true);

        if (isDemoUser && tenant) {
            const newNotice: MoveOutNotice = {
                id: `demo_mo_${new Date().getTime()}`,
                moveOutDate: data.moveOutDate,
                tenantId: user.uid,
                rentalId: tenant.rentalId,
                roomId: tenant.roomId,
                noticeType: noticeType,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            const updatedNotices = [newNotice, ...notices];
            setNotices(updatedNotices);
            localStorage.setItem('demoClientMoveOutNotices', JSON.stringify(updatedNotices));
            localStorage.setItem('demoMoveOutNotices', JSON.stringify(updatedNotices)); // also update admin view
            toast({ title: "Notice Submitted!", description: "This is a demo. Your notice is saved in local storage." });
            form.reset();
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createMoveOutNotice({
                moveOutDate: data.moveOutDate,
                tenantId: user.uid,
                rentalId: tenant.rentalId,
                roomId: tenant.roomId,
                noticeType: noticeType,
            });

            if (result?.error) throw new Error(result.error);

            toast({ title: "Notice Submitted!", description: "Your notice to vacate has been sent to the landlord." });
            form.reset();
            await fetchInitialData(); // Refresh the list
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Submission Failed", description: error.message || "An unknown error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Pending': return 'secondary';
            case 'Processed': return 'default';
            default: return 'secondary';
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit Notice to Vacate</CardTitle>
                            <CardDescription>Inform the landlord about your planned move-out date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!tenant?.rentalId ? (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Not Assigned to a Room</AlertTitle>
                                    <AlertDescription>
                                        You must be assigned to a room before you can submit a move-out notice.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="moveOutDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Intended Move-Out Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {noticeType === 'Standard' && (
                                            <Alert variant="default" className="bg-green-50 border-green-200">
                                                <Info className="h-4 w-4"/>
                                                <AlertTitle>Standard Notice</AlertTitle>
                                                <AlertDescription>Your notice is 7 days or more in advance. Your security deposit will be processed according to the lease agreement.</AlertDescription>
                                            </Alert>
                                        )}
                                        {noticeType === 'Immediate' && (
                                            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                                                <Info className="h-4 w-4"/>
                                                <AlertTitle>Immediate Notice</AlertTitle>
                                                <AlertDescription>Your notice is less than 7 days. Your deposit will be refunded within 5 working days, subject to property inspection.</AlertDescription>
                                            </Alert>
                                        )}

                                        <Button type="submit" className="w-full" disabled={isSubmitting || !moveOutDate}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit Notice
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Move-Out Notice History</CardTitle>
                            <CardDescription>Track the status of your submitted notices.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Submitted On</TableHead>
                                        <TableHead>Planned Move-Out Date</TableHead>
                                        <TableHead>Notice Type</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">Loading notices...</TableCell></TableRow>
                                    ) : notices.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">You have not submitted any move-out notices yet.</TableCell></TableRow>
                                    ) : (
                                        notices.map(notice => (
                                            <TableRow key={notice.id}>
                                                <TableCell className="font-medium">{format(new Date(notice.createdAt), 'PP')}</TableCell>
                                                <TableCell>{format(new Date(notice.moveOutDate), 'PP')}</TableCell>
                                                <TableCell><Badge variant={notice.noticeType === 'Immediate' ? 'destructive' : 'secondary'}>{notice.noticeType}</Badge></TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={getStatusVariant(notice.status)}>{notice.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>
             </div>
        </AppLayout>
    )
}
