#!/bin/bash

# Arrêter le script en cas d'erreur
set -e

echo "🌱 Génération du script de seed (Bucket: 'caisse')..."

# 1. Vérification
if [ ! -f "src/serviceaccounts.json" ]; then
    echo "❌ Erreur : 'src/serviceaccounts.json' est introuvable."
    exit 1
fi

# 2. Installation des outils (Mode Force pour éviter les conflits Angular)
echo "📦 Installation des librairies de script..."
npm install firebase-admin @supabase/supabase-js axios --no-save --legacy-peer-deps

# 3. Création du dossier scripts
mkdir -p scripts

# 4. Génération du code Node.js
echo "📝 Création de scripts/seed.js..."
cat > scripts/seed.js <<EOF
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// --- CONFIGURATION ---

// 1. Firebase Admin
const serviceAccount = require('../src/serviceaccounts.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// 2. Supabase Admin
// ⚠️ REMPLACEZ JUSTE L'URL CI-DESSOUS
const SUPABASE_URL = 'https://REMPLACER_PAR_VOTRE_ID_PROJET.supabase.co'; 

// Votre clé secrète (Service Role) fournie précédemment
const SUPABASE_SERVICE_KEY = 'sb_secret_gXJjm5eYT_3QnBRl_eh25Q_4ungNoXt';

// Nom de votre bucket
const BUCKET_NAME = 'caisse';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- DONNÉES ---

const MOCK_PRODUCTS = [
  { name: 'Espresso Intense', price: 2.50, category: 'Boissons', stock: 100, barcode: '800001', sourceUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop' },
  { name: 'Croissant Beurre', price: 1.80, category: 'Viennoiserie', stock: 50, barcode: '800002', sourceUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop' },
  { name: 'Jus Orange Bio', price: 3.50, category: 'Boissons', stock: 30, barcode: '800003', sourceUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop' },
  { name: 'Sandwich Club', price: 5.50, category: 'Snack', stock: 20, barcode: '800004', sourceUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop' },
  { name: 'Donut Chocolat', price: 2.00, category: 'Viennoiserie', stock: 25, barcode: '800005', sourceUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Soda Cola', price: 1.50, category: 'Boissons', stock: 60, barcode: '800006', sourceUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop' }
];

// --- LOGIQUE ---

async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

async function uploadToSupabase(buffer, filename) {
  // Upload dans le bucket "caisse"
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(\`mock/\${filename}\`, buffer, { 
      contentType: 'image/jpeg', 
      upsert: true 
    });

  if (error) {
    console.error('Erreur Supabase:', error.message);
    throw error;
  }
  
  // Récupération URL publique
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(\`mock/\${filename}\`);
    
  return urlData.publicUrl;
}

async function seed() {
  console.log('🚀 Démarrage de l\'injection de données...');
  console.log(\`🎯 Cible: Bucket "\${BUCKET_NAME}"\`);

  if (SUPABASE_URL.includes('REMPLACER')) {
    console.error('❌ ERREUR: Vous devez éditer scripts/seed.js et mettre votre URL Supabase !');
    process.exit(1);
  }

  let count = 0;
  for (const p of MOCK_PRODUCTS) {
    try {
      process.stdout.write(\`📦 Traitement de "\${p.name}"... \`);
      
      // 1. Download
      const buffer = await downloadImage(p.sourceUrl);
      const filename = \`\${Date.now()}-\${Math.floor(Math.random()*1000)}.jpg\`;
      
      // 2. Upload
      const publicUrl = await uploadToSupabase(buffer, filename);
      
      // 3. Firestore
      await db.collection('products').doc(p.barcode).set({
        name: p.name,
        price: p.price,
        category: p.category,
        stock: p.stock,
        barcode: p.barcode,
        imageUrl: publicUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ OK');
      count++;
    } catch (e) {
      console.log('');
      console.error(\`❌ Échec: \${e.message}\`);
    }
  }
  console.log(\`\n✨ Terminé ! \${count} produits ajoutés.\`);
}

seed();
EOF

echo "✅ Script 'scripts/seed.js' créé pour le bucket 'caisse'."
echo "--------------------------------------------------------"
echo "👉 ÉTAPE 1 : Ouvrez 'scripts/seed.js'"
echo "👉 ÉTAPE 2 : Remplacez 'https://REMPLACER_PAR_VOTRE_ID_PROJET.supabase.co' par votre vraie URL."
echo "👉 ÉTAPE 3 : Exécutez : node scripts/seed.js"
