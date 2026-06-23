import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function convertAndSaveImage(
  imageBuffer: Buffer,
): Promise<string | null> {
  try {
    const uploadDir = path.join(__dirname, "../public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(imageBuffer)
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log(
      `[ImageService] Konwersja z pamięci przeglądarki udana: ${fileName}`,
    );
    return `/uploads/${fileName}`;
  } catch (error: any) {
    console.error(`[ImageService] Błąd konwersji buffera:`, error.message);
    return null;
  }
}
