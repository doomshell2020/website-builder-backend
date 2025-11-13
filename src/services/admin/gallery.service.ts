import db from '../../models/index';
import { deleteFile } from '../../utils/delete-single-file'

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
    const { body } = req;

    // Multer’s uploaded files
    const files = req.files as { images?: Express.Multer.File[]; };

    // Folder created by multer (e.g. tenantA_1731424523123)
    const imageFolder = req.imagefolder;

    // 🖼️ Map to include folder + filename
    const imagePaths = files?.images?.map((file) => `${imageFolder}/${file.filename}`) || [];

    const galleryData = {
        ...body,
        images: imagePaths,
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
    const files = req.files as { images?: Express.Multer.File[] } | undefined;

    // 🔍 Fetch current gallery early so we can derive folder if needed
    const gallery: any = await Gallery.findByPk(id);
    if (!gallery) throw new Error("Gallery not found");

    const oldImages: string[] = gallery.images || [];

    // 1) pick folder name:
    // prefer req.imagefolder (set by multer during an upload),
    // else derive from first old image path (if exists)
    const folderFromReq = req.imagefolder;
    const folderFromOld = oldImages.length > 0 ? oldImages[0].split("/")[0] : undefined;
    const imageFolder = folderFromReq || folderFromOld; // may be undefined

    // 2) parse existingImages from body (supports JSON string or array)
    let parsedExisting: string[] = [];
    if (typeof body.existingImages === "string") {
        try {
            parsedExisting = JSON.parse(body.existingImages);
        } catch (e) {
            parsedExisting = [];
        }
    } else if (Array.isArray(body.existingImages)) {
        parsedExisting = body.existingImages;
    }

    // 3) normalize parsedExisting:
    // - if already contains '/', keep as-is
    // - if plain filename and we know imageFolder, prefix it
    // - otherwise keep as plain filename (we'll compare by basename below)
    const existingImages = parsedExisting.map((img: string) => {
        if (!img) return img;
        if (img.includes("/") || img.includes("\\")) return img;
        if (imageFolder) return `${imageFolder}/${img}`;
        return img; // no folder known — keep as-is for basename-based compare
    });

    // 4) prepare new images (if any were uploaded in this request)
    const newImages =
        files?.images?.map((f) => (imageFolder ? `${imageFolder}/${f.filename}` : f.filename)) || [];

    // helper to get basename (filename only)
    const basename = (p: string) => (typeof p === "string" ? p.split("/").pop() : p);

    // 5) determine which old images to delete:
    // compare by basename to be tolerant to whether frontend sent paths or just names
    const existingBasenames = new Set(existingImages.map((e) => basename(e)));
    const toDelete = oldImages.filter((old) => !existingBasenames.has(basename(old)));

    // safety: if parsedExisting was empty and there were no newImages,
    // you might want to avoid accidental mass-delete — optional safety guard:
    // if (parsedExisting.length === 0 && newImages.length === 0) { /* skip deletion? */ }

    // 6) delete files physically
    for (const img of toDelete) {
        try {
            deleteFile(img);
        } catch (err) {
            console.error("Failed to delete image:", img, err);
        }
    }

    // 7) combine kept + new (both are full paths if imageFolder known)
    const finalImages = [...existingImages, ...newImages];

    // 8) update DB
    const updateData = {
        ...body,
        images: finalImages,
        updatedAt: new Date(),
    };

    const [updatedCount, [updatedGallery]] = await Gallery.update(updateData, {
        where: { id },
        returning: true,
    });

    if (updatedCount === 0) throw new Error("No changes made to gallery");

    console.log(`✅ Gallery updated (ID: ${id})`);
    return updatedGallery;
};

export const deleteGallery = async (id: number) => {
    const { Gallery } = db;

    // 🔍 1️⃣ Find gallery record
    const gallery: any = await Gallery.findByPk(id);
    if (!gallery) throw new Error("Gallery not found");

    // 🧹 2️⃣ Delete all associated image files
    if (Array.isArray(gallery.images) && gallery.images.length > 0) {
        console.log(`🧹 Deleting ${gallery.images.length} images for gallery ID ${id}...`);

        for (const image of gallery.images) {
            try {
                deleteFile(image); // Automatically handles "uploads/" prefix internally
            } catch (err) {
                console.error(`⚠️ Failed to delete image ${image}:`, err);
            }
        }
    } else {
        console.log(`⚠️ No images found for gallery ID ${id}.`);
    }

    // 🗑️ 3️⃣ Delete gallery record from DB
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

// export const deleteGalleryImage = async (gallerySlug: string, filename: string) => {
//     const { Gallery } = db;

//     const gallery: any = await Gallery.findOne({ where: { slug: gallerySlug } });
//     if (!gallery) throw new Error("Gallery not found");

//     if (gallery.images && Array.isArray(gallery.images)) {
//         gallery.images = gallery.images.filter((img: string) => img !== filename);
//     }
//     deleteFile(filename);
//     await gallery.save();

//     return true;
// };


export const deleteGalleryImage = async (gallerySlug: string, filename: string) => {
    const { Gallery } = db;

    const gallery: any = await Gallery.findOne({ where: { slug: gallerySlug } });
    if (!gallery) throw new Error("Gallery not found");

    if (!Array.isArray(gallery.images) || gallery.images.length === 0) {
        throw new Error("No images found in this gallery.");
    }

    const imageExists = gallery.images.includes(filename);
    if (!imageExists) { throw new Error("Image not found in gallery."); }

    gallery.images = gallery.images.filter((img: string) => img !== filename);

    await gallery.save();
    deleteFile(filename);

    console.log(`🗑️ Deleted image "${filename}" from gallery "${gallerySlug}"`);
    return true;
};