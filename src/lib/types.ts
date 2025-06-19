import type { AppRouter } from "@/server"
import type { InferRouterOutputs } from "jstack"
 
type InferOutput = InferRouterOutputs<AppRouter>

export type Building = InferOutput["building"]["getBuilding"]