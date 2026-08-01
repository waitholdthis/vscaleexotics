/**
 * Admin panel enhancements.
 *
 * Everything here is defensive: the CMS is a third-party bundle and its API
 * surface changes between versions, so nothing in this file is allowed to
 * throw. If a hook is missing the admin panel still works, it just looks
 * slightly less like the rest of the site.
 */

(function enhance() {
  const CMS = window.CMS;
  if (!CMS) return;

  /* Brand the preview pane so it does not look like a default install. */
  try {
    if (typeof CMS.registerPreviewStyle === 'function') {
      CMS.registerPreviewStyle(
        `
        body { background:#0b0d10; color:#ece7dd; font-family:ui-sans-serif,system-ui,sans-serif;
               padding:2rem; line-height:1.6; }
        h1,h2,h3 { font-family:ui-serif,Georgia,serif; letter-spacing:-.02em; color:#ece7dd; }
        a { color:#c6a15b; }
        code, pre { font-family:ui-monospace,Menlo,Consolas,monospace; color:#7fe3a0; }
        .hint { color:#7c8391; font-size:.875rem; }
        `,
        { raw: true }
      );
    }
  } catch (err) {
    console.warn('preview style not registered', err);
  }

  /**
   * The single most useful thing to tell an editor: saving here does not
   * publish. content/ is compiled into the site by tools/build-data.mjs on
   * deploy, and the build validates genetics before anything goes live.
   */
  try {
    if (typeof CMS.registerEventListener === 'function') {
      CMS.registerEventListener({
        name: 'postSave',
        handler: ({ entry }) => {
          const collection = entry && entry.get ? entry.get('collection') : '';
          console.info(
            `[V-Scale] Saved${collection ? ` to ${collection}` : ''}. ` +
              'This writes JSON to content/. The live site updates when the deploy runs ' +
              'tools/build-data.mjs, which validates the genetics first and fails the build ' +
              'rather than publishing something impossible.'
          );
        }
      });
    }
  } catch (err) {
    console.warn('postSave listener not registered', err);
  }
})();
