/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "zh-Hans",
    locales: [
      "zh-Hans",
      "zh-Hant",
      "en",
      // "ru", // disabled
    ],
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
  showSupportNotice: false,
};
