import { algoliasearch } from 'algoliasearch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// 1. Initialize Firebase Admin
// Make sure to download your service account key and place it at the root as serviceAccountKey.json
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 2. Initialize Algolia (v5 syntax)
const client = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY // Note: Use Admin Key, NOT Search Key here
);

async function syncPostsToAlgolia() {
  console.log('Fetching posts from Firestore...');
  const snapshot = await db.collection('posts').get();
  const records = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    // Convert Firestore timestamps to unix timestamps or standard dates for Algolia
    const createdAt = data.createdAt ? data.createdAt.toDate().getTime() : null;
    const updatedAt = data.updatedAt ? data.updatedAt.toDate().getTime() : null;

    records.push({
      objectID: doc.id,
      ...data,
      createdAt,
      updatedAt
    });
  });

  console.log(`Sending ${records.length} records to Algolia...`);
  const indexName = process.env.VITE_ALGOLIA_INDEX_NAME || 'posts';
  
  await client.saveObjects({ indexName, objects: records });
  
  // Optionally, configure searchable attributes and ranking
  await client.setSettings({
    indexName,
    indexSettings: {
      searchableAttributes: [
        'title',
        'tags',
        'content',
        'authorName',
        'authorUsername'
      ],
      customRanking: [
        'desc(likeCount)',
        'desc(views)',
        'desc(createdAt)'
      ]
    }
  });

  console.log('Successfully synced posts to Algolia!');
}

syncPostsToAlgolia().catch(console.error);