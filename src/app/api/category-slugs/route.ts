import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebaseClient";

const CATEGORIES_COLLECTION = "categories";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export async function GET() {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(categoriesRef);

    const slugs = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const slugCandidate = data?.slug;

      if (isNonEmptyString(slugCandidate)) {
        slugs.add(slugCandidate.trim());
      }
    });

    return NextResponse.json(Array.from(slugs));
  } catch (error) {
    console.error("Error fetching category slugs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
