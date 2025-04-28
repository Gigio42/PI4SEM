import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  features?: string[];
  isActive?: boolean;
  discount?: number;
}
