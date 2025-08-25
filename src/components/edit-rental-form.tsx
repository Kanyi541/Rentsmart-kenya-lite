
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2, DollarSign, PlusCircle, X, ChevronsDownUp, Eye, EyeOff, Lock } from 'lucide-react';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRentalSuggestion } from '@/app/actions';
import { rentalSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Rental } from '@/lib/types';
import { Badge } from './ui/badge';

type RentalFormValues = z.infer<typeof rentalSchema>;

interface Suggestion {
  rent: number;
  reasoning: string;
}

interface EditRentalFormProps {
    rental: Rental;
    onUpdateRental: (rentalId: string, data: RentalFormValues) => void;
}

export function EditRentalForm({ rental, onUpdateRental }: EditRentalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [indexForSuggestion, setIndexForSuggestion] = useState<number | null>(null);
  const { toast } = useToast();

  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState('A');
  const [bulkRoomType, setBulkRoomType] = useState('Single Room');
  const [bulkRent, setBulkRent] = useState(10000);
  const [showRooms, setShowRooms] = useState(true);


  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      name: rental.name,
      location: rental.location,
      ownerName: rental.ownerName,
      ownerNumber: rental.ownerNumber,
      rooms: rental.rooms,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });
  
  useEffect(() => {
    form.reset({
      name: rental.name,
      location: rental.location,
      ownerName: rental.ownerName,
      ownerNumber: rental.ownerNumber,
      rooms: rental.rooms,
    })
  }, [rental, form]);

  const handleSuggestion = (roomIndex: number) => {
    startTransition(async () => {
        setIndexForSuggestion(roomIndex);
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

  const handleBulkAdd = () => {
    const roomsToAdd = [];
    const existingNumbers = fields
        .map(field => {
            if(field.roomNumber.startsWith(bulkPrefix)) {
                const numberPart = field.roomNumber.substring(bulkPrefix.length);
                if (numberPart) {
                    return parseInt(numberPart, 10);
                }
            }
            return 0;
        })
        .filter(num => !isNaN(num) && num !== null);

    const startNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    for(let i = 0; i < bulkCount; i++) {
        roomsToAdd.push({
            roomNumber: `${bulkPrefix}${startNumber + i}`,
            roomType: bulkRoomType as any,
            rent: bulkRent,
            isOccupied: false
        });
    }
    append(roomsToAdd);
    toast({
        title: "Rooms Generated!",
        description: `${bulkCount} rooms have been added to the list.`
    })
    setShowRooms(true);
  }

  function onSubmit(data: RentalFormValues) {
    onUpdateRental(rental.id, data);
    setSuggestion(null);
    form.reset();
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
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

        <Card>
            <CardHeader>
                <CardTitle>Bulk Add Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Number of Rooms</FormLabel>
                        <Input type="number" value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value, 10) || 0)} />
                    </FormItem>
                    <FormItem>
                        <FormLabel>Room Number Prefix</FormLabel>
                        <Input placeholder="e.g., A, B, G" value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value)} />
                    </FormItem>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <Select onValueChange={setBulkRoomType} value={bulkRoomType}>
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
                    </FormItem>
                    <FormItem>
                         <FormLabel>Monthly Rent (KSh)</FormLabel>
                         <Input type="number" min="0" value={bulkRent} onChange={e => setBulkRent(parseInt(e.target.value, 10) || 0)}/>
                    </FormItem>
                 </div>
                 <Button type="button" onClick={handleBulkAdd} className="w-full">
                     <ChevronsDownUp className="mr-2 h-4 w-4" />
                     Generate and Add Rooms to List
                 </Button>
            </CardContent>
        </Card>

        <Separator />


        <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Room List ({fields.length} rooms)</h3>
            <div className="flex items-center gap-2">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRooms(!showRooms)}
                    disabled={fields.length === 0}
                >
                    {showRooms ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
                    {showRooms ? 'Hide' : 'Show'} Room List
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        append({ roomNumber: '', roomType: '1 Bedroom', rent: 0, isOccupied: false });
                        setShowRooms(true);
                    }}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Manually
                </Button>
            </div>
        </div>

        {showRooms && fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4 relative bg-card">
             {field.isOccupied ? (
                <Badge variant="secondary" className="absolute top-2 right-2">
                    <Lock className="mr-2 h-3 w-3" />
                    Occupied
                </Badge>
             ) : (
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
             )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name={`rooms.${index}.roomNumber`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., A101, R001" {...field} disabled={field.isOccupied} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={field.isOccupied}>
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
                        <Input type="number" min="0" placeholder="Enter rent amount or use AI" {...field} 
                         onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                         disabled={field.isOccupied}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            {!field.isOccupied && (
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium text-muted-foreground">Get AI price suggestion for this room</p>
                    <Button type="button" variant="outline" onClick={() => handleSuggestion(index)} disabled={isPending}>
                    {isPending && indexForSuggestion === index ? (
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
            )}
           

            {suggestion && indexForSuggestion === index && (
                <Alert className="bg-accent/20 border-accent/50">
                    <DollarSign className="h-4 w-4 !text-accent-foreground" />
                    <AlertTitle className="font-bold text-accent-foreground">AI Suggestion: KSh {suggestion.rent.toLocaleString()}</AlertTitle>
                    <AlertDescription className="text-accent-foreground/80">{suggestion.reasoning}</AlertDescription>
                </Alert>
            )}
            </div>
        ))}
        
        <Separator />

        <Button type="submit" size="lg" className="w-full">Save Changes</Button>
        </form>
    </Form>
  );
}
