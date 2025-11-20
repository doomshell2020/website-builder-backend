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
          attributes: ['id', 'name', 'email', 'mobile_no', 'company_logo', 'company_name'],
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
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border:3px solid #dc3545; border-radius:4px;">

                <!-- TOP CONTACT BAR -->
                <tr>
                    <td style="padding:10px 20px; font-size:14px;">
                        <table width="100%">
                            <tr>
                                <td style="color:#000;">+91 8005523567</td>
                                <td style="text-align:right;">
                                    <a href="https://www.ezypayroll.in" style="color:#007bff; text-decoration:none;">www.ezypayroll.in</a>
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

                <!-- RED BORDERED INNER WRAPPER -->
                <tr>
                    <td class="inner-box" style="padding:20px 30px;">

                        <!-- ORDER HEADING -->
                        <h2 style="text-align:center; color:#e14d4d; margin:0;">Order Detail</h2>
                        <h1 class="order-amount" style="text-align:center; color:#0077a1; margin:5px 0 20px; font-size:26px;">
                            Rs. {{ORDER_TOTAL}}
                        </h1>

                        <!-- BLUE MAIN TABLE -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #0077a1;">
                            
                            <!-- HEADER BLUE BAR -->
                            <tr>
                                <th style="background:#0077a1; color:#fff; padding:10px; text-align:left; width:70%;">
                                    Description
                                </th>
                                <th style="background:#0077a1; color:#fff; padding:10px; text-align:right; width:30%;">
                                    Amount (In Rs.)
                                </th>
                            </tr>

                            <!-- MAIN ROW -->
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #d9d9d9;">
                                    <strong>EZYPayroll Software</strong><br>
                                    - Plan @ Rs. {{PLAN_RATE}}<br>
                                    - Billing Period: {{PLAN_START}} to {{PLAN_END}}
                                </td>
                                <td style="padding:10px; border-bottom:1px solid #d9d9d9; text-align:right;">
                                    {{PLAN_RATE}}
                                </td>
                            </tr>

                            <!-- TAX + DISCOUNT ROW -->
                            <tr>
                                <td style="padding:10px; color:#0077a1;">
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
                            <tr style="background:#0077a1; color:#fff;">
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
                               style="background:#0077a1; color:#fff; padding:12px 30px; text-decoration:none; 
                                      font-weight:bold; border-radius:4px; display:inline-block;">
                                PAY NOW
                            </a>
                        </div>

                        <!-- FOOTER -->
                        <p style="text-align:center; font-size:14px; margin:0;">
                            Best Regards,<br>
                            Customer Services Ezypayroll
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

export const updateSubscription = async (id: number, req: any) => {
  const { body } = req;
  const { name } = body;

  try {
    if (name) {
      const alreadyExists = await Subscription.findOne({
        where: { name: { [Op.iLike]: name }, id: { [Op.ne]: id } },
      });
      if (alreadyExists) {
        throw new apiErrors.BadRequestError("Subscription with this name already exists.");
      }
    }

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
                            <a href="{{DASHBOARD_URL}}" 
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

// invoice 
{/* const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f4f4f7;
      font-family: Arial, sans-serif;
    }

    .container {
      width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }

    .header {
      padding: 15px;
      background: #111827;
      color: white;
      font-size: 14px;
    }

    .header a {
      color: #ffffff;
      text-decoration: none;
      font-weight: 500;
    }

    .logo {
      text-align: center;
      padding: 20px 0;
    }

    .content {
      padding: 25px;
      color: #333;
      font-size: 14px;
    }

    .section-title {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    th, td {
      padding: 10px 5px;
      font-size: 14px;
    }

    th {
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    td:last-child {
      text-align: right;
    }

    .total-box {
      margin-top: 10px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      font-weight: bold;
    }

    .btn {
      display: block;
      width: 100%;
      text-align: center;
      background: #2563eb;
      color: white;
      padding: 12px 0;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      border-radius: 6px;
      margin-top: 25px;
    }

    .footer {
      margin-top: 20px;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>

<body>

  <div class="container">

    <!-- Header -->
    <div class="header">
      +91 8005523567
      <span style="float:right;">
        <a href="https://www.ezypayroll.in">www.ezypayroll.in</a>
      </span>
    </div>

    <!-- Logo -->
    <div class="logo">
      <img src="https://ezypayroll.in/frontEnd/images/logo.png" width="180" alt="EZYPayroll Logo"/>
    </div>

    <!-- Content -->
    <div class="content">

      <p class="section-title">Order Details</p>
      <p style="font-size: 16px; font-weight: bold;">Rs. {ORDER_TOTAL}</p>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;">Amount (₹)</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <p><strong>EZYPayroll Software</strong></p>
              <p>- {TOTAL_USER} Users Plan @ Rs. {PLAN_RATE}</p>
              <p>- Billing Period: {PLAN_START} to {PLAN_END}</p>
            </td>
            <td>{PLAN_TOTAL}</td>
          </tr>

          <tr>
            <td><strong>Tax</strong></td>
            <td>{TAX}</td>
          </tr>

          <tr>
            <td><strong>Discount</strong></td>
            <td>{DISCOUNT}</td>
          </tr>

          <tr class="total-box">
            <td><strong>Order Value</strong></td>
            <td><strong>{ORDER_TOTAL}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Pay Now Button -->
      <a href="{PAY_URL}" class="btn">PAY NOW</a>

      <p style="margin-top:20px; font-size:14px;">
        Thank you for your business!
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      Best Regards,<br>
      Customer Services – Ezypayroll<br><br>
      © 2021 Doomshell Software Pvt. Ltd | All Rights Reserved
    </div>

  </div>

</body>
</html>` 
  .replaceAll('{ORDER_TOTAL}', orderTotal)
  .replaceAll('{TOTAL_USER}', totalUser)
  .replaceAll('{PLAN_RATE}', planRate)
  .replaceAll('{PLAN_START}', planStart)
  .replaceAll('{PLAN_END}', planEnd)
  .replaceAll('{PLAN_TOTAL}', planTotal)
  .replaceAll('{TAX}', tax)
  .replaceAll('{DISCOUNT}', discount)
  .replaceAll('{PAY_URL}', payUrl);
 */}