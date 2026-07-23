# Sammy Agent DB Reset Guide

This guide explains how to completely reset your backend database (empty and drop all tables) and recreate them from scratch. This is particularly useful if your database schema becomes out of sync or if you want to wipe all past conversations and test data.

> [!WARNING]
> Running the reset command will **permanently delete all data** in your database, including workspaces, users, conversations, and agent runs. 

## Resetting the Database

To drop all tables, recreate them, and optionally run the seed script to populate initial data, follow these steps:

1. **Stop the backend server** if it is currently running (press `Ctrl + C` in the terminal running `npm run start:dev`).
2. **Open a terminal** and navigate to the `backend` directory of your project:
   ```bash
   cd "C:\Users\nikhi\OneDrive\Desktop\React learning\sammy-agent\backend"
   ```
3. **Run the Prisma Reset command**:
   ```bash
   npx prisma db push --force-reset
   ```
   *Note: This command will drop the database, recreate it according to your `schema.prisma` file, and automatically run `prisma/seed.ts` (if configured) to insert any necessary default rows.*

4. **Restart your backend server**:
   ```bash
   npm run start:dev
   ```
5. **For seeding in db**:
```bash
npx prisma db seed
```
## Auto-Creation on Startup

I have already updated your `package.json` so that the `start:dev` script will automatically check for tables and push the schema before starting the server. 

Your `start:dev` script now looks like this:
```json
"start:dev": "npx prisma db push && nest start --watch"
```
Because of this update, **you don't have to manually create the tables** when starting the app for the first time or when pulling new schema changes. As long as you run `npm run start:dev`, Prisma will ensure the tables exist!
