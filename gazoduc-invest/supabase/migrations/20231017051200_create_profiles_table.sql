-- Désactiver temporairement les déclencheurs pour éviter les conflits
SET session_replication_role = replica;

-- Supprimer le déclencheur s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la table si elle existe (cela supprimera les données existantes)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Création de la table profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles;

-- Politique d'accès : les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Politique d'accès : les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Fonction pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le déclencheur pour mettre à jour automatiquement le champ updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Fonction pour créer automatiquement un profil lorsqu'un nouvel utilisateur s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le déclencheur pour créer/mettre à jour automatiquement un profil à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Réactiver les déclencheurs
RESET session_replication_role;

-- Mettre à jour les profils existants
INSERT INTO public.profiles (id, email, first_name, last_name, full_name)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  COALESCE(
    raw_user_meta_data->>'full_name',
    CONCAT(
      COALESCE(raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(raw_user_meta_data->>'last_name', '')
    )
  )
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = NOW();

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Stocke les informations de profil des utilisateurs';
COMMENT ON COLUMN public.profiles.id IS 'ID de l''utilisateur, référence auth.users';
COMMENT ON COLUMN public.profiles.email IS 'Email de l''utilisateur';
COMMENT ON COLUMN public.profiles.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN public.profiles.last_name IS 'Nom de famille de l''utilisateur';
COMMENT ON COLUMN public.profiles.full_name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de l''avatar de l''utilisateur';
COMMENT ON COLUMN public.profiles.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création du profil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière mise à jour du profil';
