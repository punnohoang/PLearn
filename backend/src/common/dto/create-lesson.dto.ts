import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    @Min(1)
    order: number;
}