import "dotenv/config"
import express from "express"
import "express-async-errors"
import getAccountGraph from "./core/api"
import errorHandler, { UserError } from "./middleware/error-handler"
import cors from "cors"

import { isAddress } from "web3-validator"

const app = express()
app.use(cors())
const port = process.env.PORT || 3000

app.get("/info/:addr", async (req, res) => {
  let depth = req.query.depth

  if (
    depth !== undefined &&
    (typeof depth !== "string" || !/^\d+$/.test(depth))
  ) {
    throw new UserError("Invalid depth")
  }
  if (!isAddress(req.params.addr)) {
    throw new UserError("Invalid ETH address")
  }

  const depthParam = depth !== undefined ? Number(depth) : undefined
  const graph = await getAccountGraph(req.params.addr, 0, depthParam)

  return res.json(graph)
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`)
})
