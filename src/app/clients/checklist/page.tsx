
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const moveInItems = [
    { id: 'mi-1', label: 'Inspect the unit for any damages and report them to the landlord.' },
    { id: 'mi-2', label: 'Take photos of the unit, including any existing damage.' },
    { id'mi-3', label: 'Test all appliances to ensure they are in working order.' },
    { id'mi-4', label: 'Check all smoke detectors and carbon monoxide detectors.' },
    { id'mi-5', label: 'Confirm all keys have been received and test them.' },
    { id'mi-6', label: 'Set up utilities (electricity, water, gas, internet).' },
    { id'mi-7', label: 'Update your mailing address with the post office and other services.' },
    { id'mi-8', label: 'Obtain a copy of the signed lease agreement.' },
];

const moveOutItems = [
    { id: 'mo-1', label: 'Provide the landlord with a written notice of your intent to move out.' },
    { id: 'mo-2', label: 'Thoroughly clean the unit, including appliances.' },
    { id'mo-3', label: 'Repair any damages beyond normal wear and tear.' },
    { id'mo-4', label: 'Take photos of the unit to document its condition upon leaving.' },
    { id'mo-5', label: 'Schedule a final walkthrough with the landlord.' },
    { id'mo-6', label: 'Return all keys to the landlord.' },
    { id'mo-7', label: 'Provide a forwarding address for your security deposit return.' },
    { id'mo-8', label: 'Cancel or transfer utilities.' },
];

export default function ChecklistPage() {
    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Move-in & Move-out Checklist</h1>
                    <p className="text-muted-foreground">A helpful guide to ensure a smooth transition in and out of your new home.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Move-in Checklist</CardTitle>
                            <CardDescription>Tasks to complete when you first move in.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {moveInItems.map(item => (
                                <div key={item.id} className="flex items-start gap-3">
                                    <Checkbox id={item.id} className="mt-1" />
                                    <Label htmlFor={item.id} className="text-sm font-normal leading-relaxed">{item.label}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Move-out Checklist</CardTitle>
                            <CardDescription>Tasks to complete before you vacate the property.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {moveOutItems.map(item => (
                                <div key={item.id} className="flex items-start gap-3">
                                    <Checkbox id={item.id} className="mt-1" />
                                    <Label htmlFor={item.id} className="text-sm font-normal leading-relaxed">{item.label}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
