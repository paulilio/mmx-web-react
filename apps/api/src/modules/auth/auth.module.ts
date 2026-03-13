import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { GoogleOAuthController } from "./oauth/google-oauth.controller"
import { MicrosoftOAuthController } from "./oauth/microsoft-oauth.controller"

@Module({
  controllers: [AuthController, GoogleOAuthController, MicrosoftOAuthController],
})
export class AuthModule {}
