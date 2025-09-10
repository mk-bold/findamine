import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService, ClueGenerationRequest, ClueGenerationResponse } from './ai.service';

export class GenerateClueDto {
  @ApiProperty()
  @IsString()
  locationName!: string;

  @ApiProperty()
  @IsString()
  locationAddress!: string;

  @ApiProperty()
  @IsNumber()
  locationLat!: number;

  @ApiProperty()
  @IsNumber()
  locationLng!: number;

  @ApiProperty({ enum: ['easy', 'medium', 'hard', 'cryptic', 'riddle', 'historical', 'fun'] })
  @IsIn(['easy', 'medium', 'hard', 'cryptic', 'riddle', 'historical', 'fun'])
  clueStyle!: 'easy' | 'medium' | 'hard' | 'cryptic' | 'riddle' | 'historical' | 'fun';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gameTheme?: string;
}

export class ImproveClueDto extends GenerateClueDto {
  @ApiProperty()
  @IsString()
  existingClueText!: string;
}

@ApiTags('AI Clue Generation')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-clue')
  @ApiOperation({ summary: 'Generate AI-powered clue text and hints' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully generated clue content',
    schema: {
      type: 'object',
      properties: {
        clueText: { type: 'string' },
        hint: { type: 'string' },
        alternativeTexts: { type: 'array', items: { type: 'string' } },
        alternativeHints: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Failed to generate clue content' })
  async generateClue(@Body() dto: GenerateClueDto): Promise<ClueGenerationResponse> {
    const request: ClueGenerationRequest = {
      locationName: dto.locationName,
      locationAddress: dto.locationAddress,
      locationLat: dto.locationLat,
      locationLng: dto.locationLng,
      clueStyle: dto.clueStyle,
      gameTheme: dto.gameTheme
    };

    return await this.aiService.generateClueContent(request);
  }

  @Post('improve-clue')
  @ApiOperation({ summary: 'Improve existing clue text using AI' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully improved clue content',
    schema: {
      type: 'object',
      properties: {
        clueText: { type: 'string' },
        hint: { type: 'string' },
        alternativeTexts: { type: 'array', items: { type: 'string' } },
        alternativeHints: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Failed to improve clue content' })
  async improveClue(@Body() dto: ImproveClueDto): Promise<ClueGenerationResponse> {
    const request: ClueGenerationRequest = {
      locationName: dto.locationName,
      locationAddress: dto.locationAddress,
      locationLat: dto.locationLat,
      locationLng: dto.locationLng,
      clueStyle: dto.clueStyle,
      gameTheme: dto.gameTheme,
      existingClueText: dto.existingClueText
    };

    return await this.aiService.improveExistingClue(request);
  }
}