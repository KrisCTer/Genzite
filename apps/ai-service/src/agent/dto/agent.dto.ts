import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AgentChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  model?: string;
}
