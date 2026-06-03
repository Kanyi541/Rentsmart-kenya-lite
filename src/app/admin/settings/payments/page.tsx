
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateOrganizationPayments } from '@/app/actions';
import { Loader2, Smartphone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminPaymentSettingsPage() {
    const { organization, orgId } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        mpesaShortcode: '',
        mpesaType: 'Paybill' as 'Paybill' | 'Till',
        mpesaAccountName: ''
    });

    useEffect(() => {
        if (organization) {
            setFormData({
                mpesaShortcode: organization.mpesaShortcode || '',
                mpesaType: organization.mpesaType || 'Paybill',
                mpesaAccountName: organization.mpesaAccountName || ''
            });
        }
    }, [organization]);

    const handleSave = async () => {
        if (!orgId) return;
        if (!formData.mpesaShortcode || !formData.mpesaAccountName) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Please fill in your M-Pesa Shortcode and Collection Name." });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updateOrganizationPayments(orgId, formData);
            if (res.error) throw new Error(res.error);
            toast({ title: "Settings Saved", description: "Your tenants will now use these payment details." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Save Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Integration</h1>
                    <p className="text-muted-foreground">Configure how your tenants pay rent directly to your M-Pesa or Bank account.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="text-green-600 h-5 w-5" />
                                M-Pesa Collection
                            </CardTitle>
                            <CardDescription>Enter your Lipa na M-Pesa details for automated STK Pushes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mpesa-type">Account Type</Label>
                                <Select 
                                    value={formData.mpesaType} 
                                    onValueChange={(val: any) => setFormData(f => ({ ...f, mpesaType: val }))}
                                >
                                    <SelectTrigger id="mpesa-type">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paybill">Paybill</SelectItem>
                                        <SelectItem value="Till">Buy Goods (Till)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shortcode">Business Shortcode</Label>
                                <Input 
                                    id="shortcode" 
                                    placeholder="e.g. 123456" 
                                    value={formData.mpesaShortcode}
                                    onChange={(e) => setFormData(f => ({ ...f, mpesaShortcode: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-name">Display Name / Account Name</Label>
                                <Input 
                                    id="account-name" 
                                    placeholder="e.g. Green Valley Rentals" 
                                    value={formData.mpesaAccountName}
                                    onChange={(e) => setFormData(f => ({ ...f, mpesaAccountName: e.target.value }))}
                                />
                                <p className="text-[10px] text-muted-foreground italic">This is the name tenants will see on their M-Pesa popup.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Payment Settings"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    How it works
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground space-y-3">
                                <p>Once configured, the system uses the <strong>Safaricom Daraja API</strong> to trigger a secure payment request (STK Push) directly on your tenant's phone.</p>
                                <div className="flex gap-2 items-start">
                                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                                    <span>Funds go directly to your linked bank account.</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                                    <span>Rent Smart automatically verifies the payment reference.</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                                    <span>Receipts are instantly emailed to your tenant.</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-900 font-bold">API Access Notice</AlertTitle>
                            <AlertDescription className="text-blue-800 text-xs">
                                For live collections, you will need to provide your Daraja Consumer Key and Secret. Contact Techivo support to finalize your production go-live.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
