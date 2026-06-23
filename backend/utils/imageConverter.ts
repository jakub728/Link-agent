import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function convertAndSaveImage(
  imageBuffer: Buffer,
  imageUrl: string,
): Promise<string | null> {
  try {
    const uploadDir = path.join(__dirname, "../public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const baseNameWithExt = path.basename(imageUrl); 
    const originalName = path.parse(baseNameWithExt).name; 

    const fileName = `${originalName}.jpg`;
    const outputPath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/${fileName}`;

    if (fs.existsSync(outputPath)) {
      console.log(
        `[ImageService] Obrazek ${fileName} już istnieje na dysku. Pomijam konwersję.`,
      );
      return publicPath;
    }

    await sharp(imageBuffer)
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log(
      `[ImageService] Nowy obrazek zapisany pomyślnie: ${fileName}`,
    );
    return publicPath;
  } catch (error: any) {
    console.error(`[ImageService] Błąd konwersji/sprawdzania buffera:`, error.message);
    return null;
  }
}