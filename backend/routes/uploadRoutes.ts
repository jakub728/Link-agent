import express, { type Response, type NextFunction } from "express";
import axios from "axios";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import GeneratedData from "../model/generated";
import Account from "../model/conectedAccouts";
import { type ISocialPost, IRedditPost } from "../types/generatedInterface";

const router = express.Router();
router.post(
  "/content",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { platform, accountIds, generatedDataId } = req.body;

      if (!platform || !generatedDataId || !accountIds) {
        return res.status(400).json({ message: "Brak wymaganych pól" });
      }

      const supportedPlatforms = ["facebook", "linkedin", "reddit", "discord"];
      if (!supportedPlatforms.includes(platform)) {
        return res.status(400).json({
          message: `Platforma ${platform} nie jest jeszcze obsługiwana.`,
        });
      }

      const idsArray = Array.isArray(accountIds) ? accountIds : [accountIds];

      const accounts = await Account.find({
        _id: { $in: idsArray },
        userId: userId,
      });

      if (!accounts || accounts.length === 0) {
        return res.status(404).json({
          message: "Nie znaleziono wybranego konta lub brak dostępu.",
        });
      }

      const generatedData = await GeneratedData.findById(generatedDataId);
      if (!generatedData) {
        return res
          .status(404)
          .json({ message: "Nie znaleziono wygenerowanych opisów" });
      }

      const platformContent = (generatedData as any)[platform];

      if (!platformContent) {
        return res
          .status(404)
          .json({ message: `Brak treści dla danej platformy ${platform}` });
      }

      const globalImage = generatedData.imageUrl;
      const globalLink = generatedData.link;
      const postTitle = platformContent.title;
      const postContent = platformContent.content;
      const postSubreddit = platformContent.subreddit;

      let successCount = 0;
      const successfulAccountIds: string[] = [];

      for (const account of accounts) {
        try {
          switch (platform) {
            case "facebook": {
              const pageId = account.profileId || account.id;
              const pageToken = account.credentials?.accessToken;

              if (!pageId || !pageToken) {
                console.error(
                  `Brak danych autoryzacji FB dla konta: ${account._id}`,
                );
                continue;
              }

              const params: Record<string, any> = {
                access_token: pageToken,
              };

              let createdPostId: string | null = null;

              if (globalImage) {
                const publicImageUrl = `https://ai.sulisz.pl/public${globalImage}`;
                const response = await axios.post(
                  `https://graph.facebook.com/v20.0/${pageId}/photos`,
                  null,
                  {
                    params: {
                      ...params,
                      url: publicImageUrl,
                      caption: postContent,
                    },
                  },
                );
                createdPostId = response.data.post_id || response.data.id;
              } else {
                const response = await axios.post(
                  `https://graph.facebook.com/v20.0/${pageId}/feed`,
                  null,
                  {
                    params: {
                      ...params,
                      message: postContent,
                    },
                  },
                );
                createdPostId = response.data.id;
              }

              if (createdPostId && globalLink) {
                try {
                  const commentText = `Link do pełnego artykułu: ${globalLink}`;
                  await axios.post(
                    `https://graph.facebook.com/v20.0/${createdPostId}/comments`,
                    null,
                    {
                      params: {
                        access_token: pageToken,
                        message: commentText,
                      },
                    },
                  );
                  console.log(
                    `Dodano komentarz z linkiem do posta: ${createdPostId}`,
                  );
                } catch (commentError) {
                  console.error(
                    `Nie udało się dodać komentarza do posta ${createdPostId}:`,
                    commentError,
                  );
                }
              }

              successfulAccountIds.push(account._id.toString());
              successCount++;
              break;
            }

            case "linkedin":
              // Logika wysyłki na LinkedIn
              break;

            case "reddit":
              // Twoja konfiguracja pod Reddit developer API
              break;

            case "discord":
              // Wrzutka na webhooka lub przez bota
              break;
          }
        } catch (singlePublishError) {
          console.error(
            `Błąd podczas publikacji na koncie ${account._id}:`,
            singlePublishError,
          );
        }
      }

      if (successfulAccountIds.length > 0) {
        const uploadsUpdates = successfulAccountIds.map((id) => ({
          id: id,
          uploaded: true,
        }));

        await GeneratedData.findByIdAndUpdate(generatedDataId, {
          $push: {
            [`${platform}.uploads`]: { $each: uploadsUpdates },
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Pomyślnie opublikowano na ${successCount}/${accounts.length} kont.`,
      });
    } catch (error) {
      console.error("Błąd podczas przesyłania danych:", error);
      next(error);
    }
  },
);

export default router;
