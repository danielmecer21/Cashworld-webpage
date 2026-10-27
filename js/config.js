/* =========================================================
   CASH WORLD - settings you fill in (the only file you need to edit
   for reviews and ads). See SETUP-GUIDE.txt for the steps.

   Leave things blank and the site still works:
   - Reviews run in DEMO MODE (saved only in your own browser).
   - No ads are shown.
   ========================================================= */
window.CW_CONFIG = {

  /* ---- 1. REVIEWS DATABASE (Firebase) ----
     Paste the 4 values from Firebase > Project settings > Your apps > Web app. */
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },

  /* ---- 2. GOOGLE ADSENSE ----
     client: your publisher ID, looks like "ca-pub-1234567890123456"
     slots.inline: the ad unit ID (a number) from AdSense > Ads > By ad unit.
                   Leave it blank to rely on Auto ads instead. */
  adsense: {
    client: "",
    slots: { inline: "" }
  }
};
