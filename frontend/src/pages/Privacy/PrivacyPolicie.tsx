import styles from "./PrivacyPolicie.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Privacy Policy & Data Deletion Instructions
      </h1>

      <p className={styles.subtitle}>Last updated: July 23, 2026</p>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>1. General Information</h2>
        <p>
          This Privacy Policy outlines how personal data and third-party
          platform data are processed by <strong>Satkurier AI</strong>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>2. What Data We Collect</h2>
        <p>
          In order to provide our content scheduling, management, and publishing
          services via third-party APIs (including Meta Platforms, Reddit,
          Wykop, and LinkedIn), our application may collect and process:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Account Identifiers:</strong> User ID / Username for
            Facebook, Instagram, Reddit, Wykop, and LinkedIn.
          </li>
          <li className={styles.listItem}>
            <strong>Public Profile Data:</strong> Display name and profile
            pictures associated with connected accounts.
          </li>
          <li className={styles.listItem}>
            <strong>OAuth Tokens:</strong> Encrypted Access and Refresh Tokens
            required to post content on your behalf.
          </li>
          <li className={styles.listItem}>
            <strong>Managed Destination Info:</strong> List of managed Facebook
            Pages, Instagram Professional Accounts, subreddits, Wykop tags, and
            LinkedIn Profiles/Pages where you hold publishing permissions.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>3. Purpose of Data Processing</h2>
        <p>
          All collected data is used <strong>exclusively</strong> to allow users
          to schedule, manage, and automatically publish posts or content onto
          their connected social media accounts and communities.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          4. Data Sharing & Third-Party APIs
        </h2>
        <p>
          We do not sell, rent, or share your personal data with third parties.
          Data is processed solely through official APIs (Meta Graph API, Reddit
          API, Wykop API, LinkedIn API) to execute actions requested directly by
          the user.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          5. User Data Deletion & Access Revocation
        </h2>
        <p>
          Users have full control over their data and can delete or revoke
          access at any time:
        </p>
        <ol className={styles.list}>
          <li className={styles.listItem}>
            <strong>Directly in Satkurier AI:</strong> Log in to your account,
            navigate to <strong>Settings / Accounts</strong>, and click{" "}
            <strong>"Delete Account"</strong> or <strong>"Disconnect"</strong>.
            This permanently removes your profile, connected integrations, and
            stored API tokens immediately.
          </li>
          <li className={styles.listItem}>
            <strong>Via Meta (Facebook / Instagram):</strong> Go to Facebook{" "}
            <strong>
              Settings & Privacy &rarr; Settings &rarr; Apps and Websites
            </strong>
            , find <strong>Satkurier AI</strong>, and click{" "}
            <strong>Remove</strong>.
          </li>
          <li className={styles.listItem}>
            <strong>Via Reddit:</strong> Go to your Reddit account settings
            under{" "}
            <strong>
              User Settings &rarr; Safety & Privacy &rarr; Authorized Apps
            </strong>{" "}
            (or{" "}
            <a
              href="https://www.reddit.com/prefs/apps"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              reddit.com/prefs/apps
            </a>
            ), find <strong>Satkurier AI</strong>, and click{" "}
            <strong>revoke access</strong>.
          </li>
          <li className={styles.listItem}>
            <strong>Via Wykop:</strong> Go to Wykop settings under{" "}
            <strong>Ustawienia &rarr; Połączone aplikacje</strong>, find{" "}
            <strong>Satkurier AI</strong>, and revoke access.
          </li>
          <li className={styles.listItem}>
            <strong>Via LinkedIn:</strong> Go to LinkedIn settings under{" "}
            <strong>
              Settings & Privacy &rarr; Data Privacy &rarr; Permitted Services
            </strong>
            , find <strong>Satkurier AI</strong>, and remove it.
          </li>
          <li className={styles.listItem}>
            <strong>Via Email Request:</strong> Send an email to{" "}
            <a href="mailto:kuba@satkurier.pl" className={styles.link}>
              kuba@satkurier.pl
            </a>{" "}
            with the subject "Data Deletion Request". All associated data will
            be purged within 24 hours.
          </li>
        </ol>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>6. Contact Us</h2>
        <p>
          If you have any questions regarding this Privacy Policy, please
          contact us at:{" "}
          <a href="mailto:kuba@satkurier.pl" className={styles.link}>
            kuba@satkurier.pl
          </a>
          .
        </p>
      </section>
    </div>
  );
}
