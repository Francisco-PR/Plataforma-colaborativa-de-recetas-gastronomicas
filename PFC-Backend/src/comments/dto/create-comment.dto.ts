import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  user: string; // ID de usuario

  @IsNotEmpty()
  recipe: string; // ID de la receta
}
