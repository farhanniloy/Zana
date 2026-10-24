import { PrismaClient } from '@prisma/client';
import { PrismaClient as LocalPrismaClient } from '@prisma/local-preview-client';

let prisma;

const dbUrl = process.env.DATABASE_URL || '';
const usesPostgres = /^postgres(?:ql)?:\/\//i.test(dbUrl);

if (usesPostgres) {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
} else {
  const localDatabaseUrl =
    process.env.LOCAL_DATABASE_URL || `file:${process.cwd()}/prisma/local.db`;

  if (process.env.NODE_ENV === 'production') {
    prisma = new LocalPrismaClient({
      datasources: { db: { url: localDatabaseUrl } },
    });
  } else {
    if (!global.localPrisma) {
      global.localPrisma = new LocalPrismaClient({
        datasources: { db: { url: localDatabaseUrl } },
      });
    }
    prisma = global.localPrisma;
  }
}

export default prisma;
