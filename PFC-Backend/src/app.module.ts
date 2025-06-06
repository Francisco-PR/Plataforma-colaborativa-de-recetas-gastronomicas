import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot( process.env.MONGO_URI!, { dbName: process.env.MONGO_DB_NAME }),
    UsersModule,
    AuthModule,
    RecipesModule,
    CommentsModule,
    FavoritesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

