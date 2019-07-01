import React from "react"
import { StaticRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"

import Layout from "./Layout"

const Provider = ({ client, req, res }) => {
  const context = {}

  return (
    <ApolloProvider client={client}>
      <StaticRouter context={context} location={req.url}>
        <Layout />
      </StaticRouter>
    </ApolloProvider>
  )
}

export default Provider
