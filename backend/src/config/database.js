import Knex from "knex"
import { Model } from "objection"
import knexConfig from "../../knexfile.mjs"

const environment = process.env.NODE_ENV || 'development'
const knex = Knex(knexConfig[environment])

Model.knex(knex)
export { knex }