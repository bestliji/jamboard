module.exports = {
  siteMetadata: {
    title: `JAMboard`,
    description: `A Gatsby-based JAMstack whiteboard-like application for collaborative markup of documents`,
    author: `Ji Li`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `documents`,
        path: `${__dirname}/src/documents`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    ]
}
