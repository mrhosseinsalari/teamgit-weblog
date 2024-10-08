import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument } from "./schema/blog.schema";
import { Model, Types } from "mongoose";
import { CategoryService } from "src/category/category.service";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBlogDto } from "./dto/create.dto";
import { ISearch } from "./interfaces/blog.interface";

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    private CategoryService: CategoryService
  ) {}

  async create(blog: CreateBlogDto) {
    const category = await this.CategoryService.findById(blog.category);
    delete blog.category;
    const newBlog = await this.blogModel.create({
      title: blog.title,
      image: blog.image,
      content: blog.content,
      author: blog.author,
      category: new Types.ObjectId(Number(category._id)),
    });
    return newBlog;
  }

  async findAll(query: ISearch) {
    let match = {};
    if (query.search) {
      match["$or"] = [
        { title: { $regex: query.search, $options: "gi" } },
        { content: { $regex: query.search, $options: "gi" } },
      ];
    }
    if (query.category) {
      match["category"] = { $regex: query.category, $options: "gi" };
    }
    const blogs = await this.blogModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $match: match,
      },
    ]);
    return blogs;
  }

  async findOne(id: string) {
    const blog = await this.blogModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $addFields: {
          category: "$category.name",
        },
      },
    ]);

    return blog?.[0];
  }
}
