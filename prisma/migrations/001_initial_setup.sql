-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auth_id" UUID NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "phone" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits_used" INTEGER NOT NULL DEFAULT 0,
    "credits_limit" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "video_url" TEXT,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "style" TEXT,
    "voice_type" TEXT,
    "music_style" TEXT,
    "user_id" UUID NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON "users"
    FOR SELECT USING (auth.uid()::text = auth_id);

CREATE POLICY "Users can update own profile" ON "users"
    FOR UPDATE USING (auth.uid()::text = auth_id);

CREATE POLICY "Users can insert own profile" ON "users"
    FOR INSERT WITH CHECK (auth.uid()::text = auth_id);

-- Create policies for projects table
CREATE POLICY "Users can view own projects" ON "projects"
    FOR SELECT USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create own projects" ON "projects"
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own projects" ON "projects"
    FOR UPDATE USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own projects" ON "projects"
    FOR DELETE USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));
