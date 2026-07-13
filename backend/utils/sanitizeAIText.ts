export function sanitizeLLMText(text: string): string {
  if (!text) return "";

  return (
    text
      // 1. Usuwa ukryte/niewidoczne znaki Unicode (np. zero-width space, BOM itp.)
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // 2. Zamienia twarde spacje i inne dziwne odstępy na zwykłe spacje
      .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")

      // 3. Normalizuje znaki końca linii (zamienia windowsowe \r\n na linuxowe \n)
      .replace(/\r\n/g, "\n")

      // 4. (Opcjonalnie) Zamienia długie pauzy typograficzne na zwykłe myślniki,
      // jeśli sprawiają problemy w Twoich skryptach
      .replace(/[\u2013\u2014]/g, "-")

      // 5. Usuwa wielokrotne spacje obok siebie (opcjonalnie)
      .replace(/ +/g, " ")

      .trim()
  );
}
