'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRentalSuggestion } from '@/app/actions';
import { propertySchema } from '@/lib/schemas';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

type PropertyFormValues = z.infer<typeof propertySchema>;

interface Suggestion {
  suggestedPrice: number;
  reasoning: string;
}

export function PropertyForm({ onAddProperty }: { onAddProperty: (property: PropertyFormValues) => void }) {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyType: '',
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFootage: 1000,
      amenities: '',
      rent: 0,
    },
  });

  const handleSuggestion = () => {
    startTransition(async () => {
      const values = form.getValues();
      const result = await getRentalSuggestion(values);
      if (result.suggestion) {
        setSuggestion(result.suggestion);
        form.setValue('rent', result.suggestion.suggestedPrice, { shouldValidate: true });
        toast({
            title: "AI Suggestion Ready!",
            description: `We've suggested a monthly rent of KSh ${result.suggestion.suggestedPrice.toLocaleString()}.`
        })
      } else {
        toast({
            variant: "destructive",
            title: "AI Suggestion Error",
            description: result.error || 'An unknown error occurred.',
        });
      }
    });
  };

  function onSubmit(data: PropertyFormValues) {
    onAddProperty(data);
    setSuggestion(null);
    form.reset();
  }

  return (
    <Card className="shadow-lg bg-card">
      <CardHeader>
        <CardTitle>List a New Property</CardTitle>
        <CardDescription>Fill in the details of your property to get it listed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Maisonette">Maisonette</SelectItem>
                        <SelectItem value="Bungalow">Bungalow</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Kilimani, Nairobi" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Sq. Footage</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Swimming pool, Gym, Parking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4 rounded-lg border bg-background/50 p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium">Get an AI-powered price suggestion</p>
                <Button type="button" variant="outline" onClick={handleSuggestion} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Suggest Price with AI
                    </>
                  )}
                </Button>
              </div>

              {suggestion && (
                <Alert className="bg-accent/20 border-accent/50">
                    <DollarSign className="h-4 w-4 !text-accent-foreground" />
                    <AlertTitle className="font-bold text-accent-foreground">AI Suggestion: KSh {suggestion.suggestedPrice.toLocaleString()}</AlertTitle>
                    <AlertDescription className="text-accent-foreground/80">{suggestion.reasoning}</AlertDescription>
                </Alert>
              )}
            </div>

            <FormField
                control={form.control}
                name="rent"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Monthly Rent (KSh)</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" placeholder="Enter rent amount or use AI suggestion" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" size="lg" className="w-full">List Property</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
