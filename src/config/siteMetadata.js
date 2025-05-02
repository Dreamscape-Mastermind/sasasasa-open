/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: "Quality Community to Commerce",
  author: "Dreamscape Mastermind",
  authorUrl: "https://dreamscapemastermind.com",
  headerTitle: "SASASASA",
  googleAnalyticsId: "G-JRGL0BGFTT",

  theme: "dark", // system, dark or light
  description:
    "Quality Community to Commerce - Events and Cultural Experiences.",
  language: "en-us",
  theme: "system", // system, dark or light
  siteUrl: "https://sasasasa.co",
  siteLogo: `${
    process.env.NEXT_PUBLIC_BASE_PATH || ""
  }/images/sasasasaLogo.png`,
  socialBanner: `${
    process.env.NEXT_PUBLIC_BASE_PATH || ""
  }/images/sasasasaLogo.png`,
  email: "support@sasasasa.co",
  x: "https://twitter.com/sasasasa",
  // twitter: 'https://twitter.com/Twitter',
  facebook: "https://facebook.com/sasasasa",
  youtube: "https://youtube.com/sasasasa",
  linkedin: "https://www.linkedin.com/company/sasasasa",
  instagram: "https://www.instagram.com/sasasasa_official",
  medium: "https://medium.com/sasasasa",
  locale: "en-US",
  favicon: {
    apple: "/favicons/apple-touch-icon.png",
    icon: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicons/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicons/favicon-16x16.png",
      },
    ],
  },
  // set to true if you want a navbar fixed to the top
  stickyNav: true,
};

module.exports = siteMetadata;
