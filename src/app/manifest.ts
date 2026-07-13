import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Smitch - Switch your path",
    short_name: "Smitch",
    description:
      "Evidence-based life path builder. Choose the right habits backed by science.",
    lang: "en",
    dir: "ltr",
    categories: ["health", "lifestyle", "productivity"],
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9FA",
    theme_color: "#2B4162",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    // Screenshots power Chrome's "Richer Install UI" (#60). Desktop requires at
    // least one `form_factor: "wide"` entry; mobile requires at least one entry
    // whose form_factor is unset or anything other than "wide".
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Today's habits with your streak history at a glance",
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Check off today's habits from your phone",
      },
    ],
  };
}
