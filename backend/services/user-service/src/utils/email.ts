import nodemailer from "nodemailer";

const templates = {
  noti: (user: any, noti : string) => `
    <div style="margin: 0; padding: 0; background-color: #f2f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-width: 348px;">
      <tr align="center">
        <td >
          <table style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin: 40px auto; font-family: 'Segoe UI', sans-serif;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #4f46e5; padding: 20px 30px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 20px;">🔔 THÔNG BÁO HỆ THỐNG</h1>
              </td>
            </tr>
  
            <tr>
              <td style="padding: 30px;">
                <h2 style="margin-top: 0; color: #333333;">Xin chào bạn ${
                  user.email.split("@")[0]
                }</h2>
                <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                  Đây là một thông báo quan trọng từ hệ thống. Vui lòng kiểm tra thông tin bên dưới:
                </p>
  
                <div style="margin-top: 20px; background-color: #fef3c7; padding: 15px 20px; border-left: 4px solid #facc15; border-radius: 6px;">
                  <strong style="color: #92400e;">⚠️ Cảnh báo:</strong>
                  <p style="margin: 8px 0 0; color: #78350f;">Dữ liệu đo của bạn đang trong ngưỡng cảnh báo: <strong> ${noti} </strong>. Bạn hãy khẩn trương đến nơi cơ quan y tế để kiểm tra sức khỏe!</p>
                </div>
  
                <p style="margin-top: 30px; font-size: 14px; color: #666;">Trân trọng,<br><strong>TungDev</strong></p>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
                Bạn nhận được email này vì đã đăng ký sử dụng hệ thống theo dõi sức khỏe.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
</div>`
,
  forgotPassword: (user: any, code: string) => `
    <div>
      <div style="margin: 0; padding: 0; background-color: #ffffff;">
        <table
          width="100%"
          height="100%"
          style="min-width: 348px; border: 0;"
          cellspacing="0"
          cellpadding="0"
          lang="vi"
        >
          <tbody>
            <tr height="32" style="height: 32px;">
              <td></td>
            </tr>
            <tr align="center">
              <td>
                <table
                  cellspacing="0"
                  cellpadding="0"
                  style="
                    padding-bottom: 20px;
                    max-width: 516px;
                    min-width: 220px;
                    border: 0;
                  "
                >
                  <tbody>
                    <tr>
                      <td width="8" style="width: 8px;"></td>
                      <td>
                        <div
                          style="
                            border-style: solid;
                            border-width: thin;
                            border-color: #dadce0;
                            border-radius: 8px;
                            padding: 40px 20px;
                            text-align: center;
                          "
                        >
                          <div
                            style="
                              font-family: Roboto-Regular, Helvetica, Arial,
                                sans-serif;
                              font-size: 13px;
                              color: rgba(0, 0, 0, 0.87);
                              line-height: 20px;
                              padding-top: 20px;
                              text-align: left;
                            "
                          >
                            Chào bạn ${user.email.split("@")[0]}
                            <br />
                            <br />
                            Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Để tiếp tục quá trình này, vui lòng sử dụng mã dưới đây:
                            <br />
                            <div
                              style="
                                text-align: center;
                                font-size: 36px;
                                margin-top: 20px;
                                line-height: 44px;
                                font-weight: 700;
                              "
                            >
                              ${code}
                            </div>
                            <br />
                            Mã này sẽ hết hạn trong 5 phút. Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ khách hàng để được giúp đỡ.
                            <br /><br />
                            Trân trọng, <br />Tùng Dev
                          </div>
                        </div>
                      </td>
                      <td width="8" style="width: 8px;"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    `,
};

let transporter: any = null;

export async function setupMail() {
  try {
    if (transporter) {
      return transporter;
    }

    const options = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "tungdev64@gmail.com",
        pass: "trfl rjik savt wbuy",
      },
    };

    console.log(`Setup mail with option: ${JSON.stringify(options)}`);
    transporter = await nodemailer.createTransport(options);
    await transporter.verify();
    return transporter;
  } catch (err) {
    console.log("Setup mail failed: ", err);
  }
}

export async function sendMailNoti(user: any, noti: string) {
  try {
    const options = {
      from: "tungdev64@gmail.com",
      to: user.email,
      subject: "Thông báo từ WaveD",
      text: "Thông báo",
      html: templates.noti(user, noti),
    };
    await transporter.sendMail(options);
    console.log("sendMailNoti::" , noti);
    
  } catch (err) {
    console.log(`sendMailNoti failed: `, err);
  }
}

export async function sendMailForgotPassword(user: any, code: string) {
  try {
    console.log(
      `Send mail forgot password with data: ${JSON.stringify({ user, code })}`
    );
    const options = {
      from: "tungdev64@gmail.com",
      to: user.email,
      subject: "Khôi phục mật khẩu của bạn",
      html: templates.forgotPassword(user, code),
    };
    await transporter.sendMail(options);
  } catch (err) {
    console.log(`Send mail failed: `, err);
  }
}
