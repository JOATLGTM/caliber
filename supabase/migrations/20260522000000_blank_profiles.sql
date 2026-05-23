-- Optional cleanup: blank out demo profile data for existing users.
-- Run if your `profiles` rows currently contain Alex Morgan's seeded preferences.
-- Skips full_name so users keep their actual name from auth metadata.

update public.profiles
set
  phone = '',
  location = '',
  target_roles = '{}',
  preferred_locations = '{}',
  work_modes = '{"remote":false,"hybrid":false,"onsite":false}'::jsonb,
  salary_min = 0,
  salary_target = 0,
  experience_level = 'Mid',
  skills = '{}'
where phone = '+1 (415) 555 0192' or location = 'San Francisco, CA';
