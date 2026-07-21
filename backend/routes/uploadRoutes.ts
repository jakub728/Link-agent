import express, { type Response, type NextFunction } from "express";
import axios from "axios";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import GeneratedData from "../model/generated";
import Account from "../model/conectedAccouts";

//! ROUTA DO PRZESYŁANIA WYGNEROWANYCH TREŚCI NA PLATFORMY SPOŁECZNOŚCIOWE
//https://ai.sulisz.pl/upload/content
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

      for (const account of accounts) {
        try {
          switch (platform) {
            case "facebook": {
              const pageId = account.profileId;
              const pageName = account.profileName;
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
                  const commentText = `Link do artykułu: ${globalLink}`;
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
              await GeneratedData.findByIdAndUpdate(generatedDataId, {
                $push: {
                  "facebook.uploaded": {
                    accountId: account._id.toString(),
                    accountName: pageName,
                    createdAt: new Date(),
                  },
                },
              });

              successCount++;
              break;
            }

            case "linkedin": {
              const pageId = account.profileId;
              const pageName = account.profileName;
              const pageToken = account.credentials?.accessToken;
              const imageUrl = `https://ai.sulisz.pl/public${globalImage}`;
              const imageResponse = await axios.get(imageUrl, {
                responseType: "arraybuffer",
              });
              const imageBuffer = Buffer.from(imageResponse.data);

              if (!pageId || !pageToken) {
                console.error(
                  `Brak danych autoryzacji LinkedIn dla konta: ${pageName}`,
                );
                continue;
              }

              const headers = {
                Authorization: `Bearer ${pageToken}`,
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
              };

              let createdPostUrn: string | null = null;

              const getOwnerUrn = (id: string): string => {
                if (!id) return "";
                if (id.startsWith("urn:li:")) return id;
                const isNumericOnly = /^\d+$/.test(id);
                return isNumericOnly
                  ? `urn:li:organization:${id}`
                  : `urn:li:person:${id}`;
              };

              if (globalImage) {
                const registerResponse = await axios.post(
                  "https://api.linkedin.com/v2/assets?action=registerUpload",
                  {
                    registerUploadRequest: {
                      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                      owner: getOwnerUrn(pageId),
                    },
                  },
                  { headers },
                );

                const uploadMechanism =
                  registerResponse.data?.value?.uploadMechanism?.[
                    "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
                  ] ||
                  registerResponse.data?.value?.uploadMechanism?.[
                    "com.linkedin.digitalmedia.uploading.MediaUploadMechanism"
                  ];

                const uploadData = Array.isArray(uploadMechanism)
                  ? uploadMechanism[0]
                  : uploadMechanism;
                const uploadUrl = uploadData?.uploadUrl;
                const mediaAssetUrn = registerResponse.data?.value?.asset;

                if (!uploadUrl) {
                  console.error(
                    "Nadal brak uploadUrl z API LinkedIn. Odpowiedź:",
                    JSON.stringify(registerResponse.data, null, 2),
                  );
                  continue;
                }

                await axios.put(uploadUrl, imageBuffer, {
                  headers: {
                    Authorization: `Bearer ${pageToken}`,
                    "Content-Type": "image/jpg",
                  },
                });
                const postResponse = await axios.post(
                  "https://api.linkedin.com/v2/posts",
                  {
                    author: getOwnerUrn(pageId),
                    commentary: postContent,
                    visibility: "PUBLIC",
                    content: {
                      media: {
                        title: "Zdjęcie do wpisu",
                        id: mediaAssetUrn,
                      },
                    },
                    lifecycleState: "PUBLISHED",
                  },
                  { headers },
                );

                createdPostUrn = postResponse.headers["x-restli-id"];
              } else {
                break;
              }

              if (createdPostUrn && globalLink) {
                try {
                  const targetUrn = createdPostUrn.startsWith("urn:")
                    ? createdPostUrn
                    : `urn:li:ugcPost:${createdPostUrn}`;
                  const commentText = `Link do artykułu: ${globalLink}`;

                  await axios.post(
                    `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(targetUrn)}/comments`,
                    {
                      actor: getOwnerUrn(pageId),
                      object: targetUrn,
                      commentary: commentText,
                    },
                    { headers },
                  );
                  console.log(
                    `Dodano komentarz z linkiem do LinkedIn: ${targetUrn}`,
                  );
                } catch (commentError: any) {
                  console.error(
                    `Nie udało się dodać komentarza na LinkedIn do posta ${createdPostUrn}:`,
                    commentError.response?.data || commentError.message,
                  );
                }
              }

              await GeneratedData.findByIdAndUpdate(generatedDataId, {
                $push: {
                  "linkedin.uploaded": {
                    accountId: account._id.toString(),
                    accountName: pageName,
                    createdAt: new Date(),
                  },
                },
              });

              successCount++;
              break;
            }
            case "reddit": {
              // Future
              break;
            }

            case "discord": {
              // Future
              break;
            }
          }
        } catch (singlePublishError) {
          console.error(
            `Błąd podczas publikacji na koncie ${account._id}:`,
            singlePublishError,
          );
        }
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
