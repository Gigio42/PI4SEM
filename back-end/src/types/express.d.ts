// filepath: d:\clone\UXperiment-Labs\back-end\src\types\express.d.ts
import { User } from '../auth/user.interface'; // Substitua pelo tipo correto de usuário, se necessário

declare global {
  namespace Express {
    interface Request {
      user?: User; // Adicione a propriedade user
    }
  }
}