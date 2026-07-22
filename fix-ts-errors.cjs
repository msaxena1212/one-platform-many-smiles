const fs = require('fs');

// 1. Fix supabase.ts
let supabaseContent = fs.readFileSync('src/lib/supabase.ts', 'utf8');
supabaseContent = supabaseContent.replace(/created_at: string;\n  updated_at: string;\n\};/, 'created_at: string;\n  updated_at: string;\n  tenant_name?: string;\n  unit_ref?: string;\n};');
fs.writeFileSync('src/lib/supabase.ts', supabaseContent);

// 2. Fix admin.properties.tsx
let adminProps = fs.readFileSync('src/routes/admin.properties.tsx', 'utf8');
adminProps = adminProps.replace(/\/host\/manage\/\$id/g, '/prop-mgr/manage/$id');
fs.writeFileSync('src/routes/admin.properties.tsx', adminProps);

// 3. Fix guest.tsx
let guestTsx = fs.readFileSync('src/routes/guest.tsx', 'utf8');
guestTsx = guestTsx.replace(/\/properties/g, '/');
fs.writeFileSync('src/routes/guest.tsx', guestTsx);

// 4. Fix super-admin.config.tsx
let saConfig = fs.readFileSync('src/routes/super-admin.config.tsx', 'utf8');
saConfig = saConfig.replace(/Toggle, /g, '');
fs.writeFileSync('src/routes/super-admin.config.tsx', saConfig);

// 5. Fix super-admin.tsx
let saTsx = fs.readFileSync('src/routes/super-admin.tsx', 'utf8');
saTsx = saTsx.replace(/\/super-admin\/settings/g, '/super-admin/config');
fs.writeFileSync('src/routes/super-admin.tsx', saTsx);

console.log('Fixed typescript errors.');
