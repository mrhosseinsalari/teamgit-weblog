import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiConsumes, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create.dto";
import { MulterFile } from "src/common/types/public";
import { CheckRequiredUploadedFile } from "src/common/decorator/upload-file.decorator";
import { UploadFile } from "src/common/interceptor/upload-file.interceptor";
import { MIME_TYPE } from "src/common/enum/meme-type.enum";
import { Blog } from "./schema/blog.schema";

@ApiTags("Blog")
@Controller("/blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(UploadFile("image"))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CheckRequiredUploadedFile(MIME_TYPE.IMAGE) file: MulterFile,
    @Body() blog: CreateBlogDto
  ) {
    blog.image = file.path.slice(7);
    const result = await this.blogService.create(blog);
    return {
      statusCode: HttpStatus.CREATED,
      message: "created blog successfully",
    };
  }

  @Get()
  @ApiQuery({ name: "search", type: "string", required: false })
  @ApiQuery({ name: "category", type: "string", required: false })
  async findAll(
    @Query("search") search: string,
    @Query("category") category: string
  ): Promise<{ blogs: Blog[] }> {
    const blogs = await this.blogService.findAll({ search, category });
    return { blogs };
  }

  @Get(":id")
  @ApiParam({ name: "id", type: "string" })
  async findOne(@Param("id") id: string): Promise<Blog> {
    return await this.blogService.findOne(id);
  }
}
