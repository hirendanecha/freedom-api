const axios = require("axios");
const cheerio = require("cheerio");
// const og = require("open-graph");
const fetchHTML = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    throw new Error("Failed to fetch HTML");
  }
};

const extractMetadata = (html) => {
  const $ = cheerio.load(html);
  console.log("html", $("meta"));

  return {
    ogTitle: $('meta[property="og:title"]').attr("content") || "",
    ogDescription: $('meta[property="og:description"]').attr("content") || "",
    ogImage: $('meta[property="og:image"]').attr("content") || "",
    ogUrl: $('meta[property="og:url"]').attr("content") || "",
    site_name: $('meta[property="og:site_name"]').attr("content") || "",
    ogType: $('meta[property="og:type"]').attr("content") || "",
    twitterCard: $('meta[name="twitter:card"]').attr("content") || "",
    twitterTitle: $('meta[name="twitter:title"]').attr("content") || "",
    twitterDescription:
      $('meta[name="twitter:description"]').attr("content") || "",
    twitterImage: $('meta[name="twitter:image"]').attr("content") || "",
    twitterUrl: $('meta[name="twitter:url"]').attr("content") || "",
  };
};

exports.getMetadata = async (url) => {
  try {
    // const [html, metaData] = await Promise.all([
    //   fetchHTML(url),
    //   new Promise((resolve, reject) =>
    //     og(url, (err, data) => (err ? reject(err) : resolve(data)))
    //   ),
    // ]);

    const html = await fetchHTML(url);

    const additionalMeta = extractMetadata(html);

    return {
      title: additionalMeta.ogTitle || additionalMeta.twitterTitle || "",
      description:
        additionalMeta.ogDescription || additionalMeta.twitterDescription || "",
      image: additionalMeta.ogImage || additionalMeta.twitterImage || "",
      url: additionalMeta.ogUrl || url,
      site_name: additionalMeta.site_name || "",
      type: additionalMeta.ogType || "website",
    };
  } catch (error) {
    throw new Error("Error fetching or parsing metadata");
  }
};
