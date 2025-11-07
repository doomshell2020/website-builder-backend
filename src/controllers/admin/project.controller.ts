import { Request, Response } from "express";
import * as ProjectService from "../../services/admin/project.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from "../../utils/api-errors";

// ===== FIND PROJECT =====
export const FindProject = async (req: Request, res: Response) => {
    try {
        const projectName = req.params.name;
        if (!projectName) throw new apiErrors.NotFoundError("Company name not inserted.");

        const project: any = await ProjectService.findProject(projectName);
        if (!project) throw new apiErrors.BadRequestError("Company not found.");

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
        if (!project)
            throw new apiErrors.NotFoundError("Company not found for given domain.");

        const response = successResponse("Company found successfully.", project);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.log("Error: ", error?.message ?? error);
        return res.status(500).json({ status: false, message: error?.message || "Internal Server Error", });
    }
};