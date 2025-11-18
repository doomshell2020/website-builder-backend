import { Request, Response } from "express";
import * as ProjectService from "../../services/admin/project.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from "../../utils/api-errors";
import { convertToIST } from '../../middleware/date';

export const canStartProject = (user: any) => {
    // ✅ Admin always allowed
    if (user?.role === "1") return true;

    const sub = user?.subscriptionData?.[0];

    // ❌ No subscription found
    if (!sub) return false;

    // ❌ Status not active
    if (sub.status !== "Y") return false;

    // 🔍 Check expiry
    const nowIST = convertToIST(new Date());
    const expiryIST = convertToIST(sub.expiry_date);
  
    // ❌ Subscription expired
    if (expiryIST.isBefore(nowIST)) return false;

    // ✅ All good — subscription active
    return true;
};

// ===== FIND PROJECT =====
export const FindProject = async (req: Request, res: Response) => {
    try {
        const projectName = req.params.name;
        if (!projectName) throw new apiErrors.NotFoundError("Company name not inserted.");

        const project: any = await ProjectService.findProject(projectName);
        if (!project) throw new apiErrors.BadRequestError("Company not found.");
        // 🔥 Apply subscription validation here
        if (!canStartProject(project)) {
            return res.status(401).json({
                status: false, message: "Subscription expired or inactive. Please renew your plan.",
            });
        }

        const response = successResponse("Company found successfully.", project);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.log("Error: ", error?.message ?? error);
        return res.status(500).json({ status: false, message: error?.message || "Internal Server Error" });
    }
};

// ===== FIND PROJECT BY DOMAIN =====
export const FindProjectByDomain = async (req: Request, res: Response) => {
    try {
        const domainParam = req.params.domain;
        if (!domainParam) throw new apiErrors.BadRequestError("Domain not provided.");

        // Normalize domain (remove www., lowercase, trim)
        const cleanDomain = domainParam.replace(/^www\./, "").toLowerCase().trim();

        const project = await ProjectService.findProjectByDomain(cleanDomain);
        if (!project) throw new apiErrors.NotFoundError("Company not found for given domain.");
        // 🔥 Apply subscription validation here
        if (!canStartProject(project)) {
            return res.status(401).json({
                status: false, message: "Subscription expired or inactive. Please renew your plan.",
            });
        }
        const response = successResponse("Company found successfully.", project);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.log("Error: ", error?.message ?? error);
        return res.status(500).json({ status: false, message: error?.message || "Internal Server Error", });
    }
};