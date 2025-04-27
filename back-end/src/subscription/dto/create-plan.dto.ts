export class CreatePlanDto {
  name: string;
  description: string;
  price: number;
  duration: number;  // Changed from durationDays to match Prisma schema
  features: string[];
  isActive?: boolean = true;
}
