import db from '../../models/index';
import fs from 'fs';
import path from 'path';

// 🔧 Helper to safely delete a single file
const deleteFile = (filename?: string) => {
    if (!filename) return;
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${filename}`);
        } catch (err) {
            console.error(`❌ Failed to delete file ${filename}:`, err);
        }
    } else {
        console.warn(`⚠️ File not found: ${filePath}`);
    }
};

// 🔧 Helper to delete multiple files (array)
const deleteFiles = (filenames: string[] = []) => {
    for (const name of filenames) {
        deleteFile(name);
    }
};


export const findGalleryById = async (id: number) => {
    const { Gallery } = db;
    const gallery = await Gallery.findByPk(id);
    if (!gallery) throw new Error('Gallery not found');
    return gallery;
};

export const findGalleryBySlug = async (slug: string) => {
    const { Gallery } = db;
    try {
        const galleryData = await Gallery.findOne({ where: { slug, status: 'Y' } });
        return galleryData;
    } catch (error) {
        throw error;
    }
};

export const createGallery = async (req: any) => {
    const { Gallery } = db;
    const { body, } = req;

    const files = req.files as {
        images?: Express.Multer.File[];
    };

    const images = files?.images || [];

    const galleryData = {
        ...body,
        images: images.map((file) => file.filename),
    };

    const newGallery = await Gallery.create(galleryData);
    return newGallery;
};

export const findGalleries = async (page: number = 1, limit: number = 10) => {
    const { Gallery } = db;
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Gallery.findAndCountAll({
        offset,
        limit: limitNumber,
        order: [['createdAt', 'DESC']],
    });

    return {
        data: rows,
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
    };
};

export const updateGallery = async (id: number, req: any) => {
    const { Gallery } = db;
    const { body } = req;
    const { existingImages = [] } = req.body;

    // 🧩 Parse existingImages if sent as JSON string
    const parsedExistingImages = typeof existingImages === "string"
        ? JSON.parse(existingImages)
        : existingImages;

    // 📦 Handle file uploads
    const files = req.files as { images?: Express.Multer.File[] };
    const uploadedImages = files?.images?.map((file) => file.filename) || [];

    // 🔍 Fetch existing gallery
    const existing: any = await Gallery.findByPk(id);
    if (!existing) throw new Error("Gallery not found");

    const oldImages: string[] = existing.images || [];

    // 🧹 Determine which old images should be deleted
    const toDelete = oldImages.filter((img) => !parsedExistingImages.includes(img));

    // 🗑️ Delete only the removed images using your helper
    if (toDelete.length > 0) {
        console.log("🗑️ Deleting removed files:", toDelete);
        deleteFiles(toDelete);
    }

    // 🖼️ Combine kept + newly uploaded images
    const finalImages = [...parsedExistingImages, ...uploadedImages];

    // 🧠 Build update data
    const updateData: any = {
        ...body,
        images: finalImages,
        updatedAt: new Date(),
    };

    // 💾 Perform update in DB
    const [affectedCount, updatedRows] = await Gallery.update(updateData, {
        where: { id },
        returning: true,
    });

    if (affectedCount === 0) throw new Error("No changes made to gallery");

    return updatedRows[0];
};

export const deleteGallery = async (id: number) => {
    const { Gallery } = db;

    const gallery: any = await Gallery.findByPk(id);
    if (!gallery) throw new Error("Gallery not found");

    // 🧹 Delete all associated images (if exist)
    if (gallery.images && Array.isArray(gallery.images)) {
        console.log(`🧹 Deleting ${gallery.images.length} images...`);
        deleteFiles(gallery.images);
    }

    // 🗑️ Delete DB record
    await Gallery.destroy({ where: { id } });

    console.log(`✅ Deleted gallery ID: ${id}`);
    return true;
};

export const updateStatus = async (id: number, req: any) => {
    const { Gallery } = db;
    const { status } = req.body;

    const [updatedCount] = await Gallery.update(
        { status, updatedAt: new Date() },
        { where: { id } }
    );

    if (updatedCount === 0) throw new Error('Gallery not found or status unchanged');
    return true;
};

export const deleteGalleryImage = async (gallerySlug: string, filename: string) => {
    const { Gallery } = db;

    const gallery: any = await Gallery.findOne({ where: { slug: gallerySlug } });
    if (!gallery) throw new Error("Gallery not found");

    if (gallery.images && Array.isArray(gallery.images)) {
        gallery.images = gallery.images.filter((img: string) => img !== filename);
    }
    deleteFile(filename);
    await gallery.save();

    return true;
};