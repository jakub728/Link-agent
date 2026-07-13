import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import Account from "../model/conectedAccouts";
import { type ConnectedAccoutInterface } from "../types/conectedInterface";

const router = express.Router();

//Get all accounts
//http://localhost:5000/connect/account/all
router.get(
  "/all",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const allAccounts = await Account.find({ userId: userId }).lean();

      const groupedAccounts = {
        facebook: [] as ConnectedAccoutInterface[],
        linkedin: [] as ConnectedAccoutInterface[],
        reddit: [] as ConnectedAccoutInterface[],
        wykop: [] as ConnectedAccoutInterface[],
        telegram: [] as ConnectedAccoutInterface[],
        discord: [] as ConnectedAccoutInterface[],
      };

      if (allAccounts && allAccounts.length > 0) {
        allAccounts.forEach((account) => {
          const platform = account.platform?.toLowerCase();

          if (platform === "facebook") {
            groupedAccounts.facebook.push(account);
          } else if (platform === "linkedin") {
            groupedAccounts.linkedin.push(account);
          } else if (platform === "reddit") {
            groupedAccounts.reddit.push(account);
          } else if (platform === "wykop") {
            groupedAccounts.wykop.push(account);
          } else if (platform === "discord") {
            groupedAccounts.discord.push(account);
          } else if (platform === "telegram") {
            groupedAccounts.telegram.push(account);
          }
        });
      }
      return res.status(200).json({ groupedAccounts });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

//Endpoint Discord, Telegram
//http://localhost:5000/connect/account/manual
router.post(
  "/manual",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { platform, profileName, webhookUrl, botToken, chatId } = req.body;
      const userId = req.user?.userId;

      if (!platform || !profileName) {
        return res.status(400).json("Brak wymaganych danych");
      }

      let credentials = {};

      if (platform === "discord") {
        if (!webhookUrl) {
          return res
            .status(400)
            .json("Dla platformy Discord wymagany jest webhookUrl");
        }

        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `🤖 Pomyślnie połączono profil: ${profileName}`,
            }),
          });
        } catch (err) {
          return res
            .status(400)
            .json(
              "Podany Webhook URL Discorda jest nieprawidłowy lub nieaktywny",
            );
        }
        credentials = { webhookUrl };
      } else if (platform === "telegram") {
        if (!botToken || !chatId) {
          return res
            .status(400)
            .json("Dla platformy Telegram wymagany jest botToken oraz chatId");
        }

        try {
          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/getMe`,
          );
          const data = await response.json();
          if (!data.ok) throw new Error();

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🤖 Pomyślnie połączono profil: ${profileName}`,
            }),
          });
        } catch (err) {
          return res
            .status(400)
            .json(
              "Niepoprawny token bota Telegram lub bot nie ma dostępu do wskazanego czatu/kanału",
            );
        }
        credentials = { botToken, chatId };
      } else {
        return res.status(400).json("Nieobsługiwana platforma manualna");
      }

      const newAccount = await Account.create({
        userId: userId,
        platform,
        profileName,
        credentials,
      });

      return res.status(201).json({
        message: "Konto zostało utworzone",
        account: {
          id: newAccount._id,
          platform: newAccount.platform,
          profileName: newAccount.profileName,
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

//Endpoint Facebook, Reddit, Wykop, LinkedIn
//http://localhost:5000/connect/account/auth-url
router.get(
  "/auth-url",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { platform } = req.query;
      const userId = req.user?.userId;

      if (!platform) {
        return res.status(400).json("Brak parametru platform");
      }

      let authUrl = "";

      const baseCallbackUrl = `${process.env.BACKEND_URL}/connect/account/callback`;

      switch (platform) {
        case "linkedin":
          authUrl =
            `https://www.linkedin.com/oauth/v2/authorization?` +
            `response_type=code` +
            `&client_id=${process.env.LINKEDIN_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(`${baseCallbackUrl}/linkedin`)}` +
            `&scope=${encodeURIComponent("w_member_social openid profile")}`;
          break;

        case "reddit":
          const redditState = Math.random().toString(36).substring(2);
          authUrl =
            `https://www.reddit.com/api/v1/authorize?` +
            `client_id=${process.env.REDDIT_CLIENT_ID}` +
            `&response_type=code` +
            `&state=${redditState}` +
            `&redirect_uri=${encodeURIComponent(`${baseCallbackUrl}/reddit`)}` +
            `&duration=permanent` +
            `&scope=${encodeURIComponent("submit identity")}`;
          break;

        case "facebook": {
          const clientId = process.env.FACEBOOK_CLIENT_ID;
          const redirectUri = `${baseCallbackUrl}/facebook`;

          const scopes = [
            "public_profile",
            "pages_show_list",
            "pages_manage_posts",
            "pages_read_engagement",
            "pages_manage_engagement",
          ].join(",");

          const authUrl =
            `https://www.facebook.com/v19.0/dialog/oauth?` +
            new URLSearchParams({
              client_id: clientId || "",
              redirect_uri: redirectUri,
              scope: scopes,
              response_type: "code",
              auth_type: "rerequest",
            });

          return res.json({ url: authUrl });
        }

        case "wykop":
          authUrl =
            `https://wykop.pl/connect?` +
            `appkey=${process.env.WYKOP_APP_KEY}` +
            `&redirect_url=${encodeURIComponent(`${baseCallbackUrl}/wykop`)}`;
          break;

        default:
          return res.status(400).json("Nieobsługiwana platforma OAuth");
      }

      return res.status(200).json({ url: authUrl });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

//Endpoint Facebook, Reddit, Wykop, LinkedIn
//http://localhost:5000/connect/account/callback/:platform
router.get(
  "/callback/:platform",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { platform } = req.params;
      const { code, state, username } = req.query;

      if (!code && platform !== "wykop") {
        return res.status(400).json("Brak autoryzacyjnego kodu (code) w query");
      }

      const baseCallbackUrl = `${process.env.BACKEND_URL}/connect/account/callback/${platform}`;
      let accessToken = "";
      let refreshToken = "";
      let expiresAt: Date | undefined = undefined;

      const userId = req.user?.userId;

      switch (platform) {
        //LINKEDIN
        case "linkedin": {
          const tokenResponse = await fetch(
            "https://www.linkedin.com/oauth/v2/accessToken",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code as string,
                redirect_uri: baseCallbackUrl,
                client_id: process.env.LINKEDIN_CLIENT_ID || "",
                client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
              }),
            },
          );

          const tokenData = await tokenResponse.json();

          if (!tokenData.id_token) {
            return res.status(400).json({
              message:
                "Brak id_token w odpowiedzi LinkedIn. Sprawdź czy masz włączony produkt 'Sign In with LinkedIn using OpenID Connect' w panelu dewelopera.",
              debug: tokenData,
            });
          }

          accessToken = tokenData.access_token;
          refreshToken = tokenData.refresh_token;
          if (tokenData.expires_in) {
            expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
          }

          const credentials = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || "",
            expiresAt,
          };

          let profileId = "";
          let profileName = "";
          let picture = "";

          try {
            const base64Payload = tokenData.id_token.split(".")[1];
            const decodedPayload = JSON.parse(
              Buffer.from(base64Payload, "base64").toString("utf-8"),
            );

            profileId = decodedPayload.sub;
            picture = decodedPayload.picture;
            if (decodedPayload.name) {
              profileName = decodedPayload.name;
            } else {
              profileName =
                `${decodedPayload.given_name || ""} ${decodedPayload.family_name || ""}`.trim();
            }

            if (!profileName) {
              profileName = `Konto LinkedIn (${profileId})`;
            }
          } catch (jwtError) {
            console.error("Błąd dekodowania JWT:", jwtError);
            return res
              .status(500)
              .json("Nie udało się sparsować danych profilu z ID Tokena.");
          }

          await Account.findOneAndUpdate(
            { userId, platform: "linkedin", profileId },
            {
              userId,
              platform: "linkedin",
              profileId,
              profileName,
              picture,
              credentials,
            },
            { upsert: true, new: true },
          );

          return res.redirect("http://localhost:5173/accounts");
        }

        //REDDIT
        case "reddit": {
          const authHeader = Buffer.from(
            `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
          ).toString("base64");

          const tokenResponse = await fetch(
            "https://www.reddit.com/api/v1/access_token",
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code as string,
                redirect_uri: baseCallbackUrl,
              }),
            },
          );
          const tokenData = await tokenResponse.json();

          let expiresAt: Date | undefined = undefined;
          if (tokenData.expires_in) {
            expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
          }

          const credentials = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || "",
            expiresAt,
          };

          const profileResponse = await fetch(
            "https://oauth.reddit.com/api/v1/me",
            {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            },
          );
          const profileData = await profileResponse.json();
          const profileId = profileData.id;
          const profileName = `u/${profileData.name}`;

          // Dedykowany zapis w bazie tylko dla Reddit wewnątrz switcha
          await Account.findOneAndUpdate(
            { userId, platform: "reddit", profileId },
            {
              userId,
              platform: "reddit",
              profileId,
              profileName,
              picture: "",
              credentials,
            },
            { upsert: true, new: true },
          );

          return res.redirect("http://localhost:5173/accounts");
        }

        // FACEBOOK
        case "facebook":
          const tokenResponse = await fetch(
            `https://graph.facebook.com/v25.0/oauth/access_token`,
            {
              method: "POST",
              body: new URLSearchParams({
                client_id: process.env.FACEBOOK_CLIENT_ID || "",
                client_secret: process.env.FACEBOOK_CLIENT_SECRET || "",
                redirect_uri: baseCallbackUrl,
                code: code as string,
              }),
            },
          );

          const tokenData = await tokenResponse.json();

          if (tokenData.error) {
            return res.status(400).json({
              message: "Błąd pobierania tokenu użytkownika z Facebooka",
              debug: tokenData.error,
            });
          }
          const shortLivedUserToken = tokenData.access_token;

          const longLivedUserResponse = await fetch(
            `https://graph.facebook.com/v25.0/oauth/access_token`,
            {
              method: "POST",
              body: new URLSearchParams({
                grant_type: "fb_exchange_token",
                client_id: process.env.FACEBOOK_CLIENT_ID || "",
                client_secret: process.env.FACEBOOK_CLIENT_SECRET || "",
                fb_exchange_token: shortLivedUserToken,
              }),
            },
          );

          const longLivedUserData = await longLivedUserResponse.json();

          if (longLivedUserData.error) {
            return res.status(400).json({
              message: "Błąd generowania długoterminowego tokenu użytkownika",
              debug: longLivedUserData.error,
            });
          }

          const longLivedUserToken = longLivedUserData.access_token;

          const accountsResponse = await fetch(
            `https://graph.facebook.com/v25.0/me/accounts?` +
              new URLSearchParams({
                access_token: longLivedUserToken,
                fields: "id,name,access_token,picture",
              }),
          );

          const accountsData = await accountsResponse.json();

          if (accountsData.error) {
            return res.status(400).json({
              message: "Błąd pobierania stron użytkownika",
              debug: accountsData.error,
            });
          }

          if (!accountsData.data || accountsData.data.length === 0) {
            console.warn("⚠️ Brak danych lub pusta tablica:", accountsData);
            return res.status(400).json({
              message:
                "Nie znaleziono żadnych stron (Fanpage) powiązanych z tym kontem. Upewnij się, że zaznaczyłeś je w oknie logowania Facebooka.",
            });
          }

          for (const page of accountsData.data) {
            const pageAccessToken = page.access_token;
            const pageProfileId = page.id;
            const pageProfileName = page.name;
            const pagePicture = `https://graph.facebook.com/${pageProfileId}/picture?type=normal`;

            await Account.findOneAndUpdate(
              { userId, profileId: pageProfileId, platform: "facebook" },
              {
                userId,
                platform: "facebook",
                profileId: pageProfileId,
                profileName: pageProfileName,
                picture: pagePicture,
                credentials: {
                  accessToken: pageAccessToken,
                  refreshToken: "",
                  expiresAt: undefined,
                },
              },
              { upsert: true, new: true },
            );
          }
          return res.redirect("http://localhost:5173/accounts?connect=success");
        case "wykop":
          return res
            .status(501)
            .json("Logika dla Wykopu w trakcie implementacji");

        default:
          return res.status(400).json("Nieobsługiwana platforma");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

router.delete(
  "/delete/:accountId",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { accountId } = req.params;
      const userId = req.user?.userId;

      const deletedAccount = await Account.findOneAndDelete({
        _id: accountId,
        userId: userId,
      });

      if (!deletedAccount) {
        return res
          .status(404)
          .json({ message: "Nie znaleziono konta lub brak uprawnień" });
      }

      return res.status(200).json({ message: "Konto odłączone" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

export default router;
