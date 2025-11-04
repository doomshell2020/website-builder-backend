import db from '../../models/index';
import { sendEmail } from '../../utils/email';
import { UpdateStatus } from '../../utils/email-templates';

export const viewEn = async (id: string) => {
  const { Enquiry } = db;
  try {
    const enquiryData = await Enquiry.findByPk(id);
    return enquiryData;
  } catch (error) {
    throw error;
  }
};

export const createEn = async (req: any) => {
  const { Enquiry } = db;
  try {
    const { body, } = req;
    const { html, email, name, company_name, company_email } = req?.body;
    const createdEnquiry = await Enquiry.create(body);
    // Send enquiry email
    if (createdEnquiry && html) {
      const emailPayload = UpdateStatus({
        fromUser: company_name,
        fromEmail: company_email,
        toEmail: email,
        subject: 'Your enquiry submitted successfully.',
        html: html,
        Name: name,
        username: email,
      });
      try {
        await sendEmail(emailPayload);
        console.log('Enquiry email sent successfully');
      } catch (err) {
        console.error('Failed to send enquiry email:', err);
      }
    }
    return createdEnquiry;
  } catch (error) { throw error; }
};

export const findEn = async (page: number, limit: number) => {
  const { Enquiry } = db;
  try {
    const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows } = await Enquiry.findAndCountAll({
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
  } catch (error) {
    throw error;
  }
};

export const updateEn = async (id: string, req: any) => {
  const { Enquiry } = db;
  try {
    const { body } = req;
    let updateEnquiry = {
      ...body,
      updatedAt: new Date(),
    };
    const [affectedCount, updatedRows] = await Enquiry.update(updateEnquiry, {
      where: { id },
      returning: true,
    });
    if (affectedCount === 0) {
      throw new Error('static not found or no changes made.');
    }
    return updatedRows[0];
  } catch (error) {
    console.error('Error on  updating enquiry :', error);

    throw error;
  }
};

export const deleteEn = async (id: string) => {
  const { Enquiry } = db;
  try {
    await Enquiry.destroy({ where: { id } });
    return true;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleEn = async (ids: number[]) => {
  const { Enquiry } = db;
  try {
    const resumeList: any[] = await Enquiry.findAll({ where: { id: ids } });
    if (!resumeList.length) {
      throw new Error('No Resume found for the given ids');
    }
    const deletedCount = await Enquiry.destroy({ where: { id: ids } });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

export const updateEnStatus = async (id: string, req: any) => {
  const { Enquiry } = db;
  try {
    const { status } = req.body;
    await Enquiry.update({ status, updatedAt: new Date() }, { where: { id } });
    return await Enquiry.findByPk(id);
  } catch (error) {
    throw error;
  }
};
