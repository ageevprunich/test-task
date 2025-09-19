import { db } from "@/firebase/firebase";
import { collection, addDoc, getDoc, doc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tripId, email, currentUserUid } = await req.json();

    if (!tripId || !email || !currentUserUid) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Отримуємо подорож
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const tripData = tripSnap.data() as any;

    if (tripData.ownerId !== currentUserUid) {
  return NextResponse.json({ error: "Only owner can invite" }, { status: 403 });
}

if (!tripData.ownerEmail) {
  return NextResponse.json({ error: "Owner email not set" }, { status: 500 });
}

if (email === tripData.ownerEmail) {
  return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
}


    // Перевірка на існуючий активний інвайт
    const invitesRef = collection(db, "invites");
    const existingSnap = await getDocs(
      query(
        invitesRef,
        where("tripId", "==", tripId),
        where("email", "==", email),
        where("status", "==", "pending")
      )
    );

    if (!existingSnap.empty) {
      return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
    }

    // Створюємо токен і записуємо інвайт
    const token = uuidv4();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    await addDoc(invitesRef, {
      tripId,
      email,
      token,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    // Відправка email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Запрошення до подорожі "${tripData.title}"`,
      html: `Вас запрошено до подорожі. <a href="${inviteLink}">Прийняти запрошення</a>`,
    });

    return NextResponse.json({ message: "Invite sent" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
