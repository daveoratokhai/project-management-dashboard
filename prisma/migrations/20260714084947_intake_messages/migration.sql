-- AlterTable
ALTER TABLE "ProjectTask" ADD COLUMN     "intakeMessageId" TEXT,
ADD COLUMN     "reviewed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "IntakeMessage" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "rawFrom" TEXT NOT NULL DEFAULT '',
    "rawBody" TEXT NOT NULL DEFAULT '',
    "mediaJson" TEXT NOT NULL DEFAULT '[]',
    "transcript" TEXT NOT NULL DEFAULT '',
    "aiProjectId" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntakeMessage_channel_createdAt_idx" ON "IntakeMessage"("channel", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTask_intakeMessageId_key" ON "ProjectTask"("intakeMessageId");

-- CreateIndex
CREATE INDEX "ProjectTask_reviewed_idx" ON "ProjectTask"("reviewed");

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_intakeMessageId_fkey" FOREIGN KEY ("intakeMessageId") REFERENCES "IntakeMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

