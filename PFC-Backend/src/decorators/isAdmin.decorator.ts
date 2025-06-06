import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IsAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): { isAdmin: boolean } => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Verificar si el usuario tiene el rol 'Admin'
    const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('Admin');
    
    return { isAdmin };  // Devuelve el objeto con la variable isAdmin
  },
);
