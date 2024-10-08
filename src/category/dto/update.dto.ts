import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCategory {
  @ApiPropertyOptional()
  name: string;
}
