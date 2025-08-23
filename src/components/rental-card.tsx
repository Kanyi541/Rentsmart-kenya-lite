import { Building, MapPin, Phone, User, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Rental } from '@/lib/types';
import { Badge } from './ui/badge';

export function RentalCard({ rental }: { rental: Rental }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <Building className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="text-xl font-bold">{rental.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground pt-1">
                    <MapPin className="h-4 w-4" />
                    {rental.location}
                </CardDescription>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-4 text-sm">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary"/>
                <span className="font-medium">{rental.ownerName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary"/>
                <span className="font-medium">{rental.ownerNumber}</span>
            </div>
             <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary"/>
                <span className="font-medium">{rental.rooms.length} rooms</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Room No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Rent (KSh)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rental.rooms.map((room) => (
                    <TableRow key={room.id || room.roomNumber}>
                        <TableCell className="font-medium">{room.roomNumber}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{room.roomType}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{room.rent.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
