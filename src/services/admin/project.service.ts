import { Op } from "sequelize";
import db from "../../models/index";
const { User, Role, Theme } = db;

export const findProject = async (projectName: string) => {
    return await User.findOne({
        where: {
            company_name: { [Op.like]: projectName },
            approval: 'Y',
            status: 'Y',
        },
        include: [
            {
                model: Role,
                as: 'roleData',
                attributes: ['id', 'name', 'description'],
            },
            {
                model: Theme,
                as: 'Theme',
                attributes: ['id', 'name', 'slug', 'description'],
            },
        ],
    });
};

export const findProjectByDomain = async (domain: string) => {
    try {
        let cleanDomain = domain.replace(/^www\./, "").toLowerCase().trim();

        // Extract subdomain part if applicable
        const subdomain = cleanDomain.endsWith("baaraat.com")
            ? cleanDomain.split(".")[0]
            : null;

        // Match against multiple possibilities
        const project = await User.findOne({
            where: {
                [Op.or]: [
                    { company_name: { [Op.iLike]: cleanDomain } }, // domain stored directly
                    // { domain: { [Op.iLike]: cleanDomain } },       // real domain field
                    // { subdomain: { [Op.iLike]: subdomain || "" } },// subdomain match
                ],
                approval: 'Y',
                status: 'Y',
            },
            include: [
                {
                    model: Role,
                    as: "roleData",
                    attributes: ["id", "name", "description"],
                },
                {
                    model: Theme,
                    as: "Theme",
                    attributes: ["id", "name", "slug", "description"],
                },
            ],
        });

        return project;
    } catch (err) {
        console.error("findProjectByDomain error:", err);
        throw err;
    }
};
