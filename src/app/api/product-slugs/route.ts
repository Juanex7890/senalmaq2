import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebaseClient";

const PRODUCTS_COLLECTION = "products";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export async function GET() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const productsQuery = query(productsRef, where("published", "==", true));
    let snapshot = await getDocs(productsQuery);

    if (snapshot.empty) {
      snapshot = await getDocs(productsRef);
    }

    const slugs = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const slugCandidate = data?.slug;
      const published =
        typeof data?.published === "boolean"
          ? data.published
          : typeof data?.active === "boolean"
            ? data.active
            : true;

      if (published && isNonEmptyString(slugCandidate)) {
        slugs.add(slugCandidate.trim());
      }
    });

    return NextResponse.json(Array.from(slugs));
  } catch (error) {
    console.error("Error fetching product slugs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
