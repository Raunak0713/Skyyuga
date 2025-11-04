'use server';

import { utapi } from "@/lib/utapi";

export async function deleteUploadthingFile(fileKeys: string[]) {
  if (!fileKeys || fileKeys.length === 0) return;

  try {
    await utapi.deleteFiles(fileKeys);
  } catch (error) {
    console.error("Failed to delete from UploadThing:", error);
  }
}