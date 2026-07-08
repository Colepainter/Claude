# SEO Audit — newprimitive.co

**Date:** July 8, 2026
**Site:** https://www.newprimitive.co (New Primitive — luxury saunas & cold plunges, Utah)
**Method:** Search-index analysis (Google-indexed pages, titles, and snippets). Direct crawling was blocked by this session's network policy — see "Audit limitations" at the end for how to enable a full technical crawl.

---

## Executive summary

The site has a clear brand and strong commercial pages, but the search index is polluted with **test/development pages**, **duplicate product URLs**, and a **second live domain (newprimitive.io) serving an old copy of the site**. These issues split ranking authority, look unprofessional in search results, and are all fixable in a few hours inside Wix. There is also no informational content (blog/guides), which is the biggest long-term growth lever in this niche.

**Top 5 actions, in order:**

1. Remove or noindex the test pages that Google is showing (`/blank-2`, `/blank-3`, `/home-1`).
2. Fix the Wix site name — several titles read "…| New Primitive Website - V2" in Google.
3. 301-redirect the entire `newprimitive.io` domain to `newprimitive.co`.
4. Consolidate duplicate product and collection pages.
5. Fix the inconsistent business address across directories (West Jordan vs. Lehi).

---

## Critical issues

### 1. Test/development pages are indexed by Google

These URLs are live, indexed, and showing in search results:

| URL | Indexed title |
|---|---|
| `/blank-2` | "Home Page \| New Primitive" |
| `/blank-3` | "Category All Page \| New Primitive Website - V2" |
| `/home-1` | "Home with Preloader Code \| New Primitive Website - V2" |

These are duplicate/draft versions of the homepage and category pages. They dilute the real homepage's authority, can outrank the intended pages, and look unfinished to anyone who lands on them.

**Fix (Wix):** For each page: Pages & Menu → page → Settings → SEO Basics → turn off "Let search engines index this page", or delete the page entirely if unused. If deleted, add a 301 redirect to the real equivalent in Marketing & SEO → SEO → URL Redirect Manager. Then request removal in Google Search Console (Indexing → Removals).

### 2. Internal site name "New Primitive Website - V2" leaks into Google titles

At least three indexed titles end in "| New Primitive Website - V2" (e.g. the Communal Sauna and 212° Sauna product pages). Wix appends the *site name* to default page titles, and the site name is set to the internal working name.

**Fix (Wix):** Settings → Website settings → rename the site to "New Primitive". Then review each page's SEO title in the SEO panel; pages using the default title pattern will pick up the corrected name.

### 3. A second domain — newprimitive.io — is live with an old copy of the site

Google indexes `newprimitive.io` pages titled "…| My Site 8 - New Primitive" (the default Wix placeholder site name), including `/about`, `/landing-page` ("Events Page"), and product pages (`/new-primitive-product/np-1`, `/new-primitive-product/the-nook`) that duplicate the `.co` product pages nearly URL-for-URL.

This splits link equity and brand signals across two domains, creates cross-domain duplicate content, and risks customers finding the outdated site. (Note: your email uses a third domain, newprimitive.life — worth confirming which domains you own and which one is canonical.)

**Fix:** Set `.co` as primary. In the Wix dashboard for the old `.io` site, either connect the `.io` domain to the `.co` site as a redirect-only domain, or unpublish the old site and configure a domain-level 301 redirect from `newprimitive.io/*` to matching `newprimitive.co/*` URLs at the registrar/DNS level.

---

## High-priority issues

### 4. Duplicate product pages on the main site

`/new-primitive-product/np-1` and `/new-primitive-product/thermal-suite` are both indexed with the identical title "Home Sauna & Cold Plunge Combo | New Primitive" — the same product at two URLs competing against itself.

**Fix:** Keep one URL (the descriptive `/thermal-suite` slug is better than `/np-1`), delete the other, and 301-redirect it. Note the `.io` domain also has an `/np-1` page, which should redirect to the same place.

### 5. Three overlapping "browse all products" pages

`/product-collection` ("Luxury Saunas & Cold Plunges"), `/exploreproducts` ("Explore All"), and `/np-categories` ("Explore All Luxury Saunas & Wellness Suites") all target the same browse intent. This is keyword cannibalization — Google has to guess which one to rank, and none accumulates full authority.

**Fix:** Pick one canonical collection page (recommend `/product-collection` with the keyword-rich title), 301 the others to it, and make all navigation links point to the survivor.

### 6. Inconsistent business address across the web (local SEO)

- Yelp and Chamber of Commerce list **6584 S Airport Rd #10, West Jordan, UT 84084**
- Fresha and Facebook list **2499 N Wister Ln, Lehi, UT 84043**

Name/Address/Phone (NAP) consistency is a core local ranking factor for queries like "sauna store Utah." If the business moved, the old listings are actively hurting local rankings.

**Fix:** Decide the canonical address, update Google Business Profile first, then Yelp, Facebook, Fresha, Chamber of Commerce, and ZoomInfo to match exactly.

---

## Medium-priority improvements

### 7. Title tag quality

- **Homepage** — "Sauna and Cold Plunge Spaces | New Primitive" is serviceable but generic. Consider: "Luxury Custom Saunas & Cold Plunge Suites | New Primitive" — "luxury" and "custom" are your differentiators and appear in competitor titles.
- **/about** — "Luxury Saunas and Cold Plunges in Utah" is the strongest geo-targeted title on the site but sits on the About page and is missing the brand suffix. The Utah/local keyword targeting deserves a dedicated, linkable page (or the homepage), not About.
- **Nook product page** — "Elegant 4-Person sauna | New Primitive": inconsistent capitalization ("sauna"); "4-Person Outdoor Sauna — The Nook° | New Primitive" would target a real query.
- Ensure every product title leads with what the product *is* plus a qualifier people search for (outdoor/indoor, N-person, home/commercial).

### 8. No informational content indexed

No blog, guides, or educational pages appear in the index. Buyers in this category research heavily ("sauna vs cold plunge order", "outdoor sauna cost", "do I need a permit for a backyard sauna", "cedar vs thermally modified wood"). Competitors with content capture these buyers early. Given you already handle permitting and site planning as a service, a small permitting-by-state guide series would be both genuinely useful and highly linkable.

**Fix:** Add a `/journal` or `/guides` section; start with 4–6 posts targeting bottom-of-funnel questions you already answer in sales calls.

### 9. Housekeeping

- The indexed URL slugs mix conventions (`/exploreproducts`, `/np-categories`, `/blank-2`, `/new-primitive-product/212`). New pages should use short, hyphenated, descriptive slugs.
- Verify Google Search Console is set up for `www.newprimitive.co`; submit the sitemap (`/sitemap.xml`, auto-generated by Wix) and use it to monitor the cleanup above (Removals, Page indexing report).
- Add LocalBusiness + Product structured data (Wix supports custom structured data per page under SEO settings) so product pages are eligible for rich results.

---

## What could not be verified (and how to enable a full audit)

Direct requests to newprimitive.co were blocked by this Claude environment's **network egress allowlist** ("Host not in allowlist: newprimitive.co"), and the Wix connector's permission channel failed repeatedly in this non-interactive session. So the following were not checked: robots.txt, sitemap contents, canonical tags, redirect behavior (http→https, non-www→www), page speed / Core Web Vitals, structured data, image alt text, mobile rendering, and internal linking.

To enable a follow-up full technical crawl, either:

1. Add `newprimitive.co` and `www.newprimitive.co` (and `newprimitive.io`) to the allowed domains in this Claude Code environment's network settings, or
2. Re-run the audit in an interactive session where the Wix connector can be authorized, which allows reading SEO settings, page settings, and redirects directly from the Wix site.

---

## Sources

Indexed-page data from Google via: [newprimitive.co homepage](https://www.newprimitive.co/), [product collection](https://www.newprimitive.co/product-collection), [about](https://www.newprimitive.co/about), [explore products](https://www.newprimitive.co/exploreproducts), [blank-2](https://www.newprimitive.co/blank-2), [home-1](https://www.newprimitive.co/home-1), [np-1](https://www.newprimitive.co/new-primitive-product/np-1), [thermal-suite](https://www.newprimitive.co/new-primitive-product/thermal-suite), [communal](https://www.newprimitive.co/new-primitive-product/communal), [212](https://www.newprimitive.co/new-primitive-product/212), [nook](https://www.newprimitive.co/new-primitive-product/nook), [np-categories](https://www.newprimitive.co/np-categories), [commercial](https://www.newprimitive.co/commercial), [newprimitive.io/about](https://newprimitive.io/about), [newprimitive.io/landing-page](https://www.newprimitive.io/landing-page), [newprimitive.io/np-1](https://www.newprimitive.io/new-primitive-product/np-1), [Yelp listing](https://www.yelp.com/biz/new-primitive-west-jordan-4), [Chamber of Commerce listing](https://www.chamberofcommerce.com/business-directory/utah/west-jordan/sauna-store/2034173704-new-primitive), [Fresha listing](https://www.fresha.com/lvp/new-primitive-north-wister-lane-lehi-vvP9eK), [Facebook page](https://www.facebook.com/newprimitivelife/), [ZoomInfo](https://www.zoominfo.com/c/new-primitive/1328826871).
