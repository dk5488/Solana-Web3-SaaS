import z from "zod"

export const createTaskInput=z.object({
    options:z.array(z.object({
        imageUrl:z.string()
    })),
    amount:z.number().optional(),
    title:z.string().optional(),
    signature:z.string()
});