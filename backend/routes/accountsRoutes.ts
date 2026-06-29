import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import Account from "../model/conectedAccouts";

const router = express.Router();

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
            .json("Dla platformy Telegram wymagany jest webhookUrl");
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
      const { platform, code } = req.query;
      const userId = req.user?.userId;

      if (!platform) {
        return res.status(400).json("Brak parametru platform");
      }

      if (!code) {
        return res.status(400).json("Brak kodu autoryzacyjnego w zapytaniu");
      }
      let authUrl = "";

      const baseCallbackUrl = "http://localhost:5000/connect/account/callback";

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
          const tokenResponse = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?` +
              `client_id=${process.env.FACEBOOK_APP_ID}` +
              `&redirect_uri=${encodeURIComponent(baseCallbackUrl)}` +
              `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
              `&code=${code}`,
          );
          const tokenData = await tokenResponse.json();

          if (!tokenData.access_token) {
            return res
              .status(400)
              .json("Nie udało się uzyskać tokenu Facebooka");
          }

          const userToken = tokenData.access_token;

          // 2. REJESTRACJA PROFILU PRYWATNEGO
          const profileResponse = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${userToken}`,
          );
          const profileData = await profileResponse.json();

          if (profileData.id) {
            const existingUserAcc = await Account.findOne({
              userId,
              platform,
              profileId: profileData.id,
            });
            if (existingUserAcc) {
              existingUserAcc.credentials = { accessToken: userToken };
              await existingUserAcc.save();
            } else {
              await Account.create({
                userId,
                platform,
                profileId: profileData.id,
                profileName: `${profileData.name} (Profil)`,
                credentials: { accessToken: userToken },
              });
            }
          }

          // 3. REJESTRACJA STRON (FANPAGE'Y)
          const accountsResponse = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`,
          );
          const accountsData = await accountsResponse.json();

          // Jeśli użytkownik zarządza jakimiś stronami, lecimy pętlą i dodajemy każdą z osobna
          if (accountsData.data && accountsData.data.length > 0) {
            for (const page of accountsData.data) {
              const pageId = page.id;
              const pageName = page.name;
              const pageToken = page.access_token; // Dedykowany token strony

              const existingPageAcc = await Account.findOne({
                userId,
                platform,
                profileId: pageId,
              });

              if (existingPageAcc) {
                existingPageAcc.credentials = { accessToken: pageToken };
                await existingPageAcc.save();
              } else {
                await Account.create({
                  userId,
                  platform,
                  profileId: pageId,
                  profileName: `${pageName} (Strona)`,
                  credentials: { accessToken: pageToken },
                });
              }
            }
          }

          break;
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
  "/auth-url",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { platform } = req.params;
      const { code, state, username } = req.query;

      if (!code && platform !== "wykop") {
        return res.status(400).json("Brak autoryzacyjnego kodu (code) w query");
      }

      const baseCallbackUrl = `http://localhost:5000/connect/account/callback/${platform}`;
      let accessToken = "";
      let refreshToken = "";
      let expiresAt: Date | undefined = undefined;
      let profileId = "";
      let profileName = "";

      const userId = req.user?.userId;

      switch (platform) {
        //LINKEDIN
        case "linkedin": {
          const tokenResponse = await fetch(
            "https://www.linkedin.com/oauth/v2/accessToken",
            {
              method: "POST",
              headers: { "Content-Type": "x-www-form-urlencoded" },
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
          accessToken = tokenData.access_token;
          refreshToken = tokenData.refresh_token; // Dostępny tylko przy odpowiednich uprawnieniach aplikacji
          if (tokenData.expires_in) {
            expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
          }

          // 2. Pobranie danych profilu (ID i Imię/Nazwisko)
          const profileResponse = await fetch(
            "https://api.linkedin.com/v2/userinfo",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          const profileData = await profileResponse.json();
          profileId = profileData.sub; // unikalne ID użytkownika LinkedIn
          profileName = `${profileData.given_name} ${profileData.family_name}`;
          break;
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
          accessToken = tokenData.access_token;
          refreshToken = tokenData.refresh_token; // Reddit zwraca refresh_token tylko przy duration=permanent
          if (tokenData.expires_in) {
            expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
          }

          const profileResponse = await fetch(
            "https://oauth.reddit.com/api/v1/me",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          const profileData = await profileResponse.json();
          profileId = profileData.id;
          profileName = `u/${profileData.name}`;
          break;
        }

        case "facebook":
          // Logikę dla Facebooka i Wykopu dodamy analogicznie, jak poustawiasz ich panele dev
          return res
            .status(501)
            .json("Logika dla Facebooka w trakcie implementacji");

        case "wykop":
          return res
            .status(501)
            .json("Logika dla Wykopu w trakcie implementacji");

        default:
          return res.status(400).json("Nieobsługiwana platforma");
      }

      const existingAccount = await Account.findOne({
        userId,
        platform,
        profileId,
      });

      if (existingAccount) {
        existingAccount.credentials = { accessToken, refreshToken, expiresAt };
        await existingAccount.save();
      } else {
        await Account.create({
          userId,
          platform,
          profileId,
          profileName,
          credentials: { accessToken, refreshToken, expiresAt },
        });
      }

      return res.redirect(
        "http://localhost:5173/home/settings?connect=success",
      );
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

export default router;
