/*
  Warnings:

  - You are about to drop the column `active` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `nextPaymentDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `durationDays` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Made the column `planId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "active",
DROP COLUMN "duration",
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "durationDays" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "features" DROP NOT NULL,
ALTER COLUMN "features" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "canceledAt",
DROP COLUMN "nextPaymentDate",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStatus",
DROP COLUMN "type",
ADD COLUMN     "cancelDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "planId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
