import { Module } from "@nestjs/common"
import { ContactsController } from "./contacts.controller"
import { CONTACT_REPOSITORY } from "./application/ports/contact-repository.port"
import { PrismaContactRepository } from "./infrastructure/repositories/prisma-contact.repository"
import { ContactApplicationService } from "./application/contact.service"

@Module({
  controllers: [ContactsController],
  providers: [
    { provide: CONTACT_REPOSITORY, useClass: PrismaContactRepository },
    ContactApplicationService,
  ],
})
export class ContactsModule {}
