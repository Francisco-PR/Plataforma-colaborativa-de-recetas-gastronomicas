import { IsDateString } from 'class-validator';

export class BanUserDto {
  @IsDateString()
  bannedUntil: string; // ISO date string (e.g. "2025-05-10T00:00:00Z")
}
