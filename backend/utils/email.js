const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  await resend.emails.send({
    from: 'CyberInf <noreply@cyberinf.com.tr>',
    to: email,
    subject: 'Şifre Sıfırlama',
    html: `
      <div style="font-family: monospace; background: #0d1117; color: #e6edf3; padding: 2rem; border-radius: 8px;">
        <h2 style="color: #3fb950;">[CYBERINF] Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için tıklayın:</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 1rem 0; padding: 0.75rem 1.5rem; background: #3fb950; color: #0d1117; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Şifremi Sıfırla
        </a>
        <p style="color: #8b949e; margin-top: 1rem;">Link 1 saat geçerlidir.</p>
      </div>
    `
  });
};

exports.sendVerificationEmail = async (email, verifyUrl) => {
  await resend.emails.send({
    from: 'CyberInf <onboarding@resend.dev>',
    to: email,
    subject: 'Email Adresinizi Doğrulayın',
    html: `
      <div style="font-family: monospace; background: #0d1117; color: #e6edf3; padding: 2rem; border-radius: 8px;">
        <h2 style="color: #3fb950;">[CYBERINF] Email Doğrulama</h2>
        <p>Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verifyUrl}" style="display: inline-block; margin: 1rem 0; padding: 0.75rem 1.5rem; background: #3fb950; color: #0d1117; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Email Adresimi Doğrula
        </a>
        <p style="color: #8b949e; margin-top: 1rem;">Bu link 24 saat geçerlidir.</p>
        <p style="color: #8b949e;">Eğer bu isteği siz yapmadıysanız görmezden gelin.</p>
      </div>
    `
  });
};
