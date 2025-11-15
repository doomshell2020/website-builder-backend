import db from "../../models/index";
import { Op } from "sequelize";
import { apiErrors } from '../../utils/api-errors';
import { sendEmail } from '../../utils/email';
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
                    attributes: ['id', 'name', 'email', 'mobile_no', 'company_name'],
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
        const { email } = req?.body;
        const subscriptionCreated: any = await Subscription.create(req.body);
        if (subscriptionCreated) {
            const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Payment Link</title>
  <style>
    /* Basic responsive rules (kept minimal for email client compatibility) */
    @media only screen and (max-width:620px) {
      .container { width: 100% !important; padding: 16px !important; }
      .card { padding: 18px !important; }
      .two-col td { display:block; width:100% !important; box-sizing:border-box; }
      .logo img { height:44px !important; }
      .amount { font-size:22px !important; }
      .btn { padding:12px 18px !important; font-size:15px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f6f9; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <!-- Outer container -->
        <table class="container" width="640" cellpadding="0" cellspacing="0" role="presentation" style="width:640px; max-width:100%; background-color:#ffffff; border-radius:6px; box-shadow:0 6px 20px rgba(11,38,64,0.06); overflow:hidden; border:4px solid #e94b4b;">
          
          <!-- Header strip (small top accent) -->
          <tr>
            <td style="background:linear-gradient(90deg,#e94b4b 0%, #d83c3c 50%, #1b78a6 51%, #0f6aa0 100%); height:8px; line-height:8px;">&nbsp;</td>
          </tr>

          <!-- Logo / Top -->
          <tr>
            <td style="padding:22px 28px 8px 28px; text-align:center;" class="logo">
              <!-- Use your hosted logo URL (fallback to plain text if image blocked) -->
              <img src="https://www.doomshell.com/images/doomshell-logo.webp" alt="Doomshell" style="height:62px; display:block; margin:0 auto 6px auto;">
              <div style="font-size:12px; color:#1b78a6; font-weight:600; margin-top:2px;">
                Payment Link • Order #{ORDER_ID}
              </div>
            </td>
          </tr>

          <!-- Card content -->
          <tr>
            <td class="card" style="padding:26px 36px 32px 36px; color:#16313f;">
              
              <!-- Title -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="text-align:center;">
                    <div style="font-size:20px; font-weight:700; color:#e94b4b;">Order Detail</div>
                    <div style="margin-top:8px; font-size:28px; font-weight:800; color:#0f6aa0;" class="amount">Rs. {TOTAL}</div>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <div style="height:18px;">&nbsp;</div>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #d6dfe6; border-radius:4px; overflow:hidden;">
                      
                      <!-- Header row -->
                      <tr>
                        <td style="background:#0f6aa0; color:#ffffff; font-weight:700; padding:12px 14px; font-size:13px;">Description</td>
                        <td align="right" style="background:#0f6aa0; color:#ffffff; font-weight:700; padding:12px 14px; font-size:13px;">Amount (In Rs.)</td>
                      </tr>

                      <!-- Item row -->
                      <tr>
                        <td style="padding:14px; vertical-align:top; color:#16313f;">
                          <div style="font-weight:700; margin-bottom:6px;">{PLAN}</div>
                          <div style="font-size:13px; color:#576b76; margin-bottom:6px;">- {USERS} Users Plan @ Rs. {PRICE}</div>
                          <div style="font-size:13px; color:#6d8088;">- Billing Period: {BILLING_PERIOD}</div>
                        </td>
                        <td align="right" style="padding:14px 16px; vertical-align:top; color:#16313f; font-weight:700;">{PRICE}</td>
                      </tr>

                      <!-- small divider -->
                      <tr>
                        <td colspan="2" style="border-top:1px solid #e8edf0; padding:0;"></td>
                      </tr>

                      <!-- Notes & taxes -->
                      <tr>
                        <td style="padding:14px; vertical-align:top; color:#0f6aa0; font-weight:700;">Thank you for your Business!</td>
                        <td style="padding:14px; vertical-align:top;">
                          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                            <tr>
                              <td style="font-size:13px; color:#1b78a6; font-weight:700; text-align:right;">Tax</td>
                              <td style="width:18px;">&nbsp;</td>
                              <td style="text-align:right; font-weight:700; color:#16313f;">{TAX}</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px; color:#1b78a6; font-weight:700; text-align:right;">Discount</td>
                              <td style="width:18px;">&nbsp;</td>
                              <td style="text-align:right; font-weight:700; color:#16313f;">{DISCOUNT}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Total row -->
                      <tr>
                        <td style="background:#0f6aa0; color:#ffffff; font-weight:700; padding:12px 14px;">&nbsp;</td>
                        <td align="right" style="background:#0f6aa0; color:#ffffff; font-weight:800; padding:12px 14px;">Order Value &nbsp;&nbsp; {TOTAL}</td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <div style="height:22px;">&nbsp;</div>

              <!-- Pay button -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tr>
                  <td align="center">
                    <a href="{PAY_URL}" class="btn" style="display:inline-block; text-decoration:none; font-weight:800; font-size:15px; padding:14px 28px; border-radius:8px; background:linear-gradient(90deg,#e94b4b 0%, #d83c3c 50%, #1b78a6 51%, #0f6aa0 100%); color:#ffffff; border:2px solid rgba(255,255,255,0.08);">
                      PAY NOW
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <div style="height:20px;">&nbsp;</div>

              <!-- Footer note -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="text-align:center; color:#6b7f88; font-size:13px;">
                    Best Regards,<br>
                    Customer Services, Doomshell
                  </td>
                </tr>
                <tr>
                  <td style="height:10px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="text-align:center; color:#9aaab2; font-size:12px;">
                    Need help? Call: <strong style="color:#16313f;">{COMPANY_PHONE}</strong> | Visit: <a href="{COMPANY_WEBSITE}" style="color:#0f6aa0; text-decoration:none;">{COMPANY_WEBSITE}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer bottom -->
          <tr>
            <td style="background:#f6fbfd; padding:18px 28px; text-align:center; font-size:12px; color:#7b8c93;">
              &copy; {YEAR} Doomshell Software Pvt. Ltd. All rights reserved.
            </td>
          </tr>

          <!-- Bottom accent -->
          <tr>
            <td style="background:linear-gradient(90deg,#e94b4b 0%, #d83c3c 50%, #1b78a6 51%, #0f6aa0 100%); height:6px; line-height:6px;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
            // .replace('{TOTAL}', total)
            // .replace('{PLAN}', planName)
            // .replace('{USERS}', totaluser)
            // .replace('{PRICE}', amount)
            // .replace('{BILLING_PERIOD}', billingPeriod)
            // .replace('{TAX}', tax)
            // .replace('{DISCOUNT}', discount)
            // // .replace('{PAY_URL}', paymentLink)
            // .replace('{ORDER_ID}', order_id)
            // .replace('{COMPANY_PHONE}', '+91 8005523567')
            // .replace('{COMPANY_WEBSITE}', 'https://www.doomshell.com')
            // .replace('{YEAR}', new Date().getFullYear());

            const emailPayload = UpdateStatus({
                toEmail: email,
                subject: 'Payment Link',
                html,
            });

            try {
                await sendEmail(emailPayload);
                console.log('Bill Generated successfully');
            } catch (err) {
                console.error('Failed to Generate bill on email:', err);
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
                attributes: ['id', 'name', 'email', 'mobile_no', 'company_name' ,'address1' ,'gstin'],
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
    });

    return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit), };
};