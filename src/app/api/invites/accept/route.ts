// pages/api/invites/accept.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/firebase/firebase";
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, arrayUnion } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { token, currentUserUid } = req.body;
    if (!token || !currentUserUid) return res.status(400).json({ error: "Missing fields" });

    try {
        const invitesRef = collection(db, "invites");
        const inviteSnap = await getDocs(query(invitesRef, where("token", "==", token)));
        if (inviteSnap.empty) return res.status(404).json({ error: "Invite not found" });

        const inviteDoc = inviteSnap.docs[0];
        const inviteData = inviteDoc.data();

        if (inviteData.status !== "pending") return res.status(400).json({ error: "Invite already used" });
        if (inviteData.expiresAt.toDate() < new Date()) return res.status(400).json({ error: "Invite expired" });

        // Додаємо користувача до collaborators
        const tripRef = doc(db, "trips", inviteData.tripId);
        await updateDoc(tripRef, { collaborators: arrayUnion(currentUserUid) });

        // Міняємо статус інвайту
        await updateDoc(doc(db, "invites", inviteDoc.id), { status: "accepted" });

        res.status(200).json({ message: "Invite accepted" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
