'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2, DollarSign, PlusCircle, X } from 'lucide-react';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRentalSuggestion } from '@/app/actions';
import { rentalSchema, roomSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type RentalFormValues = z.infer<typeof rentalSchema>;
type RoomFormValues = z.infer<typeof roomSchema>;

interface Suggestion {
  rent: number;
  reasoning: string;
}

export function RentalForm({ onAddRental }: { onAddRental: (rental: RentalFormValues) => void }) {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const { toast } = useToast();

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      name: '',
      location: '',
      ownerName: '',
      ownerNumber: '',
      rooms: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  const handleSuggestion = (roomIndex: number) => {
    startTransition(async () => {
      const rentalValues = form.getValues();
      const roomValues = rentalValues.rooms[roomIndex];
      const result = await getRentalSuggestion({
        location: rentalValues.location,
        propertyType: rentalValues.name,
        roomType: roomValues.roomType,
      });

      if (result.suggestion) {
        setSuggestion(result.suggestion);
        form.setValue(`rooms.${roomIndex}.rent`, result.suggestion.rent, { shouldValidate: true });
        toast({
            title: "AI Suggestion Ready!",
            description: `We've suggested a monthly rent of KSh ${result.suggestion.rent.toLocaleString()}.`
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

  function onSubmit(data: RentalFormValues) {
    onAddRental(data);
    setSuggestion(null);
    form.reset();
  }

  return (
    <Card className="shadow-lg bg-card">
      <CardHeader>
        <CardTitle>Add a New Rental</CardTitle>
        <CardDescription>Fill in the details of the rental property and its rooms.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Green Valley Apartments" {...field} />
                  </FormControl>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner's Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-medium">Rooms</h3>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove room</span>
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`rooms.${index}.roomNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A101, R001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`rooms.${index}.roomType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single Room">Single Room</SelectItem>
                            <SelectItem value="Bedsitter">Bedsitter</SelectItem>
                            <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                            <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                            <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                            <SelectItem value="4 Bedroom">4 Bedroom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name={`rooms.${index}.rent`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Monthly Rent (KSh)</FormLabel>
                        <FormControl>
                            <Input type="number" min="0" placeholder="Enter rent amount or use AI" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium text-muted-foreground">Get AI price suggestion for this room</p>
                    <Button type="button" variant="outline" onClick={() => handleSuggestion(index)} disabled={isPending}>
                    {isPending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                        </>
                    ) : (
                        <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Suggest Price
                        </>
                    )}
                    </Button>
                </div>

                {suggestion && (
                    <Alert className="bg-accent/20 border-accent/50">
                        <DollarSign className="h-4 w-4 !text-accent-foreground" />
                        <AlertTitle className="font-bold text-accent-foreground">AI Suggestion: KSh {suggestion.rent.toLocaleString()}</AlertTitle>
                        <AlertDescription className="text-accent-foreground/80">{suggestion.reasoning}</AlertDescription>
                    </Alert>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ roomNumber: '', roomType: '1 Bedroom', rent: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Room
            </Button>
            
            <Separator />

            <Button type="submit" size="lg" className="w-full">Add Rental Property</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}