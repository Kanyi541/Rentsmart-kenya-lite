
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-muted/40 py-8 px-4">
             <div className="max-w-4xl mx-auto">
                 <Button asChild variant="outline" className="mb-4">
                     <Link href="/">
                        <ArrowLeft className="mr-2" />
                        Back to Home
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                        <p><strong>Effective Date:</strong> [Insert Date] <br/><strong>Company:</strong> Techivo Technologies</p>

                        <h5 className="font-semibold mb-2">1. Information We Collect</h5>
                        <p className="mb-3">When you register as a Tenant, we may collect: Personal details, rental details, payment records, and uploaded documents.</p>
                        
                        <h5 className="font-semibold mb-2">2. How We Use Your Information</h5>
                        <p className="mb-3">Your data is used to: Manage rental agreements, provide receipts, facilitate communication, handle maintenance requests, and improve our services.</p>

                        <h5 className="font-semibold mb-2">3. Data Sharing</h5>
                        <ul className="list-disc pl-5 mb-3 space-y-1">
                            <li>Data is <strong>not sold or shared</strong> with third parties for marketing.</li>
                            <li>Information may only be shared with the Landlord, payment providers, or government authorities if required by law.</li>
                        </ul>

                         <h5 className="font-semibold mb-2">4. Data Security</h5>
                         <p className="mb-3">Data is stored securely in Firebase (Google Cloud) with authentication and encryption. Access is role-based.</p>

                        <h5 className="font-semibold mb-2">5. Your Rights</h5>
                        <p className="mb-3">Tenants have the right to access, review, correct, or request deletion of their data (subject to outstanding obligations).</p>
                       
                        <h5 className="font-semibold mb-2">6. Retention</h5>
                        <p className="mb-3">Data is retained while you are an active tenant and archived upon termination for legal purposes.</p>

                        <h5 className="font-semibold mb-2">7. Contact Information</h5>
                        <p>For questions, please contact Techivo Technologies at elviskanyi8@gmail.com or +254111871428.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
