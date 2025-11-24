import db from "../../models/index";
import { Op } from "sequelize";
import { apiErrors } from '../../utils/api-errors';
import { sendEmail } from '../../utils/email';
import { formatPrice } from '../../utils/format-price';
import { UpdateStatus } from '../../utils/email-templates';
const { Subscription, User, Plan } = db;

export const findSubscriptionById = async (id: string) => {
  try {
    const subscriptionData = await Subscription.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "Customer",
          attributes: ['id', 'name', 'email', 'mobile_no', 'company_logo', 'company_name', 'address1', 'gst_type'],
        },
        {
          model: Plan,
          as: "Plan",
        }
      ]
    });
    if (!subscriptionData) {
      throw new apiErrors.BadRequestError("Subscription not exists.");
    }
    return subscriptionData;
  } catch (error) {
    throw error;
  }
};

export const findSubscription = async (page: number, limit: number) => {
  try {
    const subscriptionData = await Subscription.findAndCountAll({
      where: { status: 'Y' }, order: [["createdAt", "DESC"]],
    });
    return subscriptionData;
  } catch (error) {
    console.error("Error fetching Subscription:", error);
    throw error;
  }
};

export const createSubscription = async (req: any) => {
  try {
    const {
      plan_id, c_id, created, expiry_date, status, payment_id,
      order_id, signature_razorpay, totaluser, plantotalprice,
      taxprice, discount, payment_detail,
      isdrop, dropdate, createdAt, payment_date, razorpay_order_id,
      cgst, sgst, igst, per_user_rate, email, } = req.body;

    const subscriptionCreated: any = await Subscription.create(req.body);

    // also we can use this :--
    // const Data: any = await findSubscriptionById(subscriptionCreated?.id);

    const formatDateTime = (date: string | Date) => {
      const d = new Date(date);

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // convert 0 → 12 for midnight

      const hoursFormatted = String(hours).padStart(2, "0");

      return `${day}-${month}-${year} ${hoursFormatted}:${minutes} ${ampm}`;
    };

    if (subscriptionCreated) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
            .container {
                width: 95% !important;
            }
            .inner-box {
                padding: 10px !important;
            }
            .order-amount {
                font-size: 22px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; background:#e9eff5; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#e9eff5; padding:25px 0;">
    <tr>
        <td align="center">

            <!-- OUTER CONTAINER -->
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border:3px solid #619fd6; border-radius:4px;">

                <!-- TOP CONTACT BAR -->
                <tr>
                    <td style="padding:10px 20px; font-size:14px;">
                        <table width="100%">
                            <tr>
                                <td style="color:#000;">+91 8005523567</td>
                                <td style="text-align:right;">
                                    <a href="https://www.doomshell.com/" style="color:#377fbf; text-decoration:none;">www.doomshell.com</a>
                                </td>
                            </tr>
                            <tr>
                                 <td colspan="2" align="center" style="padding:15px 0;">
                                  <img 
                                     src="https://www.doomshell.com/images/doomshell-logo-black.webp" 
                                     alt="logo"
                                     style="max-width:280px; width:100%; height:auto; object-fit:contain;"
                                  />
                             </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- RED BORDERED INNER WRAPPER -->
                <tr>
                    <td class="inner-box" style="padding:20px 30px;">

                        <!-- ORDER HEADING -->
                        <h2 style="text-align:center; color:#377fbf; margin:0;">Order Detail</h2>
                        <h1 class="order-amount" style="text-align:center; color:#000000; margin:5px 0 20px; font-size:26px;">
                            Rs. {{ORDER_TOTAL}}
                        </h1>

                        <!-- BLUE MAIN TABLE -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #377fbf;">
                            
                            <!-- HEADER BLUE BAR -->
                            <tr>
                                <th style="background:#377fbf; color:#fff; padding:10px; text-align:left; width:70%;">
                                    Description
                                </th>
                                <th style="background:#377fbf; color:#fff; padding:10px; text-align:right; width:30%;">
                                    Amount (In Rs.)
                                </th>
                            </tr>

                            <!-- MAIN ROW -->
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #d9d9d9;">
                                    <strong>Doomshell Software </strong><br>
                                    - Plan @ Rs. {{PLAN_RATE}}<br>
                                    - Billing Period: {{PLAN_START}} to {{PLAN_END}}
                                </td>
                                <td style="padding:10px; border-bottom:1px solid #d9d9d9; text-align:right;">
                                    {{PLAN_RATE}}
                                </td>
                            </tr>

                            <!-- TAX + DISCOUNT ROW -->
                            <tr>
                                <td style="padding:10px; color:#377fbf;">
                                    Thank you for your Business!
                                </td>
                                <td style="padding:0;">
                                    <table width="100%" cellpadding="6" cellspacing="0">
                                        <tr>
                                            <td style="text-align:left;">Tax</td>
                                            <td style="text-align:right;">{{TAX}}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:left;">Discount</td>
                                            <td style="text-align:right;">{{DISCOUNT}}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- ORDER VALUE -->
                            <tr style="background:#377fbf; color:#fff;">
                                <td style="padding:10px; text-align:left; font-weight:bold;">
                                    Order Value
                                </td>
                                <td style="padding:10px; text-align:right; font-weight:bold;">
                                    {{ORDER_TOTAL}}
                                </td>
                            </tr>

                        </table>

                        <!-- PAY NOW -->
                        <div style="text-align:center; padding:25px 0;">
                            <a href="{{PAY_URL}}" 
                               style="background:#377fbf; color:#fff; padding:12px 30px; text-decoration:none; 
                                      font-weight:bold; border-radius:4px; display:inline-block;">
                                PAY NOW
                            </a>
                        </div>

                        <!-- FOOTER -->
                        <p style="text-align:center; font-size:14px; margin:0;">
                            Best Regards,<br>
                            Customer Services Doomshell Software
                        </p>

                        <p style="text-align:center; font-size:12px; margin-top:15px; color:#555;">
                            Copyrights © 2021 Doomshell Software Pvt. Ltd | All Rights Reserved
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>`
        .replace(/{{ORDER_TOTAL}}/g, formatPrice(plantotalprice))
        // .replace(/{{TOTAL_USER}}/g, totaluser)
        .replace(/{{PLAN_RATE}}/g, formatPrice(per_user_rate))
        .replace(/{{PLAN_START}}/g, formatDateTime(created))
        .replace(/{{PLAN_END}}/g, formatDateTime(expiry_date))
        .replace(/{{PLAN_TOTAL}}/g, formatPrice(plantotalprice))
        .replace(/{{TAX}}/g, formatPrice(taxprice))
        .replace(/{{DISCOUNT}}/g, formatPrice(discount))
        .replace(/{{PAY_URL}}/g, "https://ezypayroll.in/logins");

      const emailPayload = UpdateStatus({
        toEmail: email,
        subject: 'Payment Link',
        html,
      });

      try {
        await sendEmail(emailPayload);
        console.log('Invoice generated and emailed successfully.');
      } catch (err) {
        console.error('Failed to send invoice email:', err);
      }

    }
    return subscriptionCreated;
  } catch (error) {
    console.error("Error while creating Subscription:", error);
    throw (error);
  }
};

export const findAllSubscription = async (page: number, limit: number) => {
  const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
  const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await Subscription.findAndCountAll({
    offset, limit: limitNumber, order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "Customer",
        attributes: ['id', 'name', 'email', 'mobile_no', 'company_name', 'company_logo', 'address1', 'gstin'],
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

export const updateSubscription = async (id: number, req: any) => {
  const { body } = req;
  try {
    const updateData = { ...body, updatedAt: new Date() };
    const [affectedCount, updatedRows] = await Subscription.update(updateData, {
      where: { id }, returning: true,
    });

    if (affectedCount === 0) { throw new apiErrors.BadRequestError("Subscription not found."); }
    return { status: true, message: "Subscription updated successfully.", result: updatedRows[0], };
  } catch (error) {
    console.error("Error while updating Subscription:", error);
    throw (error);
  }
};

export const deleteSubscription = async (id: number) => {
  try {
    await Subscription.destroy({ where: { id } });
    return true;
  } catch (error) {
    console.error("Error while deleting Subscription:", error);
    throw (error);
  }
};

export const updateSubscriptionStatus = async (id: string, req: any) => {
  try {
    const { status } = req.body;
    await Subscription.update({ status, updatedAt: new Date() }, { where: { id } });
    return await Subscription.findByPk(id);
  } catch (error) {
    console.error("Error while updating subscription status:", error);
    throw (error);
  }
};

export const updatePaymentStatus = async (id: string, req: any) => {
  try {
    const { isdrop } = req.body;
    await Subscription.update({ isdrop, updatedAt: new Date() }, { where: { id } });
    return await Subscription.findByPk(id);
  } catch (error) {
    console.error("Error while updating payment status:", error);
    throw (error);
  }
};

export const searchSubscriptionBilling = async (page = 1, limit = 10, companyId?: string, fromDate?: string, toDate?: string) => {
  const offset = (page - 1) * limit;
  const whereClause: any = {};

  // 🔍 Search Term
  if (companyId) {
    whereClause.c_id = Number(companyId);
  }

  // 📅 Date filters
  if (fromDate && toDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(`${fromDate}T00:00:00Z`), new Date(`${toDate}T23:59:59Z`)],
    };
  } else if (fromDate) {
    whereClause.createdAt = { [Op.gte]: new Date(`${fromDate}T00:00:00Z`) };
  } else if (toDate) {
    whereClause.createdAt = { [Op.lte]: new Date(`${toDate}T23:59:59Z`) };
  }

  // ✅ Debug the final where clause
  const finalWhere = { ...whereClause, };

  const { count, rows } = await Subscription.findAndCountAll({
    offset, limit, where: finalWhere, order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: "Customer",
        attributes: ['id', 'name', 'email', 'mobile_no', 'company_logo', 'company_name', 'address1', 'gstin'],
      },
      {
        model: Plan,
        as: "Plan",
      }
    ]
  });

  return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit), };
};

export const sendMail = async (id: string) => {
  try {
    // const {
    //   id, plan_id, c_id, created, expiry_date, status,
    //   payment_id, order_id, signature_razorpay, totaluser,
    //   plantotalprice, taxprice, discount, payment_detail,
    //   isdrop, dropdate, createdAt, payment_date, razorpay_order_id,
    //   cgst, sgst, igst, per_user_rate, email, } = req.body;

    // also we can use this :--
    const Data: any = await Subscription.findOne({
      where: { c_id: id, status: "Y" },
      include: [
        {
          model: User,
          as: "Customer",
          attributes: ["id", "name", "email", "mobile_no", "company_name"],
        },
        {
          model: Plan,
          as: "Plan",
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatDateTime = (date: string | Date) => {
      const d = new Date(date);

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // convert 0 → 12 for midnight

      const hoursFormatted = String(hours).padStart(2, "0");

      return `${day}-${month}-${year} ${hoursFormatted}:${minutes} ${ampm}`;
    };

    if (Data) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 95% !important;
            }
            .inner-box {
                padding: 10px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; background:#e9eff5; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#e9eff5; padding:25px 0;">
    <tr>
        <td align="center">

            <!-- OUTER WRAPPER -->
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border:3px solid #dc3545; border-radius:4px;">

                <!-- TOP BAR -->
                <tr>
                    <td style="padding:10px 20px; font-size:14px;">
                        <table width="100%">
                            <tr>
                                <td style="color:#000;">+91 8005523567</td>
                                <td style="text-align:right;">
                                    <a href="https://www.ezypayroll.in" 
                                       style="color:#007bff; text-decoration:none;">www.ezypayroll.in</a>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" align="center" style="padding:15px 0;">
                                    <img src="https://ezypayroll.in/frontEnd/images/logo.png" width="200" alt="logo" />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- CONTENT AREA -->
                <tr>
                    <td class="inner-box" style="padding:20px 30px;">

                        <!-- WELCOME TITLE -->
                        <h2 style="text-align:center; color:#0077a1; margin:0; font-size:24px;">
                            Welcome to EZYPayroll!
                        </h2>

                        <p style="text-align:center; font-size:15px; color:#333; margin-top:10px;">
                            We’re excited to have you as part of the EZYPayroll family.  
                            Your business now has access to a powerful suite of tools designed 
                            to simplify operations, enhance productivity, and support growth.
                        </p>

                        <!-- FEATURES BOX -->
                        <table width="100%" cellpadding="10" cellspacing="0" 
                               style="border:1px solid #d6d6d6; background:#f9f9f9; border-radius:4px; margin-top:20px;">

                            <tr>
                                <td style="font-size:15px; color:#444;">
                                    <strong style="color:#0077a1;">✔ Secure Web Hosting</strong><br>
                                    Host your business portal on fast, secure, and high-availability cloud infrastructure.
                                </td>
                            </tr>

                            <tr>
                                <td style="font-size:15px; color:#444;">
                                    <strong style="color:#0077a1;">✔ Custom Business Website</strong><br>
                                    Get a fully responsive and professionally designed website tailored to your brand.
                                </td>
                            </tr>

                            <tr>
                                <td style="font-size:15px; color:#444;">
                                    <strong style="color:#0077a1;">✔ Separate Dedicated Web Panel</strong><br>
                                    Your own admin/dashboard panel to manage your business, customers, and workflows.
                                </td>
                            </tr>

                            <tr>
                                <td style="font-size:15px; color:#444;">
                                    <strong style="color:#0077a1;">✔ Continuous Support & Updates</strong><br>
                                    Our team ensures seamless updates, new features, and fast customer support whenever you need it.
                                </td>
                            </tr>

                        </table>

                        <!-- CALL TO ACTION -->
                        <div style="text-align:center; padding:30px 0;">
                            <a href="{DASHBOARD_URL}" 
                               style="background:#0077a1; color:#fff; padding:12px 30px; text-decoration:none; 
                                      font-weight:bold; border-radius:4px; display:inline-block;">
                                GO TO YOUR DASHBOARD
                            </a>
                        </div>

                        <!-- FOOTER -->
                        <p style="text-align:center; font-size:14px; margin:0;">
                            Best Regards,<br>
                            Customer Services Team – EZYPayroll
                        </p>

                        <p style="text-align:center; font-size:12px; margin-top:15px; color:#555;">
                            Copyrights © 2021 Doomshell Software Pvt. Ltd | All Rights Reserved
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
`
        .replace("{DASHBOARD_URL}", 'www.baaraat.com')
      // .replace(/{{ORDER_TOTAL}}/g, plantotalprice)
      // .replace(/{{TOTAL_USER}}/g, totaluser)
      // .replace(/{{PLAN_RATE}}/g, per_user_rate)
      // .replace(/{{PLAN_START}}/g, formatDateTime(created))
      // .replace(/{{PLAN_END}}/g, formatDateTime(expiry_date))
      // .replace(/{{PLAN_TOTAL}}/g, plantotalprice)
      // .replace(/{{TAX}}/g, taxprice)
      // .replace(/{{DISCOUNT}}/g, discount)
      // .replace(/{{PAY_URL}}/g, "https://ezypayroll.in/logins");

      const emailPayload = UpdateStatus({
        toEmail: `${Data?.Customer?.email}`,
        subject: 'Demo',
        html,
      });
      try {
        await sendEmail(emailPayload);
        console.log('Email generated successfully.');
      } catch (err) {
        console.error('Failed to send demo email:', err);
      }
      return true;
    } else {
      throw new apiErrors.BadRequestError("Subscription not active anymore.");
    }
  } catch (error) {
    console.error("Error while sending email:", error);
    throw (error);
  }
};

export const bulkInactiveExpiredSubscriptions = async () => {
  try {

    const formatDateTime = (date = new Date()) => {
      const pad = (n: number) => String(n).padStart(2, "0");

      return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds())
      );
    };

    const now = formatDateTime(new Date());

    // 1. Fetch all subscriptions that are active but expired
    const expiredSubs = await Subscription.findAll({
      where: { status: "Y", expiry_date: { [Op.lt]: now, }, },
    });

    // If none found
    if (!expiredSubs.length) {
      return { status: true, message: "No expired subscriptions found.", updated: 0, };
    }

    // 2. Update all statuses in bulk
    const ids = expiredSubs.map((s: any) => s.id);
    const updateCount = await Subscription.update({ status: "N" }, { where: { id: ids }, });

    return { status: true, message: "Expired subscriptions inactivated successfully.", updated: updateCount[0], };
  } catch (err: any) {
    console.error("Bulk inactivate error:", err);
    throw new Error("Failed to inactivate expired subscriptions. " + err.message);
  }
};

// Invoice 
{/* const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Doomshell Invoice</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f0f4ff;">

    <p style="font-size:18px; font-weight:bold; color:#3A7BD5;">Document</p>

<table align="center" cellspacing="0px" cellpadding="0px" style="width:600px; border:1px solid #e6e6e6;">
<thead>
<tr>
<td>
<table align="center" cellspacing="0px" cellpadding="10px" style="width:100%; border-bottom:2px solid #3A7BD5;">
<thead>
<tr>
<td style="color:#3A7BD5; font-weight:bold;">+91 8005523567</td>
<td style="text-align:right; color:#3A7BD5; font-weight:bold;"> <a href="https://www.doomshell.com/" style="color:#377fbf; text-decoration:none;">www.doomshell.com</a></td>
</tr>

<tr>
<td colspan="2" style="text-align:center">
    <img src="https://www.doomshell.com/images/doomshell-logo-black.webp" alt="logo" style="width:280px">
</td>
</tr>

</thead>
</table>
</td>
</tr>
</thead>

<tbody>
<tr><td><table align="center" cellspacing="0px" cellpadding="0" style="width:94%"><tbody><tr><td><br></td><td style="text-align:center"><br></td><td><br></td></tr></tbody></table></td></tr>

<tr>
<td>
<table align="center" cellspacing="0px" cellpadding="20px" style="width:94%">
<tbody>

<tr>
<td>
<p style="font-size:22px; margin-bottom:10px; font-weight:bold; color:#3A7BD5;">Invoice</p>
<p style="margin:0;">Doomshell Softwares Private Limited</p>
<p style="margin:0;">A-3 Mall Road, vidhyadhar Nagar, Jaipur-302039 India</p>
</td>
</tr>

<tr>
<td>
<table cellspacing="0" cellpadding="5" style="width:100%; border:1px solid #e6e6e6; border-radius:5px;">
<tbody>
<tr><td colspan="2" style="font-weight:bold; color:#3A7BD5;">Billing to:</td></tr>
<tr>
<td style="font-size:14px; font-weight:bold;">{COMPANYNAME}</td>
<td style="text-align:right; font-size:14px;">Invoice Date: <strong style="color:#3A7BD5;">{INVOICEDATE}</strong></td>
</tr>
</tbody>
</table>
</td>
</tr>

<tr>
<td>
<table cellspacing="0" cellpadding="10" style="width:100%; border-top:2px solid #3A7BD5;">
<thead>
<tr>
<th style="text-align:left; color:#3A7BD5; font-size:16px;">Description</th>
<th style="text-align:right; color:#3A7BD5; font-size:16px;">Amount (In Rs.)</th>
</tr>
</thead>

<tbody>
<tr>
<td>
<p style="margin:0;">Doomshell Softwares</p>
<p style="margin:0; font-size:13px;">- Plan @ Rs. {PLANRATE}</p>
<p style="margin:0; font-size:13px;">- Billing Period: {PLANSTART} to {PLANEND}</p>
</td>
<td style="text-align:right; font-weight:bold;">{PLANTOTAL}</td>
</tr>
</tbody>

<tbody>
<tr>
<td style="font-weight:bold; color:#3A7BD5;">Thank you for your Business!</td>
<td style="text-align:right;">
<table cellspacing="0" cellpadding="5" style="width:100%">
<tbody>
<tr><td style="text-align:left">CGST(9%)</td><td style="text-align:right">{CGST}</td></tr>
<tr><td style="text-align:left">SGST(9%)</td><td style="text-align:right">{SGST}</td></tr>
<tr><td style="text-align:left">IGST(18%)</td><td style="text-align:right">{IGST}</td></tr>
<tr><td style="text-align:left">Total Tax(18%)</td><td style="text-align:right; font-weight:bold;">{TAX}</td></tr>
<tr><td style="text-align:left">Discount</td><td style="text-align:right">{DISCOUNT}</td></tr>
</tbody>
</table>
</td>
</tr>

<tr>
<td style="text-align:right"><br></td>
<td style="text-align:right">
<table cellspacing="0" cellpadding="5" style="width:100%; border-top:2px solid #3A7BD5;">
<tbody>
<tr>
<td style="text-align:left; font-size:16px; font-weight:bold; color:#3A7BD5;">Order Value</td>
<td style="text-align:right; font-size:16px; font-weight:bold; color:#3A7BD5;">{ORDERTOTAL}</td>
</tr>
</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</td>
</tr>

<tr>
<td style="padding-top:20px;">
<span style="color:#3A7BD5; font-weight:bold;">Best Regards,</span><br>
Customer Services Doomshell Software<br><br>
<span style="font-size:12px; color:#555;">Copyrights © 2021 Doomshell Software Pvt. Ltd | All Rights Reserved</span>
</td>
</tr>

</tbody>
</table>
</td></tr>
</tbody>

<tfoot>
<tr>
<td>
<table align="center" cellspacing="0px" cellpadding="0" style="width:94%">
<tbody><tr><td><br></td><td><br></td><td><br></td></tr></tbody>
</table>
</td>
</tr>
</tfoot>

</table>


<script>
document.getElementById("year").innerText = new Date().getFullYear();
</script>

</body>
</html>
` 
           .replaceAll("{COMPANYNAME}", data.COMPANYNAME)
           .replaceAll("{INVOICEDATE}", data.INVOICEDATE)
           .replaceAll("{PLANRATE}", data.PLANRATE)
           .replaceAll("{PLANSTART}", data.PLANSTART)
           .replaceAll("{PLANEND}", data.PLANEND)
           .replaceAll("{PLANTOTAL}", data.PLANTOTAL)
           .replaceAll("{TOTALUSER}", data.TOTALUSER)
           .replaceAll("{CGST}", data.CGST)
           .replaceAll("{SGST}", data.SGST)
           .replaceAll("{IGST}", data.IGST)
           .replaceAll("{TAX}", data.TAX)
           .replaceAll("{DISCOUNT}", data.DISCOUNT)
           .replaceAll("{ORDERTOTAL}", data.ORDERTOTAL);
 */}


// Demo request email template
{/**
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Doomshell Demo Request</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f0f4ff; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff; padding:30px 0;">
        <tr>
            <td align="center">

                <!-- Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" 
                       style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:#3A7BD5; padding:25px;">
                            <img src="https://doomshellsoftwares.com/wp-content/uploads/2023/06/logo.png" 
                                 alt="Doomshell Software" style="max-width:220px; height:auto;">
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td style="text-align:center; padding:20px;">
                            <h2 style="margin:0; font-size:22px; color:#3A7BD5;">
                                New Demo Request Received
                            </h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:0 30px 25px 30px; font-size:15px; line-height:1.6; color:#333;">
                            
                            <p>Hi <strong>Admin</strong>,</p>

                            <p style="margin-bottom:18px;">
                                A new demo request has been submitted. Below are the details:
                            </p>

                            <table cellpadding="0" cellspacing="0" width="100%" 
                                   style="background:#f8f9ff; padding:15px; border-radius:6px; border-left:4px solid #3A7BD5;">
                                <tr><td><strong>Name:</strong> {name}</td></tr>
                                <tr><td><strong>Company Name:</strong> {company}</td></tr>
                                <tr><td><strong>Title:</strong> {title}</td></tr>
                                <tr><td><strong>Email:</strong> {email}</td></tr>
                                <tr><td><strong>Phone No.:</strong> {phone}</td></tr>
                                <tr><td><strong>Day:</strong> {day}</td></tr>
                                <tr><td><strong>Time:</strong> {time}</td></tr>
                            </table>

                            <p style="margin-top:25px;">
                                Thank you for reaching out — our team will get back to you shortly!
                            </p>

                            <p style="margin-top:15px;">
                                Regards,<br>
                                <strong>Doomshell Software Pvt. Ltd.</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background:#3A7BD5; padding:15px; color:#ffffff; font-size:13px;">
                            Doomshell Software Pvt. Ltd. |
                            <a href="https://doomshellsoftwares.com" style="color:#ffffff; text-decoration:none;">doomshellsoftwares.com</a> |
                            © {year}. All Rights Reserved.
                        </td>
                    </tr>

                </table>
                <!-- End Card -->

            </td>
        </tr>
    </table>

</body>
</html>`
.replace(/{name}/g, data.name)
    .replace(/{email}/g, data.email)
    .replace(/{phone}/g, data.phone)
    .replace(/{day}/g, data.day)
    .replace(/{time}/g, data.time)
    .replace(/{year}/g, new Date().getFullYear());
 */}


// Welcome template
{/** 
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Welcome to Doomshell</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0; padding:0; background:#f4f7ff; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.12);">

<!-- Header -->
<tr>
<td align="center" style="background:#fff; padding:25px;">
    <img src="https://www.doomshell.com/images/doomshell-logo-black.webp" alt="logo" style="max-width:290px;">
</td>
</tr>

<!-- Title -->
<tr>
<td style="padding:25px; text-align:center;">
    <h2 style="margin:0; font-size:22px; color:#3A7BD5;">
        Welcome, {USERNAME}! 🎉
    </h2>
    <p style="color:#555; font-size:14px; margin-top:8px;">
        Your account has been successfully created with Doomshell Software.
    </p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:20px;">
    <p style="font-size:15px; color:#333;">Hi <strong>{USERNAME}</strong>,</p>

    <p style="font-size:14px; color:#555; line-height:1.6;">
        We're excited to have you onboard! Your account is now ready.
        Use the login details below to access your dashboard and explore our features.
    </p>

    <!-- Credentials -->
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8f9ff; border-left:4px solid #3A7BD5; margin:15px 0;">
        <tr><td><strong>Email:</strong> {EMAIL}</td></tr>
        <tr><td><strong>Password:</strong> {PASSWORD}</td></tr>
    </table>

    <p style="font-size:14px; color:#555; margin-top:20px;">
        Click the button below to log in:
    </p>

    <!-- CTA Button -->
    <p style="text-align:center; margin-top:20px;">
        <a href="{LOGINURL}" style="background:#3A7BD5; color:#fff; padding:14px 26px; border-radius:6px; font-size:15px; text-decoration:none;">
            Login to Dashboard
        </a>
    </p>

    <p style="font-size:14px; color:#444; margin-top:25px;">
        You can purchase a plan anytime by contacting the admin from your dashboard to unlock full access.
    </p>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:20px; text-align:center; font-size:13px; color:#666;">
    Need help? Just reply to this email — we’re here to support you. 💙<br><br>
    © {YEAR} Doomshell Software Pvt. Ltd. | All Rights Reserved
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
           .replaceAll("{USERNAME}", user.name)
           .replaceAll("{EMAIL}", user.email)
           .replaceAll("{PASSWORD}", password)
           .replaceAll("{LOGINURL}", loginUrl)
           .replaceAll("{YEAR}", new Date().getFullYear());
*/}


// Welcome template when user register & have active plan
{/**
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Welcome to Doomshell</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0; padding:0; background:#f4f7ff; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.12);">

<!-- Header -->
<tr>
<td align="center" style="background:#fff; padding:25px;">
    <img src="https://www.doomshell.com/images/doomshell-logo-black.webp" alt="logo" style="max-width:290px;">
</td>
</tr>

<!-- Title -->
<tr>
<td style="padding:25px; text-align:center;">
    <h2 style="margin:0; font-size:22px; color:#3A7BD5;">
        Welcome, {USERNAME}! 🎉
    </h2>
    <p style="color:#555; font-size:14px; margin-top:8px;">
        Your account has been successfully created with Doomshell Software.
    </p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:20px;">
    <p style="font-size:15px; color:#333;">Hi <strong>{USERNAME}</strong>,</p>

    <p style="font-size:14px; color:#555; line-height:1.6;">
        Thank you for registering with us! Your Doomshell dashboard is now active and ready to use.
        Below are your login details:
    </p>

    <!-- Credentials Box -->
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8f9ff; border-left:4px solid #3A7BD5; margin:15px 0;">
        <tr><td><strong>Email:</strong> {EMAIL}</td></tr>
        <tr><td><strong>Password:</strong> {PASSWORD}</td></tr>
    </table>

    <!-- Optional plan info (only if purchased) -->
    <p style="font-size:14px; margin-top:12px; color:#333; font-weight:bold;">
        ✔ Your Plan Details:
    </p>

    <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #e6e6e6; border-radius:6px; margin:10px 0;">
        <tr>
            <td><strong>Plan:</strong></td><td style="text-align:right;">{PLANNAME}</td>
        </tr>
        <tr>
            <td><strong>Users Allowed:</strong></td><td style="text-align:right;">{TOTALUSER}</td>
        </tr>
        <tr>
            <td><strong>Billing Period:</strong></td><td style="text-align:right;">{PLANSTART} → {PLANEND}</td>
        </tr>
        <tr>
            <td><strong>Amount Paid:</strong></td><td style="text-align:right;">₹{PLANTOTAL}</td>
        </tr>
    </table>

    <p style="font-size:14px; color:#555; margin-top:20px;">
        You can now log in using the following button:
    </p>

    <!-- CTA Button -->
    <p style="text-align:center; margin-top:20px;">
        <a href="{LOGINURL}" style="background:#3A7BD5; color:#fff; padding:14px 28px; border-radius:6px; font-size:15px; text-decoration:none;">
            Login to Dashboard
        </a>
    </p>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:20px; text-align:center; font-size:13px; color:#666;">
    If you need help, reply to this email — We're here for you 💙<br><br>
    © {YEAR} Doomshell Software Pvt. Ltd. | All Rights Reserved
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`
           .replaceAll("{USERNAME}", user.name)
           .replaceAll("{EMAIL}", user.email)
           .replaceAll("{PASSWORD}", generatedPassword)
           .replaceAll("{PLANNAME}", plan.name)
           .replaceAll("{TOTALUSER}", plan.userLimit)
           .replaceAll("{PLANSTART}", plan.start)
           .replaceAll("{PLANEND}", plan.end)
           .replaceAll("{PLANTOTAL}", plan.amount)
           .replaceAll("{LOGINURL}", loginUrl)
           .replaceAll("{YEAR}", new Date().getFullYear());
 */}
