// server/collections.js
import { getDB } from "./db.js";

export function colProducts()     { return getDB().collection("products"); }
export function colPricePoints()  { return getDB().collection("pricePoints"); }
export function colOrders()       { return getDB().collection("orders"); }
export function colViews()        { return getDB().collection("views"); }
export function colTicks()        { return getDB().collection("ticks"); }
