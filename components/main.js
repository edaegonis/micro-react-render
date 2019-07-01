import express from "express"
import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { getDataFromTree } from "react-apollo"
import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import fetch from "node-fetch"

import Provider from "./Provider"

const app = express()

app.get("/*", (req, res) => {
  const client = new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      fetch,
      uri: process.env.GRAPHQL_ENDPOINT
    }),
    headers: {
      cookie: req.header("Cookie")
    },
    cache: new InMemoryCache()
  })

  const root = <Provider client={client} req={req} res={res} />

  getDataFromTree(root).then(() => {
    const markup = renderToString(root)
    const initialState = client.extract()
    const html = <Html markup={markup} state={initialState} />
    res.status(200)
    res.send(`<!DOCTYPE html>\n${renderToStaticMarkup(html)}`)
    res.end()
  })
})

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log("app is running! go to http://localhost:" + port)
})

const Html = ({ markup, state }) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Micro React Render</title>
        <link rel="stylesheet" type="text/css" href="/styles.css" />
      </head>

      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: markup }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(
              /</g,
              "\\u003c"
            )};`
          }}
        />

        <script type="text/javascript" src="./bundle.js" />
      </body>
    </html>
  )
}
