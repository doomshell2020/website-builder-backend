import db from "../../models/index";
import { Op } from "sequelize";
import { apiErrors } from '../../utils/api-errors';
const { Subscription, User, Plan } = db;

export const findSubscriptionByInvoiceId = async (id: string) => {
    try {
        let subscriptionData = await Subscription.findOne({
            where: { c_id: id, status: "Y", },
            include: [
                {
                    model: User,
                    as: "Customer",
                    attributes: ["id", "name", "email", "mobile_no",
                        "company_logo", "company_name", "address1", "gst_type",
                    ],
                },
                { model: Plan, as: "Plan", },
            ],
            order: [["createdAt", "DESC"]],
        });

        if (!subscriptionData) {
            subscriptionData = await Subscription.findOne({
                where: { c_id: id },
                include: [
                    {
                        model: User,
                        as: "Customer",
                        attributes: ["id", "name", "email", "mobile_no",
                            "company_logo", "company_name", "address1", "gst_type",
                        ],
                    },
                    { model: Plan, as: "Plan" },
                ],
                order: [["createdAt", "DESC"]],
            });
        }
        if (!subscriptionData) {
            throw new apiErrors.BadRequestError("Subscription not exists.");
        }
        return subscriptionData;
    } catch (error) {
        throw error;
    }
};

export const findAllSubscriptionByUsers = async (id: string | number, page: number, limit: number) => {
    const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Subscription.findAndCountAll({
        where: { c_id: id, },
        offset,
        limit: limitNumber,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: User,
                as: "Customer",
                attributes: [
                    'id', 'name', 'email', 'mobile_no', 'company_name',
                    'company_logo', 'address1', 'gstin'
                ],
            },
            {
                model: Plan,
                as: "Plan",
            }
        ]
    });


    return {
        data: rows,
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
    };
};