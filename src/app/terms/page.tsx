
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    const tenantName = 'The Tenant'; // Generic placeholder

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
                        <CardTitle className="text-3xl">Terms of Service</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                        <p><strong>This Tenant Agreement (“Agreement”)</strong> is entered into by and between:</p>
                        <ul className="list-disc pl-5 mb-2 text-sm space-y-1">
                            <li><strong>RentNode Kenya Lite</strong> (“Landlord”), and</li>
                            <li><strong>{tenantName}</strong> (“Tenant”),</li>
                        </ul>
                        <p>through the <strong>Techivo Technologies Rental Management System</strong> (“System”). By registering and using this system, the Tenant agrees to the following:</p>

                        <hr className="my-3" />

                        <h5 className="font-semibold mb-2">1. Purpose</h5>
                        <p className="mb-3">This Agreement sets out the rights and obligations of both the Tenant and the Landlord regarding the use of the System for rental management, payment tracking, and communication.</p>

                        <h5 className="font-semibold mb-2">2. Tenant Obligations</h5>
                        <ul className="list-disc pl-5 mb-3 space-y-1">
                            <li>Provide accurate personal and contact information.</li>
                            <li>Pay rent and other agreed charges (e.g., deposit, maintenance fees) through the system on or before the due date.</li>
                            <li>Honor the terms of the signed Lease Agreement with the Landlord.</li>
                            <li>Use the system responsibly and only for legitimate rental purposes.</li>
                        </ul>

                        <h5 className="font-semibold mb-2">3. Landlord Obligations</h5>
                        <ul className="list-disc pl-5 mb-3 space-y-1">
                            <li>Provide the Tenant with accurate property details and rental terms.</li>
                            <li>Issue receipts and maintain a clear payment record within the System.</li>
                            <li>Respond to maintenance requests in a reasonable timeframe.</li>
                            <li>Notify tenants of rent increases, policy changes, or other updates.</li>
                        </ul>

                        <h5 className="font-semibold mb-2">4. Payments</h5>
                        <ul className="list-disc pl-5 mb-3 space-y-1">
                            <li>Tenants may be required to pay a deposit, followed by monthly rent payments.</li>
                            <li>Failure to make payments within the agreed period may result in penalties, late fees, or suspension of services (including restricted system access).</li>
                            <li>Ownership of digital receipts and rental documents will remain with the Landlord until full payment is made.</li>
                        </ul>

                        <h5 className="font-semibold mb-2">5. Termination</h5>
                        <p className="mb-3">This Agreement may be terminated by either party if: The Tenant fails to honor rent payments or lease terms; The Landlord breaches obligations under the lease; Either party provides written notice as defined in the lease contract.</p>

                        <h5 className="font-semibold mb-2">6. Dispute Resolution</h5>
                        <ul className="list-disc pl-5 mb-3 space-y-1">
                            <li>Any disputes arising from the use of the System shall first be resolved through <strong>direct negotiation</strong> between Tenant and Landlord.</li>
                            <li>If unresolved, disputes shall be referred to <strong>mediation or arbitration</strong> in accordance with the laws of Kenya.</li>
                            <li>Legal action shall be a last resort.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
