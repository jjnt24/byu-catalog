import * as functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const checkPhone = functions.https.onCall(async (data, context) => {
  const phone = data.phone?.trim();
  if (!phone) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
  }

  // Normalize phone: remove spaces and convert +62 to 0
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('+62')) {
    normalized = '0' + normalized.slice(3);
  }

  try {
    const snap = await db.collection('MemberData')
                         .where('localPhone', '==', normalized)
                         .limit(1)
                         .get();

    return { 
      found: !snap.empty, 
      UID: snap.empty ? null : snap.docs[0].id 
    };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', 'Error checking phone number');
  }
});
