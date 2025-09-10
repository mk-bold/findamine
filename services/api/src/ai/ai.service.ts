import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ClueGenerationRequest {
  locationName: string;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  clueStyle: 'easy' | 'medium' | 'hard' | 'cryptic' | 'riddle' | 'historical' | 'fun';
  gameTheme?: string;
  existingClueText?: string;
}

export interface ClueGenerationResponse {
  clueText: string;
  hint: string;
  alternativeTexts: string[];
  alternativeHints: string[];
}

@Injectable()
export class AiService {
  private openai: OpenAI | undefined;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateClueContent(request: ClueGenerationRequest): Promise<ClueGenerationResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Most cost-effective option
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7, // Balanced creativity and cost
        max_tokens: 400 // Reduced for cost efficiency
      });

      const response = completion.choices[0].message.content;
      return this.parseAiResponse(response || '');
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate clue content with AI');
    }
  }

  async improveExistingClue(request: ClueGenerationRequest): Promise<ClueGenerationResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert treasure hunt game designer. Your task is to improve and enhance existing clue content for a geo-caching treasure hunt game called FINDAMINE.

Key requirements:
- Improve clarity and engagement
- Maintain the original intent and difficulty
- Make clues more fun and immersive
- Ensure clues are solvable but challenging
- Consider the location context
- Keep clues family-friendly`;

    const userPrompt = `Location: ${request.locationName}
Address: ${request.locationAddress}
Style: ${request.clueStyle}
${request.gameTheme ? `Game Theme: ${request.gameTheme}` : ''}

EXISTING CLUE: "${request.existingClueText}"

Please improve this clue and provide alternatives. Return your response in this JSON format:
{
  "clueText": "improved main clue text",
  "hint": "helpful hint for players",
  "alternativeTexts": ["alternative clue 1", "alternative clue 2"],
  "alternativeHints": ["hint variation 1", "hint variation 2"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Most cost-effective option
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7, // Balanced creativity and cost
        max_tokens: 400 // Reduced for cost efficiency
      });

      const response = completion.choices[0].message.content;
      return this.parseAiResponse(response || '');
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to improve clue content with AI');
    }
  }

  private buildSystemPrompt(request: ClueGenerationRequest): string {
    const difficultyGuides = {
      easy: 'Create straightforward, obvious clues that are easy to understand and solve.',
      medium: 'Create moderately challenging clues that require some thinking but are not too obscure.',
      hard: 'Create challenging clues that require careful observation and deduction.',
      cryptic: 'Create puzzle-like clues with wordplay, codes, or hidden meanings.',
      riddle: 'Create clues in riddle format with metaphors and creative descriptions.',
      historical: 'Create clues that incorporate historical facts or references about the location.',
      fun: 'Create playful, humorous clues that are entertaining and engaging.'
    };

    return `You are an expert treasure hunt game designer creating clues for a geo-caching app called FINDAMINE. 

Your role:
- Create engaging, solvable clues for specific real-world locations
- Make clues that encourage exploration and observation
- Ensure clues are family-friendly and inclusive
- ${difficultyGuides[request.clueStyle]}

Guidelines:
- Clues should relate to visible features, landmarks, or characteristics of the location
- Avoid clues requiring special knowledge unless specified
- Make clues immersive and story-driven when possible
- Ensure hints provide helpful guidance without giving away the answer
- Consider the surrounding area and what players might observe

Return your response in JSON format only.`;
  }

  private buildUserPrompt(request: ClueGenerationRequest): string {
    return `Generate a treasure hunt clue for this location:

Location: ${request.locationName}
Address: ${request.locationAddress}
Coordinates: ${request.locationLat}, ${request.locationLng}
Clue Style: ${request.clueStyle}
${request.gameTheme ? `Game Theme: ${request.gameTheme}` : ''}

Create a clue that guides players to this specific location. Consider what makes this place unique or identifiable.

Required JSON format:
{
  "clueText": "main clue text that players will see",
  "hint": "helpful hint if players get stuck",
  "alternativeTexts": ["alternative clue option 1", "alternative clue option 2"],
  "alternativeHints": ["alternative hint 1", "alternative hint 2"]
}`;
  }

  private parseAiResponse(response: string): ClueGenerationResponse {
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        clueText: parsed.clueText || 'Find the treasure at this location.',
        hint: parsed.hint || 'Look around carefully for clues.',
        alternativeTexts: Array.isArray(parsed.alternativeTexts) 
          ? parsed.alternativeTexts 
          : ['Alternative clue text not generated'],
        alternativeHints: Array.isArray(parsed.alternativeHints)
          ? parsed.alternativeHints
          : ['Alternative hint not generated']
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback response if parsing fails
      return {
        clueText: 'Explore this location to find your next clue.',
        hint: 'Look for distinctive features or landmarks.',
        alternativeTexts: ['Search around this area for hidden treasures.'],
        alternativeHints: ['Pay attention to unique details about this place.']
      };
    }
  }
}