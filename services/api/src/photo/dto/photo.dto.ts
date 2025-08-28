import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateGamePhotoDto {
  @IsUUID()
  gameId!: string;

  @IsString()
  filename!: string;

  @IsString()
  originalName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isGameCenter?: boolean;
}

export class CreateCluePhotoDto {
  @IsUUID()
  clueLocationId!: string;

  @IsOptional()
  @IsUUID()
  gameId?: string;

  @IsString()
  filename!: string;

  @IsString()
  originalName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCluePhoto?: boolean;
}

export class UpdatePhotoDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isGameCenter?: boolean;

  @IsOptional()
  @IsBoolean()
  isCluePhoto?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavorited?: boolean;
}
