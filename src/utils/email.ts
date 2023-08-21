export const constructEmailParams = (email: string, token: string) => {
  const params: AWS.SES.SendEmailRequest = {
    Source: process.env.EMAIL_FROM!,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_TO!],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <html>
            <body>
              <h1 style="color:red;">Verify your email</h1> 
              <p>please click the link to register</p>
              <p>${process.env.CLIENT_URL}/verify/registerationToken/${token}</p>
            </body>
          </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Complete your registration",
      },
    },
  };

  return params;
};
