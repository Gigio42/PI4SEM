export class CreatePlanDto {
  name: string;
  description: string;
  price: number;
  duration: number;  // Field that will be mapped to durationDays
  features: string[];
  isActive?: boolean = true;
}
