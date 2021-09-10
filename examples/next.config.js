const withPurgeCss = require("next-purgecss")
const rehypePrism = require('@mapbox/rehype-prism')

const withMDX = require("@next/mdx")({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [],
      rehypePlugins: [rehypePrism]
    }
})

module.exports = withMDX(
    withPurgeCss({
        pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
        trailingSlash: true,
        purgeCssPaths: ["pages/**/*", "components/**/*"],
        purgeCss: {
            whitelistPatterns: () => [/^html$/, /^body$/],
        },
    })
)
