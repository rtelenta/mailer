# Delta: template-management

## Schema / Data Model

REMOVE the `preheader` column from the `templates` table. The column is nullable text and carries no required data. A Drizzle migration (`ALTER TABLE "templates" DROP COLUMN "preheader"`) must accompany this change.

## Create Template

REMOVE `preheader` from the create request body and from the DB insert.

## Update Template

REMOVE `preheader` from the update request body and from the DB update.

## Template Response Shape

REMOVE `preheader` from all template response objects returned by the API.
