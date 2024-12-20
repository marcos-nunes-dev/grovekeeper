import { z } from 'zod'

export const EquipmentSchema = z.object({
  Type: z.string(),
  Count: z.number(),
  Quality: z.number()
}).nullable()

export const KillboardResponseSchema = z.object({
  EventId: z.string(),
  Location: z.string(),
  Victim: z.object({
    Name: z.string(),
    Id: z.string(),
    AverageItemPower: z.number(),
    Equipment: z.record(EquipmentSchema),
    Inventory: z.array(EquipmentSchema)
  })
})

export const PriceDataPointSchema = z.object({
  timestamp: z.string(),
  avg_price: z.number(),
  item_count: z.number().optional()
})

export const PriceDataSchema = z.object({
  avg_price: z.number(),
  min_price: z.number(),
  max_price: z.number(),
  data_points: z.number().optional(),
  data: z.array(PriceDataPointSchema),
  formatted: z.object({
    avg: z.string(),
    min: z.string(),
    max: z.string()
  })
})

export const PricesResponseSchema = z.record(PriceDataSchema.nullable())

export type KillboardResponse = z.infer<typeof KillboardResponseSchema>
export type PriceData = z.infer<typeof PriceDataSchema>
export type PricesResponse = z.infer<typeof PricesResponseSchema> 