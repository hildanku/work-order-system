
import { Hono } from "hono";
import { appResponse } from "../../helpers/response";
import { zValidator } from "@hono/zod-validator";
import { ProductRepository } from "./product.repository";
import { jwtMiddleware, roleMiddleware } from "../../helpers/middleware/middleware";
import { idSchema, queryUrlSchema } from "../../helpers/validator/base.validator";
import { productSchema } from "../../helpers/validator/product.validator";
import { nanoid } from 'nanoid'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path = require('node:path')
import { PRODUCT_UPLOAD_PATH } from "../../helpers/const";

export const productController = new Hono()
    .use('*', async (c, next) => {
        const method = c.req.method.toLowerCase()
        if (method === 'options') {
            await next()
            return
        }
        return jwtMiddleware(c, next)
    })
    .use(
        "*",
        roleMiddleware({
            get: ['production_manager'],
            update: ['production_manager'],
            create: ['production_manager'],
            delete: ['production_manager'],
        }),
    )
    .get('/', zValidator('query', queryUrlSchema), async (c) => {
        const { q, page, sort, order, limit } = c.req.valid('query')
        const productRepo = new ProductRepository()

        try {
            const products = await productRepo.list({ q, sort, page, limit, order });

            if (!products || products.items.length === 0) {
                return appResponse(c, 404, "Product not found", { items: [], meta: { totalItems: 0 } });
            }

            return appResponse(c, 200, "Success get data", products);
        } catch (error) {
            return appResponse(c, 500, "Something went wrong", { items: [], meta: { totalItems: 0 } });
        }
    })
    .get('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const productRepo = new ProductRepository()
        const product = await productRepo.findById({ id: Number(params.id) })

        try {
            if (!product || product.length === 0) {
                return appResponse(c, 404, "Product not found", null)
            }
            return appResponse(c, 200, "Success get data", product[0]);
        } catch (error) {
            return appResponse(c, 500, "Something went wrong", null);
        }
    })
    .patch('/:id', zValidator('param', idSchema), zValidator('form', productSchema), async (c) => {
        const params = c.req.valid('param')
        const form = c.req.valid("form")
        const productRepo = new ProductRepository()

        try {
            const product = await productRepo.update({
                id: params.id,
                item: { ...form, updated_at: new Date().getTime() },
            })

            if (!product || product.length === 0) {
                throw new Error("Error updating product");
            }

            return appResponse(c, 200, "Product updated", product[0])
        } catch (error) {
            return appResponse(c, 500, "Something went wrong", null)
        }
    })
    .delete("/:id", zValidator("param", idSchema), async (c) => {
        const params = c.req.valid("param");
        const productRepo = new ProductRepository();

        try {
            const product = await productRepo.delete({ id: params.id });

            if (!product) {
                return appResponse(c, 500, "Failed to delete product", null);
            }

            return appResponse(c, 200, "Product deleted", null);
        } catch (error) {
            return appResponse(c, 500, "Something went wrong", null);
        }
    })
    .post('/', zValidator('form', productSchema), async (c) => {
        const form = c.req.valid('form')
        const productRepo = new ProductRepository()

        try {
            const body = await c.req.parseBody()
            const image = body['image']
            let imageFilename: string | undefined = undefined

            if (image && image instanceof File) {
                // Generate nama file unik
                imageFilename = `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}-${image.name.toLowerCase()}`

                // Buat folder jika belum ada
                if (!existsSync(PRODUCT_UPLOAD_PATH)) {
                    mkdirSync(PRODUCT_UPLOAD_PATH, { recursive: true })
                }

                // Simpan file ke dalam folder
                const imageFilePath = path.join(PRODUCT_UPLOAD_PATH, imageFilename)
                const buffer = Buffer.from(await image.arrayBuffer())

                writeFileSync(imageFilePath, buffer)
            }
            const [product] = await productRepo.create({
                item: {
                    name: form.name,
                    description: form.description || '',
                    image: imageFilename || '',
                },
            });

            return appResponse(c, 201, "Product created", product);
        } catch (error) {
            return appResponse(c, 500, "Something went wrong", null)
        }
    })
